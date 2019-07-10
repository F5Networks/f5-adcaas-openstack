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

import {factory} from './log4ts';

const utilsLogger = factory.getLogger('utils.logger');

let defaultInterval = +process.env.DEFAULT_INTERVAL! || 1000;

export function getDefaultInterval(): number {
  return defaultInterval;
}

export function setDefaultInterval(ms: number) {
  if (ms > 0) {
    defaultInterval = ms;
  }
}

export function deepcopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check and wait until some condition is fulfilled or timeout.
 *
 * @param checkFunc: a function which
 *   resolves true if condition is satisfied;
 *   rejects true if condition failed and we quit waiting for it.
 *   Otherwise attempt to check the condition again after designated sleep interval.
 * @param tryTimes: times for wait.
 * @param funcArgs: array of any.
 * @param intervalInMSecs: interval in milli-seconds for sleeping between 2 tries.
 * @return:
 *  resolve true: success quit.
 *  reject true: stop quit.
 *  reject false: timeout.
 *  */
export async function checkAndWait(
  checkFunc: Function,
  tryTimes: number,
  funcArgs: (object | string | number | boolean | undefined)[] = [],
  intervalInMSecs: number = defaultInterval,
): Promise<boolean> {
  let funcName = checkFunc.name ? checkFunc.name : 'anonymous';

  utilsLogger.debug(
    `Check and wait '${funcName}' to response, countdown: ${tryTimes}.`,
  );
  if (tryTimes <= 0) {
    utilsLogger.error(`'${funcName}' timeout.`);
    return Promise.reject(false);
  }

  let hdlr = async (b: boolean | Error): Promise<boolean> => {
    utilsLogger.debug(
      `'${funcName}' response with ${b}, countdown: ${tryTimes}`,
    );
    if (typeof b === 'boolean' && b) return Promise.resolve(true);
    else throw new Error();
  };

  let errHdlr = async (b: boolean | Error): Promise<boolean> => {
    utilsLogger.debug(
      `'${funcName}' response with ${b}, countdown: ${tryTimes}`,
    );
    if (typeof b === 'boolean' && b)
      throw new Error('checkAndWait error terminate');
    else throw new Error();
  };

  try {
    return await checkFunc(...funcArgs).then(hdlr, errHdlr);
    //await checkFunc(...funcArgs);
  } catch (error) {
    if (error.message === 'checkAndWait error terminate') {
      utilsLogger.error(`'${funcName}' failure quit.`);
      return Promise.reject(true);
    }
    await sleep(intervalInMSecs);
    return await checkAndWait(
      checkFunc,
      tryTimes - 1,
      funcArgs,
      intervalInMSecs,
    );
  }
}

/**
 * sleep function
 *
 * @param milliSecs: milliseconds for the sleep.
 */
export async function sleep(milliSecs: number): Promise<void> {
  await new Promise(reslFunc => {
    setTimeout(reslFunc, milliSecs);
  });
}

/**
 * Merge two objects incursively.
 *
 * @param target: object
 * @param sources: multiple sources for merging.
 *    if source is null, set target to undefined.
 *    if source[k]'s type is different with that of target[k], this function overwrites the target[k] with source[k].
 */
export function merge(target: object, source: object): object {
  if (!target || !source)
    throw new Error(`merging target or source cannot be undefined.`);
  let sobj = JSON.parse(JSON.stringify(source));
  let tobj = JSON.parse(JSON.stringify(target));
  for (let k of Object.keys(sobj)) {
    if (sobj[k] === null) {
      delete tobj[k];
      continue;
    }
    if (!tobj[k]) {
      tobj[k] = sobj[k];
      continue;
    }

    if (typeof tobj[k] === 'object' && typeof sobj[k] === 'object') {
      tobj[k] = merge(tobj[k], sobj[k]);
    } else {
      tobj[k] = sobj[k];
    }
  }

  return tobj;
}

/**
 * Find the sub object with keyName from target, target can be an object or an array.
 *
 * @returns an array of found, each of which is the value.
 * @param target the object to find from.
 * @param key key name to find.
 */
export function findByKey(
  target: object,
  key: string,
): (object | string | boolean)[] {
  let findByKeyImpl = function(
    t: object,
    kn: string,
    r: (object | string | boolean)[],
  ) {
    let ks = Object.keys(t);
    for (let k of ks) {
      // @ts-ignore t[k] always be index-able.
      let v = t[k];
      if (k === kn) r.push(v);
      if (typeof v === 'object') findByKeyImpl(v, kn, r);
    }
  };

  let rlt: (object | string | boolean)[] = [];
  findByKeyImpl(target, key, rlt);

  return rlt;
}
