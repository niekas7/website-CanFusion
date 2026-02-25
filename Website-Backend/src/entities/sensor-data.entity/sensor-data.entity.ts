import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity()
export class SensorData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('bigint')
  time: number;

  @Column('float')
  temp: number;

  @Column('float')
  humidity: number;

  @Column('float')
  pressure: number;

  @Column('float')
  altitude: number;

  @Column('float', { nullable: true })
  lat: number | null;

  @Column('float', { nullable: true })
  lng: number | null;

  @Column('float')
  gx: number;

  @Column('float')
  gy: number;

  @Column('float')
  gz: number;

  @Column('int')
  photo: number;

  @Column('boolean', { default: false })
  isLaunched: boolean;

  @Column('boolean', { default: false })
  beeperActive: boolean;

  @Column('int')
  rssi: number;

  @Index('IDX_RECEIVED_AT', ['receivedAt'])
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  receivedAt: Date;
}