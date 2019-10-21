/*
  Copyright (c) 2017, F5 Networks, Inc.
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  *
  http://www.apache.org/licenses/LICENSE-2.0
  *
  Unless required by applicable law or agreed to in writing,
  software distributed under the License is distributed on an
  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
  either express or implied. See the License for the specific
  language governing permissions and limitations under the License.
*/


"use strict";

var q = require("q");
var logger = require("f5-logger").getInstance();

function derToPem(der) {
    let forge = require("node-forge");
    let derKey = forge.util.decode64(der);
    let asnObj = forge.asn1.fromDer(derKey);
    let asn1Cert = forge.pki.certificateFromAsn1(asnObj);
    return forge.pki.certificateToPem(asn1Cert);
}

/**
 * Responsible for sending outbound rest operations and receiving inbound rest operations
 *
 * @param options
 * @constructor
 */
function RestOperationNetworkHandler(options) {
    this.eventChannel = options.eventChannel;
    this.http = options.http;
    this.https = options.https;
    this.httpRestOperationResolver = options.httpRestOperationResolver;
    this.restHelper = options.restHelper;
    this.restOperationFactory = options.restOperationFactory;
    this.wellKnownPorts = options.wellKnownPorts;
    this.deviceAuthTokenManager = options.deviceAuthTokenManager;
    this.whiteListsStorage = require('./whiteListsStorage').getInstance();
}

/**
 * Setup the networkhandler to listen for rest 'send' events
 */
RestOperationNetworkHandler.prototype.start = function () {
    var e = this.eventChannel.e;
    this.eventChannel.on(e.sendRestOperation, this.send.bind(this));
    this.whiteListsStorage.loadAll((err) => {
        if (err) logger.warning(err);
    });
};

/**
 * generic api to send a RestRequest
 * @param restOperation
 * @param successCallback
 * @param errorCallback
 */
RestOperationNetworkHandler.prototype.send = function (restOperation, successCallback, errorCallback) {
    var oThis = this;

    if (!restOperation.isIdentifiedDeviceRequest()) {
        // send as before
        this.sendRequest(restOperation, successCallback, errorCallback);
        return;
    }

    this.isLocalHost(restOperation.getUri().hostname).then(function (result) {
        // Redirect identified requests from https://[address]:443/ to http://localhost:8100/.
        if (result) {
            restOperation.setUri(oThis.restHelper.makeRestjavadUri(restOperation.getUri().pathname,
                restOperation.getUri().search));

            // Request will be going through /mgmt. Set the local auth instead of device token
            var auth = "Basic " + new Buffer(oThis.wellKnownPorts.DEFAULT_ADMIN_NAME + ":")
                    .toString('base64');
            restOperation.setBasicAuthorization(auth);
            restOperation.setIsSetBasicAuthHeader(true);

            oThis.sendRequest(restOperation, successCallback, errorCallback);
        } else {
            oThis.sendIdentifiedRequest(restOperation, successCallback, errorCallback);
        }
    });
};

/**
 * Determines given address refers to the localhost. This checks discovery address
 * and management-address and considers that as localhost.
 *
 * @param {String} address
 * @returns {Boolean}
 */
RestOperationNetworkHandler.prototype.isLocalHost = function (address) {
    var deferred = q.defer();

    if (address === this.wellKnownPorts.LOCAL_HOST || address === this.wellKnownPorts.LOOPBACK_ADDRESS) {
        deferred.resolve(true);
    }

    var deviceInfoReq = this.restOperationFactory.createRestOperationInstance()
        .setMethod("Get")
        .setUri(this.restHelper.makeRestjavadUri("/shared/identified-devices/config/device-info"))
        .setReferer("rest-operation-network-handler-js");

    this.sendRequest(deviceInfoReq, function (resp) {
            var deviceInfo = resp.getBody();
            var isLocalhost = deviceInfo.address === address || deviceInfo.managementAddress === address;
            deferred.resolve(isLocalhost);
        },
        function (err) {
            logger.info("Unable to retrieve device-info, Error: %s", err.messsage);
            deferred.resolve(false);
        });

    return deferred.promise;
};

/**
 * generic api to send a identified RestRequest
 * @param restOperation
 * @param successCallback
 * @param errorCallback
 */
RestOperationNetworkHandler.prototype.sendIdentifiedRequest = function (restOperation, successCallback, errorCallback) {
    var oThis = this;

    // identified device API: retrieve secToken and append URL query with it
    this.deviceAuthTokenManager.retrieveSecurityToken({
        "address": restOperation.getUri().hostname,
        "groupName": restOperation.getIdentifiedDeviceGroupName()
    }).then(
        function (secToken) {
            oThis.restHelper.addQueryParam(restOperation, secToken);
            oThis.sendRequest(restOperation, successCallback, errorCallback);
        }
    ).fail(
        function (err) {
            logger.severe("Failed to send identifiedDeviceRequest: %s\n%s",
                err.message, err.stack);
            if (errorCallback) {
                errorCallback(err);
            }
        }
    ).done();
};

/**
 * Do send restOperation, no more checking for identified device API flag.
 * @param restOperation
 * @param successCallback
 * @param errorCallback
 */
RestOperationNetworkHandler.prototype.sendRequest = function (restOperation, successCallback, errorCallback) {
    var oThis = this,
        eventChannel = this.eventChannel,
        e = this.eventChannel.e,
        httpRequestOptions,
        httpRequest,
        agent;

    if (!restOperation) {
        throw new Error("[RestOperationNetworkHandler] send() missing restOperation argument.");
    }

    try {
        httpRequestOptions = this.httpRestOperationResolver.resolveToHttpRequest(restOperation);
    }
    catch (ex) {
        logger.severe("[RestOperationNetworkHandler] Error resolving to HttpRest: %s\n%s", ex.message, ex.stack);
        if (errorCallback) errorCallback(ex);
        return;
    }
    agent = this.getHttpAgentAndSetupHttpsOptions(httpRequestOptions);
    httpRequest = agent.request(httpRequestOptions, this.onHttpResponse.bind(this, {
        restOperation: restOperation,
        successCallback: successCallback,
        errorCallback: errorCallback
    }));

    httpRequest.on(e.error, function (err) {
        if (errorCallback) {
            errorCallback(err);
        }
    });

    httpRequest.setTimeout(this.restHelper.getDefaultTimeout(), function () {
        var errMsg = "[RestOperationNetworkHandler] request timeout.",
            err = new Error(errMsg);

        if (errorCallback) {
            errorCallback(err);
        }

        restOperation.fail(err);

        if (this.socket) {
            logger.warning("[RestOperationNetworkHandler] request timed out, destroying socket...: ");
            this.socket.end();
        }
    });

    if (this.shouldWriteBody(httpRequestOptions)) {
        httpRequest.write(httpRequestOptions.httpRequestBody);
    }

    httpRequest.end();
};

RestOperationNetworkHandler.prototype.shouldWriteBody = function (httpRequestOptions) {
    return !!httpRequestOptions.httpRequestBody;
};

RestOperationNetworkHandler.prototype.getHttpAgentAndSetupHttpsOptions = function (httpRequestOptions) {
    if (!httpRequestOptions.protocol) {
        return this.http;
    }

    if (httpRequestOptions.protocol === this.wellKnownPorts.DEFAULT_HTTPS_SCHEME + ":") {
        if (httpRequestOptions.rejectUnauthorized === true) {
            httpRequestOptions.ca = this.whiteListsStorage.get(httpRequestOptions.hostname); //Nodejs needs that self signed cert is added to ca although we are doing own checking below. Does hostname is always ip?
            logger.fine("httpRequestOptions.ca " + httpRequestOptions.ca);
            httpRequestOptions.checkServerIdentity = (servername, cert) => {
                logger.fine("certificate for " + servername + " is " + cert);
                if (servername === undefined || servername === null){
                    return  new Error("no server name " + servername);
                }
                //generally nodejs with verion we are using doesn't allow to use self signed certificate until they are added to ca.
                //This checking is for security reason if something would change.
                const certInWL = this.whiteListsStorage.get(servername);
                logger.fine("certInWL " + certInWL);
                if (certInWL === undefined) {
                    return new Error("no certificate for " + servername);
                }

                let pemCert = derToPem(cert.raw.toString('base64'));
                const endLineExpr = /(\r\n|\n|\r)/gm;
                if (pemCert.replace(endLineExpr,"") === certInWL.replace(endLineExpr,"")) {
                    logger.fine("cert ok");
                    return;
                }
                else {
                    logger.warning("cert mismatch peer %s in whitelist %s ", pemCert, certInWL);
                    return new Error("cert mismatch peer");
                }
            };
        }

        return this.https;
    }
    else {
        return this.http;
    }
};

/**
 * handles httpResponse to the send request
 *
 * @param options
 * @param options.restOperation
 * @param options.successCallback
 * @param options.errorCallback
 * @param resp
 */
RestOperationNetworkHandler.prototype.onHttpResponse = function (options, resp) {
    let oThis = this;

    this.httpRestOperationResolver.resolveHttpResponseToRestOperation(options.restOperation, resp,
        //onSuccess
        function (restOp) {
            let statusCode = restOp.getStatusCode();
            if (statusCode >= oThis.wellKnownPorts.STATUS_FAILURE_THRESHOLD) {
                let errorMessage = "",
                    errObj = restOp.getBody();
                logger.severe("error Object: " + JSON.stringify(errObj));
                errorMessage = JSON.stringify(errObj); // Need the entire error body instead of message only.
                let err = new Error(errorMessage);

                // This method allows for the retrieval of the error response in the case a caller
                // needs to inspect it.
                err.getResponseOperation = function () {
                    return restOp;
                };

                err.httpStatusCode = statusCode;
                oThis.callErrorCallbackOrThrow(options.errorCallback, err, restOp);
                return;
            }

            if (options.successCallback) {
                //We have a success call back handler so call it
                options.successCallback(restOp);
            }
        },
        //onError
        function (err) {
            oThis.callErrorCallbackOrThrow(options.errorCallback, err, options.restOperation);
        });
};

/**
 * call the callback if exists, else throw Error
 * @param onError
 * @param err
 * @param restOp
 */
RestOperationNetworkHandler.prototype.callErrorCallbackOrThrow = function (onError, err, restOp) {
    if (onError) {
        onError(err, restOp);
    }
    else {
        if (restOp) {
            restOp.fail(err);
        }
        else {
            logger.severe("[RestOperationNetworkHandler] unhandled error: ", err);
            this.eventChannel.emit(this.eventChannel.e.fail, err);
        }
    }
};

module.exports = RestOperationNetworkHandler;
