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
  @get(prefix + '/actions/count', {
    responses: {
      '200': {
        description: 'Action model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async countActions(
    @param.query.object('where', getWhereSchemaFor(Action)) where?: Where,
  ): Promise<Count> {
    return await this.actionRepository.count(where);
  }

  @get(prefix + '/actions', {
    responses: {
      '200': {
        description: 'Array of Action model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Action}},
          },
        },
      },
    },
  })
  async findActions(
    @param.query.object('filter', getFilterSchemaFor(Action)) filter?: Filter,
  ): Promise<Action[]> {
    return await this.actionRepository.find(filter);
  }

  @get(prefix + '/conditions/count', {
    responses: {
      '200': {
        description: 'Condition model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async countConditions(
    @param.query.object('where', getWhereSchemaFor(Condition)) where?: Where,
  ): Promise<Count> {
    return await this.conditionRepository.count(where);
  }

  @get(prefix + '/conditions', {
    responses: {
      '200': {
        description: 'Array of Condition model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Condition}},
          },
        },
      },
    },
  })
  async findConditions(
    @param.query.object('filter', getFilterSchemaFor(Condition))
    filter?: Filter,
  ): Promise<Condition[]> {
    return await this.conditionRepository.find(filter);
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
    @param.path.string('rule_id') rule_id: string,
    @requestBody() condition: Partial<Condition>,
  ): Promise<Condition> {
    return await this.ruleRepository.conditions(rule_id).create(condition);
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
    @param.path.string('rule_id') rule_id: string,
    @param.path.string('condition_id') condition_id: string,
  ): Promise<Condition> {
    const result = await this.ruleRepository
      .conditions(rule_id)
      .find({where: {id: condition_id}});
    if (result.length !== 0) {
      return result[0];
    } else {
      throw new HttpErrors.NotFound(
        'Condition ' + condition_id + ' for ruleId ' + rule_id + ' not found.',
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
    @param.path.string('rule_id') rule_id: string,
  ): Promise<Condition[]> {
    return await this.ruleRepository.conditions(rule_id).find();
  }

  @del(prefix + '/rules/{rule_id}/conditions/{condition_id}', {
    responses: {
      '204': {
        description: 'Condition DELETE success',
      },
    },
  })
  async deleteConditionByID(
    @param.path.string('rule_id') rule_id: string,
    @param.path.string('condition_id') condition_id: string,
  ) {
    await this.ruleRepository.conditions(rule_id).delete({id: condition_id});
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
    @param.path.string('rule_id') rule_id: string,
    @param.path.string('condition_id') condition_id: string,
    @requestBody() condition: Partial<Condition>,
  ): Promise<Count> {
    return await this.ruleRepository
      .conditions(rule_id)
      .patch(condition, {id: condition_id});
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
    @param.path.string('rule_id') rule_id: string,
    @requestBody() action: Partial<Action>,
  ): Promise<Action> {
    if (!action.id) {
      action.id = uuid();
    }
    return await this.ruleRepository.actions(rule_id).create(action);
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
    @param.path.string('rule_id') rule_id: string,
    @param.path.string('action_id') action_id: string,
  ): Promise<Action> {
    const result = await this.ruleRepository
      .actions(rule_id)
      .find({where: {id: action_id}});
    if (result.length !== 0) {
      return result[0];
    } else {
      throw new HttpErrors.NotFound(
        'action ' + action_id + ' for ruleId ' + rule_id + ' not found.',
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
    @param.path.string('rule_id') rule_id: string,
  ): Promise<Action[]> {
    return await this.ruleRepository.actions(rule_id).find();
  }

  @del(prefix + '/rules/{rule_id}/actions/{action_id}', {
    responses: {
      '204': {
        description: 'Action DELETE success',
      },
    },
  })
  async deleteActionByID(
    @param.path.string('rule_id') rule_id: string,
    @param.path.string('action_id') action_id: string,
  ) {
    await this.ruleRepository.actions(rule_id).delete({id: action_id});
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
    @param.path.string('rule_id') rule_id: string,
    @param.path.string('action_id') action_id: string,
    @requestBody() action: Partial<Action>,
  ): Promise<Count> {
    return await this.ruleRepository
      .actions(rule_id)
      .patch(action, {id: action_id});
  }
}
