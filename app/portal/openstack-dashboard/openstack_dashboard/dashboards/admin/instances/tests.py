# Copyright 2012 Nebula, Inc.
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

from collections import OrderedDict
import uuid

from django.core.urlresolvers import reverse
from django import http

from mox3.mox import IsA

from openstack_dashboard import api
from openstack_dashboard.test import helpers as test


INDEX_URL = reverse('horizon:admin:instances:index')
INDEX_TEMPLATE = 'horizon/common/_data_table_view.html'


class InstanceViewTest(test.BaseAdminViewTests):
    @test.create_stubs({
        api.nova: ('flavor_list', 'server_list', 'extension_supported',),
        api.keystone: ('tenant_list',),
        api.glance: ('image_list_detailed',),
    })
    def test_index(self):
        servers = self.servers.list()
        flavors = self.flavors.list()
        tenants = self.tenants.list()
        images = self.images.list()
        api.nova.extension_supported('AdminActions', IsA(http.HttpRequest)) \
            .MultipleTimes().AndReturn(True)
        api.nova.extension_supported('Shelve', IsA(http.HttpRequest)) \
            .MultipleTimes().AndReturn(True)
        api.keystone.tenant_list(IsA(http.HttpRequest)).\
            AndReturn([tenants, False])
        search_opts = {'marker': None, 'paginate': True, 'all_tenants': True}
        api.glance.image_list_detailed(IsA(http.HttpRequest))\
            .AndReturn(images)
        api.nova.flavor_list(IsA(http.HttpRequest)).AndReturn(flavors)
        api.nova.server_list(IsA(http.HttpRequest),
                             search_opts=search_opts) \
            .AndReturn([servers, False])
        self.mox.ReplayAll()

        res = self.client.get(INDEX_URL)
        self.assertTemplateUsed(res, INDEX_TEMPLATE)
        instances = res.context['table'].data
        self.assertItemsEqual(instances, servers)

    @test.create_stubs({
        api.nova: ('flavor_list', 'flavor_get', 'server_list',
                   'extension_supported',),
        api.keystone: ('tenant_list',),
        api.glance: ('image_list_detailed',),
    })
    def test_index_flavor_list_exception(self):
        servers = self.servers.list()
        tenants = self.tenants.list()
        flavors = self.flavors.list()
        full_flavors = OrderedDict([(f.id, f) for f in flavors])
        search_opts = {'marker': None, 'paginate': True, 'all_tenants': True}
        api.nova.server_list(IsA(http.HttpRequest),
                             search_opts=search_opts) \
            .AndReturn([servers, False])
        api.nova.extension_supported('AdminActions', IsA(http.HttpRequest)) \
            .MultipleTimes().AndReturn(True)
        api.nova.extension_supported('Shelve', IsA(http.HttpRequest)) \
            .MultipleTimes().AndReturn(True)
        api.nova.flavor_list(IsA(http.HttpRequest)). \
            AndRaise(self.exceptions.nova)
        api.keystone.tenant_list(IsA(http.HttpRequest)).\
            AndReturn([tenants, False])
        for server in servers:
            api.nova.flavor_get(IsA(http.HttpRequest), server.flavor["id"]). \
                AndReturn(full_flavors[server.flavor["id"]])

        self.mox.ReplayAll()

        res = self.client.get(INDEX_URL)
        self.assertTemplateUsed(res, INDEX_TEMPLATE)
        instances = res.context['table'].data
        self.assertItemsEqual(instances, servers)

    @test.create_stubs({
        api.nova: ('flavor_list', 'flavor_get', 'server_list',
                   'extension_supported',),
        api.keystone: ('tenant_list',),
        api.glance: ('image_list_detailed',),
    })
    def test_index_flavor_get_exception(self):
        servers = self.servers.list()
        flavors = self.flavors.list()
        images = self.images.list()
        tenants = self.tenants.list()
        # UUIDs generated using indexes are unlikely to match
        # any of existing flavor ids and are guaranteed to be deterministic.
        for i, server in enumerate(servers):
            server.flavor['id'] = str(uuid.UUID(int=i))

        api.glance.image_list_detailed(IsA(http.HttpRequest))\
            .AndReturn((images, False, False))
        api.nova.flavor_list(IsA(http.HttpRequest)).AndReturn(flavors)
        search_opts = {'marker': None, 'paginate': True, 'all_tenants': True}
        api.nova.server_list(IsA(http.HttpRequest),
                             search_opts=search_opts) \
            .AndReturn([servers, False])
        api.nova.extension_supported('AdminActions', IsA(http.HttpRequest)) \
            .MultipleTimes().AndReturn(True)
        api.nova.extension_supported('Shelve', IsA(http.HttpRequest)) \
            .MultipleTimes().AndReturn(True)
        api.keystone.tenant_list(IsA(http.HttpRequest)).\
            AndReturn([tenants, False])
        for server in servers:
            api.nova.flavor_get(IsA(http.HttpRequest), server.flavor["id"]). \
                AndRaise(self.exceptions.nova)
        self.mox.ReplayAll()

        res = self.client.get(INDEX_URL)
        instances = res.context['table'].data
        self.assertTemplateUsed(res, INDEX_TEMPLATE)
        # Since error messages produced for each instance are identical,
        # there will be only one error message for all instances
        # (messages de-duplication).
        self.assertMessageCount(res, error=1)
        self.assertItemsEqual(instances, servers)

    @test.create_stubs({
        api.nova: ('server_list', 'flavor_list',),
        api.keystone: ('tenant_list',),
        api.glance: ('image_list_detailed',),
    })
    def test_index_server_list_exception(self):
        tenants = self.tenants.list()

        search_opts = {'marker': None, 'paginate': True, 'all_tenants': True}
        api.nova.server_list(IsA(http.HttpRequest),
                             search_opts=search_opts) \
            .AndRaise(self.exceptions.nova)
        api.keystone.tenant_list(IsA(http.HttpRequest)).\
            AndReturn([tenants, False])

        self.mox.ReplayAll()

        res = self.client.get(INDEX_URL)
        self.assertTemplateUsed(res, INDEX_TEMPLATE)
        self.assertEqual(len(res.context['instances_table'].data), 0)

    @test.create_stubs({api.nova: ('server_get', 'flavor_get',
                                   'extension_supported', ),
                        api.network: ('servers_update_addresses',),
                        api.keystone: ('tenant_get',)})
    def test_ajax_loading_instances(self):
        server = self.servers.first()
        flavor = self.flavors.list()[0]
        tenant = self.tenants.list()[0]
        api.nova.server_get(IsA(http.HttpRequest), server.id).AndReturn(server)
        api.nova.extension_supported('AdminActions', IsA(http.HttpRequest)) \
            .MultipleTimes().AndReturn(True)
        api.nova.extension_supported('Shelve', IsA(http.HttpRequest)) \
            .MultipleTimes().AndReturn(True)
        api.nova.flavor_get(IsA(http.HttpRequest),
                            server.flavor['id']).AndReturn(flavor)
        api.keystone.tenant_get(IsA(http.HttpRequest),
                                server.tenant_id,
                                admin=True).AndReturn(tenant)
        self.mox.ReplayAll()

        url = (INDEX_URL +
               "?action=row_update&table=instances&obj_id=" + server.id)

        res = self.client.get(url, {},
                              HTTP_X_REQUESTED_WITH='XMLHttpRequest')

        self.assertTemplateUsed(res, "horizon/common/_data_table_row.html")
        self.assertContains(res, "test_tenant", 1, 200)
        self.assertContains(res, "instance-host", 1, 200)
        # two instances of name, other name comes from row data-display
        self.assertContains(res, "server_1", 2, 200)
        self.assertContains(res, "10.0.0.1", 1, 200)
        self.assertContains(res, "RAM</th><td>512MB", 1, 200)
        self.assertContains(res, "VCPUs</th><td>1", 1, 200)
        self.assertContains(res, "Size</th><td>0 GB", 1, 200)
        self.assertContains(res, "Active", 1, 200)
        self.assertContains(res, "Running", 1, 200)

    @test.create_stubs({
        api.nova: ('flavor_list', 'server_list', 'extension_supported', ),
        api.keystone: ('tenant_list',),
        api.glance: ('image_list_detailed',),
    })
    def test_index_options_before_migrate(self):
        servers = self.servers.list()
        images = self.images.list()
        flavors = self.flavors.list()
        api.keystone.tenant_list(IsA(http.HttpRequest)).\
            AndReturn([self.tenants.list(), False])
        api.glance.image_list_detailed(IsA(http.HttpRequest)) \
            .AndReturn(images)
        api.nova.flavor_list(IsA(http.HttpRequest)).AndReturn(flavors)
        search_opts = {'marker': None, 'paginate': True, 'all_tenants': True}
        api.nova.server_list(IsA(http.HttpRequest),
                             search_opts=search_opts) \
            .AndReturn([servers, False])
        api.nova.extension_supported('AdminActions', IsA(http.HttpRequest)) \
            .MultipleTimes().AndReturn(True)
        api.nova.extension_supported('Shelve', IsA(http.HttpRequest)) \
            .MultipleTimes().AndReturn(True)
        self.mox.ReplayAll()

        res = self.client.get(INDEX_URL)
        self.assertContains(res, "instances__migrate")
        self.assertNotContains(res, "instances__confirm")
        self.assertNotContains(res, "instances__revert")

    @test.create_stubs({
        api.nova: ('flavor_list', 'server_list', 'extension_supported',),
        api.keystone: ('tenant_list',),
        api.glance: ('image_list_detailed',),
    })
    def test_index_options_after_migrate(self):
        servers = self.servers.list()
        server1 = servers[0]
        server1.status = "VERIFY_RESIZE"
        server2 = servers[2]
        server2.status = "VERIFY_RESIZE"
        images = self.images.list()
        flavors = self.flavors.list()
        api.keystone.tenant_list(IsA(http.HttpRequest)) \
            .AndReturn([self.tenants.list(), False])
        api.glance.image_list_detailed(IsA(http.HttpRequest)) \
            .AndReturn(images)
        api.nova.flavor_list(IsA(http.HttpRequest)).AndReturn(flavors)
        search_opts = {'marker': None, 'paginate': True, 'all_tenants': True}
        api.nova.extension_supported('AdminActions', IsA(http.HttpRequest)) \
            .MultipleTimes().AndReturn(True)
        api.nova.extension_supported('Shelve', IsA(http.HttpRequest)) \
            .MultipleTimes().AndReturn(True)
        api.nova.server_list(IsA(http.HttpRequest),
                             search_opts=search_opts) \
            .AndReturn([servers, False])
        self.mox.ReplayAll()

        res = self.client.get(INDEX_URL)
        self.assertContains(res, "instances__confirm")
        self.assertContains(res, "instances__revert")
        self.assertNotContains(res, "instances__migrate")

    @test.create_stubs({api.nova: ('service_list',
                                   'server_get',)})
    def test_instance_live_migrate_get(self):
        server = self.servers.first()
        compute_services = [s for s in self.services.list()
                            if s.binary == 'nova-compute']
        api.nova.server_get(IsA(http.HttpRequest), server.id) \
            .AndReturn(server)
        api.nova.service_list(IsA(http.HttpRequest), binary='nova-compute') \
            .AndReturn(compute_services)

        self.mox.ReplayAll()

        url = reverse('horizon:admin:instances:live_migrate',
                      args=[server.id])
        res = self.client.get(url)

        self.assertTemplateUsed(res, 'admin/instances/live_migrate.html')

    @test.create_stubs({api.nova: ('server_get',)})
    def test_instance_live_migrate_get_server_get_exception(self):
        server = self.servers.first()
        api.nova.server_get(IsA(http.HttpRequest), server.id) \
            .AndRaise(self.exceptions.nova)

        self.mox.ReplayAll()

        url = reverse('horizon:admin:instances:live_migrate',
                      args=[server.id])
        res = self.client.get(url)

        self.assertRedirectsNoFollow(res, INDEX_URL)

    @test.create_stubs({api.nova: ('service_list',
                                   'server_get',)})
    def test_instance_live_migrate_list_host_get_exception(self):
        server = self.servers.first()
        api.nova.server_get(IsA(http.HttpRequest), server.id) \
            .AndReturn(server)
        api.nova.service_list(IsA(http.HttpRequest), binary='nova-compute') \
            .AndRaise(self.exceptions.nova)

        self.mox.ReplayAll()
        url = reverse('horizon:admin:instances:live_migrate',
                      args=[server.id])
        res = self.client.get(url)

        self.assertRedirectsNoFollow(res, INDEX_URL)

    @test.create_stubs({api.nova: ('service_list',
                                   'server_get',)})
    def test_instance_live_migrate_list_host_without_current(self):
        server = self.servers.first()
        compute_services = [s for s in self.services.list()
                            if s.binary == 'nova-compute']
        api.nova.server_get(IsA(http.HttpRequest), server.id) \
            .AndReturn(server)
        api.nova.service_list(IsA(http.HttpRequest), binary='nova-compute') \
            .AndReturn(compute_services)

        self.mox.ReplayAll()

        url = reverse('horizon:admin:instances:live_migrate',
                      args=[server.id])
        res = self.client.get(url)
        self.assertContains(
            res, "<option value=\"devstack001\">devstack001</option>")
        self.assertContains(
            res, "<option value=\"devstack002\">devstack002</option>")
        self.assertNotContains(
            res, "<option value=\"instance-host\">instance-host</option>")

    @test.create_stubs({api.nova: ('service_list',
                                   'server_get',
                                   'server_live_migrate',)})
    def test_instance_live_migrate_post(self):
        server = self.servers.first()
        compute_services = [s for s in self.services.list()
                            if s.binary == 'nova-compute']
        host = compute_services[0].host

        api.nova.server_get(IsA(http.HttpRequest), server.id) \
            .AndReturn(server)
        api.nova.service_list(IsA(http.HttpRequest), binary='nova-compute') \
            .AndReturn(compute_services)
        api.nova.server_live_migrate(IsA(http.HttpRequest), server.id, host,
                                     block_migration=False,
                                     disk_over_commit=False) \
            .AndReturn([])

        self.mox.ReplayAll()

        url = reverse('horizon:admin:instances:live_migrate',
                      args=[server.id])
        res = self.client.post(url, {'host': host, 'instance_id': server.id})
        self.assertNoFormErrors(res)
        self.assertRedirectsNoFollow(res, INDEX_URL)

    @test.create_stubs({api.nova: ('service_list',
                                   'server_get',
                                   'server_live_migrate',)})
    def test_instance_live_migrate_auto_sched(self):
        server = self.servers.first()
        host = "AUTO_SCHEDULE"
        api.nova.server_get(IsA(http.HttpRequest), server.id) \
            .AndReturn(server)
        compute_services = [s for s in self.services.list()
                            if s.binary == 'nova-compute']
        api.nova.service_list(IsA(http.HttpRequest), binary='nova-compute') \
            .AndReturn(compute_services)
        api.nova.server_live_migrate(IsA(http.HttpRequest), server.id, None,
                                     block_migration=False,
                                     disk_over_commit=False) \
            .AndReturn([])

        self.mox.ReplayAll()

        url = reverse('horizon:admin:instances:live_migrate',
                      args=[server.id])
        res = self.client.post(url, {'host': host, 'instance_id': server.id})
        self.assertNoFormErrors(res)
        self.assertRedirectsNoFollow(res, INDEX_URL)

    @test.create_stubs({api.nova: ('service_list',
                                   'server_get',
                                   'server_live_migrate',)})
    def test_instance_live_migrate_post_api_exception(self):
        server = self.servers.first()
        compute_services = [s for s in self.services.list()
                            if s.binary == 'nova-compute']
        host = compute_services[0].host

        api.nova.server_get(IsA(http.HttpRequest), server.id) \
            .AndReturn(server)
        api.nova.service_list(IsA(http.HttpRequest), binary='nova-compute') \
            .AndReturn(compute_services)
        api.nova.server_live_migrate(IsA(http.HttpRequest), server.id, host,
                                     block_migration=False,
                                     disk_over_commit=False) \
            .AndRaise(self.exceptions.nova)

        self.mox.ReplayAll()

        url = reverse('horizon:admin:instances:live_migrate',
                      args=[server.id])
        res = self.client.post(url, {'host': host, 'instance_id': server.id})
        self.assertRedirectsNoFollow(res, INDEX_URL)

    @test.create_stubs({api.nova: ('server_get',)})
    def test_instance_details_exception(self):
        server = self.servers.first()

        api.nova.server_get(IsA(http.HttpRequest), server.id) \
            .AndRaise(self.exceptions.nova)

        self.mox.ReplayAll()

        url = reverse('horizon:admin:instances:detail',
                      args=[server.id])
        res = self.client.get(url)

        self.assertRedirectsNoFollow(res, INDEX_URL)

    @test.update_settings(FILTER_DATA_FIRST={'admin.instances': True})
    def test_index_with_admin_filter_first(self):
        res = self.client.get(INDEX_URL)
        self.assertTemplateUsed(res, INDEX_TEMPLATE)
        instances = res.context['table'].data
        self.assertItemsEqual(instances, [])
