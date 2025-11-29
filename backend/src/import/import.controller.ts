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
    const parsedData = await this.pdfParserService.parsePdf(file.buffer);
    
    // Return parsed data along with file info for later upload
    return {
      ...parsedData,
      fileInfo: {
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      },
    };
  }

  @Post('pdf/save')
  @UseInterceptors(FileInterceptor('file'))
  async savePdfData(
    @Body('data') dataString: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      // Parse data from FormData
      const data = JSON.parse(dataString);
      
      // Create job order first
      const jobOrder = await this.jobOrdersService.create(data);
      
      // If file is provided, upload it as Job PDF file
      if (file && jobOrder.quotationNumber) {
        try {
          await this.jobOrdersService.uploadPdfFile(
            jobOrder.id,
            file,
            'job'
          );
        } catch (uploadError) {
          console.error('Failed to upload PDF file:', uploadError);
          // Don't fail the whole operation if file upload fails
        }
      }
      
      return {
        success: true,
        message: 'บันทึก Job Order สำเร็จ' + (file ? ' พร้อมไฟล์ PDF' : ''),
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
