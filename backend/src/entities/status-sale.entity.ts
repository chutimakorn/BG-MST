import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('status_sales')
export class StatusSale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;
}
