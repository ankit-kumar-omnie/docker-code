import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DataSets, DataSetsSchema } from "./schema/datasets.schema";
import { DataSetsService } from "./service/datasets.service";

@Module({
    imports:[MongooseModule.forFeature([{name:DataSets.name,schema:DataSetsSchema}])],
    providers:[DataSetsService],
    exports:[DataSetsService]
})

export class DataSetsModule{}