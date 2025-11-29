import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Car } from './car.entity';
import { BodyColor } from './body-color.entity';
import { SeatColor } from './seat-color.entity';
import { CanopyColor } from './canopy-color.entity';
import { StatusJobDocument } from './status-job-document.entity';
import { StatusJob } from './status-job.entity';

@Entity('job_orders')
export class JobOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  quotationNumber: string; // เลขที่ใบเสนอราคา

  @Column()
  customerName: string; // ชื่อลูกค้า

  @Column({ type: 'date' })
  submissionDate: Date; // วันที่ส่งใบเสนอ (พ.ศ.)

  @Column({ type: 'date', nullable: true })
  deliveryDate: Date; // วันส่งรถ (พ.ศ.)

  @Column({ type: 'text', nullable: true })
  deliveryPlace: string; // สถานที่ส่ง

  @ManyToOne(() => Car, { nullable: true })
  @JoinColumn()
  car: Car; // รุ่นรถ

  @Column({ type: 'int' })
  quantity: number; // จำนวน

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  pricePerUnit: number; // ราคาต่อคัน

  @ManyToOne(() => BodyColor, { nullable: true })
  @JoinColumn()
  bodyColor: BodyColor; // สี Body

  @ManyToOne(() => SeatColor, { nullable: true })
  @JoinColumn()
  seatColor: SeatColor; // สี Seat

  @ManyToOne(() => CanopyColor, { nullable: true })
  @JoinColumn()
  canopyColor: CanopyColor; // สี Canopy

  @Column({ type: 'text', nullable: true })
  additionalOptions: string; // option เพิ่มเติม

  @ManyToOne(() => StatusJobDocument, { nullable: true })
  @JoinColumn()
  statusJobDocument: StatusJobDocument; // remark

  @ManyToOne(() => StatusJob, { nullable: true })
  @JoinColumn()
  statusJob: StatusJob; // status

  // Job PDF Section (from import)
  @Column({ type: 'text', nullable: true })
  jobPdfFileName: string; // ชื่อไฟล์ Job PDF ที่ import มา (JSON string with Cloudinary info)

  // PO Section
  @Column({ type: 'text', nullable: true })
  poFileName: string; // ชื่อไฟล์ PO (JSON string with Cloudinary info)

  // IV (ใบกำกับภาษี) Section
  @Column({ type: 'text', nullable: true })
  ivFileName: string; // ชื่อไฟล์ใบกำกับภาษี (JSON string with Cloudinary info)

  @Column({ type: 'date', nullable: true })
  ivDate: Date; // วันที่ใบกำกับภาษี (พ.ศ.)

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  ivAmount: number; // ยอดใบกำกับภาษี

  // IT Section
  @Column({ type: 'text', nullable: true })
  itFileName: string; // ชื่อไฟล์ IT (JSON string with Cloudinary info)

  @Column({ type: 'date', nullable: true })
  itDate: Date; // วันที่ IT (พ.ศ.)

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  itAmount: number; // ยอด IT

  // DV Section
  @Column({ type: 'text', nullable: true })
  dvFileName: string; // ชื่อไฟล์ DV (JSON string with Cloudinary info)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
