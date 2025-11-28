import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { PdfParserService } from './pdf-parser.service';
import { Quotation } from '../entities/quotation.entity';
import { SaleMember } from '../entities/sale-member.entity';
import { Car } from '../entities/car.entity';
import { CategoryCar } from '../entities/category-car.entity';
import { BodyColor } from '../entities/body-color.entity';
import { SeatColor } from '../entities/seat-color.entity';
import { CanopyColor } from '../entities/canopy-color.entity';
import { Province } from '../entities/province.entity';
import { StatusSale } from '../entities/status-sale.entity';
import { StatusJobDocument } from '../entities/status-job-document.entity';
import { StatusJob } from '../entities/status-job.entity';
import { JobOrder } from '../entities/job-order.entity';
import { JobOrdersService } from '../job-orders/job-orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quotation,
      SaleMember,
      Car,
      CategoryCar,
      BodyColor,
      SeatColor,
      CanopyColor,
      Province,
      StatusSale,
      StatusJobDocument,
      StatusJob,
      JobOrder,
    ]),
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [ImportController],
  providers: [ImportService, PdfParserService, JobOrdersService],
})
export class ImportModule {}
