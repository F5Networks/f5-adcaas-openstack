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
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {Application} from '../models';
import {ApplicationRepository} from '../repositories';

export class ApplicationController {
  constructor(
    @repository(ApplicationRepository)
    public applicationRepository: ApplicationRepository,
  ) {}

  @post('/applications', {
    responses: {
      '200': {
        description: 'Application model instance',
        content: {'application/json': {schema: {'x-ts-type': Application}}},
      },
    },
  })
  async create(@requestBody() application: Application): Promise<Application> {
    return await this.applicationRepository.create(application);
  }

  @get('/applications/count', {
    responses: {
      '200': {
        description: 'Application model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Application)) where?: Where,
  ): Promise<Count> {
    return await this.applicationRepository.count(where);
  }

  @get('/applications', {
    responses: {
      '200': {
        description: 'Array of Application model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Application}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Application))
    filter?: Filter,
  ): Promise<Application[]> {
    return await this.applicationRepository.find(filter);
  }

  @patch('/applications', {
    responses: {
      '200': {
        description: 'Application PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody() application: Application,
    @param.query.object('where', getWhereSchemaFor(Application)) where?: Where,
  ): Promise<Count> {
    return await this.applicationRepository.updateAll(application, where);
  }

  @get('/applications/{id}', {
    responses: {
      '200': {
        description: 'Application model instance',
        content: {'application/json': {schema: {'x-ts-type': Application}}},
      },
    },
  })
  async findById(@param.path.number('id') id: string): Promise<Application> {
    return await this.applicationRepository.findById(id);
  }

  @patch('/applications/{id}', {
    responses: {
      '204': {
        description: 'Application PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: string,
    @requestBody() application: Application,
  ): Promise<void> {
    await this.applicationRepository.updateById(id, application);
  }

  @put('/applications/{id}', {
    responses: {
      '204': {
        description: 'Application PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: string,
    @requestBody() application: Application,
  ): Promise<void> {
    await this.applicationRepository.replaceById(id, application);
  }

  @del('/applications/{id}', {
    responses: {
      '204': {
        description: 'Application DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: string): Promise<void> {
    await this.applicationRepository.deleteById(id);
  }
}
