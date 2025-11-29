import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { SettingsService } from '../settings/settings.service';
import * as path from 'path';

@Injectable()
export class CloudinaryService {
  private initialized = false;

  constructor(private settingsService: SettingsService) {}

  async initialize() {
    if (this.initialized) return true;

    try {
      const cloudNameSetting = await this.settingsService.findByKey('cloudinary_cloud_name');
      const apiKeySetting = await this.settingsService.findByKey('cloudinary_api_key');
      const apiSecretSetting = await this.settingsService.findByKey('cloudinary_api_secret');

      if (!cloudNameSetting || !apiKeySetting || !apiSecretSetting) {
        console.log('Cloudinary not configured.');
        return false;
      }

      cloudinary.config({
        cloud_name: cloudNameSetting.value,
        api_key: apiKeySetting.value,
        api_secret: apiSecretSetting.value,
      });

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Cloudinary:', error);
      return false;
    }
  }

  async uploadFile(
    quotationNumber: string,
    file: Express.Multer.File,
    fileType: 'job' | 'po' | 'iv' | 'it' | 'dv',
  ): Promise<string> {
    const isInitialized = await this.initialize();
    
    if (!isInitialized) {
      throw new Error('Cloudinary is not configured');
    }

    // Decode filename to handle Thai characters properly
    // Multer may encode Thai characters incorrectly
    let originalName = file.originalname;
    try {
      // Try to decode if it's been encoded
      originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    } catch (error) {
      // If decode fails, use original
      originalName = file.originalname;
    }

    // Use original filename with timestamp prefix to avoid conflicts
    const timestamp = Date.now();
    const ext = path.extname(originalName);
    const baseNameWithoutExt = path.basename(originalName, ext);
    
    // Use sanitized version of original name for Cloudinary
    // Replace Thai and special characters with safe alternatives
    const sanitizedName = baseNameWithoutExt
      .replace(/[^\w\s-]/g, '') // Remove special chars except word chars, spaces, hyphens
      .replace(/\s+/g, '_')      // Replace spaces with underscores
      .substring(0, 50);         // Limit length
    
    // Format: fileType_timestamp_sanitizedname.ext
    const filename = sanitizedName 
      ? `${fileType}_${timestamp}_${sanitizedName}`
      : `${fileType}_${timestamp}`;

    // Upload to Cloudinary
    // Determine resource type based on file extension
    const fileExt = ext.replace('.', '').toLowerCase();
    let resourceType: 'image' | 'raw' | 'video' | 'auto' = 'raw';
    
    // PDFs can be uploaded as 'image' for better preview support
    if (fileExt === 'pdf') {
      resourceType = 'image';
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt)) {
      resourceType = 'image';
    } else if (['mp4', 'mov', 'avi', 'webm'].includes(fileExt)) {
      resourceType = 'video';
    }
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `bg-mst-files/${quotationNumber}`,
          public_id: filename,
          resource_type: resourceType,
          flags: 'attachment', // Force download instead of inline display
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(file.buffer);
    });

    // Return file info as JSON string with original filename
    return JSON.stringify({
      publicId: (result as any).public_id,
      url: (result as any).secure_url,
      format: (result as any).format,
      resourceType: (result as any).resource_type,
      originalName: originalName, // Keep decoded original filename for display
    });
  }

  async getFileUrl(fileInfo: string): Promise<string> {
    try {
      const info = JSON.parse(fileInfo);
      
      // Generate signed URL for secure access
      if (info.publicId) {
        const isInitialized = await this.initialize();
        if (isInitialized) {
          // Generate a signed URL with authentication
          const timestamp = Math.round(Date.now() / 1000);
          const signedUrl = cloudinary.utils.private_download_url(
            info.publicId,
            info.format || 'pdf',
            {
              resource_type: info.resourceType || 'raw',
              type: 'upload',
              expires_at: timestamp + 3600, // 1 hour
            }
          );
          return signedUrl;
        }
      }
      
      return info.url || '';
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return '';
    }
  }

  async deleteFile(fileInfo: string): Promise<void> {
    const isInitialized = await this.initialize();
    
    if (!isInitialized) {
      return;
    }

    try {
      const info = JSON.parse(fileInfo);
      await cloudinary.uploader.destroy(info.publicId, {
        resource_type: info.resourceType || 'raw', // Use 'raw' for PDFs
      });
      console.log(`Deleted file from Cloudinary: ${info.publicId}`);
    } catch (error) {
      console.error('Failed to delete file from Cloudinary:', error);
      throw error;
    }
  }
}
