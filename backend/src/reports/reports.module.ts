import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Quotation } from '../entities/quotation.entity';
import { JobOrder } from '../entities/job-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quotation, JobOrder])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
