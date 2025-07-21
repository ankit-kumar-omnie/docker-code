import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class DataSets {
  @Prop({ unique: true })
  id?: string;

  @Prop({ unique: true })
  key: string;

  @Prop({ type: Map, of: [String] })
  userDataSet: Map<string, string[]>;

  @Prop({ type: Map, of: [String] })
  apiDataSet: Map<string, string[]>;
}

export const DataSetsSchema = SchemaFactory.createForClass(DataSets);
