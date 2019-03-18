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
} from '@loopback/rest';
import {Rule, Condition, Action} from '../models';
import {
  RuleRepository,
  ConditionRepository,
  ActionRepository,
} from '../repositories';
import uuid = require('uuid');
const prefix = '/adcaas/v1';

export class RuleController {
  constructor(
    @repository(RuleRepository)
    public ruleRepository: RuleRepository,
    @repository(ConditionRepository)
    public conditionRepository: ConditionRepository,
    @repository(ActionRepository)
    public actionRepository: ActionRepository,
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
    if (!rule.id) {
      rule.id = uuid();
    }
    return await this.ruleRepository.create(rule);
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

  @post(prefix + '/rules/{rule_id}/conditions', {
    responses: {
      '200': {
        description: 'Conditions add to rule success',
        content: {'application/json': {schema: {'x-ts-type': Condition}}},
      },
    },
  })
  async createRuleCondition(
    @param.path.string('rule_id') ruleId: string,
    @requestBody() condition: Partial<Condition>,
  ): Promise<Condition> {
    return await this.ruleRepository.conditions(ruleId).create(condition);
  }

  @get(prefix + '/rules/{rule_id}/conditions/{condition_id}', {
    responses: {
      '200': {
        description: 'Condition model instance',
        content: {'application/json': {schema: {'x-ts-type': Condition}}},
      },
    },
  })
  async getConditionByID(
    @param.path.string('rule_id') ruleId: string,
    @param.path.string('condition_id') conditionId: string,
  ): Promise<Condition> {
    const result = await this.ruleRepository
      .conditions(ruleId)
      .find({where: {id: conditionId}});
    if (result.length !== 0) {
      return result[0];
    } else {
      throw new HttpErrors.NotFound(
        'Condition ' + conditionId + ' for ruleId ' + ruleId + ' not found.',
      );
    }
  }

  @get(prefix + '/rules/{rule_id}/conditions', {
    responses: {
      '200': {
        description: 'Array of conditon model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Condition}},
          },
        },
      },
    },
  })
  async getConditions(
    @param.path.string('rule_id') ruleId: string,
  ): Promise<Condition[]> {
    return await this.ruleRepository.conditions(ruleId).find();
  }

  @del(prefix + '/rules/{rule_id}/conditions/{condition_id}', {
    responses: {
      '204': {
        description: 'Condition DELETE success',
      },
    },
  })
  async deleteConditionByID(
    @param.path.string('rule_id') ruleId: string,
    @param.path.string('condition_id') conditionId: string,
  ) {
    await this.ruleRepository.conditions(ruleId).delete({id: conditionId});
  }

  @patch(prefix + '/rules/{rule_id}/conditions/{condition_id}', {
    responses: {
      '200': {
        description: 'Conditon model instance',
        content: {'application/json': {schema: {'x-ts-type': Condition}}},
      },
    },
  })
  async updateCondtionByID(
    @param.path.string('rule_id') ruleId: string,
    @param.path.string('condition_id') conditionId: string,
    @requestBody() condition: Partial<Condition>,
  ): Promise<Count> {
    return await this.ruleRepository
      .conditions(ruleId)
      .patch(condition, {id: conditionId});
  }

  @post(prefix + '/rules/{rule_id}/actions', {
    responses: {
      '200': {
        description: 'Actions add to rule success',
        content: {'application/json': {schema: {'x-ts-type': Action}}},
      },
    },
  })
  async createRuleAction(
    @param.path.string('rule_id') ruleId: string,
    @requestBody() action: Partial<Action>,
  ): Promise<Action> {
    if (!action.id) {
      action.id = uuid();
    }
    return await this.ruleRepository.actions(ruleId).create(action);
  }

  @get(prefix + '/rules/{rule_id}/actions/{action_id}', {
    responses: {
      '200': {
        description: 'Action model instance',
        content: {'application/json': {schema: {'x-ts-type': Action}}},
      },
    },
  })
  async getActionByID(
    @param.path.string('rule_id') ruleId: string,
    @param.path.string('action_id') actionId: string,
  ): Promise<Action> {
    const result = await this.ruleRepository
      .actions(ruleId)
      .find({where: {id: actionId}});
    if (result.length !== 0) {
      return result[0];
    } else {
      throw new HttpErrors.NotFound(
        'action ' + actionId + ' for ruleId ' + ruleId + ' not found.',
      );
    }
  }

  @get(prefix + '/rules/{rule_id}/actions', {
    responses: {
      '200': {
        description: 'Array of action model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Action}},
          },
        },
      },
    },
  })
  async getActions(
    @param.path.string('rule_id') ruleId: string,
  ): Promise<Action[]> {
    return await this.ruleRepository.actions(ruleId).find();
  }

  @del(prefix + '/rules/{rule_id}/actions/{action_id}', {
    responses: {
      '204': {
        description: 'Action DELETE success',
      },
    },
  })
  async deleteActionByID(
    @param.path.string('rule_id') ruleId: string,
    @param.path.string('action_id') actionId: string,
  ) {
    await this.ruleRepository.actions(ruleId).delete({id: actionId});
  }

  @patch(prefix + '/rules/{rule_id}/actions/{action_id}', {
    responses: {
      '200': {
        description: 'Action model instance',
        content: {'application/json': {schema: {'x-ts-type': Action}}},
      },
    },
  })
  async updateActionByID(
    @param.path.string('rule_id') ruleId: string,
    @param.path.string('action_id') actionId: string,
    @requestBody() action: Partial<Action>,
  ): Promise<Count> {
    return await this.ruleRepository
      .actions(ruleId)
      .patch(action, {id: actionId});
  }
}
