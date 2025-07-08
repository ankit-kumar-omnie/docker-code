import { Logger } from '@nestjs/common';

export interface AppEvent<T = any> {
  eventName: string;
  payload: T;
  createdAt: Date;
}

export abstract class BaseHandler {
  protected readonly logger = new Logger(this.constructor.name);

  abstract readonly eventHandlerMap: Map<
    string,
    (event: AppEvent<any>) => Promise<void>
  >;

  async dispatch(event: AppEvent<any>): Promise<void> {
    const handler = this.eventHandlerMap.get(event.eventName);

    if (!handler) {
      this.logger.warn(`No handler for event: ${event.eventName}`);
      return;
    }

    try {
      await handler(event);
    } catch (err) {
      this.logger.error(`Error in handler for ${event.eventName}:`, err);
    }
  }
}
