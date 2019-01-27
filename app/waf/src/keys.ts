import {BindingKey} from '@loopback/core';
import {LoggerFactory} from 'typescript-logging';

export interface LogFn {
  (logmsg: string): Promise<void>;
}
export namespace LOG_BINDING {
  export const LOGGER_GENERATOR = BindingKey.create<LoggerFactory>(
    'logging.factory',
  );
}
