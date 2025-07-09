import { Injectable } from '@nestjs/common';
import { UserDto } from '../dto/user.dto';
import { v4 as uuid } from 'uuid';
import { EventStoreService } from '../../common/event-store.service';
import { UserEventHandler } from '../handler/user.handler';
import { UserAggregate, UserAggregateData } from '../aggregates/user.aggregate';
import { UserUpdatedEvent } from '../events/user.updated.event';
import { UserAggregateService } from './user.aggregate.service';
import { AggregateService } from 'src/common/aggregate.service';

@Injectable()
export class UserService {
  constructor(
    private readonly aggregateService: AggregateService,
    private readonly userAggregateService:UserAggregateService
  ) {}

  async createUser(dto: UserDto) {
    const aggregate = this.userAggregateService.createAggregate(dto);
    await aggregate.commit();
    return { message: 'UserCreatedEvent appended and handled', userId: aggregate.id };
  }

  async getAggregate(id: string): Promise<UserAggregateData> {
    const aggregate = await this.aggregateService.load(UserAggregate, id);
    return aggregate.data;
  }
}
