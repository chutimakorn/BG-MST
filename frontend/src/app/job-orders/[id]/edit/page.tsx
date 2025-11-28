'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function EditJobOrderPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({
    quotationNumber: '',
    customerName: '',
    submissionDate: '',
    deliveryDate: '',
    deliveryPlace: '',
    quantity: 1,
    pricePerUnit: 0,
    additionalOptions: '',
    poFileName: '',
    ivFileName: '',
    ivDate: '',
    ivAmount: 0,
    itFileName: '',
    itDate: '',
    itAmount: 0,
  });

  const [masterData, setMasterData] = useState<any>({
    cars: [],
    bodyColors: [],
    seatColors: [],
    canopyColors: [],
    statusJobs: [],
    statusJobDocuments: [],
  });

  useEffect(() => {
    if (id) {
      fetchJobOrder();
      fetchMasterData();
    }
  }, [id]);

  const fetchJobOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/job-orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          quotationNumber: data.quotationNumber || '',
          customerName: data.customerName || '',
          submissionDate: data.submissionDate ? data.submissionDate.split('T')[0] : '',
          deliveryDate: data.deliveryDate ? data.deliveryDate.split('T')[0] : '',
          deliveryPlace: data.deliveryPlace || '',
          quantity: data.quantity || 1,
          pricePerUnit: data.pricePerUnit || 0,
          additionalOptions: data.additionalOptions || '',
          carId: data.car?.id || '',
          bodyColorId: data.bodyColor?.id || '',
          seatColorId: data.seatColor?.id || '',
          canopyColorId: data.canopyColor?.id || '',
          statusJobId: data.statusJob?.id || '',
          statusJobDocumentId: data.statusJobDocument?.id || '',
          poFileName: data.poFileName || '',
          ivFileName: data.ivFileName || '',
          ivDate: data.ivDate ? data.ivDate.split('T')[0] : '',
          ivAmount: data.ivAmount || 0,
          itFileName: data.itFileName || '',
          itDate: data.itDate ? data.itDate.split('T')[0] : '',
          itAmount: data.itAmount || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching job order:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/master-data`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMasterData(data);
      }
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/job-orders/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('บันทึกข้อมูลสำเร็จ');
        router.push(`/job-orders/${id}`);
      } else {
        const error = await response.json();
        alert(`เกิดข้อผิดพลาด: ${error.message}`);
      }
    } catch (error) {
      console.error('Error saving job order:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">แก้ไข Job Order</h1>
          <Button onClick={() => router.push(`/job-orders/${id}`)} variant="outline">
            ← กลับ
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ข้อมูลทั่วไป */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลทั่วไป</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">เลขที่ใบเสนอราคา *</label>
                  <Input
                    value={formData.quotationNumber}
                    onChange={(e) => handleInputChange('quotationNumber', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ชื่อลูกค้า *</label>
                  <Input
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">วันที่ส่งใบเสนอ</label>
                  <Input
                    type="date"
                    value={formData.submissionDate}
                    onChange={(e) => handleInputChange('submissionDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">วันส่งรถ</label>
                  <Input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">สถานที่ส่ง</label>
                  <Input
                    value={formData.deliveryPlace}
                    onChange={(e) => handleInputChange('deliveryPlace', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ข้อมูลรถ */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลรถ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">รุ่นรถ</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.carId}
                    onChange={(e) => handleInputChange('carId', e.target.value)}
                  >
                    <option value="">-- เลือกรุ่นรถ --</option>
                    {masterData.cars.map((car: any) => (
                      <option key={car.id} value={car.id}>{car.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">จำนวน *</label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">สี Body</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.bodyColorId}
                    onChange={(e) => handleInputChange('bodyColorId', e.target.value)}
                  >
                    <option value="">-- เลือกสี --</option>
                    {masterData.bodyColors.map((color: any) => (
                      <option key={color.id} value={color.id}>{color.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">สี Seat</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.seatColorId}
                    onChange={(e) => handleInputChange('seatColorId', e.target.value)}
                  >
                    <option value="">-- เลือกสี --</option>
                    {masterData.seatColors.map((color: any) => (
                      <option key={color.id} value={color.id}>{color.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">สี Canopy</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.canopyColorId}
                    onChange={(e) => handleInputChange('canopyColorId', e.target.value)}
                  >
                    <option value="">-- เลือกสี --</option>
                    {masterData.canopyColors.map((color: any) => (
                      <option key={color.id} value={color.id}>{color.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ข้อมูลราคา */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลราคา</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ราคาต่อคัน *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.pricePerUnit}
                    onChange={(e) => handleInputChange('pricePerUnit', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ยอดรวมทั้งหมด</label>
                  <Input
                    type="number"
                    value={formData.pricePerUnit * formData.quantity}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PO Section */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูล PO</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-medium mb-2">ชื่อไฟล์ PO</label>
                <Input
                  value={formData.poFileName}
                  onChange={(e) => handleInputChange('poFileName', e.target.value)}
                  placeholder="เช่น PO-2025-001.pdf"
                />
              </div>
            </CardContent>
          </Card>

          {/* IV Section */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลใบกำกับภาษี (IV)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ชื่อไฟล์ใบกำกับภาษี</label>
                  <Input
                    value={formData.ivFileName}
                    onChange={(e) => handleInputChange('ivFileName', e.target.value)}
                    placeholder="เช่น IV-2025-001.pdf"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">วันที่</label>
                  <Input
                    type="date"
                    value={formData.ivDate}
                    onChange={(e) => handleInputChange('ivDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ยอดใบกำกับภาษี</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.ivAmount}
                    onChange={(e) => handleInputChange('ivAmount', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* IT Section */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลเอกสาร IT</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ชื่อไฟล์ IT</label>
                  <Input
                    value={formData.itFileName}
                    onChange={(e) => handleInputChange('itFileName', e.target.value)}
                    placeholder="เช่น IT-2025-001.pdf"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">วันที่</label>
                  <Input
                    type="date"
                    value={formData.itDate}
                    onChange={(e) => handleInputChange('itDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ยอด IT</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.itAmount}
                    onChange={(e) => handleInputChange('itAmount', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Options เพิ่มเติม */}
          <Card>
            <CardHeader>
              <CardTitle>Options เพิ่มเติม</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.additionalOptions}
                onChange={(e) => handleInputChange('additionalOptions', e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* สถานะ */}
          <Card>
            <CardHeader>
              <CardTitle>สถานะ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">สถานะงาน</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.statusJobId}
                    onChange={(e) => handleInputChange('statusJobId', e.target.value)}
                  >
                    <option value="">-- เลือกสถานะ --</option>
                    {masterData.statusJobs.map((status: any) => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">สถานะเอกสาร</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.statusJobDocumentId}
                    onChange={(e) => handleInputChange('statusJobDocumentId', e.target.value)}
                  >
                    <option value="">-- เลือกสถานะ --</option>
                    {masterData.statusJobDocuments.map((status: any) => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ปุ่มบันทึก */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/job-orders/${id}`)}
              className="flex-1"
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
