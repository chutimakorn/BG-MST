import { Controller, Post, UploadedFile, UseInterceptors, UseGuards, Query, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ImportService } from './import.service';
import { PdfParserService } from './pdf-parser.service';
import { JobOrdersService } from '../job-orders/job-orders.service';

@Controller('import')
@UseGuards(JwtAuthGuard)
export class ImportController {
  constructor(
    private importService: ImportService,
    private pdfParserService: PdfParserService,
    private jobOrdersService: JobOrdersService,
  ) {}

  @Post('sheets')
  @UseInterceptors(FileInterceptor('file'))
  async getSheets(@UploadedFile() file: Express.Multer.File) {
    return this.importService.getSheetNames(file);
  }

  @Post('preview')
  @UseInterceptors(FileInterceptor('file'))
  async previewExcel(
    @UploadedFile() file: Express.Multer.File,
    @Query('sheetName') sheetName?: string,
  ) {
    return this.importService.previewExcelData(file, sheetName);
  }

  @Post('import-selected')
  async importSelected(@Body() body: { records: any[], fileType: string }) {
    return this.importService.importSelectedRecords(body.records, body.fileType);
  }

  @Post('pdf')
  @UseInterceptors(FileInterceptor('file'))
  async parsePdf(@UploadedFile() file: Express.Multer.File) {
    return this.pdfParserService.parsePdf(file.buffer);
  }

  @Post('pdf/save')
  async savePdfData(@Body() data: any) {
    try {
      const jobOrder = await this.jobOrdersService.create(data);
      return {
        success: true,
        message: 'บันทึก Job Order สำเร็จ',
        data: jobOrder,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
