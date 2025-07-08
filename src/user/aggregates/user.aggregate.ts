import { AppEvent, BaseHandler } from 'src/common/base-handler';
import { EventStoreService } from 'src/common/event-store.service';
import { UserCreatedEvent } from '../events/user.created.event';
import { BaseAggregate } from 'src/common/base-aggregate';
import { UserEventHandler } from '../handler/user.handler';

export interface UserAggregateData {
  id: string;
  username: string;
  password: string;
}

export class UserAggregate extends BaseAggregate<UserAggregateData> {
  private uncommittedEvents: AppEvent[] = [];

  constructor(
    id: string,
    private readonly eventStore: EventStoreService,
    private readonly eventHandler: BaseHandler
  ) {
    super(id, { id, username: '', password: '' });
  }

  // Used on the read/projection side
  public applyEvent(event: AppEvent) {
    this.apply(event);
  }

  // Command side
  createUser(username: string, password: string) {
    const event: AppEvent = {
      eventName: UserCreatedEvent.eventName,
      createdAt: new Date(),
      payload: {
        id: this.id,
        username,
        password,
      },
    };

    this.apply(event);
    this.uncommittedEvents.push(event);
  }

  async commit() {
    for (const event of this.uncommittedEvents) {
      await this.eventStore.append(`user-${this.id}`, event);
      await this.eventHandler.dispatch(event);
    }
    this.uncommittedEvents = [];
  }
}

