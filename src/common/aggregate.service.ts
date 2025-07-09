import { Injectable, Optional } from '@nestjs/common';
import { EventStoreService } from './event-store.service';
import { AppEvent, BaseHandler } from './base-handler';
import { BaseAggregate } from './base-aggregate';

@Injectable()
export class AggregateService {
  constructor(
    private readonly eventStore: EventStoreService,
    @Optional() private readonly handler?: BaseHandler,
  ) {}

  /**
   * Create a new aggregate (without historical events)
   */
  create<T extends BaseAggregate<any>>(
    AggregateClass: new (
      id: string,
      eventStore: EventStoreService,
      handler?: BaseHandler,
    ) => T,
    id: string,
  ): T {
    return new AggregateClass(id, this.eventStore, this.handler);
  }

  /**
   * Rehydrate aggregate from past events
   */
  async load<T extends BaseAggregate<any>>(
    AggregateClass: new (
      id: string,
      eventStore: EventStoreService,
      handler?: BaseHandler,
    ) => T,
    id: string,
  ): Promise<T> {
    const prefix = (AggregateClass as any).streamPrefix || AggregateClass.name.toLowerCase();
    const streamName = `${prefix}-${id}`;
    const events = await this.eventStore.getEvents(streamName);
    const aggregate = new AggregateClass(id, this.eventStore, this.handler);
    aggregate.applyAll(events);
    return aggregate;
  }

  /**
   * Persist all uncommitted events of aggregate
   */
  async append<T extends BaseAggregate<any>>(aggregate: T): Promise<void> {
    const prefix =
      (aggregate.constructor as any).streamPrefix ||
      aggregate.constructor.name.toLowerCase(); // 👈
    const streamName = `${prefix}-${aggregate.id}`;
    const uncommitted = (aggregate as any).uncommittedEvents as AppEvent[];

    for (const event of uncommitted) {
      await this.eventStore.append(streamName, event);
      if (this.handler) {
        await this.handler.dispatch(event);
      }
    }

    (aggregate as any).uncommittedEvents = [];
  }
}
