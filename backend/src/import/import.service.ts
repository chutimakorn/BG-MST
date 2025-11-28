import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Quotation } from '../entities/quotation.entity';
import { SaleMember } from '../entities/sale-member.entity';
import { Car } from '../entities/car.entity';
import { Province } from '../entities/province.entity';

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(Quotation) private quotationRepo: Repository<Quotation>,
    @InjectRepository(SaleMember) private saleMemberRepo: Repository<SaleMember>,
    @InjectRepository(Car) private carRepo: Repository<Car>,
    @InjectRepository(Province) private provinceRepo: Repository<Province>,
  ) {}

  async getSheetNames(file: Express.Multer.File) {
    try {
      if (!file) {
        throw new Error('ไม่พบไฟล์ที่อัพโหลด');
      }

      if (!file.originalname.match(/\.(xlsx|xls)$/)) {
        throw new Error('กรุณาอัพโหลดไฟล์ Excel (.xlsx หรือ .xls) เท่านั้น');
      }

      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      
      return {
        fileName: file.originalname,
        sheets: workbook.SheetNames,
      };
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการอ่านไฟล์: ${error.message}`);
    }
  }

  async previewExcelData(file: Express.Multer.File, sheetName?: string) {
    try {
      if (!file) {
        throw new Error('ไม่พบไฟล์ที่อัพโหลด');
      }

      if (!file.originalname.match(/\.(xlsx|xls)$/)) {
        throw new Error('กรุณาอัพโหลดไฟล์ Excel (.xlsx หรือ .xls) เท่านั้น');
      }

      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const selectedSheet = sheetName || workbook.SheetNames[0];
      
      if (!workbook.SheetNames.includes(selectedSheet)) {
        throw new Error(`ไม่พบ sheet ชื่อ "${selectedSheet}"`);
      }

      const worksheet = workbook.Sheets[selectedSheet];
      
      // หา header row
      const headerRowIndex = this.findHeaderRow(worksheet);

      // อ่านข้อมูลโดยเริ่มจาก header row ที่เจอ
      let data = XLSX.utils.sheet_to_json(worksheet, { 
        defval: '', 
        range: headerRowIndex 
      });

      if (data.length === 0) {
        throw new Error('ไฟล์ Excel ไม่มีข้อมูล หรือรูปแบบไม่ถูกต้อง');
      }

      const columns = Object.keys(data[0]);
      const fileType = this.detectFileType(columns);

      // แปลงข้อมูลเป็น records พร้อม mapping
      const records = data.map((row, index) => {
        const mappedData = fileType === 'thai' ? this.mapThaiFormat(row) : this.mapEnglishFormat(row);
        return {
          rowNumber: index + 2,
          rawData: row,
          mappedData,
          status: 'pending',
        };
      });

      return {
        fileName: file.originalname,
        sheetName: selectedSheet,
        availableSheets: workbook.SheetNames,
        totalRows: data.length,
        columns,
        fileType,
        records,
      };
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการอ่านไฟล์: ${error.message}`);
    }
  }

  private detectFileType(columns: string[]): string {
    const hasThaiColumns = columns.some(col => 
      col.includes('วันที่') || col.includes('เลขที่') || col.includes('ชื่อลูกค้า')
    );
    const hasEnglishColumns = columns.some(col => 
      col.includes('Status') || col.includes('JOB') || col.includes('Customer')
    );

    if (hasThaiColumns) return 'thai';
    if (hasEnglishColumns) return 'english';
    return 'unknown';
  }

  async importSelectedRecords(records: any[], fileType: string) {
    try {
      const results = {
        success: 0,
        failed: 0,
        skipped: 0,
        errors: [],
        imported: [],
        warnings: [],
      };

      for (const record of records) {
        try {
          if (record.status !== 'approved') {
            results.skipped++;
            continue;
          }

          if (this.isEmptyRow(record.rawData)) {
            results.skipped++;
            continue;
          }

          const quotation = await this.createQuotationFromMappedData(
            record.mappedData, 
            record.rowNumber
          );
          
          results.success++;
          results.imported.push({
            rowNumber: record.rowNumber,
            quotationNumber: quotation.quotationNumber,
            customerName: quotation.customerName,
            grandTotal: quotation.grandTotal,
          });
        } catch (error) {
          results.failed++;
          results.errors.push({
            rowNumber: record.rowNumber,
            data: this.sanitizeRowData(record.rawData),
            error: error.message,
          });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`เกิดข้อผิดพลาดในการ import: ${error.message}`);
    }
  }

  private isEmptyRow(row: any): boolean {
    return Object.values(row).every(val => !val || val === '');
  }

  private sanitizeRowData(row: any): any {
    const sanitized = {};
    Object.keys(row).slice(0, 5).forEach(key => {
      sanitized[key] = row[key];
    });
    return sanitized;
  }

  private async createQuotationFromMappedData(data: any, rowNumber: number): Promise<Quotation> {
    try {
      if (!data.quotationNumber || data.quotationNumber.toString().trim() === '') {
        data.quotationNumber = `AUTO-${Date.now()}-${rowNumber}`;
      }
      if (!data.customerName || data.customerName.toString().trim() === '') {
        throw new Error(`ไม่พบชื่อลูกค้า - กรุณาตรวจสอบการ mapping`);
      }

      const existing = await this.quotationRepo.findOne({
        where: { quotationNumber: data.quotationNumber }
      });
      if (existing) {
        throw new Error(`เลขที่ใบเสนอราคา ${data.quotationNumber} มีอยู่ในระบบแล้ว`);
      }

      // หา/สร้าง SaleMember
      let saleMember = null;
      if (data.saleMemberName) {
        saleMember = await this.saleMemberRepo.findOne({ 
          where: { name: data.saleMemberName } 
        });
        if (!saleMember) {
          saleMember = await this.saleMemberRepo.save({ 
            name: data.saleMemberName 
          });
        }
      }

      // หา/สร้าง Car
      let car = null;
      if (data.carName) {
        car = await this.carRepo.findOne({ 
          where: { name: data.carName } 
        });
        if (!car) {
          car = await this.carRepo.save({ 
            name: data.carName 
          });
        }
      }

      // หา/สร้าง Province
      let province = null;
      if (data.provinceName) {
        province = await this.provinceRepo.findOne({ 
          where: { name: data.provinceName } 
        });
        if (!province) {
          province = await this.provinceRepo.save({ 
            name: data.provinceName 
          });
        }
      }

      // สร้าง Quotation
      const quotation = this.quotationRepo.create({
        requestDate: data.requestDate ? this.parseDate(data.requestDate) : null,
        submissionDate: this.parseDate(data.submissionDate),
        quotationNumber: data.quotationNumber,
        customerGroup: data.customerGroup || 'G',
        saleMember,
        customerName: data.customerName,
        customerCode: data.customerCode || 'N/A',
        car,
        additionalOptions: data.additionalOptions,
        quantity: data.quantity || 1,
        pricePerUnitWithVat: data.pricePerUnit || 0,
        province,
        transportTrips: data.transportTrips || 0,
        pricePerTrip: data.pricePerTrip || 0,
        paymentTerms: data.paymentTerms || null,
        contactName: data.contactName || null,
        contactPhone: data.contactPhone || null,
        contactEmail: data.contactEmail || null,
      });

      // คำนวณยอดรวม
      quotation.totalSalesPrice = quotation.quantity * quotation.pricePerUnitWithVat;
      quotation.totalSalesPriceWithOptions = quotation.totalSalesPrice;
      quotation.totalTransportCost = quotation.transportTrips * quotation.pricePerTrip;
      quotation.grandTotal = quotation.totalSalesPriceWithOptions + quotation.totalTransportCost;

      return await this.quotationRepo.save(quotation);
    } catch (error) {
      throw new Error(`แถวที่ ${rowNumber}: ${error.message}`);
    }
  }

  mapThaiFormat(row: any): any {
    const quotationNumber = this.findValue(row, [
      'เลขที่ใบเสนอราคา', 'เลขที่', 'เลขที่ใบเสนอ', 'ใบเสนอราคา',
      'Quotation Number', 'Quote No', 'เลขที่เอกสาร', 'No.', 'No', 'JOB No.'
    ]);

    const customerName = this.findValue(row, [
      'ชื่อลูกค้า', 'ลูกค้า', 'บริษัท', 'ชื่อลูกค้า/Customer', 
      'Customer', 'ชื่อ', 'Client', 'Company', 'ชื่อบริษัท'
    ]);

    return {
      requestDate: this.findValue(row, ['วันที่ได้รับต้องการ', 'วันที่ต้องการ']),
      submissionDate: this.findValue(row, ['วันที่ส่งใบเสนอ', 'วันที่', 'Date', 'วันที่เสนอราคา']),
      quotationNumber,
      customerGroup: this.findValue(row, ['กลุ่มลูกค้า', 'กลุ่ม', 'Group', 'G/NG']) || 'G',
      saleMemberName: this.findValue(row, ['ชื่อผู้ขาย/SALE', 'ผู้ขาย', 'SALE', 'Sale', 'พนักงานขาย']),
      customerName,
      customerCode: this.findValue(row, ['รหัสลูกค้า', 'รหัส', 'Code', 'Customer Code']),
      carName: this.findValue(row, ['รุ่นรถ', 'Model', 'รุ่น', 'รถ']),
      additionalOptions: this.findValue(row, ['Option (เสนอเพิ่มเติม)', 'Option', 'ออฟชั่น', 'เพิ่มเติม']),
      quantity: this.parseNumber(this.findValue(row, ['จำนวน/คัน', 'จำนวน', 'Qty', 'Quantity'])),
      pricePerUnit: this.parseNumber(this.findValue(row, [
        'ราคาขาย  รวม Vat', 'ราคา', 'Price', 'ราคาต่อคัน', 'ราคาขาย'
      ])),
      provinceName: this.findValue(row, ['จังหวัดขนส่ง', 'จังหวัด', 'Province']),
      transportTrips: this.parseNumber(this.findValue(row, ['เที่ยวขนส่ง', 'จำนวนเที่ยว'])),
      pricePerTrip: this.parseNumber(this.findValue(row, ['ราคา/เที่ยว', 'ค่าขนส่ง'])),
      paymentTerms: this.findValue(row, ['เงื่อนไขการชำระ', 'เงื่อนไข', 'Payment Terms']),
      contactName: this.findValue(row, ['ชื่อผู้ติดต่อ', 'ผู้ติดต่อ', 'Contact Name']),
      contactPhone: this.findValue(row, ['เบอร์ติดต่อ', 'เบอร์', 'Phone', 'Tel']),
      contactEmail: this.findValue(row, ['E-Mail', 'Email', 'อีเมล']),
    };
  }

  private findValue(row: any, possibleKeys: string[]): any {
    for (const key of possibleKeys) {
      if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
        return row[key];
      }
      
      const foundKey = Object.keys(row).find(k => 
        k.toLowerCase().trim() === key.toLowerCase().trim()
      );
      if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && row[foundKey] !== '') {
        return row[foundKey];
      }
      
      if (key.length > 3) {
        const partialKey = Object.keys(row).find(k => {
          const kLower = k.toLowerCase().trim();
          const keyLower = key.toLowerCase().trim();
          return kLower.includes(keyLower) || keyLower.includes(kLower);
        });
        if (partialKey && row[partialKey] !== undefined && row[partialKey] !== null && row[partialKey] !== '') {
          return row[partialKey];
        }
      }
    }
    return null;
  }

  mapEnglishFormat(row: any): any {
    return {
      requestDate: this.findValue(row, ['Request Date', 'Date Requested']),
      submissionDate: this.findValue(row, ['Submission Date', 'Date', 'Order Date']),
      quotationNumber: this.findValue(row, ['Quotation Number', 'Quote No', 'Number', 'No']),
      customerGroup: 'G',
      saleMemberName: this.findValue(row, ['Sale', 'Sales', 'Salesperson']),
      customerName: this.findValue(row, ['Customer', 'Client', 'Company']),
      customerCode: this.findValue(row, ['Customer Code', 'Code']) || 'N/A',
      carName: this.findValue(row, ['Model', 'Car Model', 'Vehicle']),
      additionalOptions: this.findValue(row, ['Options', 'Additional Options']),
      quantity: this.parseNumber(this.findValue(row, ['Quantity', 'Qty', 'Unit'])),
      pricePerUnit: this.parseNumber(this.findValue(row, ['Price', 'Unit Price', 'Amount'])),
      provinceName: this.findValue(row, ['Province', 'Location']),
      transportTrips: this.parseNumber(this.findValue(row, ['Transport Trips', 'Trips'])),
      pricePerTrip: this.parseNumber(this.findValue(row, ['Price Per Trip', 'Transport Cost'])),
      paymentTerms: this.findValue(row, ['Payment Terms', 'Terms']),
      contactName: this.findValue(row, ['Contact Name', 'Contact Person']),
      contactPhone: this.findValue(row, ['Phone', 'Tel', 'Contact Phone']),
      contactEmail: this.findValue(row, ['Email', 'E-Mail']),
    };
  }

  private parseNumber(value: any): number {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    
    const cleaned = String(value).replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  private parseDate(dateStr: any): Date {
    if (!dateStr) return new Date();
    
    try {
      if (typeof dateStr === 'number') {
        const excelDate = XLSX.SSF.parse_date_code(dateStr);
        return new Date(excelDate.y, excelDate.m - 1, excelDate.d);
      }
      
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
      
      return new Date();
    } catch (error) {
      console.error('Error parsing date:', dateStr, error);
      return new Date();
    }
  }

  private findHeaderRow(worksheet: any): number {
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    let headerRowIndex = -1;
    let maxColumns = 0;
    
    for (let i = 0; i < Math.min(10, rawData.length); i++) {
      const row: any = rawData[i];
      const nonEmptyCells = row.filter((cell: any) => cell && cell.toString().trim() !== '');
      
      if (nonEmptyCells.length > maxColumns) {
        maxColumns = nonEmptyCells.length;
        headerRowIndex = i;
      }
      
      if (nonEmptyCells.length >= 3) {
        break;
      }
    }

    if (headerRowIndex === -1 || maxColumns < 2) {
      throw new Error('ไม่พบ header row ในไฟล์ Excel');
    }

    return headerRowIndex;
  }
}
