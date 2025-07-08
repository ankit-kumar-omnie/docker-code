import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schema/user.schema";
import { UserController } from "./controller/user.controller";
import { UserService } from "./service/user.service";
import { EventStoreService } from "src/common/event-store.service";
import { UserEventHandler } from "./handler/user.handler";

@Module({
    imports: [MongooseModule.forFeature([{name:User.name,schema:UserSchema}])],
    controllers: [UserController],
    providers: [UserService,EventStoreService,UserEventHandler], 
    exports: []
})

export class UserModule {}