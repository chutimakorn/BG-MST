import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JobOrdersService } from './job-orders.service';
import { FileUploadService } from './file-upload.service';
import { GoogleDriveService } from './google-drive.service';
import { CloudinaryService } from './cloudinary.service';
import { SettingsService } from '../settings/settings.service';

@Controller('job-orders')
export class JobOrdersController {
  constructor(
    private readonly jobOrdersService: JobOrdersService,
    private readonly fileUploadService: FileUploadService,
    private readonly googleDriveService: GoogleDriveService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly settingsService: SettingsService,
  ) {}

  @Get()
  findAll(@Query() filters: any) {
    return this.jobOrdersService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jobOrdersService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.jobOrdersService.create(data);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.jobOrdersService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.jobOrdersService.delete(id);
  }

  @Post(':id/upload/:fileType')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('id', ParseIntPipe) id: number,
    @Param('fileType') fileType: 'po' | 'iv' | 'it' | 'dv',
    @UploadedFile() file: Express.Multer.File,
    @Query('useGoogleDrive') useGoogleDrive?: string,
  ) {
    const jobOrder = await this.jobOrdersService.findOne(id);
    if (!jobOrder) {
      throw new Error('Job Order not found');
    }

    let fileName: string;
    let storageType: string;

    // Check if Cloudinary is configured
    const cloudinarySetting = await this.settingsService.findByKey('cloudinary_cloud_name');
    
    if (cloudinarySetting && cloudinarySetting.value) {
      try {
        // Upload to Cloudinary
        fileName = await this.cloudinaryService.uploadFile(
          jobOrder.quotationNumber,
          file,
          fileType,
        );
        storageType = 'cloudinary';
      } catch (error) {
        console.error('Cloudinary upload failed:', error);
        throw new Error('Failed to upload file to Cloudinary');
      }
    } else {
      throw new Error('Cloudinary is not configured. Please configure it in Settings.');
    }

    // Update job order with file name
    const updateData: any = {};
    if (fileType === 'po') updateData.poFileName = fileName;
    if (fileType === 'iv') updateData.ivFileName = fileName;
    if (fileType === 'it') updateData.itFileName = fileName;
    if (fileType === 'dv') updateData.dvFileName = fileName;

    await this.jobOrdersService.update(id, updateData);

    return {
      success: true,
      fileName,
      storageType,
      message: 'อัพโหลดไฟล์ไปยัง Cloudinary สำเร็จ',
    };
  }

  @Get('files/:fileName(*)')
  async downloadFile(@Param('fileName') fileName: string, @Query('redirect') redirect?: string) {
    const filePath = await this.fileUploadService.getFilePath(fileName);
    
    // If it's a URL (Cloudinary), return it
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      if (redirect === 'true') {
        // Redirect to the URL
        return { url: filePath, redirect: true };
      }
      return { filePath };
    }
    
    // For local files, return path
    return { filePath };
  }

  @Delete(':id/file/:fileType')
  async deleteFile(
    @Param('id', ParseIntPipe) id: number,
    @Param('fileType') fileType: 'po' | 'iv' | 'it' | 'dv',
  ) {
    return this.jobOrdersService.deleteFile(id, fileType);
  }
}
