import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quotation } from '../entities/quotation.entity';

@Injectable()
export class QuotationsService {
  constructor(
    @InjectRepository(Quotation)
    private quotationRepo: Repository<Quotation>,
  ) {}

  async findAll(filters?: any) {
    const page = parseInt(filters?.page) || 1;
    const limit = parseInt(filters?.limit) || 50;
    const skip = (page - 1) * limit;
    const sortBy = filters?.sortBy || 'submissionDate';
    const sortOrder = filters?.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const query = this.quotationRepo.createQueryBuilder('q')
      .leftJoinAndSelect('q.saleMember', 'saleMember')
      .leftJoinAndSelect('q.car', 'car')
      .leftJoinAndSelect('q.province', 'province')
      .leftJoinAndSelect('q.jobOrder', 'jobOrder');

    // Search ทั้งเลขที่และชื่อลูกค้าพร้อมกัน (OR condition)
    if (filters?.quotationNumber || filters?.customerName) {
      const searchTerm = filters?.quotationNumber || filters?.customerName || '';
      query.andWhere(
        '(LOWER(q.quotationNumber) LIKE LOWER(:search) OR LOWER(q.customerName) LIKE LOWER(:search))',
        { search: `%${searchTerm}%` }
      );
    }
    if (filters?.saleMemberId) {
      query.andWhere('q.saleMemberId = :saleMemberId', { saleMemberId: filters.saleMemberId });
    }
    if (filters?.status) {
      query.andWhere('q.status = :status', { status: filters.status });
    }
    if (filters?.startDate) {
      query.andWhere('q.submissionDate >= :startDate', { startDate: filters.startDate });
    }
    if (filters?.endDate) {
      query.andWhere('q.submissionDate <= :endDate', { endDate: filters.endDate });
    }

    // Sorting
    const validSortFields = ['submissionDate', 'quotationNumber', 'customerName', 'grandTotal', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'submissionDate';
    query.orderBy(`q.${sortField}`, sortOrder);

    // Get total count
    const total = await query.getCount();

    // Apply pagination
    const data = await query.skip(skip).take(limit).getMany();

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    return this.quotationRepo.findOne({
      where: { id },
      relations: ['saleMember', 'car', 'province', 'jobOrder'],
    });
  }

  async create(data: any) {
    const quotation = this.quotationRepo.create(data);
    return this.quotationRepo.save(quotation);
  }

  async update(id: number, data: any) {
    await this.quotationRepo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number) {
    await this.quotationRepo.delete(id);
    return { success: true };
  }
}
