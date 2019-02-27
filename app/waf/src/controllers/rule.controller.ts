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
import {Rule} from '../models';
import {RuleRepository} from '../repositories';
import uuid = require('uuid');
const prefix = '/adcaas/v1';

export class RuleController {
  constructor(
    @repository(RuleRepository)
    public ruleRepository: RuleRepository,
  ) {}

  @post(prefix + '/rules', {
    responses: {
      '200': {
        description: 'Rule model instance',
        content: {'application/json': {schema: {'x-ts-type': Rule}}},
      },
    },
  })
  async create(@requestBody() rule: Partial<Rule>): Promise<Rule> {
    if(!rule.id){
      rule.id = uuid();
    }
    return await this.ruleRepository.create(rule);
  }

  @get(prefix + '/rules/count', {
    responses: {
      '200': {
        description: 'Rule model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Rule)) where?: Where,
  ): Promise<Count> {
    return await this.ruleRepository.count(where);
  }

  @get(prefix + '/rules', {
    responses: {
      '200': {
        description: 'Array of Rule model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Rule}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Rule)) filter?: Filter,
  ): Promise<Rule[]> {
    return await this.ruleRepository.find(filter);
  }

  @patch(prefix + '/rules', {
    responses: {
      '200': {
        description: 'Rule PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody() rule: Rule,
    @param.query.object('where', getWhereSchemaFor(Rule)) where?: Where,
  ): Promise<Count> {
    return await this.ruleRepository.updateAll(rule, where);
  }

  @get(prefix + '/rules/{id}', {
    responses: {
      '200': {
        description: 'Rule model instance',
        content: {'application/json': {schema: {'x-ts-type': Rule}}},
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Rule> {
    return await this.ruleRepository.findById(id);
  }

  @patch(prefix + '/rules/{id}', {
    responses: {
      '204': {
        description: 'Rule PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() rule: Rule,
  ): Promise<void> {
    await this.ruleRepository.updateById(id, rule);
  }

  @put(prefix + '/rules/{id}', {
    responses: {
      '204': {
        description: 'Rule PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() rule: Rule,
  ): Promise<void> {
    await this.ruleRepository.replaceById(id, rule);
  }

  @del(prefix + '/rules/{id}', {
    responses: {
      '204': {
        description: 'Rule DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.ruleRepository.deleteById(id);
  }
}
