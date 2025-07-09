import { AppEvent } from 'src/common/base-handler';
import { UserAggregateData } from '../aggregates/user.aggregate';

export interface UserUpdatedPayload {
  id: string;
  username?: string;
  password?: string;
}

export class UserUpdatedEvent {
  static readonly eventName = 'user.updated';

  static rehydrate(
    current: UserAggregateData,
    event: AppEvent<UserUpdatedPayload>,
  ): UserAggregateData {
    if (current.id !== event.payload.id) {
      throw new Error(`Mismatched ID during rehydration`);
    }

    return {
      id: current.id,
      username: event.payload.username ?? current.username,
      password: event.payload.password ?? current.password,
    };
  }
}
