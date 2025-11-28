import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sale_members')
export class SaleMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;
}
