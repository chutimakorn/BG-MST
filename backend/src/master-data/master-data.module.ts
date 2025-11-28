import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterDataController } from './master-data.controller';
import { MasterDataService } from './master-data.service';
import { Car } from '../entities/car.entity';
import { SaleMember } from '../entities/sale-member.entity';
import { CategoryCar } from '../entities/category-car.entity';
import { BodyColor } from '../entities/body-color.entity';
import { SeatColor } from '../entities/seat-color.entity';
import { CanopyColor } from '../entities/canopy-color.entity';
import { Province } from '../entities/province.entity';
import { StatusSale } from '../entities/status-sale.entity';
import { StatusJobDocument } from '../entities/status-job-document.entity';
import { StatusJob } from '../entities/status-job.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Car,
      SaleMember,
      CategoryCar,
      BodyColor,
      SeatColor,
      CanopyColor,
      Province,
      StatusSale,
      StatusJobDocument,
      StatusJob,
    ]),
  ],
  controllers: [MasterDataController],
  providers: [MasterDataService],
})
export class MasterDataModule {}
