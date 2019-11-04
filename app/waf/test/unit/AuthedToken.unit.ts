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

import {
  StubResponses,
  ExpectedData,
} from '../fixtures/datasources/testrest.datasource';
import {AuthedToken} from '../../src/services';
import {expect} from '@loopback/testlab';
import {setupEnvs, teardownEnvs} from '../helpers/testsetup-helper';

describe('test AuthedToken', async () => {
  beforeEach('setup test', () => {
    setupEnvs();
  });
  afterEach('teardown test', () => {
    teardownEnvs();
  });

  it('test v2.0 normal case.', () => {
    let v20Response = {
      body: [StubResponses.v2AuthToken200()],
    };
    let authedToken = AuthedToken.buildWith(v20Response);
    expect(authedToken.token).eql(ExpectedData.userToken);
    let ep = authedToken.epPorts();
    expect(ep).to.endWith('/v2.0/ports');
  });

  it('test v2.0 error case with different region name set', () => {
    setupEnvs({
      OS_REGION_NAME: 'myRegion',
      OS_INTERFACE: 'public',
    });
    let v20Response = {
      body: [StubResponses.v2AuthToken200()],
    };
    let authedToken = AuthedToken.buildWith(v20Response);
    expect(authedToken.token).eql(ExpectedData.userToken);
    try {
      authedToken.epFloatingIps();
    } catch (error) {
      expect(error.message).eql(
        'public endpoint for network in region: myRegion: not found in v2.0 authed token.',
      );
    }
  });

  it('test v3 normal case.', () => {
    let v3Response = {
      headers: {
        'x-subject-token': ExpectedData.userToken,
      },
      body: [StubResponses.v3AuthToken200()],
    };
    let authedToken = AuthedToken.buildWith(v3Response);
    expect(authedToken.token).eql(ExpectedData.userToken);
  });

  it('test v3 normal case with OS_INTERFACE set', () => {
    setupEnvs({
      OS_INTERFACE: 'public',
    });
    let v3Response = {
      headers: {
        'x-subject-token': ExpectedData.userToken,
      },
      body: [StubResponses.v3AuthToken200()],
    };
    let authedToken = AuthedToken.buildWith(v3Response);
    expect(authedToken.token).eql(ExpectedData.userToken);
  });

  it('test v3 error case of no response body', () => {
    let v3Response = {
      headers: {
        'x-subject-token': ExpectedData.userToken,
      },
      // no body. body: [StubResponses.v3AuthToken200()],
    };
    try {
      AuthedToken.buildWith(v3Response);
    } catch (error) {
      expect(error.message).eql(
        'Invalid authed object, unable to parse: no "body"',
      );
    }
  });

  it('test v3 error case of malform body', () => {
    let v3Response = {
      headers: {
        'x-subject-token': ExpectedData.userToken,
      },
      body: [StubResponses.v3AuthToken200()],
    };
    // @ts-ignore
    v3Response.body[0].mytoken = v3Response.body[0].token;
    delete v3Response.body[0].token;
    try {
      AuthedToken.buildWith(v3Response);
    } catch (error) {
      expect(error.message).eql('Not recognized version: undefined');
    }
  });

  it('test v3 error case: missing catalog.', () => {
    let v3Response = {
      headers: {
        'x-subject-token': ExpectedData.userToken,
      },
      body: [StubResponses.v3AuthToken200()],
    };
    let authedToken = AuthedToken.buildWith(v3Response);
    expect(authedToken.token).eql(ExpectedData.userToken);
    delete authedToken.catalog;

    try {
      authedToken.epFloatingIps();
    } catch (error) {
      expect(error.message).eql('catalog of authed token is empty.');
    }
  });

  it('test v3 error case with different region name set', () => {
    setupEnvs({
      OS_REGION_NAME: 'myRegion',
      OS_INTERFACE: 'public',
    });
    let v3Response = {
      headers: {
        'x-subject-token': ExpectedData.userToken,
      },
      body: [StubResponses.v3AuthToken200()],
    };
    let authedToken = AuthedToken.buildWith(v3Response);
    expect(authedToken.token).eql(ExpectedData.userToken);
    try {
      authedToken.epFloatingIps();
    } catch (error) {
      expect(error.message).eql(
        'public endpoint for network in region: myRegion: not found in v3 authed token.',
      );
    }
  });

  it('test v3 error case with none existing interface set', () => {
    setupEnvs({
      OS_INTERFACE: 'non-existing-interface',
    });
    let v3Response = {
      headers: {
        'x-subject-token': ExpectedData.userToken,
      },
      body: [StubResponses.v3AuthToken200()],
    };
    let authedToken = AuthedToken.buildWith(v3Response);
    expect(authedToken.token).eql(ExpectedData.userToken);
    try {
      authedToken.epFloatingIps();
    } catch (error) {
      expect(error.message).eql(
        'non-existing-interface endpoint for network in region: RegionOne: not found in v3 authed token.',
      );
    }
  });
});
