import {Platform} from 'react-native';
import {sendLog, LogLevel} from './logApi';

class Logger {
  private async write(
    level: LogLevel,
    message: string,
    data?: unknown,
  ) {
    const payload = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    switch (level) {
      case 'ERROR':
        console.error(message, data);
        break;

      case 'WARN':
        console.warn(message, data);
        break;

      default:
        console.log(message, data);
    }

    await sendLog(payload);
  }

  info(message: string, data?: unknown) {
    return this.write('INFO', message, data);
  }

  debug(message: string, data?: unknown) {
    return this.write('DEBUG', message, data);
  }

  warn(message: string, data?: unknown) {
    return this.write('WARN', message, data);
  }

  error(message: string, data?: unknown) {
    return this.write('ERROR', message, data);
  }

  screen(screen: string) {
    return this.info(`Screen Opened: ${screen}`);
  }

  api(url: string, method = 'GET', body?: unknown) {
    return this.debug('API Request', {
      url,
      method,
      body,
    });
  }

  ttlock(message: string, data?: unknown) {
    return this.debug(`[TTLock] ${message}`, data);
  }

  navigation(from: string, to: string) {
    return this.info('Navigation', {
      from,
      to,
    });
  }

  exception(error: unknown) {
    if (error instanceof Error) {
      return this.error(error.message, {
        stack: error.stack,
      });
    }

    return this.error('Unknown Exception', error);
  }
}

export default new Logger();