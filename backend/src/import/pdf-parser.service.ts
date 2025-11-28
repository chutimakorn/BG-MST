import { Injectable } from '@nestjs/common';
const pdf = require('pdf-parse');

@Injectable()
export class PdfParserService {
  async parsePdf(buffer: Buffer): Promise<any> {
    try {
      const data = await pdf(buffer);
      const text = data.text;

      // ดึงข้อมูลจาก PDF text
      const extracted = this.extractJobOrderData(text);

      return {
        success: true,
        rawText: text,
        extracted,
      };
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  private extractJobOrderData(text: string): any {
    const data: any = {
      quotationNumber: null,
      customerName: null,
      submissionDate: null,
      deliveryDate: null,
      deliveryPlace: null,
      carModel: null,
      quantity: null,
      bodyColor: null,
      seatColor: null,
      canopyColor: null,
      pricePerUnit: null,
      grandTotal: null,
      additionalOptions: [],
    };

    // หา Job No - แม่นยำขึ้น
    const jobNoMatch = text.match(/SAHO\d+\s*-\s*\d+/);
    if (jobNoMatch) {
      data.quotationNumber = jobNoMatch[0].trim();
    }

    // หาวันที่ - จับ 31/10/2025
    const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
    if (dateMatch) {
      data.submissionDate = this.convertThaiDate(dateMatch[1]);
    }

    // หา Delivery Date - จับ 03.11.25
    const deliveryDateMatch = text.match(/(\d{2}\.\d{2}\.\d{2})/);
    if (deliveryDateMatch) {
      const parts = deliveryDateMatch[1].split('.');
      // แปลง DD.MM.YY เป็น DD/MM/20YY
      const fullDate = `${parts[0]}/${parts[1]}/20${parts[2]}`;
      data.deliveryDate = this.convertThaiDate(fullDate);
    }

    // หาชื่อลูกค้า - จับ "คุณ ..." แบบแม่นยำ
    const customerMatch = text.match(/คุณ\s+([^\n\(]+?)(?:\s*\(|$)/);
    if (customerMatch) {
      data.customerName = 'คุณ ' + customerMatch[1].trim();
    }

    // หาสถานที่ส่ง - ดึงที่อยู่หลายบรรทัด
    const deliveryPlaceMatch = text.match(/เลขที\s+(\d+\/\d+[^\n]+(?:\n[^\n]+){0,2})/);
    if (deliveryPlaceMatch) {
      data.deliveryPlace = deliveryPlaceMatch[0].replace(/\n/g, ' ').trim();
    }

    // หารุ่นรถ - จับทั้ง code และชื่อ
    const carModelMatch = text.match(/(03EBN-\d+|จักรยานไฟฟ้า[^\n]+)/);
    if (carModelMatch) {
      data.carModel = carModelMatch[0].trim();
    }

    // หาจำนวน - จับจากตาราง
    const qtyMatch = text.match(/(?:จํานวน|Qty)\s*\n?\s*(\d+)/i);
    if (qtyMatch) {
      data.quantity = parseInt(qtyMatch[1]);
    }

    // หาสี - จับจากบรรทัดที่มี "แดง ดํา" หรือ "แดง ดํา -"
    const colorMatch = text.match(/(แดง|ดํา|ขาว|เขียว|น้ําเงิน|เหลือง|ส้ม)\s+(แดง|ดํา|ขาว|เขียว|น้ําเงิน|เหลือง|ส้ม|-)?/);
    if (colorMatch) {
      data.bodyColor = colorMatch[1];
      data.seatColor = colorMatch[2] && colorMatch[2] !== '-' ? colorMatch[2] : null;
      // ถ้าไม่มีสีที่ 3 หรือเป็น "-" ให้เป็น null
      data.canopyColor = null;
    }

    // หา Options - จับทุกบรรทัดที่มี "—"
    const optionsMatches = text.match(/(?:Internal Charger|Deluxe Lighting|Side Mirror|Battery Indicator|Front Basket|Speedometer)\s*—[^\n]*/gi);
    if (optionsMatches) {
      data.additionalOptions = optionsMatches;
    }

    // หาราคาต่อคัน - จับ 9,200 จาก Gross Total
    const grossTotalMatch = text.match(/(?:Gross Total|จํานวนเงินรวม)\s*\n?\s*([\d,]+)/i);
    if (grossTotalMatch) {
      data.pricePerUnit = parseFloat(grossTotalMatch[1].replace(/,/g, ''));
    }

    // ถ้าไม่เจอ ลองหาจาก Pre VAT Amount
    if (!data.pricePerUnit) {
      const preVatMatch = text.match(/([\d,]+)\.\d{2}\s*(?:ภาษีมูลค่าเพิม|VAT)/i);
      if (preVatMatch) {
        data.pricePerUnit = parseFloat(preVatMatch[1].replace(/,/g, ''));
      }
    }

    // ไม่ต้องมี grandTotal
    data.grandTotal = null;

    return data;
  }

  private convertThaiDate(dateStr: string): string {
    // แปลง DD/MM/YYYY (พ.ศ.) เป็น YYYY-MM-DD (ค.ศ.)
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      let day = parts[0].padStart(2, '0');
      let month = parts[1].padStart(2, '0');
      let year = parseInt(parts[2]);

      // แปลง พ.ศ. เป็น ค.ศ.
      if (year > 2500) {
        year = year - 543;
      }

      return `${year}-${month}-${day}`;
    }
    return dateStr;
  }
}
