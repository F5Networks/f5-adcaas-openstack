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

import {merge} from '../../src/utils';
import {expect} from '@loopback/testlab';

describe('test merge function', () => {
  it('merge normal objects: no duplicate', () => {
    let obj1 = {
      a: {},
      b: true,
    };
    let obj2 = {
      c: 'string',
      d: 23,
    };

    let t = merge(obj1, obj2);

    expect(Object.keys(t)).containDeep(['a', 'b', 'c', 'd']);
    expect(t).deepEqual({
      a: {},
      b: true,
      c: 'string',
      d: 23,
    });
  });

  it('merge normal objects: duplicate', () => {
    let obj1 = {
      a: {},
      b: true,
      c: 'string in obj1',
    };
    let obj2 = {
      c: 'string in obj2',
      d: 23,
    };

    let t = merge(obj1, obj2);

    expect(Object.keys(t)).containDeep(['a', 'b', 'c', 'd']);
    expect(t).deepEqual({
      a: {},
      b: true,
      c: 'string in obj2',
      d: 23,
    });
  });

  it('merge normal objects: deep merge.', () => {
    let obj1 = {
      a: {
        aa: 'aa',
        bb: 'bb',
      },
      b: true,
    };
    let obj2 = {
      a: {
        cc: 'cc',
      },
      c: 'string',
      d: 23,
    };

    let t = merge(obj1, obj2);

    expect(Object.keys(t)).containDeep(['a', 'b', 'c', 'd']);
    expect(t).deepEqual({
      a: {
        aa: 'aa',
        bb: 'bb',
        cc: 'cc',
      },
      b: true,
      c: 'string',
      d: 23,
    });
  });

  it('merge objects: target is empty', () => {
    let obj1 = {};
    let obj2 = {
      a: {},
      b: true,
      c: 'string',
      d: 23,
    };

    let t = merge(obj1, obj2);

    expect(Object.keys(t)).containDeep(['a', 'b', 'c', 'd']);
    expect(t).deepEqual({
      a: {},
      b: true,
      c: 'string',
      d: 23,
    });
  });

  it('merge objects: target contains null', () => {
    let obj1 = {
      a: null,
    };
    let obj2 = {
      b: true,
      c: 'string',
      d: 23,
    };

    let t = merge(obj1, obj2);

    expect(Object.keys(t)).containDeep(['a', 'b', 'c', 'd']);
    expect(t).deepEqual({
      a: null,
      b: true,
      c: 'string',
      d: 23,
    });
  });

  it('merge objects: target contains null, source overwrites it.', () => {
    let obj1 = {
      a: null,
    };
    let obj2 = {
      a: {},
      b: true,
      c: 'string',
      d: 23,
    };

    let t = merge(obj1, obj2);

    expect(Object.keys(t)).containDeep(['a', 'b', 'c', 'd']);
    expect(t).deepEqual({
      a: {},
      b: true,
      c: 'string',
      d: 23,
    });
  });

  it('merge objects: source contains null', () => {
    let obj1 = {
      a: {},
    };
    let obj2 = {
      b: true,
      c: null,
      d: 23,
    };

    let t = merge(obj1, obj2);

    expect(Object.keys(t)).containDeep(['a', 'b', 'd']);
    expect(t).deepEqual({
      a: {},
      b: true,
      d: 23,
    });
  });

  it('merge objects: merge object to array', () => {
    let obj1 = [1, 2, 3];
    let obj2 = {
      b: true,
      c: null,
      d: 23,
    };

    let t = merge(obj1, obj2);

    expect(Object.keys(t)).containDeep(['0', '1', '2', 'b', 'd']);
    // Array t ==== [ 1, 2, 3, b: true, d: 23 ], bad stuctured
  });

  it('merge objects: may passing in undefined', () => {
    let obj = {
      obj1: {},
      obj2: {
        b: true,
        c: null,
        d: 23,
      },
      obj3: [],
      obj4: [],
    };

    delete obj.obj1;
    delete obj.obj4;

    try {
      merge(obj.obj1, obj.obj2);
    } catch (error) {
      expect(error.message).eql(
        'merging target or source cannot be undefined.',
      );
    }

    try {
      merge(obj.obj3, obj.obj4);
    } catch (error) {
      expect(error.message).eql(
        'merging target or source cannot be undefined.',
      );
    }
  });
});
