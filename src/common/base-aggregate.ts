import { AppEvent } from './base-handler';
import { EventRegistry } from './event-registry';

export abstract class BaseAggregate<TState> {
  public static streamPrefix: string;
  public data: TState;

  constructor(public id: string, initialState: TState) {
    this.data = initialState;
  }

  apply(event: AppEvent<any>): void {
    const eventClass = EventRegistry[event.eventName];

    if (!eventClass || typeof eventClass.rehydrate !== 'function') {
      throw new Error(
        `No valid rehydrate() method for event: ${event.eventName}`,
      );
    }

    this.data = eventClass.rehydrate(this.data, event);
  }

  applyAll(events: AppEvent<any>[]) {
    for (const event of events) {
      this.apply(event);
    }
  }
}
