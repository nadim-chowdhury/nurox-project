import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  async createEvent(data: {
    summary: string;
    location?: string;
    description?: string;
    start: { dateTime: string };
    end: { dateTime: string };
    attendees: { email: string }[];
  }) {
    this.logger.log(`[GOOGLE CALENDAR] Creating event: ${data.summary}`);
    this.logger.log(
      `[GOOGLE CALENDAR] Time: ${data.start.dateTime} - ${data.end.dateTime}`,
    );
    this.logger.log(
      `[GOOGLE CALENDAR] Attendees: ${data.attendees.map((a) => a.email).join(', ')}`,
    );

    // Simulate API call
    return {
      id: Math.random().toString(36).substring(7),
      htmlLink: 'https://calendar.google.com/event?id=mock',
      ...data,
    };
  }
}
