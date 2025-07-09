import { UserUpdatedEvent } from 'src/user/events/user.updated.event';
import { UserCreatedEvent } from '../user/events/user.created.event';

export const EventRegistry = {
  [UserCreatedEvent.eventName]: UserCreatedEvent,
  [UserUpdatedEvent.eventName]: UserUpdatedEvent,
};
