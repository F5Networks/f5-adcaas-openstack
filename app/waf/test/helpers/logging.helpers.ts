import {sinon} from '@loopback/testlab';
import {MySequence} from '../../src/sequence';

let logRequest: sinon.SinonStub;
let logResponse: sinon.SinonStub;
let consoleLog: sinon.SinonStub;

export function stubLogging(): void {
  logRequest = sinon.stub(MySequence.prototype, 'logRequest');
  logRequest.callsFake(() => {});

  logResponse = sinon.stub(MySequence.prototype, 'logResponse');
  logResponse.callsFake(() => {});
}

export function restoreLogging(): void {
  logRequest.restore();
  logResponse.restore();
}

export function stubConsoleLog(): void {
  consoleLog = sinon.stub(console, 'log');
  consoleLog.callsFake(() => {});
}

export function restoreConsoleLog(): void {
  consoleLog.restore();
}
