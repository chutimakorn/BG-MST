import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quotation } from '../entities/quotation.entity';
import { JobOrder } from '../entities/job-order.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Quotation)
    private quotationRepo: Repository<Quotation>,
    @InjectRepository(JobOrder)
    private jobOrderRepo: Repository<JobOrder>,
  ) {}

  async getSalesSummary(filters: any) {
    const { startDate, endDate, saleMemberId } = filters;
    
    const query = this.quotationRepo.createQueryBuilder('q')
      .leftJoinAndSelect('q.saleMember', 'saleMember')
      .leftJoinAndSelect('q.car', 'car')
      .leftJoinAndSelect('q.province', 'province');

    if (startDate) {
      query.andWhere('q.submissionDate >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('q.submissionDate <= :endDate', { endDate });
    }
    if (saleMemberId) {
      query.andWhere('q.saleMemberId = :saleMemberId', { saleMemberId });
    }

    const quotations = await query.getMany();

    return {
      totalQuotations: quotations.length,
      totalAmount: quotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0),
      totalQuantity: quotations.reduce((sum, q) => sum + (q.quantity || 0), 0),
      quotations,
    };
  }

  async getQuotationReport(quotationNumber: string) {
    return this.quotationRepo.findOne({
      where: { quotationNumber },
      relations: ['saleMember', 'car', 'province'],
    });
  }

  async getMonthlyQuotations(filters: any) {
    const { year, startMonth, endMonth, saleMemberId } = filters;
    
    const query = this.quotationRepo.createQueryBuilder('q')
      .select('EXTRACT(MONTH FROM q.submissionDate)', 'month')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(q.quantity)', 'totalQuantity')
      .addSelect('SUM(q.grandTotal)', 'totalAmount')
      .groupBy('EXTRACT(MONTH FROM q.submissionDate)');

    if (year) {
      query.andWhere('EXTRACT(YEAR FROM q.submissionDate) = :year', { year });
    }
    if (startMonth) {
      query.andWhere('EXTRACT(MONTH FROM q.submissionDate) >= :startMonth', { startMonth });
    }
    if (endMonth) {
      query.andWhere('EXTRACT(MONTH FROM q.submissionDate) <= :endMonth', { endMonth });
    }
    if (saleMemberId) {
      query.andWhere('q.saleMemberId = :saleMemberId', { saleMemberId });
    }

    return query.getRawMany();
  }

  async getMonthlyJobOrders(filters: any) {
    const { year, saleMemberId } = filters;
    
    // Debug: Check total job orders
    const totalJobOrders = await this.jobOrderRepo.count();
    console.log('Total Job Orders in DB:', totalJobOrders);
    
    // Debug: Check job orders with submissionDate
    const jobOrdersWithDate = await this.jobOrderRepo
      .createQueryBuilder('j')
      .select('COUNT(*)', 'count')
      .addSelect('EXTRACT(YEAR FROM j.submissionDate)', 'year')
      .where('j.submissionDate IS NOT NULL')
      .groupBy('EXTRACT(YEAR FROM j.submissionDate)')
      .getRawMany();
    console.log('Job Orders by Year:', jobOrdersWithDate);
    
    const query = this.jobOrderRepo.createQueryBuilder('j')
      .select('EXTRACT(MONTH FROM j.submissionDate)', 'month')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(j.quantity)', 'totalQuantity')
      .addSelect('SUM(j.quantity * j.pricePerUnit)', 'totalAmount')
      .where('j.submissionDate IS NOT NULL')
      .groupBy('EXTRACT(MONTH FROM j.submissionDate)');

    if (year) {
      // Year is already in Buddhist format in database
      query.andWhere('EXTRACT(YEAR FROM j.submissionDate) = :year', { year });
    }

    const result = await query.getRawMany();
    console.log('Monthly Job Orders Query Result for year', year, ':', result);
    return result;
  }

  async getCarSalesReport(filters: any) {
    const { startDate, endDate, year, startMonth, endMonth, saleMemberId } = filters;
    
    // Use quotations instead of job orders for car sales
    const query = this.quotationRepo.createQueryBuilder('q')
      .leftJoin('q.car', 'car')
      .select('car.name', 'carName')
      .addSelect('COUNT(*)::int', 'count')
      .addSelect('COALESCE(SUM(q.quantity), 0)::int', 'totalQuantity')
      .addSelect('COALESCE(SUM(q.grandTotal), 0)::decimal', 'totalAmount')
      .where('car.name IS NOT NULL')
      .groupBy('car.name')
      .orderBy('SUM(q.quantity)', 'DESC');

    if (year) {
      query.andWhere('EXTRACT(YEAR FROM q.submissionDate) = :year', { year });
    }
    if (startMonth) {
      query.andWhere('EXTRACT(MONTH FROM q.submissionDate) >= :startMonth', { startMonth });
    }
    if (endMonth) {
      query.andWhere('EXTRACT(MONTH FROM q.submissionDate) <= :endMonth', { endMonth });
    }
    if (saleMemberId) {
      query.andWhere('q.saleMemberId = :saleMemberId', { saleMemberId });
    }
    if (startDate) {
      query.andWhere('q.submissionDate >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('q.submissionDate <= :endDate', { endDate });
    }

    const results = await query.getRawMany();
    console.log('Car Sales Results:', results.slice(0, 5)); // Log first 5 results
    return results;
  }

  async getProvinceSalesReport(filters: any) {
    const { startDate, endDate, year, startMonth, endMonth, saleMemberId } = filters;
    
    const query = this.quotationRepo.createQueryBuilder('q')
      .leftJoin('q.province', 'province')
      .select('province.name', 'provinceName')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(q.quantity)', 'totalQuantity')
      .addSelect('SUM(q.grandTotal)', 'totalAmount')
      .where('province.name IS NOT NULL')
      .groupBy('province.name')
      .orderBy('SUM(q.quantity)', 'DESC');

    if (year) {
      query.andWhere('EXTRACT(YEAR FROM q.submissionDate) = :year', { year });
    }
    if (startMonth) {
      query.andWhere('EXTRACT(MONTH FROM q.submissionDate) >= :startMonth', { startMonth });
    }
    if (endMonth) {
      query.andWhere('EXTRACT(MONTH FROM q.submissionDate) <= :endMonth', { endMonth });
    }
    if (saleMemberId) {
      query.andWhere('q.saleMemberId = :saleMemberId', { saleMemberId });
    }
    if (startDate) {
      query.andWhere('q.submissionDate >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('q.submissionDate <= :endDate', { endDate });
    }

    return query.getRawMany();
  }

  async getDashboardStats(filters: any) {
    const { year = 2567, startMonth, endMonth, saleMemberId } = filters; // Default to Buddhist year 2567

    try {
      const queryFilters = { year, startMonth, endMonth, saleMemberId };
      
      const [
        monthlyQuotations,
        monthlyJobOrders,
        carSales,
        provinceSales,
        salesPerformance,
        monthlyDetails,
      ] = await Promise.all([
        this.getMonthlyQuotations(queryFilters),
        this.getMonthlyJobOrders(queryFilters),
        this.getCarSalesReport(queryFilters),
        this.getProvinceSalesReport(queryFilters),
        this.getSalesPerformance(queryFilters),
        this.getMonthlyDetails(queryFilters),
      ]);

      console.log('Dashboard Stats:', {
        year,
        startMonth,
        endMonth,
        saleMemberId,
        monthlyQuotationsCount: monthlyQuotations.length,
        monthlyJobOrdersCount: monthlyJobOrders.length,
        carSalesCount: carSales.length,
        provinceSalesCount: provinceSales.length,
      });

      return {
        monthlyQuotations,
        monthlyJobOrders,
        carSales,
        provinceSales,
        salesPerformance,
        monthlyDetails,
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  async getSalesPerformance(filters: any) {
    const { year, startMonth, endMonth } = filters;
    
    // Quotations by sale member
    const quotationsQuery = this.quotationRepo.createQueryBuilder('q')
      .leftJoin('q.saleMember', 'saleMember')
      .select('saleMember.id', 'saleMemberId')
      .addSelect('saleMember.name', 'saleMemberName')
      .addSelect('EXTRACT(MONTH FROM q.submissionDate)', 'month')
      .addSelect('COUNT(*)', 'quotationCount')
      .addSelect('SUM(q.quantity)', 'quotationQuantity')
      .addSelect('SUM(q.grandTotal)', 'quotationAmount')
      .where('saleMember.id IS NOT NULL')
      .groupBy('saleMember.id')
      .addGroupBy('saleMember.name')
      .addGroupBy('EXTRACT(MONTH FROM q.submissionDate)');

    if (year) {
      quotationsQuery.andWhere('EXTRACT(YEAR FROM q.submissionDate) = :year', { year });
    }
    if (startMonth) {
      quotationsQuery.andWhere('EXTRACT(MONTH FROM q.submissionDate) >= :startMonth', { startMonth });
    }
    if (endMonth) {
      quotationsQuery.andWhere('EXTRACT(MONTH FROM q.submissionDate) <= :endMonth', { endMonth });
    }

    const quotations = await quotationsQuery.getRawMany();

    // Job Orders by sale member (through quotation relationship)
    // Note: Job orders don't have direct sale member, so we'll aggregate differently
    const jobOrdersQuery = this.jobOrderRepo.createQueryBuilder('j')
      .select('EXTRACT(MONTH FROM j.submissionDate)', 'month')
      .addSelect('COUNT(*)', 'jobOrderCount')
      .addSelect('SUM(j.quantity)', 'jobOrderQuantity')
      .addSelect('SUM(j.quantity * j.pricePerUnit)', 'jobOrderAmount')
      .where('j.submissionDate IS NOT NULL')
      .groupBy('EXTRACT(MONTH FROM j.submissionDate)');

    if (year) {
      jobOrdersQuery.andWhere('EXTRACT(YEAR FROM j.submissionDate) = :year', { year });
    }
    if (startMonth) {
      jobOrdersQuery.andWhere('EXTRACT(MONTH FROM j.submissionDate) >= :startMonth', { startMonth });
    }
    if (endMonth) {
      jobOrdersQuery.andWhere('EXTRACT(MONTH FROM j.submissionDate) <= :endMonth', { endMonth });
    }

    const jobOrders = await jobOrdersQuery.getRawMany();

    return {
      quotations,
      jobOrders,
    };
  }

  async getMonthlyDetails(filters: any) {
    const { year, startMonth, endMonth, saleMemberId } = filters;
    
    const details = [];
    
    const start = startMonth || 1;
    const end = endMonth || 12;
    
    for (let m = start; m <= end; m++) {
      
      // Quotations for this month
      const quotationQuery = this.quotationRepo.createQueryBuilder('q')
        .select('COUNT(*)', 'count')
        .addSelect('SUM(q.quantity)', 'totalQuantity')
        .addSelect('SUM(q.grandTotal)', 'totalAmount')
        .where('EXTRACT(YEAR FROM q.submissionDate) = :year', { year })
        .andWhere('EXTRACT(MONTH FROM q.submissionDate) = :month', { month: m });
      
      if (saleMemberId) {
        quotationQuery.andWhere('q.saleMemberId = :saleMemberId', { saleMemberId });
      }
      
      const quotationResult = await quotationQuery.getRawOne();
      
      // Job Orders for this month
      const jobOrderQuery = this.jobOrderRepo.createQueryBuilder('j')
        .select('COUNT(*)', 'count')
        .addSelect('SUM(j.quantity)', 'totalQuantity')
        .addSelect('SUM(j.quantity * j.pricePerUnit)', 'totalAmount')
        .where('j.submissionDate IS NOT NULL')
        .andWhere('EXTRACT(YEAR FROM j.submissionDate) = :year', { year })
        .andWhere('EXTRACT(MONTH FROM j.submissionDate) = :month', { month: m });
      
      const jobOrderResult = await jobOrderQuery.getRawOne();
      
      details.push({
        month: m,
        quotations: {
          count: parseInt(quotationResult?.count || 0),
          quantity: parseInt(quotationResult?.totalQuantity || 0),
          amount: parseFloat(quotationResult?.totalAmount || 0),
        },
        jobOrders: {
          count: parseInt(jobOrderResult?.count || 0),
          quantity: parseInt(jobOrderResult?.totalQuantity || 0),
          amount: parseFloat(jobOrderResult?.totalAmount || 0),
        },
      });
    }
    
    return details;
  }
}
