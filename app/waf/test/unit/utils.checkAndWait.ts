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
    let rejS = 0; //should be 1
    let rejE = 0; //should be 1
    let rejF = 0; //should be 1
    let retE = 0; //should be 1
    let resolveTrue = () => {
      resT += 1;
      return Promise.resolve(true);
    };
    let resolveFalse = () => {
      resF += 1;
      return Promise.resolve(false);
    };
    let rejectString = () => {
      rejS += 1;
      return Promise.reject('haha');
    };
    let rejectError = () => {
      rejE += 1;
      return Promise.reject(new Error('hahaha'));
    };
    let rejectFalse = () => {
      rejF += 1;
      return Promise.reject(false);
    };
    let returnError = () => {
      retE += 1;
      throw new Error('help');
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
        expect(b).eql('timeout');
        expect(resF).eql(3);
      },
    );
    await checkAndWait(rejectString, 3, [], 1).then(
      () => {
        expect(true).eql(false);
      },
      b => {
        expect(b).eql('haha');
        expect(rejS).eql(1);
      },
    );
    await checkAndWait(rejectError, 3, [], 1).then(
      () => {
        expect(true).eql(false);
      },
      b => {
        expect(b).eql('hahaha');
        expect(rejE).eql(1);
      },
    );
    await checkAndWait(rejectFalse, 3, [], 1).then(
      () => {
        expect(true).eql(false);
      },
      b => {
        expect(b).eql('checkAndWait terminates due to unknown error');
        expect(rejF).eql(1);
      },
    );
    await checkAndWait(returnError, 3, [], 1).then(
      () => {
        expect(true).eql(false);
      },
      b => {
        expect(b.message).eql('help');
        expect(retE).eql(1);
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
