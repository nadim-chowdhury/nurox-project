import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDashboardWidget } from './entities/user-dashboard-widget.entity';

@Injectable()
export class UserDashboardService {
  constructor(
    @InjectRepository(UserDashboardWidget)
    private readonly widgetRepo: Repository<UserDashboardWidget>,
  ) {}

  async getUserWidgets(userId: string) {
    return this.widgetRepo.find({
      where: { userId },
      order: { order: 'ASC' },
    });
  }

  async saveUserWidgets(userId: string, widgets: any[]) {
    // We'll replace all existing widgets for this user to keep it simple
    // or we could use an upsert logic. Upsert is better.
    
    await this.widgetRepo.delete({ userId });
    
    const entities = widgets.map((w, index) => {
      return this.widgetRepo.create({
        userId,
        widgetId: w.widgetId,
        order: index,
        isVisible: w.isVisible !== undefined ? w.isVisible : true,
        gridSpan: w.gridSpan || 24,
        settings: w.settings || {},
      });
    });

    return this.widgetRepo.save(entities);
  }

  async updateWidget(userId: string, widgetId: string, data: any) {
    const widget = await this.widgetRepo.findOne({
      where: { userId, widgetId },
    });

    if (!widget) {
      throw new NotFoundException('Widget preference not found');
    }

    Object.assign(widget, data);
    return this.widgetRepo.save(widget);
  }
}
