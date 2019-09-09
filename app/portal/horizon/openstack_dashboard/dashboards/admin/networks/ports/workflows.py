#    Copyright 2016 NEC Corporation
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


import logging

from django.core.urlresolvers import reverse
from django.utils.translation import ugettext_lazy as _

from horizon import forms

from openstack_dashboard.dashboards.project.networks.ports \
    import workflows as project_workflow


LOG = logging.getLogger(__name__)


class UpdatePortInfoAction(project_workflow.UpdatePortInfoAction):
    device_id = forms.CharField(
        max_length=100, label=_("Device ID"),
        required=False)
    device_owner = forms.CharField(
        max_length=100, label=_("Device Owner"),
        required=False)
    binding__host_id = forms.CharField(
        label=_("Binding: Host"),
        required=False)
    mac_address = forms.MACAddressField(
        label=_("MAC Address"),
        required=False)

    class Meta(object):
        name = _("Info")
        help_text_template = 'admin/networks/ports/_edit_port_help.html'


class UpdatePortInfo(project_workflow.UpdatePortInfo):
    action_class = UpdatePortInfoAction
    contributes = ["name", "admin_state",
                   "binding__vnic_type", "mac_state", "port_security_enabled",
                   "device_id", "device_owner", "binding__host_id",
                   "mac_address"]


class UpdatePort(project_workflow.UpdatePort):
    default_steps = (UpdatePortInfo, project_workflow.UpdatePortSecurityGroup)

    def get_success_url(self):
        return reverse("horizon:admin:networks:detail",
                       args=(self.context['network_id'],))

    def _construct_parameters(self, data):
        params = super(UpdatePort, self)._construct_parameters(data)
        params.update({'device_id': data['device_id'],
                       'device_owner': data['device_owner'],
                       'binding__host_id': data['binding__host_id'],
                       'mac_address': data['mac_address']})
        return params
