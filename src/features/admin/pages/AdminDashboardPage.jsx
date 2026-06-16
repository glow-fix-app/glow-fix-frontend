import React, { useState, useEffect } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { 
  CurrencyDollarIcon, 
  UsersIcon, 
  BriefcaseIcon, 
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

import DashboardCard from "@/components/dashboard/DashboardCard";
import StatCard from "@/components/dashboard/StatCard";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { 
  useDashboardStats, 
  useRevenueStats, 
  useTopPerformers,
  usePlatformHealth
} from "@/features/admin/hooks/useAdminDashboard";
import { Spinner, Select, ListBox, Label } from "@heroui/react";

export default function AdminDashboardPage() {
  const [revenuePeriod, setRevenuePeriod] = useState("monthly");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: stats, isLoading: isStatsLoading } = useDashboardStats();
  const { data: revenueData, isLoading: isRevenueLoading } = useRevenueStats({ period: revenuePeriod });
  const { data: topPerformers, isLoading: isPerformersLoading } = useTopPerformers({ limit: 5 });
  const { data: health, isLoading: isHealthLoading } = usePlatformHealth();

  // Real Data for Services Donut Chart
  const servicesData = stats?.services_distribution || [];

  // Process Services Data to handle many services (Top 4 + Other)
  const processedServicesData = React.useMemo(() => {
    if (!servicesData || servicesData.length <= 4) return servicesData;
    
    const sorted = [...servicesData].sort((a, b) => b.value - a.value);
    const topServices = sorted.slice(0, 4);
    const others = sorted.slice(4);
    
    const othersValue = others.reduce((sum, item) => sum + item.value, 0);
    
    if (othersValue > 0) {
      topServices.push({
        name: "Other",
        value: othersValue,
        color: "#94a3b8" // Neutral gray for Other
      });
    }
    
    return topServices;
  }, [servicesData]);

  if (isStatsLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Extract chart data based on selected period
  const chartData = revenueData?.[revenuePeriod] || [];

  // Real Data for Booking Trends (Last 30 Days)
  const bookingTrendsData = stats?.booking_trends || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        
        {/* Platform Health Quick Indicator */}
        {!isHealthLoading && health && (
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${health.database_status === 'ok' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-[12px] font-medium text-gray-600">
              System: {health.database_status === 'ok' ? 'Healthy' : 'Issues'}
            </span>
            <span className="text-[12px] text-gray-400 pl-2 border-l border-gray-200">
              {health.database_latency_ms}ms
            </span>
          </div>
        )}
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.total_revenue)}
          subtext="Lifetime earnings"
          icon={<CurrencyDollarIcon className="w-5 h-5" />}
        />
        <StatCard
          title="Platform Fees"
          value={formatCurrency(stats?.platform_fees)}
          subtext="Net platform profit"
          icon={<CurrencyDollarIcon className="w-5 h-5 text-brand-500" />}
        />
        <StatCard
          title="Total Users"
          value={stats?.total_users?.toLocaleString()}
          subtext={`+${stats?.new_users_this_week} this week`}
          icon={<UsersIcon className="w-5 h-5" />}
        />
        <StatCard
          title="Pending Businesses"
          value={stats?.pending_businesses?.toLocaleString()}
          subtext="Requires approval"
          icon={<BriefcaseIcon className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Booking Trends Chart */}
        <div className="lg:col-span-3">
          <DashboardCard 
            title="Booking Trends" 
            subtitle="Last 30 days performance"
            className="h-full"
          >
            <div className="h-[280px] w-full" style={{ minWidth: 0, minHeight: 0 }}>
              {isMounted && (
                <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                  <AreaChart data={bookingTrendsData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#0f172a', fontWeight: 500 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="bookings" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorBookings)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </DashboardCard>
        </div>

        {/* Services Donut Chart */}
        <div className="lg:col-span-1">
          <DashboardCard title="Services" className="h-full">
            <div className="flex-1 flex flex-col justify-center items-center">
              <div className="h-[180px] w-full relative flex justify-center" style={{ minWidth: 0, minHeight: 0 }}>
                {isMounted && (
                  <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                    <PieChart>
                      <Pie
                        data={processedServicesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {processedServicesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#0f172a', fontWeight: 500 }}
                        formatter={(value) => `${value}%`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Legend */}
              <div className="w-full mt-4 space-y-3 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                {processedServicesData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]" title={item.name}>{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chart Area - Revenue */}
        <div className="lg:col-span-3">
          <DashboardCard 
            title="Revenue Overview" 
            className="h-full"
            action={
              <Select 
                className="w-[180px]"
                aria-label="Select revenue period"
                selectedKey={revenuePeriod}
                onSelectionChange={(key) => setRevenuePeriod(key)}
              >
                <Label className="sr-only">Revenue Period</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    <ListBox.Item id="daily" textValue="Daily (Last 30 days)">
                      Daily (Last 30 days)
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item id="weekly" textValue="Weekly">
                      Weekly
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item id="monthly" textValue="Monthly">
                      Monthly
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>
            }
          >
            <div className="h-[350px] w-full mt-4" style={{ minWidth: 0, minHeight: 0 }}>
              {isRevenueLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Spinner color="primary" />
                </div>
              ) : chartData.length > 0 && isMounted ? (
                <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey={revenuePeriod === "monthly" ? "month" : revenuePeriod === "daily" ? "date" : "week"} 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={(value) => `EGP ${value / 1000}k`}
                      dx={-10}
                      width={70}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#0f172a', fontWeight: 500 }}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      name="Gross Revenue"
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="fees" 
                      name="Platform Fees"
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorFees)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </DashboardCard>
        </div>

        {/* Side Panel: Top Providers */}
        <div className="lg:col-span-1">
          <DashboardCard 
            title="Top Providers" 
            action={<span className="text-sm font-medium text-blue-500 cursor-pointer hover:underline">View all</span>}
            className="h-full"
          >
            <div className="space-y-6">
              {isPerformersLoading ? (
                <div className="flex justify-center py-4"><Spinner size="sm" /></div>
              ) : topPerformers?.top_businesses?.length > 0 ? (
                topPerformers.top_businesses.map((business, index) => (
                  <div key={business.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={`text-[13px] font-bold w-4 text-center ${index === 0 ? 'text-orange-500' : 'text-gray-500'}`}>
                        {index + 1}
                      </span>
                      <UserAvatar 
                        user={{ fullName: business.business_name }} 
                        className="w-10 h-10 text-[11px] bg-blue-50 text-blue-500 font-medium" 
                      />
                      <div className="flex flex-col">
                        <span className="text-[14px] font-medium text-gray-900 truncate max-w-[140px]">
                          {business.business_name}
                        </span>
                        <span className="text-[13px] text-gray-500">
                          {business.city}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[14px] font-bold text-gray-900">
                        {business.total_bookings}
                      </span>
                      <span className="text-[12px] text-orange-400 flex items-center gap-1 font-medium mt-0.5">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {business.average_rating > 0 ? business.average_rating.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[13px] text-gray-500 text-center py-4">
                  No business data yet.
                </div>
              )}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
