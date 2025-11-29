import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SaleMember } from './sale-member.entity';
import { Car } from './car.entity';
import { Province } from './province.entity';
import { JobOrder } from './job-order.entity';

@Entity('quotations')
export class Quotation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', nullable: true })
  requestDate: Date; // วันที่ได้รับต้องการ

  @Column({ type: 'date' })
  submissionDate: Date; // วันที่ส่งใบเสนอ

  @Column({ unique: true })
  quotationNumber: string; // เลขที่ใบเสนอราคาขาย

  @Column({ length: 10 })
  customerGroup: string; // G/NG

  @Column({ type: 'varchar', length: 255, nullable: true })
  customerGroupName: string; // กลุ่มลูกค้า (ชื่อกลุ่ม)

  @ManyToOne(() => SaleMember, { nullable: true })
  @JoinColumn()
  saleMember: SaleMember; // ชื่อผู้ขาย/SALE

  @Column()
  customerName: string; // ชื่อลูกค้า/Customer

  @Column()
  customerCode: string; // รหัสลูกค้า

  @ManyToOne(() => Car, { nullable: true })
  @JoinColumn()
  car: Car; // รุ่นรถ

  @Column({ type: 'text', nullable: true })
  additionalOptions: string; // Option (เสนอเพิ่มเติม)

  @Column({ type: 'int' })
  quantity: number; // จำนวน/คัน

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  pricePerUnitWithVat: number; // ราคาขาย รวม Vat

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalSalesPrice: number; // รวมราคาขาย = จำนวน/คัน * ราคาขาย รวม Vat

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalSalesPriceWithOptions: number; // รวมราคาขาย + Option รวม Vat

  @ManyToOne(() => Province, { nullable: true })
  @JoinColumn()
  province: Province; // จังหวัดขนส่ง

  @Column({ type: 'int', default: 0 })
  transportTrips: number; // เที่ยวขนส่ง

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pricePerTrip: number; // ราคา/เที่ยว

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalTransportCost: number; // รวมค่าขนส่ง = เที่ยวขนส่ง * ราคา/เที่ยว

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  grandTotal: number; // ราคาขายรวมค่าขนส่ง

  @Column({ type: 'text', nullable: true })
  paymentTerms: string; // เงื่อนไขการชำระ

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactName: string; // ชื่อผู้ติดต่อ

  @Column({ type: 'varchar', length: 50, nullable: true })
  contactPhone: string; // เบอร์ติดต่อ

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactEmail: string; // E-Mail

  @ManyToOne(() => JobOrder, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  jobOrder: JobOrder; // Job Order ที่เกี่ยวข้อง

  @Column({ type: 'varchar', length: 50, nullable: true, default: 'รอ 7 - 30' })
  stockStatus: string; // สถานะเช็ครถในสต็อก: พร้อมส่ง, รอ 7 - 30, รอ 31-60

  @Column({ type: 'text', nullable: true })
  customerNotification: string; // แจ้ง/นัดหมายลูกค้าก่อนส่งมอบ

  @Column({ type: 'text', nullable: true })
  preDeliveryInspection: string; // ผลตรวจเช็คก่อนส่งมอบ

  @Column({ type: 'varchar', length: 255, nullable: true })
  serialCode: string; // Serial / Code

  @Column({ type: 'text', nullable: true })
  remarkReason: string; // หมายเหตุ / เหตุผล

  @Column({ type: 'varchar', length: 50, default: 'processing' })
  status: string; // สถานะ: processing, close, cancel

  @Column({ type: 'text', nullable: true, default: 'เกินระยะเวลายืนราคา' })
  postDeliveryNote: string; // หมายเหตุ / สถานะหลังส่งมอบ

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
