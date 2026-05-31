import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Param,
  Request,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Search')
@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('global')
  @ApiOperation({ summary: 'Global search across multiple entities' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  async globalSearch(
    @CurrentTenant() tenantId: string,
    @Query('q') query: string,
    @Request() req: any,
  ) {
    const results = await this.searchService.multiSearch(tenantId, [
      { indexUid: 'products', q: query, limit: 5 },
      { indexUid: 'invoices', q: query, limit: 5 },
      { indexUid: 'employees', q: query, limit: 5 },
    ]);

    const totalHits = results.results.reduce(
      (sum, res) => sum + (res.totalHits || 0),
      0,
    );
    const log = await this.searchService.logSearch(
      tenantId,
      req.user?.id,
      query,
      totalHits,
    );

    return {
      ...results,
      searchId: log?.id,
    };
  }

  @Post('click/:queryId')
  @ApiOperation({ summary: 'Track click on search result' })
  async trackClick(
    @CurrentTenant() tenantId: string,
    @Param('queryId') queryId: string,
    @Query('entityId') entityId: string,
  ) {
    return this.searchService.trackClick(tenantId, queryId, entityId);
  }

  @Get('products')
  @ApiOperation({ summary: 'Search products' })
  async searchProducts(
    @CurrentTenant() tenantId: string,
    @Query('q') query: string,
  ) {
    return this.searchService.search(tenantId, 'products', query);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Search invoices' })
  async searchInvoices(
    @CurrentTenant() tenantId: string,
    @Query('q') query: string,
  ) {
    return this.searchService.search(tenantId, 'invoices', query);
  }

  @Get('employees')
  @ApiOperation({ summary: 'Search employees' })
  async searchEmployees(
    @CurrentTenant() tenantId: string,
    @Query('q') query: string,
  ) {
    return this.searchService.search(tenantId, 'employees', query);
  }
}
