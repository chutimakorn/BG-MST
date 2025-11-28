'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function JobOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  
  const [jobOrder, setJobOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchJobOrder();
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
        setJobOrder(data);
      }
    } catch (error) {
      console.error('Error fetching job order:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount);
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

  if (!jobOrder) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">ไม่พบข้อมูล Job Order</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">รายละเอียด Job Order</h1>
          <div className="flex gap-2">
            <Button onClick={() => router.push(`/job-orders/${id}/edit`)} className="bg-blue-600 hover:bg-blue-700">
              แก้ไข
            </Button>
            <Button onClick={() => router.push('/job-orders')} variant="outline">
              ← กลับ
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* ข้อมูลหลัก */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลทั่วไป</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">เลขที่ใบเสนอราคา</label>
                  <p className="text-lg font-semibold">{jobOrder.quotationNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">ชื่อลูกค้า</label>
                  <p className="text-lg">{jobOrder.customerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">วันที่ส่งใบเสนอ</label>
                  <p className="text-lg">{formatDate(jobOrder.submissionDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">วันส่งรถ</label>
                  <p className="text-lg">{formatDate(jobOrder.deliveryDate)}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">สถานที่ส่ง</label>
                  <p className="text-lg">{jobOrder.deliveryPlace || '-'}</p>
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
                  <label className="text-sm font-medium text-gray-500">รุ่นรถ</label>
                  <p className="text-lg">{jobOrder.car?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">จำนวน</label>
                  <p className="text-lg">{jobOrder.quantity} คัน</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">สี Body</label>
                  <p className="text-lg">{jobOrder.bodyColor?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">สี Seat</label>
                  <p className="text-lg">{jobOrder.seatColor?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">สี Canopy</label>
                  <p className="text-lg">{jobOrder.canopyColor?.name || '-'}</p>
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
                  <label className="text-sm font-medium text-gray-500">ราคาต่อคัน</label>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(jobOrder.pricePerUnit)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">ยอดรวมทั้งหมด</label>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(jobOrder.pricePerUnit * jobOrder.quantity)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Options เพิ่มเติม */}
          {jobOrder.additionalOptions && (
            <Card>
              <CardHeader>
                <CardTitle>Options เพิ่มเติม</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm">{jobOrder.additionalOptions}</pre>
              </CardContent>
            </Card>
          )}

          {/* PO Section */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูล PO</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium text-gray-500">ชื่อไฟล์ PO</label>
                <p className="text-lg">{jobOrder.poFileName || '-'}</p>
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
                  <label className="text-sm font-medium text-gray-500">ชื่อไฟล์</label>
                  <p className="text-lg">{jobOrder.ivFileName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">วันที่</label>
                  <p className="text-lg">{formatDate(jobOrder.ivDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">ยอดใบกำกับภาษี</label>
                  <p className="text-lg font-semibold text-blue-600">
                    {jobOrder.ivAmount ? formatCurrency(jobOrder.ivAmount) : '-'}
                  </p>
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
                  <label className="text-sm font-medium text-gray-500">ชื่อไฟล์</label>
                  <p className="text-lg">{jobOrder.itFileName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">วันที่</label>
                  <p className="text-lg">{formatDate(jobOrder.itDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">ยอด IT</label>
                  <p className="text-lg font-semibold text-green-600">
                    {jobOrder.itAmount ? formatCurrency(jobOrder.itAmount) : '-'}
                  </p>
                </div>
              </div>
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
                  <label className="text-sm font-medium text-gray-500">สถานะงาน</label>
                  <p className="text-lg">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      jobOrder.statusJob?.name === 'เสร็จสิ้น' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {jobOrder.statusJob?.name || 'รอดำเนินการ'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">สถานะเอกสาร</label>
                  <p className="text-lg">{jobOrder.statusJobDocument?.name || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
