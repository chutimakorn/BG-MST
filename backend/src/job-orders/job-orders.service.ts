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
import { CloudinaryService } from './cloudinary.service';

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
    private cloudinaryService: CloudinaryService,
  ) {}

  async findAll(filters?: any): Promise<any> {
    const page = parseInt(filters?.page) || 1;
    const limit = parseInt(filters?.limit) || 50;
    const skip = (page - 1) * limit;
    const sortBy = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const query = this.jobOrderRepository.createQueryBuilder('j')
      .leftJoinAndSelect('j.car', 'car')
      .leftJoinAndSelect('j.bodyColor', 'bodyColor')
      .leftJoinAndSelect('j.seatColor', 'seatColor')
      .leftJoinAndSelect('j.canopyColor', 'canopyColor')
      .leftJoinAndSelect('j.statusJobDocument', 'statusJobDocument')
      .leftJoinAndSelect('j.statusJob', 'statusJob');

    // Search ทั้งเลขที่และชื่อลูกค้าพร้อมกัน (OR condition)
    if (filters?.quotationNumber || filters?.customerName) {
      const searchTerm = filters?.quotationNumber || filters?.customerName || '';
      query.andWhere(
        '(LOWER(j.quotationNumber) LIKE LOWER(:search) OR LOWER(j.customerName) LIKE LOWER(:search))',
        { search: `%${searchTerm}%` }
      );
    }

    // Sorting
    const validSortFields = ['createdAt', 'quotationNumber', 'customerName', 'submissionDate', 'deliveryDate'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    query.orderBy(`j.${sortField}`, sortOrder);

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

    // DV Section
    if (data.dvFileName !== undefined) jobOrder.dvFileName = data.dvFileName;

    // Update relations if provided (support both 'car' and 'carId' formats)
    const carId = data.car || data.carId;
    if (carId) {
      const car = await this.carRepository.findOne({ where: { id: carId } });
      if (car) jobOrder.car = car;
    } else if (data.car === null || data.carId === null) {
      jobOrder.car = null;
    }

    const bodyColorId = data.bodyColor || data.bodyColorId;
    if (bodyColorId) {
      const bodyColor = await this.bodyColorRepository.findOne({ where: { id: bodyColorId } });
      if (bodyColor) jobOrder.bodyColor = bodyColor;
    } else if (data.bodyColor === null || data.bodyColorId === null) {
      jobOrder.bodyColor = null;
    }

    const seatColorId = data.seatColor || data.seatColorId;
    if (seatColorId) {
      const seatColor = await this.seatColorRepository.findOne({ where: { id: seatColorId } });
      if (seatColor) jobOrder.seatColor = seatColor;
    } else if (data.seatColor === null || data.seatColorId === null) {
      jobOrder.seatColor = null;
    }

    const canopyColorId = data.canopyColor || data.canopyColorId;
    if (canopyColorId) {
      const canopyColor = await this.canopyColorRepository.findOne({ where: { id: canopyColorId } });
      if (canopyColor) jobOrder.canopyColor = canopyColor;
    } else if (data.canopyColor === null || data.canopyColorId === null) {
      jobOrder.canopyColor = null;
    }

    const statusJobDocumentId = data.statusJobDocument || data.statusJobDocumentId;
    if (statusJobDocumentId) {
      const statusJobDocument = await this.statusJobDocumentRepository.findOne({ where: { id: statusJobDocumentId } });
      if (statusJobDocument) jobOrder.statusJobDocument = statusJobDocument;
    } else if (data.statusJobDocument === null || data.statusJobDocumentId === null) {
      jobOrder.statusJobDocument = null;
    }

    const statusJobId = data.statusJob || data.statusJobId;
    if (statusJobId) {
      const statusJob = await this.statusJobRepository.findOne({ where: { id: statusJobId } });
      if (statusJob) jobOrder.statusJob = statusJob;
    } else if (data.statusJob === null || data.statusJobId === null) {
      jobOrder.statusJob = null;
    }

    return this.jobOrderRepository.save(jobOrder);
  }

  async delete(id: number): Promise<void> {
    const result = await this.jobOrderRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Job Order with ID ${id} not found`);
    }
  }

  async uploadPdfFile(
    id: number,
    file: Express.Multer.File,
    fileType: 'job' | 'po' | 'iv' | 'it' | 'dv',
  ): Promise<void> {
    const jobOrder = await this.findOne(id);
    
    // Upload to Cloudinary
    const fileName = await this.cloudinaryService.uploadFile(
      jobOrder.quotationNumber,
      file,
      fileType,
    );
    
    // Update job order with file name
    const updateData: any = {};
    if (fileType === 'job') updateData.jobPdfFileName = fileName;
    if (fileType === 'po') updateData.poFileName = fileName;
    if (fileType === 'iv') updateData.ivFileName = fileName;
    if (fileType === 'it') updateData.itFileName = fileName;
    if (fileType === 'dv') updateData.dvFileName = fileName;
    
    await this.jobOrderRepository.update(id, updateData);
  }

  async deleteFile(id: number, fileType: 'po' | 'iv' | 'it' | 'dv'): Promise<any> {
    const jobOrder = await this.findOne(id);
    
    let fileName: string | null = null;
    const updateData: any = {};

    // Get file name based on type
    if (fileType === 'po') {
      fileName = jobOrder.poFileName;
      updateData.poFileName = null;
    } else if (fileType === 'iv') {
      fileName = jobOrder.ivFileName;
      updateData.ivFileName = null;
    } else if (fileType === 'it') {
      fileName = jobOrder.itFileName;
      updateData.itFileName = null;
    } else if (fileType === 'dv') {
      fileName = jobOrder.dvFileName;
      updateData.dvFileName = null;
    }

    if (!fileName) {
      throw new NotFoundException(`No ${fileType.toUpperCase()} file found for this Job Order`);
    }

    // Try to delete from Cloudinary
    try {
      await this.cloudinaryService.deleteFile(fileName);
    } catch (error) {
      console.error('Failed to delete from Cloudinary:', error);
      // Continue anyway to update database
    }

    // Update database
    await this.jobOrderRepository.update(id, updateData);

    return {
      success: true,
      message: `ลบไฟล์ ${fileType.toUpperCase()} สำเร็จ`,
    };
  }
}
