import { AppEvent, BaseHandler } from 'src/common/base-handler';
import { EventStoreService } from 'src/common/event-store.service';
import { UserCreatedEvent } from '../events/user.created.event';
import { BaseAggregate } from 'src/common/base-aggregate';
import { StreamPrifix } from 'src/streams-prefix/stream-prefix';

export interface UserAggregateData {
  id: string;
  username: string;
  password: string;
}

export class UserAggregate extends BaseAggregate<UserAggregateData> {
  static override streamPrefix = StreamPrifix.User;
  private uncommittedEvents: AppEvent[] = [];

  constructor(
    id: string,
    private readonly eventStore: EventStoreService,
    private readonly eventHandler?: BaseHandler, // made optional
  ) {
    super(id, { id, username: '', password: '' });
  }

  // Used to apply events one by one (from read side or during commit)
  public applyEvent(event: AppEvent) {
    this.apply(event);
  }

  // Command method to create a new user
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

    this.apply(event); // Apply immediately to current state
    this.uncommittedEvents.push(event); // Queue it for persistence
  }

  // Commits all uncommitted events
  async commit() {
    for (const event of this.uncommittedEvents) {
      await this.eventStore.append(`${StreamPrifix.User}-${this.id}`, event);
      if (this.eventHandler) {
        await this.eventHandler.dispatch(event); // dispatch only if defined
      }
    }
    this.uncommittedEvents = [];
  }
}
