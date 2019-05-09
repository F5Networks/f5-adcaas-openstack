import {factory} from './log4ts';

const utilsLogger = factory.getLogger('utils.logger');

export async function checkAndWait(
  checkFunc: Function,
  tryTimes: number,
  funcArgs: (object | string | number | boolean | undefined)[] = [],
  intervalInMSecs: number = 1000,
): Promise<void> {
  let funcName = checkFunc.name ? checkFunc.name : 'anonymous';

  utilsLogger.debug(
    `Check and wait '${funcName}' to response, countdown: ${tryTimes}.`,
  );
  if (tryTimes <= 0) {
    utilsLogger.error(`'${funcName}' timeout.`);
    return Promise.reject();
  }

  let hdlr = async (b: boolean | Error): Promise<boolean> => {
    utilsLogger.debug(
      `'${funcName}' response with ${b}, countdown: ${tryTimes}`,
    );
    if (typeof b === 'boolean' && b) return Promise.resolve(true);
    else throw new Error();
  };

  try {
    await checkFunc(...funcArgs).then(hdlr, hdlr);
    //await checkFunc(...funcArgs);
  } catch (error) {
    await sleep(intervalInMSecs);
    await checkAndWait(checkFunc, tryTimes - 1, funcArgs, intervalInMSecs);
  }
}

export async function sleep(milliSecs: number): Promise<void> {
  await new Promise(reslFunc => {
    setTimeout(reslFunc, milliSecs);
  });
}
