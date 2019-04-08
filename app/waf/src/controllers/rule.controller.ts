import {Filter, repository,CountSchema,Count,Where} from '@loopback/repository';
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
import {Schema, Response, CollectionResponse} from '.';
const prefix = '/adcaas/v1';

const createDesc: string = 'Rule resource that need to be created';
const updateDesc: string =
  'Rule resource properties that need to be updated';
const createConditionDesc: string = 'Condition resource that need to be created';
const updateConditionDesc: string =
  'Condition resource properties that need to be updated';

const createActionDesc: string = 'Action resource that need to be created';
const updateActionDesc: string =
  'Action resource properties that need to be updated';


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
    '200': Schema.response(Rule, 'Successfully create Rule resource'),
    '400': Schema.badRequest('Invalid Rule resource'),
    '422': Schema.unprocessableEntity('Unprocessable Rule resource'),
    },
  })
  async create(
    @requestBody(Schema.createRequest(Rule,createDesc))
    reqBody: Partial <Rule>,
  ): Promise<Response>{
    try {
      const data = await this.ruleRepository.create(reqBody);
      return new Response(Rule, data);
    } catch (error) {
      throw new HttpErrors.BadRequest(error.message);
    }
  }
    

  @get(prefix + '/rules', {
    responses: {
      '200': Schema.collectionResponse(
        Rule,
        'Successfully retrieve Rule resources',
      ),
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Rule)) filter?: Filter,
  ): Promise<CollectionResponse> {
    const data = await this.ruleRepository.find(filter);
    return new CollectionResponse(Rule, data);
  }

  @patch(prefix + '/rules/{ruleId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully update Rule resource'),
      '404': Schema.notFound('Can not find Rule resource'),
    },
  })
  async updateById(
    @param(Schema.pathParameter('ruleId', 'Rule resource ID'))
    id: string,
    @requestBody(Schema.createRequest(Rule, updateDesc))
    rule: Rule,
  ): Promise<void> {
    await this.ruleRepository.updateById(id, rule);
  }

  @del(prefix + '/rules/{ruleId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully delete Rule resource'),
      '404': Schema.notFound('Can not find Rule resource'),
    },
  })
  async deleteById(
    @param(Schema.pathParameter('ruleId', 'Rule resource ID'))
    id: string,
  ): Promise<void> {
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

  @get(prefix + '/rules/{ruleId}', {
    responses: {
      '200': Schema.response(Rule, 'Successfully retrieve Rule resource'),
      '404': Schema.notFound('Can not find Rule resource'),
    },
  })
  async findById(
    @param(Schema.pathParameter('ruleId', 'Rule resource ID'))
    id: string,
  ): Promise<Response> {
    const data = await this.ruleRepository.findById(id);
    return new Response(Rule, data);
  }

  @post(prefix + '/rules/{ruleId}/conditions', {
    responses: {
      '200': Schema.response(Rule, 'Successfully create Rule resource'),
      '400': Schema.badRequest('Invalid Rule resource'),
      '422': Schema.unprocessableEntity('Unprocessable Rule resource'),
    },
  })
  async createRuleCondition(
    @param(Schema.pathParameter('ruleId', 'Rule resource ID'))
    ruleId: string,
    @requestBody(Schema.createRequest(Rule, createConditionDesc))
    condition: Partial<Condition>,
  ): Promise<Response> {
    const data = await this.ruleRepository.conditions(ruleId).create(condition);
    return new Response(Condition, data);
  }

  @get(prefix + '/rules/{ruleId}/conditions/{conditionId}', {
    responses: {
      '200': Schema.collectionResponse(
        Condition,
        'Successfully retrieve condition resources',
      ),
    },
  })
  async getConditionByID(
    @param(Schema.pathParameter('ruleId', 'Rule resource ID'))
    ruleId: string,
    @param(Schema.pathParameter('conditionId', 'Condition resource ID'))
    conditionId: string,
  ): Promise<CollectionResponse> {
    const data = await this.ruleRepository
      .conditions(ruleId)
      .find({where: {id: conditionId}});
    return new CollectionResponse(Condition, data);
  }
  
  @get(prefix + '/rules/{ruleId}/conditions', {
    responses: {
      '200': Schema.collectionResponse(
        Condition,
        'Successfully retrieve condition resources by pool id',
      ),
    },
  })
  async getConditions(
    @param(Schema.pathParameter('ruleId', 'Rule resource ID'))
    ruleId: string,
  ): Promise<CollectionResponse> {
    const data = await this.ruleRepository.conditions(ruleId).find();
    return new CollectionResponse(Condition, data);
  }

  @del(prefix + '/rules/{ruleId}/conditions/{conditionId}', {
    responses: {
      '204': {
        description: 'condition DELETE success',
      },
    },
  })
  async deleteConditionByID(
    @param(Schema.pathParameter('ruleId', 'Rule resource ID'))
    ruleId: string,
    @param(Schema.pathParameter('conditionId', 'Condition resource ID'))
    conditionId: string,
  ) {
    await this.ruleRepository.conditions(ruleId).delete({id: conditionId});
  }
  
  @patch(prefix + '/rules/{ruleId}/conditions/{conditionId}', {
    responses: {
      '200': {
        description: 'Condition model instance',
        content: {'application/json': {schema: {'x-ts-type': Condition}}},
      },
    },
  })
  async updateConditionByID(
    @param(Schema.pathParameter('ruleId', 'Rule resource ID'))
    ruleId: string,
    @param(Schema.pathParameter('conditionId', 'Condition resource ID'))
    conditionId: string,
    @requestBody(Schema.createRequest(Condition, updateConditionDesc))
    condition: Partial<Condition>,
  ): Promise<Count> {
    return await this.ruleRepository
      .conditions(ruleId)
      .patch(condition, {id: conditionId});
  }

  @post(prefix + '/rules/{ruleId}/actions', {
    responses: {
      '200': Schema.response(Action, 'Successfully create Action resource'),
      '400': Schema.badRequest('Invalid Action resource'),
      '422': Schema.unprocessableEntity('Unprocessable Action resource'),
    },
  })
  async createRuleAction(
    @param(Schema.pathParameter('ruleId', 'Rule resource ID'))
    ruleId: string,
    @requestBody(Schema.createRequest(Action, createActionDesc))
    action: Partial<Action>,
  ): Promise<Response> {
    const data = await this.ruleRepository.actions(ruleId).create(action);
    return new Response(Action, data);
  }


  @get(prefix + '/rules/{ruleId}/actions/{actionId}', {
    responses: {
      '200': Schema.collectionResponse(
        Action,
        'Successfully retrieve action resources',
      ),
    },
  })
  async getActionByID(
    @param(Schema.pathParameter('ruleId', 'Rule resource ID'))
    ruleId: string,
    @param(Schema.pathParameter('actionId', 'Action resource ID'))
    actionId: string,
  ): Promise<CollectionResponse> {
    const data = await this.ruleRepository
      .actions(ruleId)
      .find({where: {id: actionId}});
    return new CollectionResponse(Action, data);
  }

  @get(prefix + '/rules/{ruleId}/actions', {
    responses: {
      '200': Schema.collectionResponse(
        Action,
        'Successfully retrieve action resources by pool id',
      ),
    },
  })
  async getActions(
    @param(Schema.pathParameter('ruleId', 'Rule resource ID'))
    ruleId: string,
  ): Promise<CollectionResponse> {
    const data = await this.ruleRepository.actions(ruleId).find();
    return new CollectionResponse(Action, data);
  }

  @del(prefix + '/rules/{ruleId}/actions/{actionId}', {
    responses: {
      '204': {
        description: 'Action DELETE success',
      },
    },
  })
  async deleteActionByID(
    @param(Schema.pathParameter('ruleId', 'Rule resource ID'))
    ruleId: string,
    @param(Schema.pathParameter('actionId', 'Action resource ID'))
    actionId: string,
  ) {
    await this.ruleRepository.actions(ruleId).delete({id: actionId});
  }


  @patch(prefix + '/rules/{ruleId}/actions/{actionId}', {
    responses: {
      '200': {
        description: 'Action model instance',
        content: {'application/json': {schema: {'x-ts-type': Action}}},
      },
    },
  })
  async updateActionByID(
    @param(Schema.pathParameter('ruleId', 'Rule resource ID'))
    ruleId: string,
    @param(Schema.pathParameter('actionId', 'Action resource ID'))
    actionId: string,
    @requestBody(Schema.createRequest(Action, updateActionDesc))
    action: Partial<Action>,
  ): Promise<Count> {
    return await this.ruleRepository
      .actions(ruleId)
      .patch(action, {id: actionId});
  }

}
