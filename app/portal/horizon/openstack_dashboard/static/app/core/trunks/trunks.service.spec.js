/*
 * Copyright 2017 Ericsson
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

  describe('trunks service', function() {
    var service, neutron, session, _location_;

    beforeEach(module('horizon.framework.util'));
    beforeEach(module('horizon.framework.conf'));
    beforeEach(module('horizon.app.core.trunks'));
    beforeEach(inject(function($injector, $location) {
      service = $injector.get('horizon.app.core.trunks.service');
      neutron = $injector.get('horizon.app.core.openstack-service-api.neutron');
      session = $injector.get('horizon.app.core.openstack-service-api.userSession');
      _location_ = $location;
    }));

    describe('getTrunkPromise', function() {
      it('provides a promise', inject(function($q, $timeout) {
        var deferred = $q.defer();
        spyOn(neutron, 'getTrunk').and.returnValue(deferred.promise);
        var result = service.getTrunkPromise({});
        deferred.resolve({data: {id: 1, updated_at: 'May29'}});
        $timeout.flush();
        expect(neutron.getTrunk).toHaveBeenCalled();
        expect(result.$$state.value.data.updated_at).toBe('May29');
      }));

      it('provides a promise that gets translated', inject(function($q, $timeout) {
        var deferred = $q.defer();
        var deferredSession = $q.defer();
        var updatedAt = new Date('November 15, 2017');
        spyOn(neutron, 'getTrunks').and.returnValue(deferred.promise);
        spyOn(session, 'get').and.returnValue(deferredSession.promise);
        var result = service.getTrunksPromise({});
        deferred.resolve({data: {items: [{id: 1, updated_at: updatedAt}]}});
        deferredSession.resolve({project_id: '42'});
        $timeout.flush();
        expect(neutron.getTrunks).toHaveBeenCalledWith({project_id: '42'});
        expect(result.$$state.value.data.items[0].updated_at).toBe(updatedAt);
        expect(result.$$state.value.data.items[0].id).toBe(1);
      }));

      it('removes project_id in case of calling from admin panel',
      inject(function($q, $timeout) {
        var deferred = $q.defer();
        var deferredSession = $q.defer();
        var updatedAt = new Date('November 15, 2017');
        spyOn(neutron, 'getTrunks').and.returnValue(deferred.promise);
        spyOn(session, 'get').and.returnValue(deferredSession.promise);
        spyOn(_location_, 'url').and.returnValue('/admin/trunks');
        var result = service.getTrunksPromise({project_id: '43'});
        deferred.resolve({data: {items: [{id: 1, updated_at: updatedAt}]}});
        deferredSession.resolve({project_id: '42'});
        $timeout.flush();
        expect(neutron.getTrunks).toHaveBeenCalledWith({});
        expect(result.$$state.value.data.items[0].updated_at).toBe(updatedAt);
        expect(result.$$state.value.data.items[0].id).toBe(1);
      }));

    });

  });
})();
