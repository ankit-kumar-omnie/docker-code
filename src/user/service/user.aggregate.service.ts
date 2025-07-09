import { Injectable } from '@nestjs/common';
import { UserAggregate } from '../aggregates/user.aggregate';
import { EventStoreService } from 'src/common/event-store.service';
import { UserEventHandler } from '../handler/user.handler';
import { UserDto } from '../dto/user.dto';
import { v4 as uuid } from 'uuid';


@Injectable()
export class UserAggregateService {
  constructor(
    private readonly eventStore: EventStoreService,
    private readonly userEventHandler: UserEventHandler,
  ) {}

  
  createAggregate(dto: UserDto): UserAggregate {
    const userId = uuid();
    const aggregate = new UserAggregate(
      userId,
      this.eventStore,
      this.userEventHandler,
    );

    aggregate.createUser(dto.username, dto.password);

    return aggregate;
  }
}