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
} from '@loopback/rest';
import {TenantAssociation} from '../models';
import {TenantAssociationRepository} from '../repositories';

const prefix = '/adcaas/v1';

export class TenantAssociationController {
  constructor(
    @repository(TenantAssociationRepository)
    public tenantAssociationRepository: TenantAssociationRepository,
  ) {}

  @post(prefix + '/tenantassocs', {
    responses: {
      '200': {
        description: 'TenantAssociation model instance',
        content: {
          'application/json': {schema: {'x-ts-type': TenantAssociation}},
        },
      },
    },
  })
  async create(
    @requestBody() tenantAssoc: Partial<TenantAssociation>,
  ): Promise<TenantAssociation> {
    return await this.tenantAssociationRepository.create(tenantAssoc);
  }

  @get(prefix + '/tenantassocs/count', {
    responses: {
      '200': {
        description: 'TenantAssociation model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(TenantAssociation))
    where?: Where,
  ): Promise<Count> {
    return await this.tenantAssociationRepository.count(where);
  }

  @get(prefix + '/tenantassocs', {
    responses: {
      '200': {
        description: 'Array of TenantAssociation model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': TenantAssociation}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(TenantAssociation))
    filter?: Filter,
  ): Promise<TenantAssociation[]> {
    return await this.tenantAssociationRepository.find(filter);
  }

  @get(prefix + '/tenantassocs/{tenantId}', {
    responses: {
      '200': {
        description: 'TenantAssociation model instance',
        content: {
          'application/json': {schema: {'x-ts-type': TenantAssociation}},
        },
      },
    },
  })
  async findById(
    @param.path.string('tenantId') tenantId: string,
  ): Promise<TenantAssociation> {
    return await this.tenantAssociationRepository.findById(tenantId);
  }

  @patch(prefix + '/tenantassocs/{tenantId}', {
    responses: {
      '204': {
        description: 'TenantAssociation PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('tenantId') tenantId: string,
    @requestBody() tenantAssoc: Partial<TenantAssociation>,
  ): Promise<void> {
    await this.tenantAssociationRepository.updateById(tenantId, tenantAssoc);
  }

  @del(prefix + '/tenantassocs/{tenantId}', {
    responses: {
      '204': {
        description: 'TenantAssociation DELETE success',
      },
    },
  })
  async deleteById(
    @param.path.string('tenantId') tenantId: string,
  ): Promise<void> {
    await this.tenantAssociationRepository.deleteById(tenantId);
  }
}
