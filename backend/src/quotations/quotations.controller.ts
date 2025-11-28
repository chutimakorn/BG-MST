import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('quotations')
@UseGuards(JwtAuthGuard)
export class QuotationsController {
  constructor(private quotationsService: QuotationsService) {}

  @Get()
  findAll(@Query() filters: any) {
    return this.quotationsService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.quotationsService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.quotationsService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data: any) {
    return this.quotationsService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.quotationsService.delete(id);
  }
}
