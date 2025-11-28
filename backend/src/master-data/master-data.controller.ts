import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { MasterDataService } from './master-data.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('master-data')
@UseGuards(JwtAuthGuard)
export class MasterDataController {
  constructor(private masterDataService: MasterDataService) {}

  @Post('initialize')
  initialize() {
    return this.masterDataService.initializeDefaultData();
  }

  @Get(':type')
  findAll(@Param('type') type: string) {
    return this.masterDataService.findAll(type);
  }

  @Post(':type')
  create(@Param('type') type: string, @Body() data: any) {
    return this.masterDataService.create(type, data);
  }

  @Put(':type/:id')
  update(@Param('type') type: string, @Param('id') id: number, @Body() data: any) {
    return this.masterDataService.update(type, id, data);
  }

  @Delete(':type/:id')
  delete(@Param('type') type: string, @Param('id') id: number) {
    return this.masterDataService.delete(type, id);
  }
}
