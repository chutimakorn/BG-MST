import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JobOrdersService } from './job-orders.service';
import { FileUploadService } from './file-upload.service';
import { GoogleDriveService } from './google-drive.service';
import { SettingsService } from '../settings/settings.service';

@Controller('job-orders')
export class JobOrdersController {
  constructor(
    private readonly jobOrdersService: JobOrdersService,
    private readonly fileUploadService: FileUploadService,
    private readonly googleDriveService: GoogleDriveService,
    private readonly settingsService: SettingsService,
  ) {}

  @Get()
  findAll() {
    return this.jobOrdersService.findAll();
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
    @Param('fileType') fileType: 'po' | 'iv' | 'it',
    @UploadedFile() file: Express.Multer.File,
    @Query('useGoogleDrive') useGoogleDrive?: string,
  ) {
    const jobOrder = await this.jobOrdersService.findOne(id);
    if (!jobOrder) {
      throw new Error('Job Order not found');
    }

    let fileName: string;
    let storageType: string;

    // Check if Google Drive is configured and should be used
    const googleDriveSetting = await this.settingsService.findByKey('google_drive_folder_id');
    const shouldUseGoogleDrive = useGoogleDrive === 'true' || (googleDriveSetting && googleDriveSetting.value);

    if (shouldUseGoogleDrive) {
      try {
        // Upload to Google Drive
        fileName = await this.googleDriveService.uploadFile(
          jobOrder.quotationNumber,
          file,
          fileType,
        );
        storageType = 'google_drive';
      } catch (error) {
        console.error('Google Drive upload failed, falling back to local:', error);
        // Fallback to local storage
        fileName = await this.fileUploadService.saveJobOrderFile(
          jobOrder.quotationNumber,
          file,
          fileType,
        );
        storageType = 'local';
      }
    } else {
      // Upload to local storage
      fileName = await this.fileUploadService.saveJobOrderFile(
        jobOrder.quotationNumber,
        file,
        fileType,
      );
      storageType = 'local';
    }

    // Update job order with file name
    const updateData: any = {};
    if (fileType === 'po') updateData.poFileName = fileName;
    if (fileType === 'iv') updateData.ivFileName = fileName;
    if (fileType === 'it') updateData.itFileName = fileName;

    await this.jobOrdersService.update(id, updateData);

    return {
      success: true,
      fileName,
      storageType,
      message: `อัพโหลดไฟล์สำเร็จ (${storageType === 'google_drive' ? 'Google Drive' : 'Local Storage'})`,
    };
  }

  @Get('files/:fileName(*)')
  async downloadFile(@Param('fileName') fileName: string) {
    const filePath = await this.fileUploadService.getFilePath(fileName);
    return { filePath };
  }
}
