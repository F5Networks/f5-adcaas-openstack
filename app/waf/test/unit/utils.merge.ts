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

    expect(t).deepEqual(obj1);
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

    expect(t).deepEqual(obj1);
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

    expect(t).deepEqual(obj1);
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

  it('merge normal objects: multiple sources', () => {
    let obj1 = {
      a: {},
      b: true,
      c: 'string in obj1',
    };
    let obj2 = {
      c: 'string in obj2',
      d: 23,
    };

    let obj3 = {
      d: {
        dd: 23,
      },
    };

    let t = merge(obj1, obj2, obj3);

    expect(t).deepEqual(obj1);
    expect(Object.keys(t)).containDeep(['a', 'b', 'c', 'd']);
    expect(t).deepEqual({
      a: {},
      b: true,
      c: 'string in obj2',
      d: {
        dd: 23,
      },
    });
  });

  it('merge objects: target is undefined', () => {
    let obj1 = undefined;
    let obj2 = {
      a: {},
      b: true,
      c: 'string',
      d: 23,
    };

    let t = merge(obj1, obj2);

    //expect(t).deepEqual(obj1); if obj1 is undefined, obj1 will be never changed.
    expect(Object.keys(t)).containDeep(['a', 'b', 'c', 'd']);
    expect(t).deepEqual({
      a: {},
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

    expect(t).deepEqual(obj1);
    expect(Object.keys(t)).containDeep(['a', 'b', 'c', 'd']);
    expect(t).deepEqual({
      a: {},
      b: true,
      c: 'string',
      d: 23,
    });
  });

  it('merge objects: source is undefined', () => {
    let obj1 = {
      a: {},
      b: true,
      c: 'string',
      d: 23,
    };
    let obj2 = undefined;

    let t = merge(obj1, obj2);

    expect(t).deepEqual(obj1);
    expect(Object.keys(t)).containDeep(['a', 'b', 'c', 'd']);
    expect(t).deepEqual({
      a: {},
      b: true,
      c: 'string',
      d: 23,
    });
  });

  it('merge objects: both target and source are undefined', () => {
    let obj1 = undefined;
    let obj2 = undefined;

    let t = merge(obj1, obj2);

    expect(t).deepEqual({});
  });

  it('merge objects: sources vary', () => {
    let obj1 = {
      a: {},
      b: true,
      c: 'string',
      d: 23,
    };
    let obj2 = undefined;
    let obj3 = {
      b: false,
      d: {
        dd: 23,
      },
    };
    let obj4 = undefined;
    let obj5 = {
      a: undefined,
    };

    let t = merge(obj1, obj2, obj3, obj4, obj5);

    expect(t).deepEqual(obj1);
    expect(Object.keys(t)).containDeep(['a', 'b', 'c', 'd']);
    expect(t).deepEqual({
      a: {},
      b: false,
      c: 'string',
      d: {
        dd: 23,
      },
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

    expect(t).deepEqual(obj1);
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

    expect(t).deepEqual(obj1);
    expect(Object.keys(t)).containDeep(['a', 'b', 'c', 'd']);
    expect(t).deepEqual({
      a: {},
      b: true,
      c: 'string',
      d: 23,
    });
  });
});
