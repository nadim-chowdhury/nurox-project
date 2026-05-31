import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SearchService } from './search.service';

@Injectable()
export class SearchListener {
  private readonly logger = new Logger(SearchListener.name);

  constructor(private readonly searchService: SearchService) {}

  @OnEvent('product.created')
  @OnEvent('product.updated')
  async handleProductSync(payload: any) {
    this.logger.debug(`Syncing product to Meilisearch: ${payload.id}`);
    await this.searchService.indexDocument('products', {
      id: payload.id,
      tenantId: payload.tenantId,
      name: payload.name,
      sku: payload.sku,
      description: payload.description,
      category: payload.category,
      status: payload.status,
      updatedAt: payload.updatedAt,
    });
  }

  @OnEvent('product.deleted')
  async handleProductDelete(payload: any) {
    this.logger.debug(`Deleting product from Meilisearch: ${payload.id}`);
    await this.searchService.deleteDocument('products', payload.id);
  }

  @OnEvent('invoice.created')
  @OnEvent('invoice.updated')
  async handleInvoiceSync(payload: any) {
    this.logger.debug(`Syncing invoice to Meilisearch: ${payload.id}`);
    await this.searchService.indexDocument('invoices', {
      id: payload.id,
      tenantId: payload.tenantId,
      invoiceNumber: payload.invoiceNumber,
      customerName: payload.customerName,
      status: payload.status,
      totalAmount: payload.totalAmount,
      currency: payload.currency,
      invoiceDate: payload.invoiceDate,
      updatedAt: payload.updatedAt,
    });
  }

  @OnEvent('invoice.deleted')
  async handleInvoiceDelete(payload: any) {
    this.logger.debug(`Deleting invoice from Meilisearch: ${payload.id}`);
    await this.searchService.deleteDocument('invoices', payload.id);
  }

  @OnEvent('employee.created')
  @OnEvent('employee.updated')
  async handleEmployeeSync(payload: any) {
    this.logger.debug(`Syncing employee to Meilisearch: ${payload.id}`);
    await this.searchService.indexDocument('employees', {
      id: payload.id,
      tenantId: payload.tenantId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      employeeId: payload.employeeId,
      department: payload.department,
      designation: payload.designation,
      status: payload.status,
      updatedAt: payload.updatedAt,
    });
  }

  @OnEvent('employee.deleted')
  async handleEmployeeDelete(payload: any) {
    this.logger.debug(`Deleting employee from Meilisearch: ${payload.id}`);
    await this.searchService.deleteDocument('employees', payload.id);
  }

  @OnEvent('chat.message_sent')
  async handleChatMessageSync(payload: any) {
    this.logger.debug(`Syncing chat message to Meilisearch: ${payload.id}`);
    await this.searchService.indexDocument('chat_messages', {
      id: payload.id,
      tenantId: payload.tenantId,
      channelId: payload.channelId,
      senderId: payload.senderId,
      content: payload.content,
      createdAt: payload.createdAt,
    });
  }
}
