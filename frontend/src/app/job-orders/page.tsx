'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function JobOrdersPage() {
  const router = useRouter();
  const [jobOrders, setJobOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobOrders();
  }, []);

  const fetchJobOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/job-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJobOrders(data);
      }
    } catch (error) {
      console.error('Error fetching job orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Orders</h1>
          <p className="text-muted-foreground mt-1">ดูและจัดการ Job Orders ทั้งหมด</p>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => router.push('/import-pdf')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            + Import PDF
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-boxdark rounded-lg shadow overflow-hidden border border-stroke dark:border-strokedark">
          <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
            <thead className="bg-gray-50 dark:bg-meta-4">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-bodydark1 uppercase">เลขที่</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-bodydark1 uppercase">ลูกค้า</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-bodydark1 uppercase">รุ่นรถ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-bodydark1 uppercase">จำนวน</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-bodydark1 uppercase">ราคา/คัน</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-bodydark1 uppercase">วันส่งรถ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-bodydark1 uppercase">สถานะ</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-boxdark divide-y divide-stroke dark:divide-strokedark">
              {jobOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-bodydark1">
                    ไม่มีข้อมูล Job Order
                  </td>
                </tr>
              ) : (
                jobOrders.map((order: any) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 dark:hover:bg-meta-4 cursor-pointer transition-colors"
                    onClick={() => router.push(`/job-orders/${order.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {order.quotationNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-bodydark1">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-bodydark1">
                      {order.car?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-bodydark1">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-bodydark1">
                      {formatCurrency(order.pricePerUnit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-bodydark1">
                      {formatDate(order.deliveryDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.statusJob?.name === 'เสร็จสิ้น' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {order.statusJob?.name || 'รอดำเนินการ'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
    </div>
  );
}
