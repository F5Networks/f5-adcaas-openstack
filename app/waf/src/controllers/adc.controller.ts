import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
  patch,
  del,
  requestBody,
  HttpErrors,
  RestBindings,
  RequestContext,
} from '@loopback/rest';
import {
  Adc,
  Tenant,
  ActionsBody,
  ActionsResponse,
  ActionsRequest,
} from '../models';
import {AdcRepository, AdcTenantAssociationRepository} from '../repositories';
import {Schema, Response, CollectionResponse} from '.';
import {inject, CoreBindings} from '@loopback/core';
import {factory} from '../log4ts';
import {WafBindingKeys} from '../keys';
import {WafApplication} from '../application';
import {
  TrustedDeviceRequest,
  TrustedDevice,
  TrustedDeviceService,
  PortCreationParams,
  ServersParams,
  BigIpManager,
  OnboardingManager,
} from '../services';

const prefix = '/adcaas/v1';

const ASG_HOST: string = process.env.ASG_HOST || 'localhost';
const ASG_PORT: number = Number(process.env.ASG_PORT) || 8443;

async function sleep(time: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    setTimeout(resolve, time);
  });
}

export class AdcController {
  constructor(
    @repository(AdcRepository)
    public adcRepository: AdcRepository,
    @repository(AdcTenantAssociationRepository)
    public adcTenantAssociationRepository: AdcTenantAssociationRepository,
    @inject('services.TrustedDeviceService')
    public trustedDeviceService: TrustedDeviceService,
    //Suppress get injection binding exeption by using {optional: true}
    @inject(RestBindings.Http.CONTEXT, {optional: true})
    private reqCxt: RequestContext,
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private wafapp: WafApplication,
    private logger = factory.getLogger('controllers.adc'),
  ) {}

  @post(prefix + '/adcs', {
    responses: {
      '200': Schema.response(Adc, 'Successfully create ADC resource'),
      '400': Schema.badRequest('Invalid ADC resource'),
      '422': Schema.unprocessableEntity('Unprocessable ADC resource'),
    },
  })
  async create(
    @requestBody(
      Schema.createRequest(Adc, 'ADC resource that need to be created'),
    )
    reqBody: Partial<Adc>,
  ): Promise<Response> {
    //TODO: Reject create ADC HW request with duplicated mgmt IP address
    if (reqBody.type === 'HW') {
      await this.trustAdc(reqBody);
    }

    try {
      return new Response(Adc, await this.adcRepository.create(reqBody));
    } catch (e) {
      throw new HttpErrors.UnprocessableEntity(e.message);
    }
  }

  async trustAdc(adc: Partial<Adc>): Promise<void> {
    if (!adc.management || !adc.management.ipAddress) {
      throw new HttpErrors.BadRequest(
        'IP address and admin passphrase are required to trust ADC hardware',
      );
    }

    let body: TrustedDeviceRequest = {
      devices: [
        {
          targetHost: adc.management.ipAddress,
          targetPort: adc.management.tcpPort || 443,
          //TODO: Need away to input admin password of BIG-IP HW
          targetUsername: 'admin',
          targetPassphrase: 'admin',
        },
      ],
    };

    let devices: TrustedDevice[];

    try {
      devices = (await this.trustedDeviceService.trust(
        ASG_HOST,
        ASG_PORT,
        body,
      )).devices;
    } catch (e) {
      //TODO: Request TrustedDevices to hide admin passphrase in error message
      throw new HttpErrors.UnprocessableEntity(e.message);
    }

    //Wait until trusted state become ACTIVE
    let retries = 0;
    while (retries < 15) {
      if (devices.length !== 1) {
        throw new HttpErrors.UnprocessableEntity(
          'Trusting device fails: Response size is ' + devices.length,
        );
      } else {
        adc.trustedDeviceId = devices[0].targetUUID;
        if (devices[0].state === 'ACTIVE') {
          break;
        } else if (
          devices[0].state === 'ERROR' ||
          devices[0].state === 'UNDISCOVERED'
        ) {
          throw new HttpErrors.UnprocessableEntity(
            'Trusting device fails: Device state is ' + devices[0].state,
          );
        }
      }

      await sleep(1000);
      retries++;

      try {
        devices = (await this.trustedDeviceService.query(
          ASG_HOST,
          ASG_PORT,
          adc.trustedDeviceId,
        )).devices;
      } catch (e) {
        throw new HttpErrors.UnprocessableEntity(e.message);
      }
    }

    if (retries >= 15) {
      throw new HttpErrors.UnprocessableEntity(
        'Trusting ADC' + adc.id + ' timeout',
      );
    }
  }

  async untrustAdc(adc: Adc): Promise<void> {
    if (!adc.trustedDeviceId) {
      return;
    }

    let devices: TrustedDevice[];

    try {
      devices = (await this.trustedDeviceService.untrust(
        ASG_HOST,
        ASG_PORT,
        adc.trustedDeviceId,
      )).devices;
    } catch (e) {
      throw new HttpErrors.UnprocessableEntity(e.message);
    }

    if (devices.length !== 1) {
      throw new HttpErrors.UnprocessableEntity(
        'Untrusting device fails: Response size is ' + devices.length,
      );
    }

    if (devices[0].state !== 'DELETING') {
      throw new HttpErrors.UnprocessableEntity(
        'Untrusting device fails: Device state is ' + devices[0].state,
      );
    }
  }

  @get(prefix + '/adcs/count', {
    responses: {
      '200': {
        description: 'ADC resource count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Adc)) where?: Where,
  ): Promise<Count> {
    try {
      // TODO: remove this reqCxt usage sample.
      this.logger.debug(
        'Checked tenant id: ' +
          (await this.reqCxt.get(WafBindingKeys.Request.KeyTenantId)),
      );
    } catch (error) {
      // do nothing
    }

    return await this.adcRepository.count(where);
  }

  @get(prefix + '/adcs', {
    responses: {
      '200': Schema.collectionResponse(
        Adc,
        'Successfully retrieve ADC resources',
      ),
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Adc)) filter?: Filter,
  ): Promise<CollectionResponse> {
    let data = await this.adcRepository.find(filter);
    return new CollectionResponse(Adc, data);
  }

  @get(prefix + '/adcs/{adcId}', {
    responses: {
      '200': Schema.response(Adc, 'Successfully retrieve ADC resource'),
      '404': Schema.notFound('Can not find ADC resource'),
    },
  })
  async findById(
    @param(Schema.pathParameter('adcId', 'ADC resource ID')) id: string,
  ): Promise<Response> {
    let data = await this.adcRepository.findById(id);
    return new Response(Adc, data);
  }

  @patch(prefix + '/adcs/{adcId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully update ADC resource'),
      '404': Schema.notFound('Can not find ADC resource'),
    },
  })
  async updateById(
    @param(Schema.pathParameter('adcId', 'ADC resource ID')) id: string,
    @requestBody(
      Schema.updateRequest(
        Adc,
        'ADC resource properties that need to be updated',
      ),
    )
    adc: Partial<Adc>,
  ): Promise<void> {
    // TODO: create the unified way in schema to check request body.
    if (adc.status || adc.createdAt || adc.updatedAt || adc.management)
      throw new HttpErrors.BadRequest('Not changable properties.');

    await this.adcRepository.updateById(id, adc);
  }

  @del(prefix + '/adcs/{adcId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully delete ADC resource'),
      '404': Schema.notFound('Can not find ADC resource'),
    },
  })
  async deleteById(
    @param(Schema.pathParameter('adcId', 'ADC resource ID')) id: string,
  ): Promise<void> {
    let adc = await this.adcRepository.findById(id);

    if (adc.type === 'HW') {
      await this.untrustAdc(adc);
    }

    await this.adcRepository.deleteById(id);
  }

  @get(prefix + '/adcs/{adcId}/tenants', {
    responses: {
      '200': Schema.collectionResponse(
        Tenant,
        'Successfully retrieve Tenant resources',
      ),
    },
  })
  async findTenants(
    @param(Schema.pathParameter('adcId', 'ADC resource ID')) id: string,
  ): Promise<CollectionResponse> {
    let assocs = await this.adcTenantAssociationRepository.find({
      where: {
        adcId: id,
      },
    });

    let tenants: Tenant[] = [];
    assocs.forEach(assoc =>
      tenants.push(
        new Tenant({
          id: assoc.tenantId,
        }),
      ),
    );

    return new CollectionResponse(Tenant, tenants);
  }

  @get(prefix + '/adcs/{adcId}/tenants/{tenantId}', {
    responses: {
      '200': Schema.response(Tenant, 'Successfully retrieve Tenant resource'),
    },
  })
  async findTenant(
    @param(Schema.pathParameter('adcId', 'ADC resource ID')) adcId: string,
    @param(Schema.pathParameter('tenantId', 'OpenStack project ID'))
    tenantId: string,
  ): Promise<Response> {
    let assocs = await this.adcTenantAssociationRepository.find({
      where: {
        adcId: adcId,
        tenantId: tenantId,
      },
    });

    if (assocs.length === 0) {
      throw new HttpErrors.NotFound('Cannot find association.');
    } else {
      return new Response(
        Tenant,
        new Tenant({
          id: assocs[0].tenantId,
        }),
      );
    }
  }

  // TODO: schema.response not work well here.
  // It shows the below in Example Value:
  // {
  //   "actionsresponse": {
  //     "id": "11111111-2222-3333-4444-555555555555"
  //   }
  // }
  @post(prefix + '/adcs/{adcId}/action', {
    responses: {
      '200': Schema.response(ActionsResponse, 'Adc Id for the actions.'),
    },
  })
  async provision(
    @param(Schema.pathParameter('adcId', 'ADC resource ID')) id: string,
    @requestBody(Schema.createRequest(ActionsRequest, 'actions request'))
    actionBody: ActionsBody,
  ): Promise<object | undefined> {
    let adc = await this.adcRepository.findById(id);

    switch (Object.keys(actionBody)[0]) {
      case 'create':
        try {
          if (adc.status !== 'NONE' && adc.status !== 'ERROR')
            throw new HttpErrors.BadRequest(
              'Adc status is ' +
                adc.status +
                ". Cannot repeat 'create' on the same ADC.",
            );

          // TODO: Create VM in async way.
          await this.createOn(adc);
          return {id: adc.id};
        } catch (error) {
          throw new HttpErrors.BadRequest(error.message);
        }

      case 'delete':
        break;

      case 'setup':
        try {
          // TODO: setup VE in async way.
          await this.setupOn(adc);
          return {id: adc.id};
        } catch (error) {
          throw new HttpErrors.BadRequest(error.message);
        }

      default:
        throw new HttpErrors.BadRequest(
          'Not supported: ' + Object.keys(actionBody)[0],
        );
    }
  }

  private async setupOn(adc: Adc): Promise<void> {
    let bigipMgr = await BigIpManager.instanlize({
      username: adc.management.username,
      password: adc.management.password,
      ipAddr: adc.management.ipAddress,
      port: adc.management.tcpPort,
    });
    let ready = await bigipMgr.checkAndWaitBigipReady(240 * 1000);
    if (ready) {
      await this.serialize(adc, {status: 'ONBOARDING'});
      this.logger.debug('start to do onbarding');
      let doMgr = await OnboardingManager.instanlize(this.wafapp);

      // TODO do it async in the future(maybe.).
      let doBody = await doMgr.assembleDo(adc);
      this.logger.debug('Json used for onboarding: ' + JSON.stringify(doBody));
      await doMgr.onboarding(doBody);
      let over = await bigipMgr.checkAndWaitBigipOnboarded(
        240 * 1000,
        doBody.declaration.Common!.hostname!,
      );
      if (over) await this.serialize(adc, {status: 'ONBOARDED'});
      else await this.serialize(adc, {status: 'ONBOARDERROR'});
    } else {
      let errmsg =
        'bigip is not ready after waiting timeout. Cannot go forwards';
      this.logger.error(errmsg);
      throw new Error(errmsg);
    }
  }

  private async serialize(adc: Adc, data?: object) {
    // TODO: implement complete object merging.
    if (data) Object.assign(adc, data);
    await this.adcRepository.update(adc);
  }

  private async createOn(adc: Adc): Promise<void> {
    try {
      await this.serialize(adc, {status: 'BUILDING'})
        .then(async () => await this.cNet(adc))
        .then(async () => await this.cSvr(adc));
      await this.serialize(adc, {status: 'POWERON'});
    } catch (error) {
      await this.serialize(adc, {status: 'ERROR'});
      throw error;
    }
  }

  private async cSvr(adc: Adc): Promise<void> {
    await Promise.all([
      this.wafapp.get(WafBindingKeys.KeyComputeManager),
      this.reqCxt.get(WafBindingKeys.Request.KeyUserToken),
      this.reqCxt.get(WafBindingKeys.Request.KeyTenantId),
    ]).then(async ([computeHelper, userToken, tenantId]) => {
      let rootPass = Math.random()
        .toString(36)
        .slice(-8);
      let adminPass = Math.random()
        .toString(36)
        .slice(-8);
      let userdata: string = await this.cUserdata(rootPass, adminPass);

      let serverParams: ServersParams = {
        userTenantId: tenantId,
        vmName: adc.id,
        imageRef: adc.compute.imageRef,
        flavorRef: adc.compute.flavorRef,
        securityGroupName: 'default', //TODO: remove the hardcode in the future.
        userData: userdata,
        ports: (() => {
          let ports = [];
          for (let n of Object.keys(adc.networks)) {
            ports.push(<string>adc.networks[n].portId);
          }
          return ports;
        })(),
      };

      await computeHelper
        .createServer(userToken, serverParams)
        .then(response => {
          adc.compute.vmId = response;
          adc.management = {
            username: 'admin',
            password: adminPass,
            rootPass: rootPass,
            tcpPort: 443, // TODO: remove the hard-code.
            ipAddress: <string>(() => {
              for (let net in adc.networks) {
                if (adc.networks[net].type === 'mgmt') {
                  return adc.networks[net].fixedIp;
                }
              }
            })(),
          };
        });
    });
  }

  private async cNet(adc: Adc): Promise<void> {
    await Promise.all([
      this.wafapp.get(WafBindingKeys.KeyNetworkDriver),
      this.reqCxt.get(WafBindingKeys.Request.KeyUserToken),
    ]).then(async ([networkHelper, userToken]) => {
      for (let k of Object.keys(adc.networks)) {
        let net = adc.networks[k];
        if (net.portId && net.ready) continue;

        net.ready = false;

        let portParams: PortCreationParams = {
          networkId: net.networkId,
          name: <string>(adc.id + '-' + net.type + '-' + k),
        };
        if (net.fixedIp) portParams.fixedIp = net.fixedIp;

        await networkHelper
          .createPort(userToken, portParams)
          .then(async port => {
            net.fixedIp = port.fixedIp;
            net.macAddr = port.macAddr;
            net.portId = port.id;
            net.ready = true;

            await this.serialize(adc);
          });
      }
    });
  }

  private async cUserdata(
    rootPassword: string,
    adminPassword: string,
  ): Promise<string> {
    const userData: string = `#cloud-config
    runcmd:
     - "echo \\"root:${rootPassword}\\" | chpasswd"
     - "echo \\"admin:${adminPassword}\\" | chpasswd"`;

    this.logger.debug('userdata for create vm: ' + userData);
    const userDataB64Encoded = Buffer.from(userData).toString('base64');

    return userDataB64Encoded;
  }
}
