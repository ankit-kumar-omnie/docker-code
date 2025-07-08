import { UserCreatedEvent } from '../user/events/user.created.event';

export const EventRegistry = {
  [UserCreatedEvent.eventName]: UserCreatedEvent,
};
