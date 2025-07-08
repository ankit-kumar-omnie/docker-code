import { AppEvent, BaseHandler } from '../../common/base-handler';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserAggregate } from '../aggregates/user.aggregate';
import { User } from '../schema/user.schema';
import {
  UserCreatedEvent,
  UserCreatedPayload,
} from '../events/user.created.event';
import { EventStoreService } from 'src/common/event-store.service';

export class UserEventHandler extends BaseHandler {
  readonly eventHandlerMap = new Map([
    [UserCreatedEvent.eventName, this.handleUserCreated.bind(this)],
  ]);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly eventStore: EventStoreService, // ✅ inject this
  ) {
    super();
  }

  private async handleUserCreated(event: AppEvent<UserCreatedPayload>) {
    const aggregate = new UserAggregate(
      event.payload.id,
      this.eventStore,
      this,
    );
    aggregate.applyEvent(event);

    const { username, password } = aggregate.data;

    await this.userModel.create({
      id: event.payload.id,
      username,
      password,
    });
  }
}
