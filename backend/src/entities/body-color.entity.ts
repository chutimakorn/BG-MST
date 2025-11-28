import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('body_colors')
export class BodyColor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;
}
