# Copyright 2012 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
#
# Copyright 2012 Nebula, Inc.
# Copyright (c) 2012 X.commerce, a business unit of eBay Inc.
#
#    Licensed under the Apache License, Version 2.0 (the "License"); you may
#    not use this file except in compliance with the License. You may obtain
#    a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#    License for the specific language governing permissions and limitations
#    under the License.

from __future__ import absolute_import

from django import http
from django.test.utils import override_settings
from django.utils.translation import ugettext_lazy as _
from mox3.mox import IsA

from horizon import exceptions
from openstack_dashboard import api
from openstack_dashboard.api import cinder
from openstack_dashboard.test import helpers as test
from openstack_dashboard.usage import quotas


class QuotaTests(test.APITestCase):

    def get_usages(self, with_volume=True, with_compute=True,
                   nova_quotas_enabled=True, tenant_id=None):
        usages = {}
        if with_compute:
            # These are all nova fields; the neutron ones are named slightly
            # differently and aren't included in here yet
            if nova_quotas_enabled:
                usages.update({
                    'injected_file_content_bytes': {'quota': 1},
                    'metadata_items': {'quota': 1},
                    'injected_files': {'quota': 1},
                    'ram': {'available': 8976, 'used': 1024, 'quota': 10000},
                    'instances': {'available': 8, 'used': 2, 'quota': 10},
                    'cores': {'available': 8, 'used': 2, 'quota': 10},
                    'key_pairs': {'quota': 100},
                    'injected_file_path_bytes': {'quota': 255}
                })
                if tenant_id == 3:
                    usages.update({
                        'ram': {'available': 10000,
                                'used': 0,
                                'quota': 10000},
                        'instances': {'available': 10, 'used': 2, 'quota': 10},
                        'cores': {'available': 10, 'used': 2, 'quota': 10}
                    })

        if with_volume:
            usages.update({'volumes': {'available': 0, 'used': 4, 'quota': 1},
                           'snapshots': {'available': 0, 'used': 3,
                                         'quota': 1},
                           'gigabytes': {'available': 600, 'used': 400,
                                         'quota': 1000}})
        return usages

    def get_usages_from_limits(self, with_volume=True, with_compute=True,
                               nova_quotas_enabled=True,
                               unlimited_items=None):
        usages = {}
        if with_compute and nova_quotas_enabled:
            usages.update({
                'instances': {'available': 8, 'used': 2, 'quota': 10},
                'cores': {'available': 18, 'used': 2, 'quota': 20},
                'ram': {'available': 8976, 'used': 1024, 'quota': 10000},
                'key_pairs': {'quota': 100},
            })
        if with_volume:
            usages.update({
                'volumes': {'available': 16, 'used': 4, 'quota': 20},
                'gigabytes': {'available': 600, 'used': 400, 'quota': 1000},
                'snapshots': {'available': 7, 'used': 3, 'quota': 10},
            })
        if unlimited_items:
            for item in unlimited_items:
                usages[item]['available'] = float('inf')
                usages[item]['quota'] = float('inf')
        return usages

    def assertAvailableQuotasEqual(self, expected_usages, actual_usages):
        expected_available = {key: value['available'] for key, value in
                              expected_usages.items() if 'available' in value}
        actual_available = {key: value['available'] for key, value in
                            actual_usages.items() if 'available' in value}
        self.assertEqual(expected_available, actual_available)

    @test.create_stubs({api.nova: ('tenant_absolute_limits',),
                        api.base: ('is_service_enabled',),
                        cinder: ('tenant_absolute_limits',
                                 'is_volume_service_enabled')})
    def test_tenant_quota_usages_with_id(self):
        tenant_id = 3
        cinder.is_volume_service_enabled(IsA(http.HttpRequest)).AndReturn(True)
        api.base.is_service_enabled(IsA(http.HttpRequest),
                                    'network').AndReturn(False)
        api.base.is_service_enabled(IsA(http.HttpRequest), 'compute') \
            .MultipleTimes().AndReturn(True)

        api.nova.tenant_absolute_limits(
            IsA(http.HttpRequest),
            reserved=True,
            tenant_id=tenant_id).AndReturn(self.limits['absolute'])

        api.cinder.tenant_absolute_limits(
            IsA(http.HttpRequest),
            tenant_id).AndReturn(self.cinder_limits['absolute'])

        self.mox.ReplayAll()

        quota_usages = quotas.tenant_quota_usages(self.request,
                                                  tenant_id=tenant_id)
        expected_output = self.get_usages_from_limits(
            with_volume=True, with_compute=True)

        # Compare internal structure of usages to expected.
        self.assertItemsEqual(expected_output, quota_usages.usages)
        # Compare available resources
        self.assertAvailableQuotasEqual(expected_output, quota_usages.usages)

    @test.create_stubs({api.nova: ('tenant_absolute_limits',),
                        api.base: ('is_service_enabled',),
                        cinder: ('tenant_absolute_limits',
                                 'is_volume_service_enabled')})
    def _test_tenant_quota_usages(self, nova_quotas_enabled=True,
                                  with_compute=True, with_volume=True,
                                  unlimited_items=None):
        tenant_id = '1'
        cinder.is_volume_service_enabled(IsA(http.HttpRequest)).AndReturn(
            with_volume)
        api.base.is_service_enabled(IsA(http.HttpRequest),
                                    'network').AndReturn(False)
        api.base.is_service_enabled(
            IsA(http.HttpRequest), 'compute'
        ).MultipleTimes().AndReturn(with_compute)
        if with_compute:
            if nova_quotas_enabled:
                api.nova.tenant_absolute_limits(
                    IsA(http.HttpRequest),
                    reserved=True,
                    tenant_id=tenant_id).AndReturn(self.limits['absolute'])

        if with_volume:
            api.cinder.tenant_absolute_limits(
                IsA(http.HttpRequest),
                tenant_id).AndReturn(self.cinder_limits['absolute'])

        self.mox.ReplayAll()

        quota_usages = quotas.tenant_quota_usages(self.request)
        expected_output = self.get_usages_from_limits(
            nova_quotas_enabled=nova_quotas_enabled,
            with_volume=with_volume,
            with_compute=with_compute,
            unlimited_items=unlimited_items)

        # Compare internal structure of usages to expected.
        self.assertItemsEqual(expected_output, quota_usages.usages)
        # Compare available resources
        self.assertAvailableQuotasEqual(expected_output, quota_usages.usages)

    def test_tenant_quota_usages(self):
        self._test_tenant_quota_usages()

    @override_settings(OPENSTACK_HYPERVISOR_FEATURES={'enable_quotas': False})
    def test_tenant_quota_usages_wo_nova_quotas(self):
        self._test_tenant_quota_usages(nova_quotas_enabled=False,
                                       with_compute=True,
                                       with_volume=False)

    def test_tenant_quota_usages_with_unlimited(self):
        self.limits['absolute']['maxTotalInstances'] = float('inf')
        self._test_tenant_quota_usages(unlimited_items=['instances'])

    @override_settings(OPENSTACK_HYPERVISOR_FEATURES={'enable_quotas': False})
    @test.create_stubs({api.base: ('is_service_enabled',),
                        cinder: ('is_volume_service_enabled',)})
    def test_get_all_disabled_quotas(self):
        cinder.is_volume_service_enabled(IsA(http.HttpRequest)).AndReturn(
            False)
        api.base.is_service_enabled(IsA(http.HttpRequest),
                                    'network').AndReturn(False)
        # Nova enabled but quotas disabled
        api.base.is_service_enabled(IsA(http.HttpRequest),
                                    'compute').AndReturn(True)
        self.mox.ReplayAll()

        result_quotas = quotas.get_disabled_quotas(self.request)
        expected_quotas = (quotas.CINDER_QUOTA_FIELDS |
                           quotas.NEUTRON_QUOTA_FIELDS |
                           quotas.NOVA_QUOTA_FIELDS)
        self.assertItemsEqual(result_quotas, expected_quotas)

    @test.create_stubs({api.nova: ('tenant_absolute_limits',),
                        api.base: ('is_service_enabled',),
                        api.cinder: ('is_volume_service_enabled',)})
    def test_tenant_quota_usages_without_volume(self):
        tenant_id = self.request.user.tenant_id

        api.cinder.is_volume_service_enabled(
            IsA(http.HttpRequest)
        ).AndReturn(False)
        api.base.is_service_enabled(IsA(http.HttpRequest),
                                    'network').AndReturn(False)
        api.base.is_service_enabled(IsA(http.HttpRequest),
                                    'compute').MultipleTimes().AndReturn(True)
        api.nova.tenant_absolute_limits(
            IsA(http.HttpRequest),
            reserved=True,
            tenant_id=tenant_id).AndReturn(self.limits['absolute'])

        self.mox.ReplayAll()

        quota_usages = quotas.tenant_quota_usages(self.request)
        expected_output = self.get_usages_from_limits(with_volume=False)

        # Compare internal structure of usages to expected.
        self.assertItemsEqual(expected_output, quota_usages.usages)

        # Make sure that the `in` operator and the `.get()` method
        # behave as expected
        self.assertIn('ram', quota_usages)
        self.assertIsNotNone(quota_usages.get('ram'))

    @test.create_stubs({api.nova: ('tenant_absolute_limits',),
                        api.base: ('is_service_enabled',),
                        api.cinder: ('is_volume_service_enabled',)})
    def test_tenant_quota_usages_no_instances_running(self):
        api.cinder.is_volume_service_enabled(
            IsA(http.HttpRequest)
        ).AndReturn(False)
        api.base.is_service_enabled(IsA(http.HttpRequest),
                                    'network').AndReturn(False)
        api.base.is_service_enabled(IsA(http.HttpRequest),
                                    'compute').MultipleTimes().AndReturn(True)
        api.nova.tenant_absolute_limits(
            IsA(http.HttpRequest),
            reserved=True,
            tenant_id='1').AndReturn(self.limits['absolute'])

        self.mox.ReplayAll()

        quota_usages = quotas.tenant_quota_usages(self.request)
        expected_output = self.get_usages_from_limits(with_volume=False)

        expected_output.update({
            'ram': {'available': 10000, 'used': 0, 'quota': 10000},
            'instances': {'available': 10, 'used': 0, 'quota': 10},
            'cores': {'available': 10, 'used': 0, 'quota': 10}})

        # Compare internal structure of usages to expected.
        self.assertItemsEqual(expected_output, quota_usages.usages)

    @test.create_stubs({api.nova: ('tenant_absolute_limits',),
                        api.base: ('is_service_enabled',),
                        cinder: ('tenant_absolute_limits',
                                 'is_volume_service_enabled')})
    def test_tenant_quota_usages_unlimited_quota(self):
        tenant_id = '1'
        inf_quota = self.quotas.first()
        inf_quota['ram'] = -1

        cinder.is_volume_service_enabled(
            IsA(http.HttpRequest)
        ).AndReturn(True)
        api.base.is_service_enabled(IsA(http.HttpRequest),
                                    'network').AndReturn(False)
        api.base.is_service_enabled(IsA(http.HttpRequest),
                                    'compute').MultipleTimes().AndReturn(True)

        api.nova.tenant_absolute_limits(
            IsA(http.HttpRequest),
            reserved=True,
            tenant_id=tenant_id).AndReturn(self.limits['absolute'])
        api.cinder.tenant_absolute_limits(
            IsA(http.HttpRequest),
            tenant_id).AndReturn(self.cinder_limits['absolute'])

        self.mox.ReplayAll()

        quota_usages = quotas.tenant_quota_usages(self.request)
        expected_output = self.get_usages_from_limits()
        expected_output.update({'ram': {'available': float("inf"),
                                        'used': 1024,
                                        'quota': float("inf")}})

        # Compare internal structure of usages to expected.
        self.assertItemsEqual(expected_output, quota_usages.usages)

    @test.create_stubs({api.nova: ('tenant_absolute_limits',),
                        api.base: ('is_service_enabled',),
                        cinder: ('tenant_absolute_limits',
                                 'is_volume_service_enabled')})
    def test_tenant_quota_usages_neutron_fip_disabled(self):
        tenant_id = '1'
        cinder.is_volume_service_enabled(
            IsA(http.HttpRequest)
        ).AndReturn(True)
        api.base.is_service_enabled(IsA(http.HttpRequest),
                                    'network').AndReturn(False)
        api.base.is_service_enabled(IsA(http.HttpRequest),
                                    'compute').MultipleTimes().AndReturn(True)
        api.nova.tenant_absolute_limits(
            IsA(http.HttpRequest),
            reserved=True,
            tenant_id=tenant_id).AndReturn(self.limits['absolute'])
        api.cinder.tenant_absolute_limits(
            IsA(http.HttpRequest),
            tenant_id).AndReturn(self.cinder_limits['absolute'])

        self.mox.ReplayAll()

        quota_usages = quotas.tenant_quota_usages(self.request)
        expected_output = self.get_usages_from_limits()

        # Compare internal structure of usages to expected.
        self.assertItemsEqual(expected_output, quota_usages.usages)

    @test.create_stubs({api.base: ('is_service_enabled',),
                        api.cinder: ('tenant_quota_get',
                                     'is_volume_service_enabled'),
                        exceptions: ('handle',)})
    def test_get_quota_data_cinder_exception(self):
        api.cinder.is_volume_service_enabled(
            IsA(http.HttpRequest)
        ).AndReturn(True)
        api.base.is_service_enabled(IsA(http.HttpRequest),
                                    'network').AndReturn(False)
        api.base.is_service_enabled(IsA(http.HttpRequest),
                                    'compute').AndReturn(False)
        api.cinder.tenant_quota_get(IsA(http.HttpRequest), '1') \
            .AndRaise(cinder.cinder_exception.ClientException('test'))
        exceptions.handle(IsA(http.HttpRequest),
                          _("Unable to retrieve volume limit information."))
        self.mox.ReplayAll()

        quotas.get_tenant_quota_data(self.request)

    @test.create_stubs({api.base: ('is_service_enabled',),
                        api.cinder: ('tenant_absolute_limits',
                                     'is_volume_service_enabled'),
                        exceptions: ('handle',)})
    def test_tenant_limit_usages_cinder_exception(self):
        api.base.is_service_enabled(IsA(http.HttpRequest),
                                    'compute').AndReturn(False)
        api.cinder.is_volume_service_enabled(
            IsA(http.HttpRequest)
        ).AndReturn(True)
        api.cinder.tenant_absolute_limits(IsA(http.HttpRequest)) \
            .AndRaise(cinder.cinder_exception.ClientException('test'))
        exceptions.handle(IsA(http.HttpRequest),
                          _("Unable to retrieve volume limit information."))
        self.mox.ReplayAll()
        quotas.tenant_limit_usages(self.request)

    @test.create_stubs({api.neutron: ('is_router_enabled',
                                      'is_extension_supported',
                                      'is_quotas_extension_supported',),
                        api.cinder: ('is_volume_service_enabled',),
                        api.base: ('is_service_enabled',)})
    def test_get_disabled_quotas_router_disabled(self):
        api.cinder.is_volume_service_enabled(
            IsA(http.HttpRequest)
        ).AndReturn(True)
        api.base.is_service_enabled(IsA(http.HttpRequest),
                                    'network').AndReturn(True)
        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'security-group').AndReturn(True)
        api.neutron.is_router_enabled(IsA(http.HttpRequest)).AndReturn(False)
        api.neutron.is_quotas_extension_supported(IsA(http.HttpRequest)) \
            .AndReturn(True)
        api.base.is_service_enabled(IsA(http.HttpRequest),
                                    'compute').AndReturn(True)

        self.mox.ReplayAll()

        disabled_quotas = quotas.get_disabled_quotas(self.request)
        expected = set(['router', 'floatingip'])
        self.assertEqual(expected, disabled_quotas)

    def test_tenant_quota_usages_with_target_instances(self):
        self._test_tenant_quota_usages_with_target(targets=('instances', ))

    def test_tenant_quota_usages_with_target_ram(self):
        self._test_tenant_quota_usages_with_target(
            targets=('ram', ), use_flavor_list=True)

    def test_tenant_quota_usages_with_target_volume(self):
        self._test_tenant_quota_usages_with_target(
            targets=('volumes', ), use_compute_call=False,
            use_cinder_call=True)

    def test_tenant_quota_usages_with_target_compute_volume(self):
        self._test_tenant_quota_usages_with_target(
            targets=('instances', 'cores', 'ram', 'volumes', ),
            use_flavor_list=True, use_cinder_call=True)

    @test.create_stubs({api.nova: ('tenant_absolute_limits',),
                        api.base: ('is_service_enabled',),
                        cinder: ('tenant_absolute_limits',
                                 'is_volume_service_enabled')})
    def _test_tenant_quota_usages_with_target(
            self, targets,
            use_compute_call=True,
            use_flavor_list=False, use_cinder_call=False):
        tenant_id = self.request.user.tenant_id
        cinder.is_volume_service_enabled(IsA(http.HttpRequest)).AndReturn(True)
        api.base.is_service_enabled(IsA(http.HttpRequest), 'network') \
            .AndReturn(False)
        api.base.is_service_enabled(IsA(http.HttpRequest), 'compute') \
            .MultipleTimes().AndReturn(True)

        if use_compute_call:
            api.nova.tenant_absolute_limits(
                IsA(http.HttpRequest),
                reserved=True,
                tenant_id=tenant_id).AndReturn(self.limits['absolute'])

        if use_cinder_call:
            api.cinder.tenant_absolute_limits(
                IsA(http.HttpRequest),
                tenant_id).AndReturn(self.cinder_limits['absolute'])

        self.mox.ReplayAll()

        quota_usages = quotas.tenant_quota_usages(self.request,
                                                  targets=targets)

        expected = self.get_usages_from_limits()
        expected = dict((k, v) for k, v in expected.items() if k in targets)

        # Compare internal structure of usages to expected.
        self.assertItemsEqual(expected, quota_usages.usages)
        # Compare available resources
        self.assertAvailableQuotasEqual(expected, quota_usages.usages)

    def test_tenant_quota_usages_neutron_with_target_network_resources(self):
        self._test_tenant_quota_usages_neutron_with_target(
            targets=('network', 'subnet', 'router', ))

    def test_tenant_quota_usages_neutron_with_target_security_groups(self):
        self._test_tenant_quota_usages_neutron_with_target(
            targets=('security_group', ))

    def test_tenant_quota_usages_neutron_with_target_floating_ips(self):
        self._test_tenant_quota_usages_neutron_with_target(
            targets=('floatingip', ))

    @test.create_stubs({api.base: ('is_service_enabled',),
                        api.neutron: ('floating_ip_supported',
                                      'tenant_floating_ip_list',
                                      'security_group_list',
                                      'is_extension_supported',
                                      'is_router_enabled',
                                      'is_quotas_extension_supported',
                                      'tenant_quota_get',
                                      'network_list',
                                      'subnet_list',
                                      'router_list'),
                        cinder: ('is_volume_service_enabled',)})
    def _test_tenant_quota_usages_neutron_with_target(
            self, targets):
        cinder.is_volume_service_enabled(IsA(http.HttpRequest)).AndReturn(True)
        api.base.is_service_enabled(IsA(http.HttpRequest), 'network') \
            .AndReturn(True)
        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'security-group').AndReturn(True)
        api.neutron.is_router_enabled(IsA(http.HttpRequest)).AndReturn(True)
        api.neutron.is_quotas_extension_supported(IsA(http.HttpRequest)) \
            .AndReturn(True)
        api.base.is_service_enabled(IsA(http.HttpRequest), 'compute') \
            .MultipleTimes().AndReturn(True)

        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'quota_details').AndReturn(False)
        api.neutron.tenant_quota_get(IsA(http.HttpRequest), '1') \
            .AndReturn(self.neutron_quotas.first())
        if 'network' in targets:
            api.neutron.network_list(IsA(http.HttpRequest),
                                     tenant_id=self.request.user.tenant_id) \
                .AndReturn(self.networks.list())
        if 'subnet' in targets:
            api.neutron.subnet_list(IsA(http.HttpRequest),
                                    tenant_id=self.request.user.tenant_id) \
                .AndReturn(self.subnets.list())
        if 'router' in targets:
            api.neutron.router_list(IsA(http.HttpRequest),
                                    tenant_id=self.request.user.tenant_id) \
                .AndReturn(self.routers.list())
        if 'floatingip' in targets:
            api.neutron.tenant_floating_ip_list(IsA(http.HttpRequest)) \
                .AndReturn(self.floating_ips.list())
        if 'security_group' in targets:
            api.neutron.security_group_list(IsA(http.HttpRequest)) \
                .AndReturn(self.security_groups.list())

        self.mox.ReplayAll()

        quota_usages = quotas.tenant_quota_usages(self.request,
                                                  targets=targets)

        network_used = len(self.networks.list())
        subnet_used = len(self.subnets.list())
        router_used = len(self.routers.list())
        fip_used = len(self.floating_ips.list())
        sg_used = len(self.security_groups.list())
        expected = {
            'network': {'used': network_used, 'quota': 10,
                        'available': 10 - network_used},
            'subnet': {'used': subnet_used, 'quota': 10,
                       'available': 10 - subnet_used},
            'router': {'used': router_used, 'quota': 10,
                       'available': 10 - router_used},
            'security_group': {'used': sg_used, 'quota': 20,
                               'available': 20 - sg_used},
            'floatingip': {'used': fip_used, 'quota': 50,
                           'available': 50 - fip_used},
        }
        expected = dict((k, v) for k, v in expected.items() if k in targets)

        # Compare internal structure of usages to expected.
        self.assertEqual(expected, quota_usages.usages)
        # Compare available resources
        self.assertAvailableQuotasEqual(expected, quota_usages.usages)
