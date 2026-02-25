import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensorData } from '../entities/sensor-data.entity/sensor-data.entity';

@Controller('data')
export class DataController {
  constructor(
    @InjectRepository(SensorData)
    private sensorRepository: Repository<SensorData>,
  ) {}

  @Post()
  async receiveData(@Body() payload: { data: string; rssi: number }) {
    try {
      const parsedData = this.parseSensorData(payload.data);
      const sensorEntry = this.sensorRepository.create({
        ...parsedData,
        rssi: payload.rssi,
        receivedAt: new Date() // Explicit set receivedAt
      });
      
      await this.sensorRepository.save(sensorEntry);
      return { 
        status: 'success', 
        id: sensorEntry.id,
        receivedAt: sensorEntry.receivedAt 
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Post('clear')
  async clearDatabase() {
    try {
      // Clear all data from the sensor_data table
      await this.sensorRepository.clear();
      
      return {
        status: 'success',
        message: 'Database cleared successfully',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error clearing database:', error);
      return { 
        status: 'error', 
        message: error.message,
        timestamp: new Date()
      };
    }
  }

  @Get('latest')
  async getLatest() {
    const entry = await this.sensorRepository.findOne({
      where: {}, // Add empty where clause
      order: { receivedAt: 'DESC' },
    });
    
    return entry ? this.formatForFrontend(entry) : null;
  }

  @Get('history')
  async getHistory(@Query('limit') limit = 50) {
    const validatedLimit = Math.min(Math.max(Number(limit) || 50, 1), 1000);
    
    const entries = await this.sensorRepository.find({
      order: { receivedAt: 'DESC' },
      take: validatedLimit,
    });

    return entries.map(entry => this.formatForFrontend(entry));
  }

  private parseSensorData(rawData: string): Partial<SensorData> {
    const data: Partial<SensorData> = {};
    const pairs = rawData.split(',');

    pairs.forEach(pair => {
      const [key, value] = pair.split(':').map(s => s.trim());
      switch(key) {
        case 'Time': data.time = parseInt(value, 10); break;
        case 'Temp': data.temp = parseFloat(value) - 5; break;
        case 'Humidity': data.humidity = parseFloat(value); break;
        case 'Pressure': data.pressure = parseFloat(value); break;
        case 'Altitude': data.altitude = parseFloat(value); break;
        case 'Lat': data.lat = value === 'nan' ? null : parseFloat(value); break;
        case 'Lng': data.lng = value === 'nan' ? null : parseFloat(value); break;
        case 'Gx': data.gx = parseFloat(value); break;
        case 'Gy': data.gy = parseFloat(value); break;
        case 'Gz': data.gz = parseFloat(value); break;
        case 'Photo': data.photo = parseInt(value, 10); break;
        case 'LAUNCHED': data.isLaunched = true; break;
        case 'Beeper on': data.beeperActive = true; break;
      }
    });

    return data;
  }

  private formatForFrontend(entry: SensorData) {
    return {
      data: [
        `Time:${entry.time}`,
        `Temp:${entry.temp}`,
        `Humidity:${entry.humidity}`,
        `Pressure:${entry.pressure}`,
        `Altitude:${entry.altitude}`,
        `Lat:${entry.lat ?? 'nan'}`,
        `Lng:${entry.lng ?? 'nan'}`,
        `Gx:${entry.gx}`,
        `Gy:${entry.gy}`,
        `Gz:${entry.gz}`,
        `Photo:${entry.photo}`,
        ...(entry.isLaunched ? ['LAUNCHED'] : []),
        ...(entry.beeperActive ? ['Beeper on'] : [])
      ].join(','),
      rssi: entry.rssi,
      timestamp: entry.receivedAt ? entry.receivedAt.getTime() : Date.now()
    };
  }
}