import { Injectable } from '@nestjs/common';
import { UserDto } from '../dto/user.dto';
import { v4 as uuid } from 'uuid';
import { AppEvent } from '../../common/base-handler';
import {
  UserCreatedEvent,
  UserCreatedPayload,
} from '../events/user.created.event';
import { EventStoreService } from '../../common/event-store.service';
import { UserEventHandler } from '../handler/user.handler';
import { UserAggregate } from '../aggregates/user.aggregate';

@Injectable()
export class UserService {
  constructor(
    private readonly eventStore: EventStoreService,
    private readonly userEventHandler: UserEventHandler,
  ) {}

  async createUser(dto: UserDto) {
    const userId = uuid();
    const aggregate = new UserAggregate(
      userId,
      this.eventStore,
      this.userEventHandler,
    );

    aggregate.createUser(dto.username, dto.password);
    await aggregate.commit();

    return { message: 'UserCreatedEvent appended and handled', userId };
  }
}
