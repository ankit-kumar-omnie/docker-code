import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schema/user.schema";
import { UserController } from "./controller/user.controller";
import { UserService } from "./service/user.service";
import { EventStoreService } from "src/common/event-store.service";
import { UserEventHandler } from "./handler/user.handler";
import { UserAggregate } from "./aggregates/user.aggregate";
import { UserAggregateService } from "./service/user.aggregate.service";
import { AggregateService } from "src/common/aggregate.service";
import { DataSetsModule } from "src/datasets/dataset.module";

@Module({
    imports: [MongooseModule.forFeature([{name:User.name,schema:UserSchema}]),DataSetsModule],
    controllers: [UserController],
    providers: [UserService,EventStoreService,UserEventHandler,UserAggregate,UserAggregateService,AggregateService,], 
    exports: []
})

export class UserModule {}