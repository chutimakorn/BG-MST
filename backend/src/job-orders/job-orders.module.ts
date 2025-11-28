import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOrdersController } from './job-orders.controller';
import { JobOrdersService } from './job-orders.service';
import { JobOrder } from '../entities/job-order.entity';
import { Car } from '../entities/car.entity';
import { BodyColor } from '../entities/body-color.entity';
import { SeatColor } from '../entities/seat-color.entity';
import { CanopyColor } from '../entities/canopy-color.entity';
import { StatusJobDocument } from '../entities/status-job-document.entity';
import { StatusJob } from '../entities/status-job.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JobOrder,
      Car,
      BodyColor,
      SeatColor,
      CanopyColor,
      StatusJobDocument,
      StatusJob,
    ]),
  ],
  controllers: [JobOrdersController],
  providers: [JobOrdersService],
  exports: [JobOrdersService],
})
export class JobOrdersModule {}
