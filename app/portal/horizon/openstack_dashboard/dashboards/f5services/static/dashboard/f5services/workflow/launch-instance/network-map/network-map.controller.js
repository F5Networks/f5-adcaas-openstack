/*
 *    (c) Copyright 2019 F5Networks Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function () {
    'use strict';

    angular
        .module('horizon.dashboard.f5services.workflow.launch-instance')
        .controller('LaunchInstanceNetworkMapController', LaunchInstanceNetworkMapController);

    LaunchInstanceNetworkMapController.$inject = [
        '$scope',
        'horizon.dashboard.f5services.workflow.launch-instance.basePath',
        'launchInstanceModel'
    ];

    function LaunchInstanceNetworkMapController($scope, basePath, launchInstanceModel) {
        var ctrl = this;

        ctrl.networkPages = {
            mgmt: basePath + 'network/network.mgmt.html',
            ext: basePath + 'network/network.ext.html',
            int: basePath + 'network/network.int.html',
            ha: basePath + 'network/network.ha.html',
        };

        ctrl.networkPages_mgmt = basePath + 'network/network.mgmt.html';

        ctrl.asterisk = {
            mgmt: '*',
            ext: '*',
            int: '*',
            ha: '*',
        };
        
        function getNewIntanceSpec() {
            return launchInstanceModel.newInstanceSpec.networksMap;
        }

        ctrl.allNetReady = true; 

        //var portWatcher = 
        $scope.$watch(
            getNewIntanceSpec,
            function (newValue, oldValue) {
                var valid = true;
                for(var i of Object.keys(ctrl.asterisk)) {
                    var gt0 = (newValue[i].length > 0);
                    ctrl.asterisk[i] = gt0 ? ' ' : '*';
                    valid = valid & gt0;
                }
                ctrl.allNetReady = valid; 
            }, 
            true
        );
    }
})();