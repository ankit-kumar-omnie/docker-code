import { AppEvent } from 'src/common/base-handler';
import { UserAggregateData } from '../aggregates/user.aggregate';

export interface UserCreatedPayload {
  id: string;
  username: string;
  password: string;
}

export class UserCreatedEvent {
  static readonly eventName = 'user.created';

  static rehydrate(
    current: UserAggregateData,
    event: AppEvent<UserCreatedPayload>,
  ): UserAggregateData {
    return {
      id: event.payload.id,
      username: event.payload.username,
      password: event.payload.password,
    };
  }
}
