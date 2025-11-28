import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

@Injectable()
export class MasterDataService {
  constructor(
    @InjectRepository(Car) private carRepo: Repository<Car>,
    @InjectRepository(SaleMember) private saleMemberRepo: Repository<SaleMember>,
    @InjectRepository(CategoryCar) private categoryCarRepo: Repository<CategoryCar>,
    @InjectRepository(BodyColor) private bodyColorRepo: Repository<BodyColor>,
    @InjectRepository(SeatColor) private seatColorRepo: Repository<SeatColor>,
    @InjectRepository(CanopyColor) private canopyColorRepo: Repository<CanopyColor>,
    @InjectRepository(Province) private provinceRepo: Repository<Province>,
    @InjectRepository(StatusSale) private statusSaleRepo: Repository<StatusSale>,
    @InjectRepository(StatusJobDocument) private statusJobDocumentRepo: Repository<StatusJobDocument>,
    @InjectRepository(StatusJob) private statusJobRepo: Repository<StatusJob>,
  ) {}

  getRepository(type: string) {
    const repos = {
      cars: this.carRepo,
      'sale-members': this.saleMemberRepo,
      'category-cars': this.categoryCarRepo,
      'body-colors': this.bodyColorRepo,
      'seat-colors': this.seatColorRepo,
      'canopy-colors': this.canopyColorRepo,
      provinces: this.provinceRepo,
      'status-sales': this.statusSaleRepo,
      'status-job-documents': this.statusJobDocumentRepo,
      'status-jobs': this.statusJobRepo,
    };
    const repo = repos[type];
    if (!repo) {
      throw new Error(`Repository not found for type: ${type}`);
    }
    return repo;
  }

  async findAll(type: string) {
    return this.getRepository(type).find({ where: { isActive: true } });
  }

  async create(type: string, data: any) {
    const repo = this.getRepository(type);
    const entity = repo.create(data);
    return repo.save(entity);
  }

  async update(type: string, id: number, data: any) {
    const repo = this.getRepository(type);
    await repo.update(id, data);
    return repo.findOne({ where: { id } as any });
  }

  async delete(type: string, id: number) {
    const repo = this.getRepository(type);
    await repo.update(id, { isActive: false });
    return { success: true };
  }

  async initializeDefaultData() {
    // Initialize Cars
    const carNames = [
      'MS2 2 ที่นั่ง (รถใหม่)',
      'MS2+2 4 ที่นั่ง (รถใหม่)',
      'MS4VIP 4 ที่นั่ง (รถใหม่)',
      'MS4+2 6 ที่นั่ง (รถใหม่)',
      'MS6VIP 6 ที่นั่ง (รถใหม่)',
      'MS6+2 8 ที่นั่ง (รถใหม่)',
      'MS4(หน้าเป็ด) 4 ที่นั่ง (รถใหม่)',
      'MS8(หน้าเป็ด) 8 ที่นั่ง (รถใหม่)',
      'MS11M 11 ที่นั่ง (รถใหม่)',
      'MS14M 14 ที่นั่ง (รถใหม่)',
      'MS17M 17 ที่นั่ง (รถใหม่)',
      'MS23B 23 ที่นั่ง (รถใหม่)',
      'MS23M 23 ที่นั่ง (รถใหม่)',
      'MS4Classic 4 ที่นั่ง (รถใหม่)',
      'MS6Classic 6 ที่นั่ง (รถใหม่)',
      'MS8Classic 8 ที่นั่ง (รถใหม่)',
      'New Tuk Tuk NEX.1.5 (รถสภาพดี)',
      'Wuling 6 seat VIP (รถสภาพดี)',
      'Motorcycle รุ่น Easy watt',
      'USED FOMM One',
    ];
    for (const name of carNames) {
      const exists = await this.carRepo.findOne({ where: { name } });
      if (!exists) await this.carRepo.save({ name });
    }

    // Initialize Sale Members
    const saleMembers = ['คุณกนกวรรณ', 'คุณรักชนก', 'คุณสโรชินี', 'คุณวรรณศิริ', 'คุณสมพร'];
    for (const name of saleMembers) {
      const exists = await this.saleMemberRepo.findOne({ where: { name } });
      if (!exists) await this.saleMemberRepo.save({ name });
    }

    // Initialize Body Colors
    const bodyColors = ['Beige', 'Brown', 'Pink', 'Light Blue', 'Blue', 'Green', 'Grey', 'Orange', 'Red', 'Gold', 'Yellow', 'Camello'];
    for (const name of bodyColors) {
      const exists = await this.bodyColorRepo.findOne({ where: { name } });
      if (!exists) await this.bodyColorRepo.save({ name });
    }

    // Initialize Seat Colors
    const seatColors = ['White', 'Black', 'Beige', 'Brown', 'Pink', 'Light Blue', 'Blue', 'Green', 'Grey', 'Orange', 'Red', 'Gold', 'Yellow', 'Camello'];
    for (const name of seatColors) {
      const exists = await this.seatColorRepo.findOne({ where: { name } });
      if (!exists) await this.seatColorRepo.save({ name });
    }

    // Initialize Canopy Colors
    const canopyColors = ['White', 'Black', 'Beige', 'Brown', 'Pink', 'Light Blue', 'Blue', 'Green', 'Grey', 'Orange', 'Red', 'Gold', 'Yellow'];
    for (const name of canopyColors) {
      const exists = await this.canopyColorRepo.findOne({ where: { name } });
      if (!exists) await this.canopyColorRepo.save({ name });
    }

    // Initialize Category Cars
    const categoryCars = ['Fomm Marshell', 'E-Bike', 'Club Car'];
    for (const name of categoryCars) {
      const exists = await this.categoryCarRepo.findOne({ where: { name } });
      if (!exists) await this.categoryCarRepo.save({ name });
    }

    // Initialize Status Sales
    const statusSales = [
      'อยู่ระหว่างการพิจารณา',
      'ได้รับ PO แล้ว',
      'ยกเลิกลูกค้าไม่สนใจ',
      'ยกเลิกลูกค้าเลือก Club Car',
      'ยกเลิกเกินเวลายื่นเสนอราคา (30 วัน)',
    ];
    for (const name of statusSales) {
      const exists = await this.statusSaleRepo.findOne({ where: { name } });
      if (!exists) await this.statusSaleRepo.save({ name });
    }

    // Initialize Status Job Documents
    const statusJobDocuments = [
      'ได้รับ PO แล้ว',
      'ชำระ 30 % แล้ว',
      'ชำระ 100% ณ วันส่งรถ',
      'ไฟแนนท์',
      'ส่งรถแล้ว (เครดิตชำระเงิน 30 วัน)',
      'ส่งรถแล้ว (เครดิตชำระเงิน 60 วัน)',
      'ส่งรถแล้วลูกค้าค้างชำระ',
      'ส่งรถแล้วยังมีออฟชั่นค้างส่ง',
      'จัดส่งและชำระเงินเรียบร้อย',
    ];
    for (const name of statusJobDocuments) {
      const exists = await this.statusJobDocumentRepo.findOne({ where: { name } });
      if (!exists) await this.statusJobDocumentRepo.save({ name });
    }

    // Initialize Status Jobs
    const statusJobs = ['complete', 'อยู่ระหว่างดำเนินการ', 'ยกเลิกjob', 'ส่งรถแล้วยังมีออฟชั่นค้างส่ง'];
    for (const name of statusJobs) {
      const exists = await this.statusJobRepo.findOne({ where: { name } });
      if (!exists) await this.statusJobRepo.save({ name });
    }

    // Initialize Provinces (77 จังหวัด)
    const provinces = [
      'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา',
      'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก',
      'นครปฐม', 'นครพนม', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน',
      'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา',
      'พะเยา', 'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'ภูเก็ต',
      'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี',
      'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ',
      'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี',
      'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี'
    ];
    for (const name of provinces) {
      const exists = await this.provinceRepo.findOne({ where: { name } });
      if (!exists) await this.provinceRepo.save({ name });
    }

    return { message: 'Master data initialized successfully' };
  }
}
