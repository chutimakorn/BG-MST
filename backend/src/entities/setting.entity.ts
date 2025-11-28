import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string; // ชื่อ setting เช่น 'file_upload_path'

  @Column({ type: 'text' })
  value: string; // ค่า setting

  @Column({ type: 'text', nullable: true })
  description: string; // คำอธิบาย

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
