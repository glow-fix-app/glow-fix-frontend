import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Select, ListBox, Spinner } from '@heroui/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';
import { adminApi } from '@/features/admin/services/adminApi';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState('this_month');

  // Fetch Dashboard Stats
  const { data: dashboardResp, isLoading: isLoadingDash } = useQuery({
    queryKey: ['admin_analytics', 'dashboard', period],
    queryFn: () => adminApi.analyticsDashboard({ range: period }),
  });

  // Fetch Revenue
  const { data: revenueResp, isLoading: isLoadingRev } = useQuery({
    queryKey: ['admin_analytics', 'revenue', period],
    queryFn: () => adminApi.analyticsRevenue({ range: period }),
  });

  // Fetch Bookings
  const { data: bookingsResp, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['admin_analytics', 'bookings', period],
    queryFn: () => adminApi.analyticsBookings({ range: period }),
  });

  // Fetch Top Services
  const { data: topServicesResp, isLoading: isLoadingTopServices } = useQuery({
    queryKey: ['admin_analytics', 'top-services', period],
    queryFn: () => adminApi.analyticsTopServices({ range: period }),
  });

  // Fetch Payment Methods
  const { data: paymentMethodsResp, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['admin_analytics', 'payment-methods', period],
    queryFn: () => adminApi.analyticsPaymentMethods({ range: period }),
  });

  // Fetch Top Businesses
  const { data: businessesResp, isLoading: isLoadingBusinesses } = useQuery({
    queryKey: ['admin_analytics', 'businesses', period],
    queryFn: () => adminApi.analyticsBusinesses({ range: period, limit: 10 }),
  });

  const isLoading = isLoadingDash || isLoadingRev || isLoadingBookings || isLoadingTopServices || isLoadingPayments || isLoadingBusinesses;

  const stats = dashboardResp?.stats || {};
  const trends = dashboardResp?.trends || {};
  const revenueData = revenueResp?.daily || [];
  const topServices = (topServicesResp?.top_services || []).slice(0, 10);
  const paymentMethods = paymentMethodsResp || [];
  const topBusinesses = (businessesResp?.data || []).slice(0, 10);

  // Calculate repeat rate
  const totalUsers = stats.total_users || 0;
  const newUsers = stats.new_users || 0;
  const returningUsers = Math.max(0, totalUsers - newUsers);
  const repeatRate = totalUsers > 0 ? ((returningUsers / totalUsers) * 100).toFixed(0) : 0;

  // Aggregate bookings by category for the Pie Chart
  const categoryDataMap = {};
  topServices.forEach(s => {
    const cat = s.category_name || 'Other';
    categoryDataMap[cat] = (categoryDataMap[cat] || 0) + s.booking_count;
  });
  
  const finalPieData = Object.keys(categoryDataMap).map(key => ({
    name: key,
    value: categoryDataMap[key]
  })).sort((a, b) => b.value - a.value);

  // Real Customer Retention (Single Period based on current stats)
  const retentionData = [
    { 
      period: period === 'this_week' ? 'This Week' : period === 'this_month' ? 'This Month' : 'This Year', 
      new: newUsers, 
      returning: returningUsers 
    }
  ];

  const MetricCard = ({ title, value, trend, isCurrency }) => {
    const isPositive = trend >= 0;
    return (
      <Card className="border border-gray-200 bg-white shadow-sm rounded-xl">
        <div className="p-4 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-[13px] font-semibold text-gray-500 tracking-wide">{title}</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900">
              {isCurrency ? `EGP ${value?.toLocaleString()}` : value?.toLocaleString()}
            </p>
            <div className={`flex items-center text-[13px] font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
              {isPositive ? <ArrowTrendingUpIcon className="w-3.5 h-3.5 mr-1" /> : <ArrowTrendingDownIcon className="w-3.5 h-3.5 mr-1" />}
              {isPositive ? '+' : ''}{trend || 0}%
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="w-full pb-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Platform Analytics</h1>
          <p className="text-sm text-gray-500">Monitor all revenue, users, and service metrics platform-wide.</p>
        </div>
        <Select
          className="w-40"
          selectedKeys={[period]}
          onSelectionChange={(keys) => {
            const val = typeof keys === 'string' ? keys : Array.from(keys)[0];
            if (val) setPeriod(val);
          }}
          aria-label="Time period"
          placeholder="This Month"
        >
          <Select.Trigger className="h-10 w-full rounded-xl border border-gray-200 px-4 text-sm font-semibold transition-all outline-none bg-white text-gray-700 flex items-center justify-between cursor-pointer shadow-sm">
            <Select.Value />
            <Select.Indicator>▼</Select.Indicator>
          </Select.Trigger>
          <Select.Popover className="bg-white border border-gray-200 rounded-xl shadow-xl p-1 z-[9999] min-w-[160px]">
            <ListBox>
              <ListBox.Item key="this_week" id="this_week" textValue="This Week" className="px-3 py-2 text-sm font-medium hover:bg-gray-50 rounded-lg cursor-pointer">This Week</ListBox.Item>
              <ListBox.Item key="this_month" id="this_month" textValue="This Month" className="px-3 py-2 text-sm font-medium hover:bg-gray-50 rounded-lg cursor-pointer">This Month</ListBox.Item>
              <ListBox.Item key="this_year" id="this_year" textValue="This Year" className="px-3 py-2 text-sm font-medium hover:bg-gray-50 rounded-lg cursor-pointer">This Year</ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <Spinner size="lg" color="primary" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Platform Bookings" 
              value={stats.total_bookings || 0} 
              trend={trends.bookings_trend || 0} 
            />
            <MetricCard 
              title="Platform Revenue" 
              value={stats.total_revenue || 0} 
              trend={trends.revenue_trend || 0} 
              isCurrency 
            />
            <MetricCard 
              title="Platform Fees" 
              value={(stats.total_revenue || 0) * 0.1} // Assuming 10% platform fee
              trend={trends.revenue_trend || 0} 
              isCurrency 
            />
            <MetricCard 
              title="Total Users" 
              value={totalUsers}
              trend={trends.users_trend || 0} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2 border border-gray-100 bg-white shadow-sm rounded-xl h-full flex flex-col">
              <div className="p-5 flex justify-between items-center border-b border-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Revenue Trend</h3>
              </div>
              <div className="p-5 h-[300px] w-full flex items-center justify-center flex-grow">
                {revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={true} 
                        tickLine={false} 
                        tick={{ fill: '#6b7280', fontSize: 12 }} 
                        dy={10}
                        tickFormatter={(val) => {
                          if(val.includes('-')) {
                            const d = new Date(val);
                            return `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}`;
                          }
                          return val;
                        }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        dx={-10}
                      />
                      <Tooltip 
                        cursor={{ fill: '#f9fafb' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-gray-400 text-sm">No revenue data for this period.</div>
                )}
              </div>
            </Card>

            {/* Bookings by Type Donut */}
            <Card className="border border-gray-100 bg-white shadow-sm rounded-xl h-full flex flex-col">
              <div className="p-5 flex justify-between items-center border-b border-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Bookings by Category</h3>
              </div>
              <div className="p-5 h-[300px] w-full flex flex-col items-center justify-center relative flex-grow">
                {finalPieData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={finalPieData}
                          cx="50%"
                          cy="45%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {finalPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-100 z-50">
                                  <p className="font-semibold text-gray-800 text-sm mb-1">{payload[0].name}</p>
                                  <p className="text-gray-600 text-xs"><span className="font-bold text-blue-600">{payload[0].value}</span> bookings</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="flex flex-col gap-2 mt-4 w-full px-2 overflow-y-auto max-h-[100px] scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                      {finalPieData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center justify-between text-xs font-medium text-gray-600 py-1">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                            <span className="truncate pr-2">{entry.name}</span>
                          </div>
                          <span className="text-gray-900 font-semibold shrink-0 ml-2">{Math.round((entry.value / finalPieData.reduce((a,b)=>a+b.value,0)) * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                   <div className="text-gray-400 text-sm">No bookings for this period.</div>
                )}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Services Table */}
            <Card className="border border-gray-100 bg-white shadow-sm rounded-xl overflow-x-auto flex flex-col">
              <div className="p-5 flex justify-between items-center border-b border-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Platform Top Services</h3>
              </div>
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="py-3 px-5 text-xs font-medium text-gray-500 w-12">#</th>
                    <th className="py-3 px-5 text-xs font-medium text-gray-500">Service</th>
                    <th className="py-3 px-5 text-xs font-medium text-gray-500 text-right">Bookings</th>
                    <th className="py-3 px-5 text-xs font-medium text-gray-500 text-right">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topServices.length > 0 ? topServices.map((service, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-5 text-xs text-gray-400">{idx + 1}</td>
                      <td className="py-4 px-5 text-sm font-medium text-gray-900">{service.service_name}</td>
                      <td className="py-4 px-5 text-sm text-gray-500 text-right">{service.booking_count}</td>
                      <td className="py-4 px-5 text-sm font-medium text-gray-900 text-right">EGP {service.total_revenue?.toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-sm text-gray-400">
                        No services booked during this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>

            {/* Customer Retention */}
            <Card className="border border-gray-100 bg-white shadow-sm rounded-xl h-full flex flex-col">
              <div className="p-5 flex justify-between items-center border-b border-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Platform User Acquisition</h3>
              </div>
              <div className="p-5 h-[250px] w-full flex items-center justify-center flex-grow">
                 {(retentionData[0].new > 0 || retentionData[0].returning > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={retentionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="period" axisLine={true} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="square" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                      <Bar dataKey="new" name="New Signups" fill="#3B82F6" radius={[2, 2, 0, 0]} maxBarSize={60} />
                      <Bar dataKey="returning" name="Active Existing Users" fill="#10B981" radius={[2, 2, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                 ) : (
                   <div className="text-gray-400 text-sm">No customer data for this period.</div>
                 )}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Payment Methods Donut */}
            <Card className="border border-gray-100 bg-white shadow-sm rounded-xl h-full flex flex-col">
              <div className="p-5 flex justify-between items-center border-b border-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Revenue by Payment Method</h3>
              </div>
              <div className="p-5 h-[300px] w-full flex flex-col items-center justify-center relative flex-grow">
                {paymentMethods.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentMethods}
                          cx="50%"
                          cy="45%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="total_amount"
                          nameKey="method"
                          stroke="none"
                        >
                          {paymentMethods.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-100 z-50">
                                  <p className="font-semibold text-gray-800 text-sm mb-1">{payload[0].name}</p>
                                  <p className="text-gray-600 text-xs"><span className="font-bold text-blue-600">EGP {payload[0].value.toLocaleString()}</span></p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="flex flex-col gap-2 mt-4 w-full px-2 overflow-y-auto max-h-[100px] scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                      {paymentMethods.map((entry, index) => (
                        <div key={entry.method} className="flex items-center justify-between text-xs font-medium text-gray-600 py-1">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                            <span className="truncate pr-2">{entry.method}</span>
                          </div>
                          <span className="text-gray-900 font-semibold shrink-0 ml-2">{entry.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                   <div className="text-gray-400 text-sm">No payment data for this period.</div>
                )}
              </div>
            </Card>

            {/* Top Businesses Table */}
            <Card className="lg:col-span-2 border border-gray-100 bg-white shadow-sm rounded-xl overflow-x-auto flex flex-col">
              <div className="p-5 flex justify-between items-center border-b border-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Platform Top Performing Businesses</h3>
              </div>
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="py-3 px-5 text-xs font-medium text-gray-500 w-12">#</th>
                    <th className="py-3 px-5 text-xs font-medium text-gray-500">Business Name</th>
                    <th className="py-3 px-5 text-xs font-medium text-gray-500 text-center">Rating</th>
                    <th className="py-3 px-5 text-xs font-medium text-gray-500 text-right">Bookings</th>
                    <th className="py-3 px-5 text-xs font-medium text-gray-500 text-right">Net Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topBusinesses.length > 0 ? topBusinesses.map((business, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-5 text-xs text-gray-400">{idx + 1}</td>
                      <td className="py-4 px-5 text-sm font-medium text-gray-900">{business.business_name}</td>
                      <td className="py-4 px-5 text-sm text-gray-500 text-center">⭐ {business.average_rating} ({business.total_reviews})</td>
                      <td className="py-4 px-5 text-sm text-gray-500 text-right">{business.completed_bookings}</td>
                      <td className="py-4 px-5 text-sm font-medium text-emerald-600 text-right">EGP {business.net_revenue?.toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-sm text-gray-400">
                        No active businesses generated revenue during this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
