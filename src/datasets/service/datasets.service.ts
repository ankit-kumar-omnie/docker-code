import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DataSets } from '../schema/datasets.schema';
import { Model } from 'mongoose';

@Injectable()
export class DataSetsService {
  constructor(
    @InjectModel(DataSets.name) private dataSetModel: Model<DataSets>,
  ) {}

  async getByKey(key: string) {
    return this.dataSetModel.findOne({ key }).lean();
  }

  async updateUserDataSet(key: string, userDataSet: Record<string, string[]>) {
    return this.dataSetModel.updateOne({ key }, { $set: { userDataSet } });
  }
}
