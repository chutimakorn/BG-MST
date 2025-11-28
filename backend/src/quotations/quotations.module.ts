import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuotationsController } from './quotations.controller';
import { QuotationsService } from './quotations.service';
import { Quotation } from '../entities/quotation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quotation])],
  controllers: [QuotationsController],
  providers: [QuotationsService],
})
export class QuotationsModule {}
