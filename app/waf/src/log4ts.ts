import {
  LoggerFactoryOptions,
  LFService,
  LogGroupRule,
  LogLevel,
} from 'typescript-logging';

const defaultLogLevel = LogLevel.fromString(process.env.LOGLEVEL || 'Trace');

let options = new LoggerFactoryOptions();

const array = ['api', 'controller', '.'];
array.forEach(element => {
  options = options.addLogGroupRule(
    new LogGroupRule(new RegExp(element + '+'), defaultLogLevel),
  );
});

// TODO: refactor the factory to bind to application context.
export const factory = LFService.createNamedLoggerFactory(
  'LoggerFactory',
  options,
);
