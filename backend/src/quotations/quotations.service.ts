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
    const query = this.quotationRepo.createQueryBuilder('q')
      .leftJoinAndSelect('q.saleMember', 'saleMember')
      .leftJoinAndSelect('q.car', 'car')
      .leftJoinAndSelect('q.province', 'province')
      .leftJoinAndSelect('q.jobOrder', 'jobOrder');

    if (filters?.quotationNumber) {
      query.andWhere('q.quotationNumber LIKE :quotationNumber', { quotationNumber: `%${filters.quotationNumber}%` });
    }
    if (filters?.saleMemberId) {
      query.andWhere('q.saleMemberId = :saleMemberId', { saleMemberId: filters.saleMemberId });
    }
    if (filters?.startDate) {
      query.andWhere('q.submissionDate >= :startDate', { startDate: filters.startDate });
    }
    if (filters?.endDate) {
      query.andWhere('q.submissionDate <= :endDate', { endDate: filters.endDate });
    }

    return query.orderBy('q.submissionDate', 'DESC').getMany();
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
