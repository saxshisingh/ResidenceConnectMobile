import Logger from './logger';

declare const ErrorUtils: {
  getGlobalHandler?: () => (error: Error, isFatal?: boolean) => void;
  setGlobalHandler?: (
    handler: (error: Error, isFatal?: boolean) => void,
  ) => void;
};

const defaultHandler =
  ErrorUtils?.getGlobalHandler?.();

ErrorUtils?.setGlobalHandler?.(
  (error: Error, isFatal?: boolean) => {
    Logger.error('Global JS Crash', {
      message: error.message,
      stack: error.stack,
      isFatal,
    });

    if (defaultHandler) {
      defaultHandler(error, isFatal);
    }
  },
);

export {};