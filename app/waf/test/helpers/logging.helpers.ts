import {sinon} from '@loopback/testlab';
import {AbstractLogger} from 'typescript-logging';

let consoleLog: sinon.SinonStub;
let loggerFuncs: {[key: string]: sinon.SinonStub} = {};

export function stubConsoleLog(): void {
  consoleLog = sinon.stub(console, 'log');
  consoleLog.callsFake(() => {});
}

export function restoreConsoleLog(): void {
  consoleLog.restore();
}

export function stubLogger() {
  let fakeFunc = () => {};

  loggerFuncs['trace'] = sinon.stub(AbstractLogger.prototype, 'trace');
  loggerFuncs['debug'] = sinon.stub(AbstractLogger.prototype, 'debug');
  loggerFuncs['info'] = sinon.stub(AbstractLogger.prototype, 'info');
  loggerFuncs['warn'] = sinon.stub(AbstractLogger.prototype, 'warn');
  loggerFuncs['error'] = sinon.stub(AbstractLogger.prototype, 'error');
  loggerFuncs['fatal'] = sinon.stub(AbstractLogger.prototype, 'fatal');

  for (let f of Object.keys(loggerFuncs)) {
    loggerFuncs[f].callsFake(fakeFunc);
  }
}

export function restoreLogger() {
  for (let f of Object.keys(loggerFuncs)) {
    loggerFuncs[f].restore();
  }
}
