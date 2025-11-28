import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quotation } from '../entities/quotation.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Quotation)
    private quotationRepo: Repository<Quotation>,
  ) {}

  async getSalesSummary(filters: { startDate?: string; endDate?: string; saleMemberId?: number }) {
    try {
      const query = this.quotationRepo.createQueryBuilder('q')
        .leftJoinAndSelect('q.saleMember', 'saleMember')
        .leftJoinAndSelect('q.statusSale', 'statusSale')
        .leftJoinAndSelect('q.statusJob', 'statusJob')
        .leftJoinAndSelect('q.statusJobDocument', 'statusJobDocument');

      if (filters.startDate) {
        query.andWhere('q.submissionDate >= :startDate', { startDate: filters.startDate });
      }
      if (filters.endDate) {
        query.andWhere('q.submissionDate <= :endDate', { endDate: filters.endDate });
      }
      if (filters.saleMemberId) {
        query.andWhere('q.saleMemberId = :saleMemberId', { saleMemberId: filters.saleMemberId });
      }

      const quotations = await query.getMany();

      console.log(`Found ${quotations.length} quotations for report`);

      // ถ้าไม่มีข้อมูล ให้ return array ว่าง
      if (!quotations || quotations.length === 0) {
        return [];
      }

      // Group by month and saleMember
      const monthlyData = {};
      
      quotations.forEach(q => {
        try {
          // จัดการกับ date ที่อาจเป็น string, Date object, หรือ plain object
          let month: string;
          try {
            if (!q.submissionDate) {
              month = new Date().toISOString().slice(0, 7);
            } else if (typeof q.submissionDate === 'string') {
              month = (q.submissionDate as string).slice(0, 7);
            } else if (q.submissionDate instanceof Date) {
              month = q.submissionDate.toISOString().slice(0, 7);
            } else {
              // ถ้าเป็น object ให้ลองแปลงเป็น Date
              const date = new Date(q.submissionDate as any);
              if (!isNaN(date.getTime())) {
                month = date.toISOString().slice(0, 7);
              } else {
                month = new Date().toISOString().slice(0, 7);
              }
            }
          } catch (dateError) {
            console.error('Error parsing date:', q.submissionDate, dateError);
            month = new Date().toISOString().slice(0, 7);
          }
          if (!monthlyData[month]) {
            monthlyData[month] = {
              month,
              salesByMember: {},
              carsByStatusJob: {},
              carsByStatusSale: {},
              carsByStatusJobDocument: {},
              totalSales: 0,
            };
          }

          const saleMemberName = q.saleMember?.name || 'ไม่ระบุ';
          if (!monthlyData[month].salesByMember[saleMemberName]) {
            monthlyData[month].salesByMember[saleMemberName] = {
              totalAmount: 0,
              totalCars: 0,
            };
          }

          const grandTotal = Number(q.grandTotal) || 0;
          const quantity = Number(q.quantity) || 0;

          monthlyData[month].salesByMember[saleMemberName].totalAmount += grandTotal;
          monthlyData[month].salesByMember[saleMemberName].totalCars += quantity;
          monthlyData[month].totalSales += grandTotal;
        } catch (error) {
          console.error('Error processing quotation:', q.id, error);
        }
      });

      return Object.values(monthlyData);
    } catch (error) {
      console.error('Error in getSalesSummary:', error);
      throw error;
    }
  }

  async getQuotationReport(quotationNumber: string) {
    return this.quotationRepo.findOne({
      where: { quotationNumber },
      relations: ['saleMember', 'car', 'categoryCar', 'bodyColor', 'seatColor', 'canopyColor', 'province', 'statusSale', 'statusJobDocument', 'statusJob'],
    });
  }
}
