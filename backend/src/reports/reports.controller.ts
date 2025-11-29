import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('sales-summary')
  getSalesSummary(@Query() filters: any) {
    return this.reportsService.getSalesSummary(filters);
  }

  @Get('quotation')
  getQuotationReport(@Query('quotationNumber') quotationNumber: string) {
    return this.reportsService.getQuotationReport(quotationNumber);
  }

  @Get('monthly-quotations')
  getMonthlyQuotations(@Query() filters: any) {
    return this.reportsService.getMonthlyQuotations(filters);
  }

  @Get('monthly-job-orders')
  getMonthlyJobOrders(@Query() filters: any) {
    return this.reportsService.getMonthlyJobOrders(filters);
  }

  @Get('car-sales')
  getCarSalesReport(@Query() filters: any) {
    return this.reportsService.getCarSalesReport(filters);
  }

  @Get('province-sales')
  getProvinceSalesReport(@Query() filters: any) {
    return this.reportsService.getProvinceSalesReport(filters);
  }

  @Get('dashboard')
  getDashboardStats(@Query() filters: any) {
    return this.reportsService.getDashboardStats(filters);
  }
}
