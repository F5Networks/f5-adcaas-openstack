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

from django.utils.translation import ugettext_lazy as _

from horizon import tabs

from openstack_dashboard.dashboards.project.snapshots import tables


class OverviewTab(tabs.Tab):
    name = _("Overview")
    slug = "overview"
    template_name = ("project/volumes/_detail_overview.html")

    def get_context_data(self, request):
        return {
            'volume': self.tab_group.kwargs['volume'],
            'detail_url': {
                'instance': 'horizon:project:instances:detail',
                'image': 'horizon:project:images:images:detail',
                'encryption': 'horizon:project:volumes:encryption_detail',
            }
        }


class SnapshotTab(tabs.TableTab):
    table_classes = (tables.VolumeDetailsSnapshotsTable,)
    name = _("Snapshots")
    slug = "snapshots_tab"
    template_name = "horizon/common/_detail_table.html"
    dashboard = 'project'
    preload = False

    def get_volume_snapshots_data(self):
        snapshots = self.tab_group.kwargs['snapshots']
        volume = self.tab_group.kwargs['volume']

        if volume is not None:
            for snapshot in snapshots:
                snapshot._volume = volume

        return snapshots


class VolumeDetailTabs(tabs.DetailTabsGroup):
    slug = "volume_details"
    tabs = (OverviewTab, SnapshotTab)
