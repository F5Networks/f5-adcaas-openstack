# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from django.conf import settings
from django import http
from django import test
from django.test.utils import override_settings

from openstack_auth import utils


class RoleTestCaseAdmin(test.TestCase):

    def test_get_admin_roles_with_default_value(self):
        admin_roles = utils.get_admin_roles()
        self.assertSetEqual({'admin'}, admin_roles)

    @override_settings(OPENSTACK_KEYSTONE_ADMIN_ROLES=['foO', 'BAR', 'admin'])
    def test_get_admin_roles(self):
        admin_roles = utils.get_admin_roles()
        self.assertSetEqual({'foo', 'bar', 'admin'}, admin_roles)

    @override_settings(OPENSTACK_KEYSTONE_ADMIN_ROLES=['foO', 'BAR', 'admin'])
    def test_get_admin_permissions(self):
        admin_permissions = utils.get_admin_permissions()
        self.assertSetEqual({'openstack.roles.foo',
                             'openstack.roles.bar',
                             'openstack.roles.admin'}, admin_permissions)


class UtilsTestCase(test.TestCase):

    def test_fix_auth_url_version_v20(self):
        settings.OPENSTACK_API_VERSIONS['identity'] = 2.0
        test_urls = [
            ("http://a/", ("http://a/v2.0", False)),
            ("http://a", ("http://a/v2.0", False)),
            ("http://a:8080/", ("http://a:8080/v2.0", False)),
            ("http://a/v2.0", ("http://a/v2.0", False)),
            ("http://a/v2.0/", ("http://a/v2.0/", False)),
            ("http://a/identity", ("http://a/identity/v2.0", False)),
            ("http://a/identity/", ("http://a/identity/v2.0", False)),
            ("http://a:5000/identity/v2.0",
             ("http://a:5000/identity/v2.0", False)),
            ("http://a/identity/v2.0/", ("http://a/identity/v2.0/", False))
        ]
        for src, expected in test_urls:
            self.assertEqual(expected, utils.fix_auth_url_version_prefix(src))

    def test_fix_auth_url_version_v3(self):
        settings.OPENSTACK_API_VERSIONS['identity'] = 3
        test_urls = [
            ("http://a/", ("http://a/v3", False)),
            ("http://a", ("http://a/v3", False)),
            ("http://a:8080/", ("http://a:8080/v3", False)),
            ("http://a/v3", ("http://a/v3", False)),
            ("http://a/v3/", ("http://a/v3/", False)),
            ("http://a/v2.0/", ("http://a/v3/", True)),
            ("http://a/v2.0", ("http://a/v3", True)),
            ("http://a/identity", ("http://a/identity/v3", False)),
            ("http://a:5000/identity/", ("http://a:5000/identity/v3", False)),
            ("http://a/identity/v3", ("http://a/identity/v3", False)),
            ("http://a/identity/v3/", ("http://a/identity/v3/", False))
        ]
        for src, expected in test_urls:
            self.assertEqual(expected, utils.fix_auth_url_version_prefix(src))


class BehindProxyTestCase(test.TestCase):

    def setUp(self):
        super(BehindProxyTestCase, self).setUp()
        self.request = http.HttpRequest()

    def test_without_proxy(self):
        self.request.META['REMOTE_ADDR'] = '10.111.111.2'
        from openstack_auth.utils import get_client_ip
        self.assertEqual('10.111.111.2', get_client_ip(self.request))

    def test_with_proxy_no_settings(self):
        from openstack_auth.utils import get_client_ip
        self.request.META['REMOTE_ADDR'] = '10.111.111.2'
        self.request.META['HTTP_X_REAL_IP'] = '192.168.15.33'
        self.request.META['HTTP_X_FORWARDED_FOR'] = '172.18.0.2'
        self.assertEqual('10.111.111.2', get_client_ip(self.request))

    def test_with_settings_without_proxy(self):
        from openstack_auth.utils import get_client_ip
        self.request.META['REMOTE_ADDR'] = '10.111.111.2'
        self.assertEqual('10.111.111.2', get_client_ip(self.request))

    @override_settings(SECURE_PROXY_ADDR_HEADER='HTTP_X_FORWARDED_FOR')
    def test_with_settings_with_proxy_forwardfor(self):
        from openstack_auth.utils import get_client_ip
        self.request.META['REMOTE_ADDR'] = '10.111.111.2'
        self.request.META['HTTP_X_FORWARDED_FOR'] = '172.18.0.2'
        self.assertEqual('172.18.0.2', get_client_ip(self.request))

    @override_settings(SECURE_PROXY_ADDR_HEADER='HTTP_X_REAL_IP')
    def test_with_settings_with_proxy_real_ip(self):
        from openstack_auth.utils import get_client_ip
        self.request.META['REMOTE_ADDR'] = '10.111.111.2'
        self.request.META['HTTP_X_REAL_IP'] = '192.168.15.33'
        self.request.META['HTTP_X_FORWARDED_FOR'] = '172.18.0.2'
        self.assertEqual('192.168.15.33', get_client_ip(self.request))
