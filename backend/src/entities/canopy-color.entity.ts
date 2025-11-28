import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('canopy_colors')
export class CanopyColor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;
}
