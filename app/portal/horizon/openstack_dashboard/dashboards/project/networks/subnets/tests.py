# Copyright 2012 NEC Corporation
# Copyright 2015 Cisco Systems, Inc.
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

from django.core.urlresolvers import reverse
from django import http
from mox3.mox import IsA

from horizon.workflows import views

from openstack_dashboard import api
from openstack_dashboard.dashboards.project.networks \
    import tests as net_tests
from openstack_dashboard.test import helpers as test

DETAIL_URL = 'horizon:project:networks:subnets:detail'

NETWORKS_INDEX_URL = reverse('horizon:project:networks:index')
NETWORKS_DETAIL_URL = 'horizon:project:networks:detail'
form_data_subnet = net_tests.form_data_subnet


class NetworkSubnetTests(test.TestCase):

    @test.create_stubs({api.neutron: ('network_get',
                                      'subnet_get',)})
    def test_subnet_detail(self):
        network = self.networks.first()
        subnet = self.subnets.first()

        api.neutron.network_get(IsA(http.HttpRequest), network.id)\
            .MultipleTimes().AndReturn(network)
        api.neutron.subnet_get(IsA(http.HttpRequest), subnet.id)\
            .AndReturn(subnet)
        self.mox.ReplayAll()

        url = reverse(DETAIL_URL, args=[subnet.id])
        res = self.client.get(url)

        self.assertTemplateUsed(res, 'horizon/common/_detail.html')
        self.assertEqual(res.context['subnet'].id, subnet.id)

    @test.create_stubs({api.neutron: ('subnet_get',)})
    def test_subnet_detail_exception(self):
        subnet = self.subnets.first()
        api.neutron.subnet_get(IsA(http.HttpRequest), subnet.id)\
            .AndRaise(self.exceptions.neutron)

        self.mox.ReplayAll()

        url = reverse(DETAIL_URL, args=[subnet.id])
        res = self.client.get(url)

        self.assertRedirectsNoFollow(res, NETWORKS_INDEX_URL)

    @test.create_stubs({api.neutron: ('network_get',
                                      'subnet_get', 'subnetpool_get',
                                      'is_extension_supported')})
    def test_subnet_detail_with_subnetpool(self):
        network = self.networks.first()
        subnet = self.subnets.first()
        subnetpool = self.subnetpools.first()
        subnet.subnetpool_id = subnetpool.id

        api.neutron.network_get(IsA(http.HttpRequest), network.id)\
            .MultipleTimes().AndReturn(network)
        api.neutron.subnet_get(IsA(http.HttpRequest), subnet.id)\
            .AndReturn(subnet)
        api.neutron.is_extension_supported(
            IsA(http.HttpRequest), 'subnet_allocation').AndReturn(True)
        api.neutron.subnetpool_get(IsA(http.HttpRequest), subnetpool.id)\
            .AndReturn(subnetpool)
        self.mox.ReplayAll()

        url = reverse(DETAIL_URL, args=[subnet.id])
        res = self.client.get(url)

        self.assertTemplateUsed(res, 'horizon/common/_detail.html')
        self.assertEqual(subnet.id, res.context['subnet'].id)
        self.assertEqual(subnetpool.id, res.context['subnet'].subnetpool_id)
        self.assertEqual(subnetpool.name,
                         res.context['subnet'].subnetpool_name)

    @test.create_stubs({api.neutron: ('network_get',
                                      'subnet_get')})
    def test_subnet_detail_with_subnetpool_prefixdelegation(self):
        network = self.networks.first()
        subnet = self.subnets.first()
        subnet.subnetpool_id = 'prefix_delegation'

        api.neutron.network_get(IsA(http.HttpRequest), network.id)\
            .MultipleTimes().AndReturn(network)
        api.neutron.subnet_get(IsA(http.HttpRequest), subnet.id)\
            .AndReturn(subnet)
        self.mox.ReplayAll()

        url = reverse(DETAIL_URL, args=[subnet.id])
        res = self.client.get(url)

        self.assertTemplateUsed(res, 'horizon/common/_detail.html')
        self.assertEqual(subnet.id, res.context['subnet'].id)
        self.assertEqual('prefix_delegation',
                         res.context['subnet'].subnetpool_id)

    @test.create_stubs({api.neutron: ('network_get',
                                      'is_extension_supported',
                                      'subnetpool_list')})
    def test_subnet_create_get(self):
        network = self.networks.first()
        api.neutron.network_get(IsA(http.HttpRequest),
                                network.id)\
            .AndReturn(self.networks.first())
        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'subnet_allocation') \
            .AndReturn(True)
        api.neutron.subnetpool_list(IsA(http.HttpRequest)).\
            AndReturn(self.subnetpools.list())
        self.mox.ReplayAll()

        url = reverse('horizon:project:networks:createsubnet',
                      args=[network.id])
        res = self.client.get(url)

        self.assertTemplateUsed(res, views.WorkflowView.template_name)

    @test.create_stubs({api.neutron: ('network_get',
                                      'subnet_create',
                                      'is_extension_supported',
                                      'subnetpool_list')})
    def test_subnet_create_post(self):
        network = self.networks.first()
        subnet = self.subnets.first()
        api.neutron.network_get(IsA(http.HttpRequest),
                                network.id)\
            .AndReturn(self.networks.first())
        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'subnet_allocation') \
            .AndReturn(True)
        api.neutron.subnetpool_list(IsA(http.HttpRequest)).\
            AndReturn(self.subnetpools.list())
        api.neutron.subnet_create(IsA(http.HttpRequest),
                                  network_id=network.id,
                                  name=subnet.name,
                                  cidr=subnet.cidr,
                                  ip_version=subnet.ip_version,
                                  gateway_ip=subnet.gateway_ip,
                                  enable_dhcp=subnet.enable_dhcp,
                                  allocation_pools=subnet.allocation_pools)\
            .AndReturn(subnet)
        self.mox.ReplayAll()

        form_data = form_data_subnet(subnet)
        url = reverse('horizon:project:networks:createsubnet',
                      args=[subnet.network_id])
        res = self.client.post(url, form_data)

        self.assertNoFormErrors(res)
        redir_url = reverse(NETWORKS_DETAIL_URL, args=[subnet.network_id])
        self.assertRedirectsNoFollow(res, redir_url)

    @test.create_stubs({api.neutron: ('network_get',
                                      'subnet_create',
                                      'is_extension_supported',
                                      'subnetpool_list')})
    def test_subnet_create_post_with_additional_attributes(self):
        network = self.networks.list()[1]
        subnet = self.subnets.list()[2]
        api.neutron.network_get(IsA(http.HttpRequest),
                                network.id)\
            .AndReturn(self.networks.first())
        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'subnet_allocation') \
            .AndReturn(True)
        api.neutron.subnetpool_list(IsA(http.HttpRequest)).\
            AndReturn(self.subnetpools.list())
        api.neutron.subnet_create(IsA(http.HttpRequest),
                                  network_id=network.id,
                                  name=subnet.name,
                                  cidr=subnet.cidr,
                                  ip_version=subnet.ip_version,
                                  gateway_ip=subnet.gateway_ip,
                                  enable_dhcp=subnet.enable_dhcp,
                                  allocation_pools=subnet.allocation_pools,
                                  dns_nameservers=subnet.dns_nameservers,
                                  host_routes=subnet.host_routes)\
            .AndReturn(subnet)
        self.mox.ReplayAll()

        form_data = form_data_subnet(subnet)
        url = reverse('horizon:project:networks:createsubnet',
                      args=[subnet.network_id])
        res = self.client.post(url, form_data)

        self.assertNoFormErrors(res)
        redir_url = reverse(NETWORKS_DETAIL_URL, args=[subnet.network_id])
        self.assertRedirectsNoFollow(res, redir_url)

    @test.create_stubs({api.neutron: ('network_get',
                                      'subnet_create',
                                      'is_extension_supported',
                                      'subnetpool_list')})
    def test_subnet_create_post_with_additional_attributes_no_gateway(self):
        network = self.networks.first()
        subnet = self.subnets.first()
        api.neutron.network_get(IsA(http.HttpRequest),
                                network.id)\
            .AndReturn(self.networks.first())
        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'subnet_allocation') \
            .AndReturn(True)
        api.neutron.subnetpool_list(IsA(http.HttpRequest)).\
            AndReturn(self.subnetpools.list())
        api.neutron.subnet_create(IsA(http.HttpRequest),
                                  network_id=network.id,
                                  name=subnet.name,
                                  cidr=subnet.cidr,
                                  ip_version=subnet.ip_version,
                                  gateway_ip=None,
                                  enable_dhcp=subnet.enable_dhcp,
                                  allocation_pools=subnet.allocation_pools)\
            .AndReturn(subnet)
        self.mox.ReplayAll()

        form_data = form_data_subnet(subnet, gateway_ip=None)
        url = reverse('horizon:project:networks:createsubnet',
                      args=[subnet.network_id])
        res = self.client.post(url, form_data)

        self.assertNoFormErrors(res)
        redir_url = reverse(NETWORKS_DETAIL_URL, args=[subnet.network_id])
        self.assertRedirectsNoFollow(res, redir_url)

    @test.create_stubs({api.neutron: ('network_get',
                                      'subnet_create',)})
    def test_subnet_create_post_network_exception(self, with_subnetpool=False):
        network = self.networks.first()
        subnet = self.subnets.first()
        api.neutron.network_get(IsA(http.HttpRequest),
                                network.id)\
            .AndRaise(self.exceptions.neutron)
        self.mox.ReplayAll()

        form_data = {}
        if with_subnetpool:
            subnetpool = self.subnetpools.first()
            form_data['subnetpool'] = subnetpool.id
        form_data.update(form_data_subnet(subnet, allocation_pools=[]))

        url = reverse('horizon:project:networks:createsubnet',
                      args=[subnet.network_id])
        res = self.client.post(url, form_data)

        self.assertNoFormErrors(res)
        self.assertRedirectsNoFollow(res, NETWORKS_INDEX_URL)

    def test_subnet_create_post_network_exception_with_subnetpool(self):
        self.test_subnet_create_post_network_exception(
            with_subnetpool=True)

    @test.create_stubs({api.neutron: ('network_get',
                                      'subnet_create',
                                      'is_extension_supported',
                                      'subnetpool_list')})
    def test_subnet_create_post_subnet_exception(self):
        network = self.networks.first()
        subnet = self.subnets.first()
        api.neutron.network_get(IsA(http.HttpRequest),
                                network.id)\
            .AndReturn(self.networks.first())
        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'subnet_allocation') \
            .AndReturn(True)
        api.neutron.subnetpool_list(IsA(http.HttpRequest)).\
            AndReturn(self.subnetpools.list())
        api.neutron.subnet_create(IsA(http.HttpRequest),
                                  network_id=network.id,
                                  name=subnet.name,
                                  cidr=subnet.cidr,
                                  ip_version=subnet.ip_version,
                                  gateway_ip=subnet.gateway_ip,
                                  enable_dhcp=subnet.enable_dhcp)\
            .AndRaise(self.exceptions.neutron)
        self.mox.ReplayAll()

        form_data = form_data_subnet(subnet, allocation_pools=[])
        url = reverse('horizon:project:networks:createsubnet',
                      args=[subnet.network_id])
        res = self.client.post(url, form_data)

        redir_url = reverse(NETWORKS_DETAIL_URL, args=[subnet.network_id])
        self.assertRedirectsNoFollow(res, redir_url)

    @test.create_stubs({api.neutron: ('network_get',
                                      'is_extension_supported',
                                      'subnetpool_list',)})
    def test_subnet_create_post_cidr_inconsistent(self, with_subnetpool=False):
        network = self.networks.first()
        subnet = self.subnets.first()
        api.neutron.network_get(IsA(http.HttpRequest),
                                network.id)\
            .AndReturn(self.networks.first())

        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'subnet_allocation').\
            AndReturn(True)
        api.neutron.subnetpool_list(IsA(http.HttpRequest)).\
            AndReturn(self.subnetpools.list())

        self.mox.ReplayAll()

        form_data = {}
        if with_subnetpool:
            subnetpool = self.subnetpools.first()
            form_data['subnetpool'] = subnetpool.id

        # dummy IPv6 address
        cidr = '2001:0DB8:0:CD30:123:4567:89AB:CDEF/60'
        form_data.update(form_data_subnet(subnet, cidr=cidr,
                                          allocation_pools=[]))
        url = reverse('horizon:project:networks:createsubnet',
                      args=[subnet.network_id])
        res = self.client.post(url, form_data)

        expected_msg = 'Network Address and IP version are inconsistent.'
        self.assertFormErrors(res, 1, expected_msg)
        self.assertTemplateUsed(res, views.WorkflowView.template_name)

    def test_subnet_create_post_cidr_inconsistent_with_subnetpool(self):
        self.test_subnet_create_post_cidr_inconsistent(
            with_subnetpool=True)

    @test.create_stubs({api.neutron: ('network_get',
                                      'is_extension_supported',
                                      'subnetpool_list',)})
    def test_subnet_create_post_gw_inconsistent(self, with_subnetpool=False):
        network = self.networks.first()
        subnet = self.subnets.first()
        api.neutron.network_get(IsA(http.HttpRequest),
                                network.id)\
            .AndReturn(self.networks.first())

        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'subnet_allocation').\
            AndReturn(True)
        api.neutron.subnetpool_list(IsA(http.HttpRequest)).\
            AndReturn(self.subnetpools.list())

        self.mox.ReplayAll()

        form_data = {}
        if with_subnetpool:
            subnetpool = self.subnetpools.first()
            form_data['subnetpool'] = subnetpool.id

        # dummy IPv6 address
        gateway_ip = '2001:0DB8:0:CD30:123:4567:89AB:CDEF'
        form_data.update(form_data_subnet(subnet, gateway_ip=gateway_ip,
                                          allocation_pools=[]))
        url = reverse('horizon:project:networks:createsubnet',
                      args=[subnet.network_id])
        res = self.client.post(url, form_data)

        self.assertContains(res, 'Gateway IP and IP version are inconsistent.')

    def test_subnet_create_post_gw_inconsistent_with_subnetpool(self):
        self.test_subnet_create_post_gw_inconsistent(with_subnetpool=True)

    @test.create_stubs({api.neutron: ('network_get',
                                      'is_extension_supported',
                                      'subnetpool_list',)})
    def _test_subnet_create_post_invalid_pools(self, with_subnetpool,
                                               allocation_pools):
        network = self.networks.first()
        subnet = self.subnets.first()
        api.neutron.network_get(IsA(http.HttpRequest),
                                network.id).AndReturn(network)

        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'subnet_allocation').\
            AndReturn(True)
        api.neutron.subnetpool_list(IsA(http.HttpRequest)).\
            AndReturn(self.subnetpools.list())

        self.mox.ReplayAll()

        form_data = {}
        if with_subnetpool:
            subnetpool = self.subnetpools.first()
            form_data['subnetpool'] = subnetpool.id

        # Start only allocation_pools
        form_data.update(form_data_subnet(subnet,
                                          allocation_pools=allocation_pools))
        url = reverse('horizon:project:networks:createsubnet',
                      args=[subnet.network_id])
        res = self.client.post(url, form_data)
        return res

    def test_subnet_create_post_invalid_pools_start_only(
            self, with_subnetpool=False):
        allocation_pools = '10.0.0.2'
        res = self._test_subnet_create_post_invalid_pools(with_subnetpool,
                                                          allocation_pools)
        self.assertContains(res,
                            'Start and end addresses must be specified '
                            '(value=%s)' % allocation_pools)

    def test_subnet_create_post_invalid_pools_start_only_with_subnetpool(self):
        self.test_subnet_create_post_invalid_pools_start_only(
            with_subnetpool=True)

    def test_subnet_create_post_invalid_pools_three_entries(
            self, with_subnetpool=False):
        allocation_pools = '10.0.0.2,10.0.0.3,10.0.0.4'
        res = self._test_subnet_create_post_invalid_pools(with_subnetpool,
                                                          allocation_pools)
        self.assertContains(res,
                            'Start and end addresses must be specified '
                            '(value=%s)' % allocation_pools)

    def test_subnet_create_post_invalid_pools_three_entries_w_subnetpool(self):
        self.test_subnet_create_post_invalid_pools_three_entries(
            with_subnetpool=True)

    def test_subnet_create_post_invalid_pools_invalid_address(
            self, with_subnetpool=False):
        allocation_pools = '10.0.0.2,invalid_address'
        res = self._test_subnet_create_post_invalid_pools(with_subnetpool,
                                                          allocation_pools)
        self.assertContains(res,
                            'allocation_pools: Invalid IP address '
                            '(value=%s)' % allocation_pools.split(',')[1])

    def test_subnet_create_post_invalid_pools_invalid_address_w_snpool(self):
        self.test_subnet_create_post_invalid_pools_invalid_address(
            with_subnetpool=True)

    def test_subnet_create_post_invalid_pools_ip_network(
            self, with_subnetpool=False):
        allocation_pools = '10.0.0.2/24,10.0.0.5'
        res = self._test_subnet_create_post_invalid_pools(with_subnetpool,
                                                          allocation_pools)
        self.assertContains(res,
                            'allocation_pools: Invalid IP address '
                            '(value=%s)' % allocation_pools.split(',')[0])

    def test_subnet_create_post_invalid_pools_ip_network_with_subnetpool(self):
        self.test_subnet_create_post_invalid_pools_ip_network(
            with_subnetpool=True)

    def test_subnet_create_post_invalid_pools_start_larger_than_end(
            self, with_subnetpool=False):
        allocation_pools = '10.0.0.254,10.0.0.2'
        res = self._test_subnet_create_post_invalid_pools(with_subnetpool,
                                                          allocation_pools)
        self.assertContains(res,
                            'Start address is larger than end address '
                            '(value=%s)' % allocation_pools)

    def test_subnet_create_post_invalid_pools_start_larger_than_end_with_pool(
            self):
        self.test_subnet_create_post_invalid_pools_start_larger_than_end(
            with_subnetpool=True)

    @test.create_stubs({api.neutron: ('network_get',
                                      'is_extension_supported',
                                      'subnetpool_list',)})
    def test_subnet_create_post_invalid_nameservers(self,
                                                    with_subnetpool=False):
        network = self.networks.first()
        subnet = self.subnets.first()
        api.neutron.network_get(IsA(http.HttpRequest),
                                network.id).AndReturn(network)

        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'subnet_allocation').\
            AndReturn(True)
        api.neutron.subnetpool_list(IsA(http.HttpRequest)).\
            AndReturn(self.subnetpools.list())

        self.mox.ReplayAll()

        form_data = {}
        if with_subnetpool:
            subnetpool = self.subnetpools.first()
            form_data['subnetpool'] = subnetpool.id

        # invalid DNS server address
        dns_nameservers = ['192.168.0.2', 'invalid_address']
        form_data.update(form_data_subnet(subnet,
                                          dns_nameservers=dns_nameservers,
                                          allocation_pools=[]))
        url = reverse('horizon:project:networks:createsubnet',
                      args=[subnet.network_id])
        res = self.client.post(url, form_data)

        self.assertContains(res,
                            'dns_nameservers: Invalid IP address '
                            '(value=%s)' % dns_nameservers[1])

    def test_subnet_create_post_invalid_nameservers_with_subnetpool(self):
        self.test_subnet_create_post_invalid_nameservers(
            with_subnetpool=True)

    @test.create_stubs({api.neutron: ('network_get',
                                      'is_extension_supported',
                                      'subnetpool_list',)})
    def _test_subnet_create_post_invalid_routes(self, with_subnetpool,
                                                host_routes):
        network = self.networks.first()
        subnet = self.subnets.first()
        api.neutron.network_get(IsA(http.HttpRequest),
                                network.id).AndReturn(network)

        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'subnet_allocation').\
            AndReturn(True)

        api.neutron.subnetpool_list(IsA(http.HttpRequest)).\
            AndReturn(self.subnetpools.list())

        self.mox.ReplayAll()

        form_data = {}
        if with_subnetpool:
            subnetpool = self.subnetpools.first()
            form_data['subnetpool'] = subnetpool.id

        form_data.update(form_data_subnet(subnet,
                                          allocation_pools=[],
                                          host_routes=host_routes))
        url = reverse('horizon:project:networks:createsubnet',
                      args=[subnet.network_id])
        res = self.client.post(url, form_data)
        return res

    def test_subnet_create_post_invalid_routes_destination_only(
            self, with_subnetpool=False):
        host_routes = '192.168.0.0/24'
        res = self._test_subnet_create_post_invalid_routes(with_subnetpool,
                                                           host_routes)
        self.assertContains(res,
                            'Host Routes format error: '
                            'Destination CIDR and nexthop must be specified '
                            '(value=%s)' % host_routes)

    def test_subnet_create_post_invalid_routes_dest_only_with_pool(self):
        self.test_subnet_create_post_invalid_routes_destination_only(
            with_subnetpool=True)

    def test_subnet_create_post_invalid_routes_three_entries(
            self, with_subnetpool=False):
        host_routes = 'aaaa,bbbb,cccc'
        res = self._test_subnet_create_post_invalid_routes(with_subnetpool,
                                                           host_routes)
        self.assertContains(res,
                            'Host Routes format error: '
                            'Destination CIDR and nexthop must be specified '
                            '(value=%s)' % host_routes)

    def test_subnet_create_post_invalid_routes_three_entries_with_pool(self):
        self.test_subnet_create_post_invalid_routes_three_entries(
            with_subnetpool=True)

    def test_subnet_create_post_invalid_routes_invalid_destination(
            self, with_subnetpool=False):
        host_routes = '172.16.0.0/64,10.0.0.253'
        res = self._test_subnet_create_post_invalid_routes(with_subnetpool,
                                                           host_routes)
        self.assertContains(res,
                            'host_routes: Invalid IP address '
                            '(value=%s)' % host_routes.split(',')[0])

    def test_subnet_create_post_invalid_routes_invalid_dest_with_pool(self):
        self.test_subnet_create_post_invalid_routes_invalid_destination(
            with_subnetpool=True)

    def test_subnet_create_post_invalid_routes_nexthop_ip_network(
            self, with_subnetpool=False):
        host_routes = '172.16.0.0/24,10.0.0.253/24'
        res = self._test_subnet_create_post_invalid_routes(with_subnetpool,
                                                           host_routes)
        self.assertContains(res,
                            'host_routes: Invalid IP address '
                            '(value=%s)' % host_routes.split(',')[1])

    def test_subnet_create_post_invalid_routes_nexthop_ip_network_with_pool(
            self):
        self.test_subnet_create_post_invalid_routes_nexthop_ip_network(
            with_subnetpool=True)

    @test.create_stubs({api.neutron: ('is_extension_supported',
                                      'network_get',
                                      'subnet_create',
                                      'subnetpool_list',)})
    def test_v6subnet_create_post(self):
        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'subnet_allocation').\
            AndReturn(True)
        api.neutron.subnetpool_list(IsA(http.HttpRequest)).\
            AndReturn(self.subnetpools.list())
        network = self.networks.get(name="v6_net1")
        subnet = self.subnets.get(name="v6_subnet1")
        api.neutron.network_get(IsA(http.HttpRequest),
                                network.id)\
            .AndReturn(network)
        api.neutron.subnet_create(IsA(http.HttpRequest),
                                  network_id=network.id,
                                  name=subnet.name,
                                  cidr=subnet.cidr,
                                  ip_version=subnet.ip_version,
                                  gateway_ip=subnet.gateway_ip,
                                  enable_dhcp=subnet.enable_dhcp,
                                  allocation_pools=subnet.allocation_pools)\
            .AndReturn(subnet)
        self.mox.ReplayAll()

        form_data = form_data_subnet(subnet)
        url = reverse('horizon:project:networks:createsubnet',
                      args=[subnet.network_id])
        res = self.client.post(url, form_data)

        self.assertNoFormErrors(res)
        redir_url = reverse(NETWORKS_DETAIL_URL, args=[subnet.network_id])
        self.assertRedirectsNoFollow(res, redir_url)

    @test.create_stubs({api.neutron: ('network_get',
                                      'subnet_create',
                                      'is_extension_supported',
                                      'subnetpool_list')})
    def test_v6subnet_create_post_with_slaac_attributes(self):
        network = self.networks.get(name="v6_net2")
        subnet = self.subnets.get(name="v6_subnet2")
        api.neutron.network_get(IsA(http.HttpRequest),
                                network.id)\
            .AndReturn(network)
        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'subnet_allocation') \
            .AndReturn(True)
        api.neutron.subnetpool_list(IsA(http.HttpRequest)).\
            AndReturn(self.subnetpools.list())
        api.neutron.subnet_create(IsA(http.HttpRequest),
                                  network_id=network.id,
                                  name=subnet.name,
                                  cidr=subnet.cidr,
                                  ip_version=subnet.ip_version,
                                  gateway_ip=subnet.gateway_ip,
                                  enable_dhcp=subnet.enable_dhcp,
                                  allocation_pools=subnet.allocation_pools,
                                  ipv6_address_mode='slaac',
                                  ipv6_ra_mode='slaac')\
            .AndReturn(subnet)
        self.mox.ReplayAll()

        form_data = form_data_subnet(subnet)
        url = reverse('horizon:project:networks:createsubnet',
                      args=[subnet.network_id])
        res = self.client.post(url, form_data)

        self.assertNoFormErrors(res)
        redir_url = reverse(NETWORKS_DETAIL_URL, args=[subnet.network_id])
        self.assertRedirectsNoFollow(res, redir_url)

    @test.create_stubs({api.neutron: ('subnet_update',
                                      'subnet_get',
                                      'is_extension_supported',
                                      'subnetpool_list')})
    def test_subnet_update_post(self):
        subnet = self.subnets.first()
        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'subnet_allocation') \
            .AndReturn(True)
        api.neutron.subnetpool_list(IsA(http.HttpRequest)).\
            AndReturn(self.subnetpools.list())
        api.neutron.subnet_get(IsA(http.HttpRequest), subnet.id)\
            .AndReturn(subnet)
        api.neutron.subnet_get(IsA(http.HttpRequest), subnet.id)\
            .AndReturn(subnet)
        api.neutron.subnet_update(IsA(http.HttpRequest), subnet.id,
                                  name=subnet.name,
                                  enable_dhcp=subnet.enable_dhcp,
                                  dns_nameservers=[],
                                  host_routes=[])\
            .AndReturn(subnet)
        self.mox.ReplayAll()

        form_data = form_data_subnet(subnet,
                                     allocation_pools=[])
        url = reverse('horizon:project:networks:editsubnet',
                      args=[subnet.network_id, subnet.id])
        res = self.client.post(url, form_data)

        redir_url = reverse(NETWORKS_DETAIL_URL, args=[subnet.network_id])
        self.assertRedirectsNoFollow(res, redir_url)

    @test.create_stubs({api.neutron: ('subnet_update',
                                      'subnet_get',
                                      'is_extension_supported',
                                      'subnetpool_list')})
    def test_subnet_update_post_with_gateway_ip(self):
        subnet = self.subnets.first()
        api.neutron.subnet_get(IsA(http.HttpRequest), subnet.id)\
            .MultipleTimes().AndReturn(subnet)
        gateway_ip = '10.0.0.100'
        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'subnet_allocation') \
            .AndReturn(True)
        api.neutron.subnetpool_list(IsA(http.HttpRequest)) \
            .AndReturn(self.subnetpools.list())
        api.neutron.subnet_update(IsA(http.HttpRequest), subnet.id,
                                  name=subnet.name,
                                  gateway_ip=gateway_ip,
                                  enable_dhcp=subnet.enable_dhcp,
                                  dns_nameservers=[],
                                  host_routes=[])\
            .AndReturn(subnet)
        self.mox.ReplayAll()

        form_data = form_data_subnet(subnet,
                                     gateway_ip=gateway_ip,
                                     allocation_pools=[])
        url = reverse('horizon:project:networks:editsubnet',
                      args=[subnet.network_id, subnet.id])
        res = self.client.post(url, form_data)

        redir_url = reverse(NETWORKS_DETAIL_URL, args=[subnet.network_id])
        self.assertRedirectsNoFollow(res, redir_url)

    @test.create_stubs({api.neutron: ('subnet_update',
                                      'subnet_get',
                                      'is_extension_supported',
                                      'subnetpool_list')})
    def test_subnet_update_post_no_gateway(self):
        subnet = self.subnets.first()
        api.neutron.subnet_get(IsA(http.HttpRequest), subnet.id)\
            .MultipleTimes().AndReturn(subnet)
        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'subnet_allocation') \
            .AndReturn(True)
        api.neutron.subnetpool_list(IsA(http.HttpRequest)).\
            AndReturn(self.subnetpools.list())
        api.neutron.subnet_update(IsA(http.HttpRequest), subnet.id,
                                  name=subnet.name,
                                  gateway_ip=None,
                                  enable_dhcp=subnet.enable_dhcp,
                                  dns_nameservers=[],
                                  host_routes=[])\
            .AndReturn(subnet)
        self.mox.ReplayAll()

        form_data = form_data_subnet(subnet,
                                     gateway_ip=None,
                                     allocation_pools=[])
        url = reverse('horizon:project:networks:editsubnet',
                      args=[subnet.network_id, subnet.id])
        res = self.client.post(url, form_data)

        redir_url = reverse(NETWORKS_DETAIL_URL, args=[subnet.network_id])
        self.assertRedirectsNoFollow(res, redir_url)

    @test.create_stubs({api.neutron: ('subnet_update',
                                      'subnet_get',
                                      'is_extension_supported',
                                      'subnetpool_list')})
    def test_subnet_update_post_with_additional_attributes(self):
        subnet = self.subnets.list()[2]
        api.neutron.subnet_get(IsA(http.HttpRequest), subnet.id)\
            .AndReturn(subnet)
        api.neutron.subnet_get(IsA(http.HttpRequest), subnet.id)\
            .AndReturn(subnet)
        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'subnet_allocation') \
            .AndReturn(True)
        api.neutron.subnetpool_list(IsA(http.HttpRequest)).\
            AndReturn(self.subnetpools.list())
        start = subnet.allocation_pools[0]['start']
        end = subnet.allocation_pools[0]['end']
        api.neutron.subnet_update(IsA(http.HttpRequest), subnet.id,
                                  name=subnet.name,
                                  enable_dhcp=False,
                                  dns_nameservers=subnet.dns_nameservers,
                                  host_routes=subnet.host_routes,
                                  allocation_pools=[{'start': start,
                                                     'end': end}])\
            .AndReturn(subnet)
        self.mox.ReplayAll()

        form_data = form_data_subnet(subnet,
                                     enable_dhcp=False)
        url = reverse('horizon:project:networks:editsubnet',
                      args=[subnet.network_id, subnet.id])
        res = self.client.post(url, form_data)

        redir_url = reverse(NETWORKS_DETAIL_URL, args=[subnet.network_id])
        self.assertRedirectsNoFollow(res, redir_url)

    @test.create_stubs({api.neutron: ('subnet_update',
                                      'subnet_get',
                                      'is_extension_supported',
                                      'subnetpool_list')})
    def test_subnet_update_post_gw_inconsistent(self):
        subnet = self.subnets.first()
        api.neutron.subnet_get(IsA(http.HttpRequest), subnet.id)\
            .AndReturn(subnet)
        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'subnet_allocation') \
            .AndReturn(True)
        api.neutron.subnetpool_list(IsA(http.HttpRequest)).\
            AndReturn(self.subnetpools.list())
        self.mox.ReplayAll()

        # dummy IPv6 address
        gateway_ip = '2001:0DB8:0:CD30:123:4567:89AB:CDEF'
        form_data = form_data_subnet(subnet, gateway_ip=gateway_ip,
                                     allocation_pools=[])
        url = reverse('horizon:project:networks:editsubnet',
                      args=[subnet.network_id, subnet.id])
        res = self.client.post(url, form_data)

        self.assertContains(res, 'Gateway IP and IP version are inconsistent.')

    @test.create_stubs({api.neutron: ('subnet_update',
                                      'subnet_get',
                                      'is_extension_supported',
                                      'subnetpool_list')})
    def test_subnet_update_post_invalid_nameservers(self):
        subnet = self.subnets.first()
        api.neutron.subnet_get(IsA(http.HttpRequest), subnet.id)\
            .AndReturn(subnet)
        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'subnet_allocation') \
            .AndReturn(True)
        api.neutron.subnetpool_list(IsA(http.HttpRequest)).\
            AndReturn(self.subnetpools.list())
        self.mox.ReplayAll()

        # invalid DNS server address
        dns_nameservers = ['192.168.0.2', 'invalid_address']
        form_data = form_data_subnet(subnet, dns_nameservers=dns_nameservers,
                                     allocation_pools=[])
        url = reverse('horizon:project:networks:editsubnet',
                      args=[subnet.network_id, subnet.id])
        res = self.client.post(url, form_data)

        self.assertContains(res,
                            'dns_nameservers: Invalid IP address '
                            '(value=%s)' % dns_nameservers[1])

    def _test_subnet_update_post_invalid(self, host_routes):
        subnet = self.subnets.first()
        api.neutron.subnet_get(IsA(http.HttpRequest), subnet.id)\
            .AndReturn(subnet)
        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'subnet_allocation') \
            .AndReturn(True)
        api.neutron.subnetpool_list(IsA(http.HttpRequest)).\
            AndReturn(self.subnetpools.list())
        self.mox.ReplayAll()

        form_data = form_data_subnet(subnet,
                                     allocation_pools=[],
                                     host_routes=host_routes)
        url = reverse('horizon:project:networks:editsubnet',
                      args=[subnet.network_id, subnet.id])
        res = self.client.post(url, form_data)
        return res

    @test.create_stubs({api.neutron: ('subnet_update',
                                      'subnet_get',
                                      'is_extension_supported',
                                      'subnetpool_list')})
    def test_subnet_update_post_invalid_routes_destination_only(self):
        host_routes = '192.168.0.0/24'
        res = self._test_subnet_update_post_invalid(host_routes)
        self.assertContains(res,
                            'Host Routes format error: '
                            'Destination CIDR and nexthop must be specified '
                            '(value=%s)' % host_routes)

    @test.create_stubs({api.neutron: ('subnet_update',
                                      'subnet_get',
                                      'is_extension_supported',
                                      'subnetpool_list')})
    def test_subnet_update_post_invalid_routes_three_entries(self):
        host_routes = 'aaaa,bbbb,cccc'
        res = self._test_subnet_update_post_invalid(host_routes)
        self.assertContains(res,
                            'Host Routes format error: '
                            'Destination CIDR and nexthop must be specified '
                            '(value=%s)' % host_routes)

    @test.create_stubs({api.neutron: ('subnet_update',
                                      'subnet_get',
                                      'is_extension_supported',
                                      'subnetpool_list')})
    def test_subnet_update_post_invalid_routes_invalid_destination(self):
        host_routes = '172.16.0.0/64,10.0.0.253'
        res = self._test_subnet_update_post_invalid(host_routes)
        self.assertContains(res,
                            'host_routes: Invalid IP address '
                            '(value=%s)' % host_routes.split(',')[0])

    @test.create_stubs({api.neutron: ('subnet_update',
                                      'subnet_get',
                                      'is_extension_supported',
                                      'subnetpool_list')})
    def test_subnet_update_post_invalid_routes_nexthop_ip_network(self):
        host_routes = '172.16.0.0/24,10.0.0.253/24'
        res = self._test_subnet_update_post_invalid(host_routes)
        self.assertContains(res,
                            'host_routes: Invalid IP address '
                            '(value=%s)' % host_routes.split(',')[1])

    @test.create_stubs({api.neutron: ('subnet_delete',
                                      'subnet_list',
                                      'network_get',
                                      'port_list',
                                      'is_extension_supported',)})
    def test_subnet_delete(self):
        self._test_subnet_delete()

    @test.create_stubs({api.neutron: ('subnet_delete',
                                      'subnet_list',
                                      'port_list',
                                      'is_extension_supported',)})
    def test_subnet_delete_with_mac_learning(self):
        self._test_subnet_delete(mac_learning=True)

    def _test_subnet_delete(self, mac_learning=False):
        subnet = self.subnets.first()
        network_id = subnet.network_id
        api.neutron.subnet_delete(IsA(http.HttpRequest), subnet.id)
        api.neutron.subnet_list(IsA(http.HttpRequest), network_id=network_id)\
            .AndReturn([self.subnets.first()])
        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'mac-learning')\
            .AndReturn(mac_learning)
        self.mox.ReplayAll()

        form_data = {'action': 'subnets__delete__%s' % subnet.id}
        url = reverse(NETWORKS_DETAIL_URL, args=[network_id])
        res = self.client.post(url, form_data)

        self.assertRedirectsNoFollow(res, url)

    @test.create_stubs({api.neutron: ('subnet_delete',
                                      'subnet_list',
                                      'network_get',
                                      'port_list',
                                      'is_extension_supported',)})
    def test_subnet_delete_exception(self):
        self._test_subnet_delete_exception()

    @test.create_stubs({api.neutron: ('subnet_delete',
                                      'subnet_list',
                                      'port_list',
                                      'is_extension_supported',)})
    def test_subnet_delete_exception_with_mac_learning(self):
        self._test_subnet_delete_exception(mac_learning=True)

    def _test_subnet_delete_exception(self, mac_learning=False):
        subnet = self.subnets.first()
        network_id = subnet.network_id
        api.neutron.subnet_delete(IsA(http.HttpRequest), subnet.id)\
            .AndRaise(self.exceptions.neutron)
        api.neutron.subnet_list(IsA(http.HttpRequest), network_id=network_id)\
            .AndReturn([self.subnets.first()])
        api.neutron.is_extension_supported(IsA(http.HttpRequest),
                                           'mac-learning')\
            .AndReturn(mac_learning)
        self.mox.ReplayAll()

        form_data = {'action': 'subnets__delete__%s' % subnet.id}
        url = reverse(NETWORKS_DETAIL_URL, args=[network_id])
        res = self.client.post(url, form_data)

        self.assertRedirectsNoFollow(res, url)
