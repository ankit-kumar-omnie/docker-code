import { Injectable } from '@nestjs/common';
import { AppEvent } from './base-handler';
import axios from 'axios';
import { UserAggregate } from 'src/user/aggregates/user.aggregate';
import { UserEventHandler } from 'src/user/handler/user.handler';

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
    const streamUrl = `${this.eventStoreUrl}/streams/${streamName}/0/forward/100`;

    try {
      const res = await axios.get(streamUrl, {
        headers: { Accept: 'application/json' },
        auth: this.credentials,
      });

      const entries = res.data.entries || [];
      const events: AppEvent[] = [];

      for (const entry of entries.reverse()) {
        const eventUrl = entry.links?.find(
          (l: any) => l.relation === 'alternate',
        )?.uri;

        if (!eventUrl) {
          console.warn(`⚠️ Missing alternate link for ${entry.title}`);
          continue;
        }

        try {
          const eventRes = await axios.get(eventUrl, {
            headers: { Accept: 'application/json' },
            auth: this.credentials,
          });

          const event = eventRes.data;
          events.push({
            eventName: event.eventName,
            payload: event.payload,
            createdAt: new Date(event.createdAt),
          });
        } catch (err) {
          console.error(
            `❌ Error fetching detail at ${eventUrl}:`,
            err.message,
          );
        }
      }
      return events;
    } catch (err) {
      console.error(
        `❌ Error fetching events for ${streamName}:`,
        err?.response?.data || err.message,
      );
      return [];
    }
  }

  /**
   * Rebuild user aggregate state from event stream
   */
  async getUserSnapshot(
    userId: string,
  ): Promise<UserAggregate> {
    const streamName = `user-${userId}`;
    const events = await this.getEvents(streamName);

    const aggregate = new UserAggregate(userId, this);
    aggregate.applyAll(events);

    return aggregate;
  }
}
