import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowRule } from '../entities/workflow-rule.entity';

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(
    @InjectRepository(WorkflowRule)
    private readonly ruleRepo: Repository<WorkflowRule>,
  ) {}

  /**
   * Called by various modules when an event occurs.
   * e.g., this.workflowEngine.emitEvent(tenantId, 'LEAVE_APPROVED', { leaveId: '...', department: 'Engineering' });
   */
  async emitEvent(tenantId: string, triggerEvent: string, eventData: any) {
    this.logger.log(`Received event ${triggerEvent} for tenant ${tenantId}`);

    const activeRules = await this.ruleRepo.find({
      where: { tenantId, triggerEvent, isActive: true },
    });

    for (const rule of activeRules) {
      if (this.evaluateConditions(rule.conditionLogic, eventData)) {
        this.logger.log(
          `Rule "${rule.name}" triggered. Executing action: ${rule.actionType}`,
        );
        await this.executeAction(
          rule.actionType,
          rule.actionPayload,
          eventData,
        );
      }
    }
  }

  private evaluateConditions(conditionLogic: any, eventData: any): boolean {
    if (!conditionLogic) return true; // No conditions = always run

    try {
      // Basic mock evaluation logic
      if (
        conditionLogic.field &&
        conditionLogic.operator &&
        conditionLogic.value
      ) {
        const actualValue = eventData[conditionLogic.field];
        if (conditionLogic.operator === 'eq')
          return actualValue === conditionLogic.value;
        if (conditionLogic.operator === 'neq')
          return actualValue !== conditionLogic.value;
      }
    } catch (e) {
      this.logger.error('Failed to evaluate conditions', e);
      return false;
    }
    return true; // Fallback for unsupported rules in MVP
  }

  private async executeAction(
    actionType: string,
    actionPayload: any,
    eventData: any,
  ) {
    switch (actionType) {
      case 'SEND_EMAIL':
        this.logger.log(
          `[ACTION] Sending email to ${actionPayload.to} about ${eventData.id || 'entity'}`,
        );
        // await this.mailerService.sendMail(...)
        break;
      case 'SEND_SLACK_WEBHOOK':
        this.logger.log(
          `[ACTION] Sending Slack webhook to ${actionPayload.webhookUrl}`,
        );
        // axios.post(...)
        break;
      case 'CREATE_TASK':
        this.logger.log(`[ACTION] Creating task in Projects module`);
        // await this.projectsService.createTask(...)
        break;
      default:
        this.logger.warn(`Unknown action type: ${actionType}`);
    }
  }
}
