import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobOrder } from '../entities/job-order.entity';
import { Car } from '../entities/car.entity';
import { BodyColor } from '../entities/body-color.entity';
import { SeatColor } from '../entities/seat-color.entity';
import { CanopyColor } from '../entities/canopy-color.entity';
import { StatusJobDocument } from '../entities/status-job-document.entity';
import { StatusJob } from '../entities/status-job.entity';

@Injectable()
export class JobOrdersService {
  constructor(
    @InjectRepository(JobOrder)
    private jobOrderRepository: Repository<JobOrder>,
    @InjectRepository(Car)
    private carRepository: Repository<Car>,
    @InjectRepository(BodyColor)
    private bodyColorRepository: Repository<BodyColor>,
    @InjectRepository(SeatColor)
    private seatColorRepository: Repository<SeatColor>,
    @InjectRepository(CanopyColor)
    private canopyColorRepository: Repository<CanopyColor>,
    @InjectRepository(StatusJobDocument)
    private statusJobDocumentRepository: Repository<StatusJobDocument>,
    @InjectRepository(StatusJob)
    private statusJobRepository: Repository<StatusJob>,
  ) {}

  async findAll(): Promise<JobOrder[]> {
    return this.jobOrderRepository.find({
      relations: [
        'car',
        'bodyColor',
        'seatColor',
        'canopyColor',
        'statusJobDocument',
        'statusJob',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<JobOrder> {
    const jobOrder = await this.jobOrderRepository.findOne({
      where: { id },
      relations: [
        'car',
        'bodyColor',
        'seatColor',
        'canopyColor',
        'statusJobDocument',
        'statusJob',
      ],
    });

    if (!jobOrder) {
      throw new NotFoundException(`Job Order with ID ${id} not found`);
    }

    return jobOrder;
  }

  async create(data: any): Promise<JobOrder> {
    const jobOrder = new JobOrder();
    
    jobOrder.quotationNumber = data.quotationNumber;
    jobOrder.customerName = data.customerName;
    jobOrder.submissionDate = data.submissionDate;
    jobOrder.deliveryDate = data.deliveryDate;
    jobOrder.deliveryPlace = data.deliveryPlace;
    jobOrder.quantity = data.quantity;
    jobOrder.pricePerUnit = data.pricePerUnit;
    jobOrder.additionalOptions = data.additionalOptions;

    // หา/สร้าง Car
    if (data.carModel) {
      let car = await this.carRepository.findOne({ where: { name: data.carModel } });
      if (!car) {
        car = this.carRepository.create({ name: data.carModel, isActive: true });
        await this.carRepository.save(car);
      }
      jobOrder.car = car;
    }

    // หา/สร้าง Body Color
    if (data.bodyColor) {
      let bodyColor = await this.bodyColorRepository.findOne({ where: { name: data.bodyColor } });
      if (!bodyColor) {
        bodyColor = this.bodyColorRepository.create({ name: data.bodyColor, isActive: true });
        await this.bodyColorRepository.save(bodyColor);
      }
      jobOrder.bodyColor = bodyColor;
    }

    // หา/สร้าง Seat Color
    if (data.seatColor) {
      let seatColor = await this.seatColorRepository.findOne({ where: { name: data.seatColor } });
      if (!seatColor) {
        seatColor = this.seatColorRepository.create({ name: data.seatColor, isActive: true });
        await this.seatColorRepository.save(seatColor);
      }
      jobOrder.seatColor = seatColor;
    }

    // หา/สร้าง Canopy Color
    if (data.canopyColor) {
      let canopyColor = await this.canopyColorRepository.findOne({ where: { name: data.canopyColor } });
      if (!canopyColor) {
        canopyColor = this.canopyColorRepository.create({ name: data.canopyColor, isActive: true });
        await this.canopyColorRepository.save(canopyColor);
      }
      jobOrder.canopyColor = canopyColor;
    }

    return this.jobOrderRepository.save(jobOrder);
  }

  async update(id: number, data: any): Promise<JobOrder> {
    const jobOrder = await this.findOne(id);

    if (data.quotationNumber !== undefined) jobOrder.quotationNumber = data.quotationNumber;
    if (data.customerName !== undefined) jobOrder.customerName = data.customerName;
    if (data.submissionDate !== undefined) jobOrder.submissionDate = data.submissionDate;
    if (data.deliveryDate !== undefined) jobOrder.deliveryDate = data.deliveryDate;
    if (data.deliveryPlace !== undefined) jobOrder.deliveryPlace = data.deliveryPlace;
    if (data.quantity !== undefined) jobOrder.quantity = data.quantity;
    if (data.pricePerUnit !== undefined) jobOrder.pricePerUnit = data.pricePerUnit;
    if (data.additionalOptions !== undefined) jobOrder.additionalOptions = data.additionalOptions;

    // PO Section
    if (data.poFileName !== undefined) jobOrder.poFileName = data.poFileName;

    // IV Section
    if (data.ivFileName !== undefined) jobOrder.ivFileName = data.ivFileName;
    if (data.ivDate !== undefined) jobOrder.ivDate = data.ivDate;
    if (data.ivAmount !== undefined) jobOrder.ivAmount = data.ivAmount;

    // IT Section
    if (data.itFileName !== undefined) jobOrder.itFileName = data.itFileName;
    if (data.itDate !== undefined) jobOrder.itDate = data.itDate;
    if (data.itAmount !== undefined) jobOrder.itAmount = data.itAmount;

    // Update relations if provided
    if (data.carId) {
      const car = await this.carRepository.findOne({ where: { id: data.carId } });
      if (car) jobOrder.car = car;
    }

    if (data.bodyColorId) {
      const bodyColor = await this.bodyColorRepository.findOne({ where: { id: data.bodyColorId } });
      if (bodyColor) jobOrder.bodyColor = bodyColor;
    }

    if (data.seatColorId) {
      const seatColor = await this.seatColorRepository.findOne({ where: { id: data.seatColorId } });
      if (seatColor) jobOrder.seatColor = seatColor;
    }

    if (data.canopyColorId) {
      const canopyColor = await this.canopyColorRepository.findOne({ where: { id: data.canopyColorId } });
      if (canopyColor) jobOrder.canopyColor = canopyColor;
    }

    if (data.statusJobDocumentId) {
      const statusJobDocument = await this.statusJobDocumentRepository.findOne({ where: { id: data.statusJobDocumentId } });
      if (statusJobDocument) jobOrder.statusJobDocument = statusJobDocument;
    }

    if (data.statusJobId) {
      const statusJob = await this.statusJobRepository.findOne({ where: { id: data.statusJobId } });
      if (statusJob) jobOrder.statusJob = statusJob;
    }

    return this.jobOrderRepository.save(jobOrder);
  }

  async delete(id: number): Promise<void> {
    const result = await this.jobOrderRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Job Order with ID ${id} not found`);
    }
  }
}
