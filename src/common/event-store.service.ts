import { Injectable } from '@nestjs/common';
import { AppEvent } from './base-handler';
import axios from 'axios';

@Injectable()
export class EventStoreService {
  private readonly eventStoreUrl =
    process.env.EVENTSTORE_URL || 'http://localhost:3000';
  private readonly credentials = {
    username: 'admin',
    password: 'changeit',
  };

  async append(streamName: string, event: AppEvent): Promise<void> {
    const url = `${this.eventStoreUrl}/streams/${streamName}`;
    const headers = {
      'Content-Type': 'application/json',
      'ES-EventType': event.eventName,
      'ES-EventId': crypto.randomUUID(),
    };

    try {
      await axios.post(url, event, {
        headers,
        auth: this.credentials,
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error('Status:', err.response?.status);
        console.error('Headers:', err.response?.headers);
        console.error('Data:', err.response?.data);
      } else {
        console.error(err.message);
      }
    }
  }

  async getEvents(streamName: string): Promise<AppEvent[]> {
    const url = `${this.eventStoreUrl}/streams/${streamName}/0/forward/100`;
    try {
      const res = await axios.get(url, {
        headers: { Accept: 'application/json' },
        auth: this.credentials,
      });

      return res.data.entries.reverse().map((entry: any) => entry.data);
    } catch (err) {
      console.error(
        `❌ Error fetching events for ${streamName}:`,
        err?.response?.data || err.message,
      );
      return [];
    }
  }
}
