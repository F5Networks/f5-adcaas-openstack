import {checkAndWait} from '../../src/utils';
import {expect} from '@loopback/testlab';
import {stubLogger, restoreLogger} from '../helpers/logging.helpers';

describe('checkAndWait test', () => {
  before('start', async () => {
    stubLogger();
  });
  it('checkAndWait test', async () => {
    let resT = 0; //should be 1
    let resF = 0; //should be 3
    let rejT = 0; //should be 1
    let rejF = 0; //should be 3
    let retE = 0; //should be 3
    let resolveTrue = () => {
      resT += 1;
      return Promise.resolve(true);
    };
    let resolveFalse = () => {
      resF += 1;
      return Promise.resolve(false);
    };
    let rejectTrue = () => {
      rejT += 1;
      return Promise.reject(true);
    };
    let rejectFalse = () => {
      rejF += 1;
      return Promise.reject(false);
    };
    let returnError = () => {
      retE += 1;
      throw new Error();
    };

    await checkAndWait(resolveTrue, 3, [], 1).then(
      b => {
        expect(b).eql(true);
        expect(resT).eql(1);
      },
      () => {
        expect(true).eql(false);
      },
    );
    await checkAndWait(resolveFalse, 3, [], 1).then(
      () => {
        expect(true).eql(false);
      },
      b => {
        expect(b).eql(false);
        expect(resF).eql(3);
      },
    );
    await checkAndWait(rejectTrue, 3, [], 1).then(
      () => {
        expect(true).eql(false);
      },
      b => {
        expect(b).eql(true);
        expect(rejT).eql(1);
      },
    );
    await checkAndWait(rejectFalse, 3, [], 1).then(
      () => {
        expect(true).eql(false);
      },
      b => {
        expect(b).eql(false);
        expect(rejF).eql(3);
      },
    );
    await checkAndWait(returnError, 3, [], 1).then(
      () => {
        expect(true).eql(false);
      },
      b => {
        expect(b).eql(false);
        expect(retE).eql(3);
      },
    );
    let x = 0;
    function* gen() {
      yield false;
      yield false;
      yield false;
      yield false;
      yield false;
      yield false;
      yield false;
      yield true;
      yield false;
      yield false;
    }
    async function res(h: Generator) {
      return Promise.resolve(h.next().value);
    }
    let g = gen();
    let testFFT = () => {
      x += 1;
      return res(g);
    };
    await checkAndWait(testFFT, 10, [], 1).then(
      b => {
        expect(b).eql(true);
        expect(x).eql(8);
      },
      () => {
        expect(true).eql(false);
      },
    );
  });
  after('complete', async () => {
    restoreLogger();
  });
});
