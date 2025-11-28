import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('status_job_documents')
export class StatusJobDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;
}
