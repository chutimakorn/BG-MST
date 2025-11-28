import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('provinces')
export class Province {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;
}
