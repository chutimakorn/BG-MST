import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('status_jobs')
export class StatusJob {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;
}
