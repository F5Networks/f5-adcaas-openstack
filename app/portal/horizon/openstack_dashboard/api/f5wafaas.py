import requests
import json
import os

from openstack_dashboard.api import base
from openstack_dashboard.contrib.developer.profiler import api as profiler

WAFAAS_URL = os.environ['F5_WAFAAS_URL']

class ADCInstance(base.APIResourceWrapper):
    """Wrapper for the "console" dictionary.

    Returned by the novaclient.servers.get_mks_console method.
    """
    _attrs = ['id', 'type', 'name', 'networks', 'compute', 'management', 'status', 'lastErr', 'tenantId']

    def __init__(self, apiresource, request):
        super(ADCInstance, self).__init__(apiresource)
        self.request = request


    def __getattribute__(self, attr):
        try:
            return object.__getattribute__(self, attr)
        except AttributeError: 
            return self._apiresource[attr]

    def __setattribute__(self, name, value):
        self.__dict__[name] = value

@profiler.trace
def adc_list(request):
    url = '%s/adcaas/v1/adcs' % WAFAAS_URL
    headers = {
        'tenant-id': request.user.tenant_id, 
        'x-auth-token': request.user.token.id,
        'content-type': 'application/json'
    }

    response = requests.get(url, headers=headers)
    if response.status_code != 200: 
        # TODO: use horizon exceptions.handle()..
        raise Exception('Failed to request: %s' % response.reason)
    
    rlt = []
    adcs = json.loads(response.content)['adcs']
    for n in adcs:
        adc = ADCInstance(n, request)
        rlt.append(adc)

    return rlt

@profiler.trace
def adc_create(request):

    def net2json(request):
        rlt = {}
        for (k, v) in request.DATA['networkSettings'].items(): 
            for n in range(0, len(v)):
                rlt['%s%d' % (k, n)] = {
                    'type': k,
                    'networkId': v[n]['id'],
                }
        return rlt

    url = '%s/adcaas/v1/adcs' % WAFAAS_URL
    headers = {
        'tenant-id': request.user.tenant_id, 
        'x-auth-token': request.user.token.id,
        'content-type': 'application/json'
    }
    json_data = {
        'name': request.DATA['name'],
        'description': 'should not be shorter than 1 characters.. why?!',
        'type': 'VE',
        'networks': net2json(request),
        'compute': {
            'imageRef': request.DATA['source'][0]['id'],
            'flavorRef': request.DATA['flavor_id'],
        }
    }

    response = requests.post(url, headers=headers, data=json.dumps(json_data))
    if response.status_code != 200: 
        # TODO: use horizon exceptions.handle()..
        raise Exception('Failed to request: %s' % response.reason)
    
    return json.loads(response.content)['adc']

@profiler.trace
def adc_delete(request, obj_id):
    url = '%s/adcaas/v1/adcs/%s' % (WAFAAS_URL, obj_id)
    headers = {
        'tenant-id': request.user.tenant_id, 
        'x-auth-token': request.user.token.id,
        'content-type': 'application/json'
    }

    response = requests.delete(url, headers=headers)
    if response.status_code != 204: 
        # TODO: use horizon exceptions.handle()..
        raise Exception('Failed to request: %s' % response.reason)
