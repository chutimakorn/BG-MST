import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { JobOrdersService } from './job-orders.service';

@Controller('job-orders')
export class JobOrdersController {
  constructor(private readonly jobOrdersService: JobOrdersService) {}

  @Get()
  findAll() {
    return this.jobOrdersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jobOrdersService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.jobOrdersService.create(data);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.jobOrdersService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.jobOrdersService.delete(id);
  }
}
