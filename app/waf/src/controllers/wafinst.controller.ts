import { repository } from '@loopback/repository';
import {
  post,
  param,
  get,
  put,
  del,
  requestBody,
  HttpErrors,
} from '@loopback/rest';
import { WafInst, PostBody } from '../models';
import { WafInstRepository } from '../repositories';

export class WafinstController {
  constructor(
    @repository(WafInstRepository)
    public wafInstRepository: WafInstRepository,
  ) { }

  @post('/wafinsts', {
    responses: {
      '200': {
        description: 'WafInst model instance',
        content: { 'application/json': { schema: { 'x-ts-type': WafInst } } },
      },
    },
  })
  async create(@requestBody() wafInst: Partial<WafInst>): Promise<WafInst> {
    return await this.wafInstRepository.create(wafInst);
  }

  @post('/wafinsts/actions', {
    responses: {
      '200': {
        description: 'WafInst model instance',
        content: { 'application/json': { schema: { 'x-ts-type': WafInst } } },
      },
    },
  })
  async doProvision(@requestBody() actionBody: PostBody): Promise<object> {
    switch (Object.keys(actionBody)[0]) {
      case 'launch':
        break;

      case 'destroy':
        break;

      case 'setup':
        break;

      default:
        throw new HttpErrors.BadRequest(
          'not supported: ' + Object.keys(actionBody)[0],
        );
    }

    return Promise.resolve({});
  }

  // @get('/wafinsts/count', {
  //   responses: {
  //     '200': {
  //       description: 'WafInst model count',
  //       content: { 'application/json': { schema: CountSchema } },
  //     },
  //   },
  // })
  // async count(
  //   @param.query.object('where', getWhereSchemaFor(WafInst)) where?: Where,
  // ): Promise<Count> {
  //   return await this.wafInstRepository.count(where);
  // }

  // @get('/WafInsts', {
  //   responses: {
  //     '200': {
  //       description: 'Array of WafInst model instances',
  //       content: {
  //         'application/json': {
  //           schema: { type: 'array', items: { 'x-ts-type': WafInst } },
  //         },
  //       },
  //     },
  //   },
  // })
  // async find(
  //   @param.query.object('filter', getFilterSchemaFor(WafInst)) filter?: Filter,
  // ): Promise<WafInst[]> {
  //   return await this.wafInstRepository.find(filter);
  // }

  // @patch('/WafInsts', {
  //   responses: {
  //     '200': {
  //       description: 'WafInst PATCH success count',
  //       content: { 'application/json': { schema: CountSchema } },
  //     },
  //   },
  // })
  // async updateAll(
  //   @requestBody() wafInst: WafInst,
  //   @param.query.object('where', getWhereSchemaFor(WafInst)) where?: Where,
  // ): Promise<Count> {
  //   return await this.wafInstRepository.updateAll(wafInst, where);
  // }

  @get('/wafinsts/{id}', {
    responses: {
      '200': {
        description: 'WafInst model instance',
        content: { 'application/json': { schema: { 'x-ts-type': WafInst } } },
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<WafInst> {
    return await this.wafInstRepository.findById(id);
  }

  // @patch('/wafinsts/{id}', {
  //   responses: {
  //     '204': {
  //       description: 'WafInst PATCH success',
  //     },
  //   },
  // })
  // async updateById(
  //   @param.path.string('id') id: string,
  //   @requestBody() wafInst: WafInst,
  // ): Promise<void> {
  //   await this.wafInstRepository.updateById(id, wafInst);
  // }

  @put('/wafinsts/{id}', {
    responses: {
      '204': {
        description: 'WafInst PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() wafInst: Partial<WafInst>,
  ): Promise<void> {
    if (wafInst.status || wafInst.createdAt || wafInst.updatedAt)
      throw new HttpErrors.BadRequest('status is not changable.');

    // wafInst.updatedAt = ; TODO: do it in CommonRepository.
    await this.wafInstRepository.replaceById(id, wafInst);
  }

  @del('/wafinsts/{id}', {
    responses: {
      '204': {
        description: 'WafInst DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.wafInstRepository.deleteById(id);
  }
}
