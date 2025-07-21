import { Injectable } from '@nestjs/common';
import { UserDto } from '../dto/user.dto';
import { v4 as uuid } from 'uuid';
import { EventStoreService } from '../../common/event-store.service';
import { UserEventHandler } from '../handler/user.handler';
import { UserAggregate, UserAggregateData } from '../aggregates/user.aggregate';
import { UserUpdatedEvent } from '../events/user.updated.event';
import { UserAggregateService } from './user.aggregate.service';
import { AggregateService } from 'src/common/aggregate.service';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { CreatePostDto } from '../dto/create.post.dto';
import { DataSetsService } from 'src/datasets/service/datasets.service';

@Injectable()
export class UserService {
  constructor(
    private readonly aggregateService: AggregateService,
    private readonly userAggregateService: UserAggregateService,
    private readonly dataSetsService: DataSetsService,
  ) {}

  async createUser(dto: UserDto) {
    const aggregate = this.userAggregateService.createAggregate(dto);
    await aggregate.commit();
    return {
      message: 'UserCreatedEvent appended and handled',
      userId: aggregate.id,
    };
  }

  async getAggregate(id: string): Promise<UserAggregateData> {
    const aggregate = await this.aggregateService.load(UserAggregate, id);
    return aggregate.data;
  }

  async processPlace(createPostDto: CreatePostDto) {
    const { placeName, categoryName } = createPostDto;
    const id = uuid();

    const normalizedPlaceName = placeName.trim().toLowerCase();

    const dataSet = await this.dataSetsService.getByKey('dataSet');
    const userData = dataSet?.userDataSet || {};
    const apiData = dataSet?.apiDataSet || {};

    let updated = false;

    const normalizedUserData = new Map<string, string[]>();
    for (const key in userData) {
      const normKey = key.trim().toLowerCase();
      normalizedUserData.set(normKey, userData[key]);
    }

    // STEP 1: Manual override by user
    if (categoryName && categoryName.trim() !== '') {
      const existing = normalizedUserData.get(normalizedPlaceName) || [];

      if (!existing.includes(categoryName)) {
        existing.push(categoryName);
        normalizedUserData.set(normalizedPlaceName, existing);
        updated = true;
      }

      if (updated) {
        await this.dataSetsService.updateUserDataSet(
          'dataSet',
          Object.fromEntries(normalizedUserData),
        );
      }

      return {
        id,
        placeName,
        categories: normalizedUserData.get(normalizedPlaceName),
        source: 'user',
      };
    }

    // STEP 2: Partial match
    for (const [key, value] of normalizedUserData.entries()) {
      if (normalizedPlaceName.includes(key)) {
        return {
          id,
          placeName,
          categories: value,
          source: 'userDataSet_partial',
        };
      }
    }

    // STEP 2.1: Prefix-based match
    const matchingKey = Array.from(normalizedUserData.keys())
      .filter((key) => key.startsWith(normalizedPlaceName))
      .sort((a, b) => b.length - a.length)[0];

    if (matchingKey) {
      return {
        id,
        placeName,
        categories: normalizedUserData.get(matchingKey),
        source: 'userDataSet_prefix',
      };
    }

    // STEP 3: AI detection using DuckDuckGo scraping
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(placeName)}`;
    const headers = { 'User-Agent': 'Mozilla/5.0' };
    const response = await axios.get(searchUrl, { headers });
    const $ = cheerio.load(response.data);

    const texts: string[] = [];
    $('.result__snippet').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 50 && text.length < 500) texts.push(text);
    });

    const fullText = texts.join(' ').toLowerCase();
    const keywordHitCount = new Map<string, number>();

    for (const [category, keywords] of Object.entries(apiData)) {
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        const matches = fullText.match(regex);
        if (matches) {
          keywordHitCount.set(
            category,
            (keywordHitCount.get(category) || 0) + matches.length,
          );
        }
      }
    }

    const matchedCategories = Array.from(keywordHitCount.entries())
      .filter(([_, count]) => count >= 2)
      .map(([category]) => category);

    const finalCategories =
      matchedCategories.length > 0 ? matchedCategories : ['Others'];

    // STEP 4: Save AI result to DB
    normalizedUserData.set(normalizedPlaceName, finalCategories);
    await this.dataSetsService.updateUserDataSet(
      'dataSet',
      Object.fromEntries(normalizedUserData),
    );

    return {
      id,
      placeName,
      categories: finalCategories,
      source: 'ai',
    };
  }
}
