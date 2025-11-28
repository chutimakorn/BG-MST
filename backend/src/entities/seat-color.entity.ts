import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('seat_colors')
export class SeatColor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;
}
