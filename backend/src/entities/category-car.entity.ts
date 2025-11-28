import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('category_cars')
export class CategoryCar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;
}
