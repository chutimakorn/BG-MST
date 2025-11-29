import { Injectable } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  constructor(private settingsService: SettingsService) {}

  async saveJobOrderFile(
    quotationNumber: string,
    file: Express.Multer.File,
    fileType: 'po' | 'iv' | 'it',
  ): Promise<string> {
    // Get base upload path from settings
    const basePath = await this.settingsService.getFileUploadPath();
    
    // Create job order folder path
    const jobFolderPath = path.join(basePath, quotationNumber);
    
    // Create folder if not exists
    if (!fs.existsSync(jobFolderPath)) {
      fs.mkdirSync(jobFolderPath, { recursive: true });
    }
    
    // Generate filename with timestamp to avoid conflicts
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${fileType}_${timestamp}${ext}`;
    const filePath = path.join(jobFolderPath, filename);
    
    // Save file
    fs.writeFileSync(filePath, file.buffer);
    
    // Return relative path for storage in database
    return path.join(quotationNumber, filename);
  }

  async deleteFile(relativePath: string): Promise<void> {
    const basePath = await this.settingsService.getFileUploadPath();
    const fullPath = path.join(basePath, relativePath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  async getFilePath(relativePath: string): Promise<string> {
    // Check if it's already a URL (Cloudinary)
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    
    // Try to parse as JSON (Cloudinary format with metadata)
    try {
      const fileInfo = JSON.parse(relativePath);
      if (fileInfo.publicId) {
        // Generate signed URL through CloudinaryService
        // For now, return the direct URL (will be handled by frontend)
        return fileInfo.url || '';
      }
      if (fileInfo.url) {
        return fileInfo.url;
      }
    } catch (error) {
      // Not JSON, continue
    }
    
    // For local files, return the local path
    const basePath = await this.settingsService.getFileUploadPath();
    return path.join(basePath, relativePath);
  }
}
