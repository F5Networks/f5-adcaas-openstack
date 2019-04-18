import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
  patch,
  del,
  requestBody,
  HttpErrors,
  RestBindings,
  RequestContext,
} from '@loopback/rest';
import {
  Adc,
  Tenant,
  ActionsBody,
  ActionsResponse,
  ActionsRequest,
} from '../models';
import {AdcRepository, AdcTenantAssociationRepository} from '../repositories';
import {Schema, Response, CollectionResponse} from '.';
import {inject, CoreBindings} from '@loopback/core';
import {factory} from '../log4ts';
import {WafBindingKeys} from '../keys';
import {WafApplication} from '../application';
import {PortCreationParams, ServersParams} from '../services';

const prefix = '/adcaas/v1';

const createDesc = 'ADC resource that need to be created';
const updateDesc = 'ADC resource properties that need to be updated';

export class AdcController {
  constructor(
    @repository(AdcRepository)
    public adcRepository: AdcRepository,
    @repository(AdcTenantAssociationRepository)
    public adcTenantAssociationRepository: AdcTenantAssociationRepository,
    @inject(RestBindings.Http.CONTEXT)
    private reqCxt: RequestContext,
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private wafapp: WafApplication,
    private logger = factory.getLogger('controllers.adc'),
  ) {}

  @post(prefix + '/adcs', {
    responses: {
      '200': Schema.response(Adc, 'Successfully create ADC resource'),
      '400': Schema.badRequest('Invalid ADC resource'),
      '422': Schema.unprocessableEntity('Unprocessable ADC resource'),
    },
  })
  async create(
    @requestBody(Schema.createRequest(Adc, createDesc))
    reqBody: Partial<Adc>,
  ): Promise<Response> {
    try {
      return new Response(Adc, await this.adcRepository.create(reqBody));
    } catch (error) {
      throw new HttpErrors.BadRequest(error.message);
    }
  }

  @get(prefix + '/adcs/count', {
    responses: {
      '200': {
        description: 'ADC resource count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Adc)) where?: Where,
  ): Promise<Count> {
    try {
      // TODO: remove this reqCxt usage sample.
      this.logger.debug(
        'Checked tenant id: ' +
          (await this.reqCxt.get(WafBindingKeys.Request.KeyTenantId)),
      );
    } catch (error) {
      // do nothing
    }

    return await this.adcRepository.count(where);
  }

  @get(prefix + '/adcs', {
    responses: {
      '200': Schema.collectionResponse(
        Adc,
        'Successfully retrieve ADC resources',
      ),
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Adc)) filter?: Filter,
  ): Promise<CollectionResponse> {
    let data = await this.adcRepository.find(filter);
    return new CollectionResponse(Adc, data);
  }

  @get(prefix + '/adcs/{adcId}', {
    responses: {
      '200': Schema.response(Adc, 'Successfully retrieve ADC resource'),
      '404': Schema.notFound('Can not find ADC resource'),
    },
  })
  async findById(
    @param(Schema.pathParameter('adcId', 'ADC resource ID')) id: string,
  ): Promise<Response> {
    let data = await this.adcRepository.findById(id);
    return new Response(Adc, data);
  }

  @patch(prefix + '/adcs/{adcId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully update ADC resource'),
      '404': Schema.notFound('Can not find ADC resource'),
    },
  })
  async updateById(
    @param(Schema.pathParameter('adcId', 'ADC resource ID')) id: string,
    @requestBody(Schema.updateRequest(Adc, updateDesc)) adc: Partial<Adc>,
  ): Promise<void> {
    // TODO: create the unified way in schema to check request body.
    if (adc.status || adc.createdAt || adc.updatedAt || adc.management)
      throw new HttpErrors.BadRequest('Not changable properties.');

    await this.adcRepository.updateById(id, adc);
  }

  @del(prefix + '/adcs/{adcId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully delete ADC resource'),
      '404': Schema.notFound('Can not find ADC resource'),
    },
  })
  async deleteById(
    @param(Schema.pathParameter('adcId', 'ADC resource ID')) id: string,
  ): Promise<void> {
    await this.adcRepository.deleteById(id);
  }

  @get(prefix + '/adcs/{adcId}/tenants', {
    responses: {
      '200': Schema.collectionResponse(
        Tenant,
        'Successfully retrieve Tenant resources',
      ),
    },
  })
  async findTenants(
    @param(Schema.pathParameter('adcId', 'ADC resource ID')) id: string,
  ): Promise<CollectionResponse> {
    let assocs = await this.adcTenantAssociationRepository.find({
      where: {
        adcId: id,
      },
    });

    let tenants: Tenant[] = [];
    assocs.forEach(assoc =>
      tenants.push(
        new Tenant({
          id: assoc.tenantId,
        }),
      ),
    );

    return new CollectionResponse(Tenant, tenants);
  }

  @get(prefix + '/adcs/{adcId}/tenants/{tenantId}', {
    responses: {
      '200': Schema.response(Tenant, 'Successfully retrieve Tenant resource'),
    },
  })
  async findTenant(
    @param(Schema.pathParameter('adcId', 'ADC resource ID')) adcId: string,
    @param(Schema.pathParameter('tenantId', 'OpenStack project ID'))
    tenantId: string,
  ): Promise<Response> {
    let assocs = await this.adcTenantAssociationRepository.find({
      where: {
        adcId: adcId,
        tenantId: tenantId,
      },
    });

    if (assocs.length === 0) {
      throw new HttpErrors.NotFound('Cannot find association.');
    } else {
      return new Response(
        Tenant,
        new Tenant({
          id: assocs[0].tenantId,
        }),
      );
    }
  }

  // TODO: schema.response not work well here.
  // It shows the below in Example Value:
  // {
  //   "actionsresponse": {
  //     "id": "11111111-2222-3333-4444-555555555555"
  //   }
  // }
  @post(prefix + '/adcs/{adcId}/action', {
    responses: {
      '200': Schema.response(ActionsResponse, 'Adc Id for the actions.'),
    },
  })
  async provision(
    @param(Schema.pathParameter('adcId', 'ADC resource ID')) id: string,
    @requestBody(Schema.createRequest(ActionsRequest, 'actions request'))
    actionBody: ActionsBody,
  ): Promise<object | undefined> {
    let adc = await this.adcRepository.findById(id);

    switch (Object.keys(actionBody)[0]) {
      case 'create':
        try {
          if (adc.status !== 'NONE' && adc.status !== 'ERROR')
            throw new HttpErrors.BadRequest(
              'Adc status is ' +
                adc.status +
                ". Cannot repeat 'create' on the same ADC.",
            );

          // TODO: Create VM in async way.
          return await this.createOn(adc).then(async () => {
            return {id: adc.id};
          });
        } catch (error) {
          throw new HttpErrors.BadRequest(error.message);
        }

      case 'delete':
        break;

      case 'setup':
        break;

      default:
        throw new HttpErrors.BadRequest(
          'Not supported: ' + Object.keys(actionBody)[0],
        );
    }
  }

  private async serialize(adc: Adc, data?: object) {
    if (data) Object.assign(adc, data);
    await this.adcRepository.update(adc);
  }

  private async createOn(adc: Adc): Promise<void> {
    try {
      await this.serialize(adc, {status: 'BUILDING'})
        .then(async () => await this.cNet(adc))
        .then(async () => await this.cSvr(adc));
      await this.serialize(adc, {status: 'POWERON'});
    } catch (error) {
      await this.serialize(adc, {status: 'ERROR'});
      throw error;
    }
  }

  private async cSvr(adc: Adc): Promise<void> {
    await Promise.all([
      this.wafapp.get(WafBindingKeys.KeyComputeManager),
      this.reqCxt.get(WafBindingKeys.Request.KeyUserToken),
      this.reqCxt.get(WafBindingKeys.Request.KeyTenantId),
    ]).then(async ([computeHelper, userToken, tenantId]) => {
      let serverParams: ServersParams = {
        userTenantId: tenantId,
        vmName: adc.id,
        imageRef: adc.compute.imageRef,
        flavorRef: adc.compute.flavorRef,
        securityGroupName: 'default', //TODO: remove the hardcode in the future.
        ports: (() => {
          let ports = [];
          for (let n of Object.keys(adc.networks)) {
            ports.push(<string>adc.networks[n].portId);
          }
          return ports;
        })(),
      };

      await computeHelper
        .createServer(userToken, serverParams)
        .then(response => {
          adc.compute.vmId = response;
          adc.management = {
            tcpPort: 443, // TODO: remove the hard-code.
            ipAddress: <string>(() => {
              let ip: string | undefined;
              Object.keys(adc.networks).forEach(v => {
                if (adc.networks[v].type === 'mgmt')
                  return adc.networks[v].fixedIp;
              });
              return ip;
            })(),
          };
        });
    });
  }

  private async cNet(adc: Adc): Promise<void> {
    await Promise.all([
      this.wafapp.get(WafBindingKeys.KeyNetworkDriver),
      this.reqCxt.get(WafBindingKeys.Request.KeyUserToken),
    ]).then(async ([networkHelper, userToken]) => {
      for (let k of Object.keys(adc.networks)) {
        let net = adc.networks[k];
        if (net.portId && net.ready) continue;

        net.ready = false;

        let portParams: PortCreationParams = {
          networkId: net.networkId,
          name: <string>(adc.id + '-' + net.type + '-' + k),
        };
        if (net.fixedIp) portParams.fixedIp = net.fixedIp;

        await networkHelper
          .createPort(userToken, portParams)
          .then(async port => {
            net.fixedIp = port.fixedIp;
            net.portId = port.id;
            net.ready = true;

            await this.serialize(adc);
          });
      }
    });
  }
}
