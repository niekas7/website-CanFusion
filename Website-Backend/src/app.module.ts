import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataController } from './data/data.controller';
import { SensorData } from './entities/sensor-data.entity/sensor-data.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'sensor-data.db',
      entities: [SensorData],
      synchronize: true, // Auto-creates tables
    }),
    TypeOrmModule.forFeature([SensorData]),
  ],
  controllers: [AppController, DataController],
  providers: [AppService],
})
export class AppModule {}