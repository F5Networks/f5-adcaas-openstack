/**
 * Copyright 2019 F5 Networks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {runWithTimer, cbPostInflux, checkAndWait} from '../../src/utils';
import {expect, sinon} from '@loopback/testlab';
import {stubLogger, restoreLogger} from '../helpers/logging.helpers';
import * as WebRequest from 'web-request';
import {setupEnvs, teardownEnvs} from '../helpers/testsetup-helper';

describe('test runWithTimer', async () => {
  let stubPost: sinon.SinonStub;
  let sum = 0;
  let f = async () => {
    let max = 100;
    let index = 0;
    while (index < max) {
      sum += index;
      index++;
    }
  };

  before('before', () => {
    stubLogger();
  });

  after('after', () => {
    restoreLogger();
  });

  beforeEach('before each', async () => {
    await setupEnvs({
      INFLUXDB_URL: 'http://localhost:8086',
    });
    stubPost = sinon.stub(WebRequest, 'post');
  });

  afterEach('after each', async () => {
    await teardownEnvs();
    stubPost.restore();
  });

  it('async function with no callback', async () => {
    sum = 0;
    await runWithTimer('metrics', f);
    expect(sum).eql(4950);
  });

  it('async function with callback', async () => {
    sum = 0;
    let mm: string = '';
    let nn: number = 0;
    let cb = async (m: string, n: number) => {
      mm = m;
      nn = n;
    };

    await runWithTimer('metrics', f, cb);

    expect(nn).greaterThanOrEqual(0);
    expect(`${mm}:${nn}`).startWith('metrics:');
    expect(sum).eql(4950);
  });

  it('async function with function exception', async () => {
    f = async () => {
      throw new Error('error happens');
    };

    try {
      await runWithTimer('any', f);
      expect('here').eql('should not be reached.');
    } catch (error) {
      expect(error.message).eql('error happens');
    }
  });

  it('async function with callback exception', async () => {
    f = async () => {
      // do nothing
    };
    let cb = async () => {
      throw new Error('error happens');
    };

    try {
      await runWithTimer('any', f, cb);
    } catch (error) {
      expect('here').eql('should not be reached.');
    }
  });

  it('async function with long execution.', async () => {
    f = async () => {
      let b = false;
      let checkFunc = async () => b;

      setTimeout(() => {
        b = true;
      }, 200);
      await checkAndWait(checkFunc, 10, [], 30);
    };

    let runTime = 0;
    await runWithTimer('any', f, async (m: string, n: number) => {
      runTime = n;
    });
    expect(runTime).greaterThan(200);
    expect(runTime).lessThan(300);
  });

  it('async function with multiple long execution.', async () => {
    f = async () => {
      let b = false;
      let checkFunc = async () => b;

      setTimeout(() => {
        b = true;
      }, 100);
      await checkAndWait(checkFunc, 10, [], 20);
    };

    let runTime = 0;
    let cb = async (m: string, n: number) => {
      runTime = n;
    };
    let fff = async () => {
      let n: number;
      for (n = 0; n < 3; n++) {
        await runWithTimer('any', f, cb);
        expect(runTime).greaterThanOrEqual(99);
        expect(runTime).lessThan(200);
      }
    };

    await runWithTimer('any', fff, cb);
    expect(runTime).greaterThan(300);
    expect(runTime).lessThan(600);
  });

  it('async function with callback cbPostInflux not called', async () => {
    delete process.env.INFLUXDB_URL;
    stubPost.callsFake(() => {});

    await runWithTimer('any', async () => {}, cbPostInflux);
    expect(stubPost.calledOnce).eql(false);
  });

  it('async function with callback cbPostInflux called.', async () => {
    stubPost.callsFake(() => {});

    await runWithTimer('any', async () => {}, cbPostInflux);
    expect(stubPost.calledOnce).eql(true);
  });
});
