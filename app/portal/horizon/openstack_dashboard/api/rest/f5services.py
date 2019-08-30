from django import forms
from django.views.decorators.csrf import csrf_exempt
from django.views import generic
from six.moves import zip as izip

from openstack_dashboard import api
from openstack_dashboard.api.rest import urls
from openstack_dashboard.api.rest import utils as rest_utils

@urls.register
class ADC(generic.View):
    """API for retrieving ADCs"""
    url_regex = r'f5services/adcs/$'

    @rest_utils.ajax()
    def post(self, request):
        """Create ADC instance.
        """

        rlt = api.f5wafaas.adc_create(request)
        return rest_utils.CreatedResponse('/api/f5services/adcs/%s' % rlt['id'], rlt)