import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../entities/setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingRepo: Repository<Setting>,
  ) {}

  async findAll() {
    return this.settingRepo.find();
  }

  async findByKey(key: string) {
    return this.settingRepo.findOne({ where: { key } });
  }

  async upsert(key: string, value: string, description?: string) {
    const existing = await this.findByKey(key);
    
    if (existing) {
      existing.value = value;
      if (description) existing.description = description;
      return this.settingRepo.save(existing);
    }
    
    const setting = this.settingRepo.create({ key, value, description });
    return this.settingRepo.save(setting);
  }

  async getFileUploadPath(): Promise<string> {
    const setting = await this.findByKey('file_upload_path');
    return setting?.value || './uploads';
  }
}
