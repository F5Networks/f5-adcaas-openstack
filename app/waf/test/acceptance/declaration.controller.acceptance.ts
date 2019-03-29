import {Client, expect, sinon} from '@loopback/testlab';
import {WafApplication} from '../..';
import {ApplicationController} from '../../src/controllers';
import {setupApplication, teardownApplication} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  givenApplicationData,
  givenDeclarationData,
} from '../helpers/database.helpers';

describe('ApplicationController declaration test', () => {
  let wafapp: WafApplication;
  let controller: ApplicationController;
  let client: Client;
  let deployStub: sinon.SinonStub;

  const prefix = '/adcaas/v1';

  before('setupApplication', async () => {
    ({wafapp, client} = await setupApplication());

    controller = await wafapp.get<ApplicationController>(
      'controllers.ApplicationController',
    );
  });

  beforeEach('Empty database', async () => {
    await givenEmptyDatabase(wafapp);
    deployStub = sinon.stub(controller.as3Service, 'deploy');
  });

  after(async () => {
    await teardownApplication(wafapp);
  });

  afterEach(async () => {
    deployStub.restore();
  });

  it(
    'post ' +
      prefix +
      '/applications/{applicationId}/declarations: create declaration',
    async () => {
      const application = await givenApplicationData(wafapp);

      await client
        .post(prefix + '/applications/' + application.id + '/declarations')
        .send({name: 'a-declaration'})
        .expect(200);
    },
  );

  it(
    'post ' +
      prefix +
      '/applications/{applicationId}/declarations: create declaration with non-existing application: ',
    async () => {
      await client
        .post(prefix + '/applications/do-not-exist/declarations')
        .send({name: 'a-declaration'})
        .expect(404);
    },
  );

  it(
    'get ' +
      prefix +
      '/applications/{applicationId}/declarations: get all declarations',
    async () => {
      const application = await givenApplicationData(wafapp);
      const declaration = await givenDeclarationData(wafapp, {
        applicationId: application.id,
      });

      let response = await client
        .get(prefix + '/applications/' + application.id + '/declarations')
        .expect(200);

      expect(response.body.declarations[0].id).to.equal(declaration.id);
    },
  );

  it(
    'get ' +
      prefix +
      '/applications/{applicationId}/declarations: get no declarations',
    async () => {
      const application = await givenApplicationData(wafapp);

      let response = await client
        .get(prefix + '/applications/' + application.id + '/declarations')
        .expect(200);

      expect(response.body.declarations.length).to.equal(0);
    },
  );

  it(
    'get ' +
      prefix +
      '/applications/{applicationId}/declarations/{declarationId}: get declaration',
    async () => {
      const application = await givenApplicationData(wafapp);
      const declaration = await givenDeclarationData(wafapp, {
        applicationId: application.id,
      });

      let response = await client
        .get(
          prefix +
            '/applications/' +
            application.id +
            '/declarations/' +
            declaration.id,
        )
        .expect(200);

      expect(response.body.declaration.id).to.equal(declaration.id);
    },
  );

  it(
    'get ' +
      prefix +
      '/applications/{applicationId}/declarations/{declarationId}: get no declaration',
    async () => {
      const application = await givenApplicationData(wafapp);

      await client
        .get(
          prefix +
            '/applications/' +
            application.id +
            '/declarations/do-not-exist',
        )
        .expect(404);
    },
  );

  it(
    'patch' +
      prefix +
      '/applications/{applicationId}/declarations/{declarationId}: update declaration',
    async () => {
      const application = await givenApplicationData(wafapp);
      const declaration = await givenDeclarationData(wafapp, {
        applicationId: application.id,
      });

      await client
        .patch(
          prefix +
            '/applications/' +
            application.id +
            '/declarations/' +
            declaration.id,
        )
        .send({name: 'new-name'})
        .expect(204);

      let response = await client
        .get(
          prefix +
            '/applications/' +
            application.id +
            '/declarations/' +
            declaration.id,
        )
        .expect(200);

      expect(response.body.declaration.name).to.equal('new-name');
    },
  );

  it(
    'patch' +
      prefix +
      '/applications/{applicationId}/declarations/{declarationId}: update non-existing declaration',
    async () => {
      const application = await givenApplicationData(wafapp);

      await client
        .patch(
          prefix +
            '/applications/' +
            application.id +
            '/declarations/do-not-exist',
        )
        .send({name: 'new-name'})
        .expect(404);
    },
  );

  it(
    'delete' +
      prefix +
      '/applications/{applicationId}/declarations/{declarationId}: delete declaration',
    async () => {
      const application = await givenApplicationData(wafapp);
      const declaration = await givenDeclarationData(wafapp, {
        applicationId: application.id,
      });

      await client
        .del(
          prefix +
            '/applications/' +
            application.id +
            '/declarations/' +
            declaration.id,
        )
        .expect(204);
    },
  );

  it(
    'delete' +
      prefix +
      '/applications/{applicationId}/declarations/{declarationId}: delete non-existing declaration',
    async () => {
      const application = await givenApplicationData(wafapp);

      await client
        .del(
          prefix +
            '/applications/' +
            application.id +
            '/declarations/do-not-exist',
        )
        .expect(204);
    },
  );

  it(
    'delete' +
      prefix +
      '/applications/{applicationId}/declarations/{declarationId}: delete declaration with non-existing application',
    async () => {
      await client
        .del(prefix + '/applications/do-not-exist/declarations/do-not-exist')
        .expect(204);
    },
  );
});
