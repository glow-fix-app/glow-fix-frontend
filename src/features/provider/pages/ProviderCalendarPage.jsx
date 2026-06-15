import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Spinner, Tooltip, Calendar, DateField, DatePicker, Label } from "@heroui/react";
import { I18nProvider } from "@react-aria/i18n";
import { parseDate } from "@internationalized/date";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";

import { providerApi } from "@/features/provider/services/providerApi";

const STATUS_THEMES = {
  PENDING: { bg: "bg-pink-50", text: "text-pink-700", dot: "bg-pink-500" },
  CONFIRMED: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  IN_PROGRESS: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  READY: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  COMPLETED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  CANCELLED: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  REJECTED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

export default function ProviderCalendarPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const { data, isLoading } = useQuery({
    queryKey: ["provider", "bookings", "calendar", format(startDate, "yyyy-MM-dd")],
    queryFn: () => providerApi.managerBookings({ 
      limit: 100,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }),
  });

  const bookings = data?.data || [];

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  const handleEventClick = (e, id) => {
    e.stopPropagation();
    navigate(`/provider/bookings/${id}`);
  };

  return (
    <div className="flex flex-col -mx-4 sm:-mx-6 -my-4 sm:-my-6 h-[calc(100vh-64px)] bg-white">
      {/* Responsive Header */}
      <div className="flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 shrink-0 bg-white gap-4">
        
        {/* Left Section */}
        <div className="flex items-center justify-center md:justify-start gap-4 w-full md:w-1/3">
          {/* Current Date Box */}
          <div className="flex flex-col items-center justify-center border border-gray-200 rounded-lg w-10 sm:w-12 h-10 sm:h-12 shadow-sm bg-gray-50/50 shrink-0">
            <span className="text-[8px] sm:text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none mt-1">{format(new Date(), "MMM")}</span>
            <span className="text-base sm:text-lg font-black text-gray-900 leading-tight">{format(new Date(), "d")}</span>
          </div>
          
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight">
                {format(currentDate, "MMMM yyyy")}
              </h2>
              {isLoading && <Spinner size="sm" className="text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />}
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 mt-0.5 whitespace-nowrap">
              {format(monthStart, "MMM d, yyyy")} – {format(monthEnd, "MMM d, yyyy")}
            </p>
          </div>
        </div>
        
        {/* Center Section: Navigation */}
        <div className="flex items-center justify-center w-full md:w-1/3 order-3 md:order-2 gap-2 sm:gap-4">
          <button
            onClick={prevMonth}
            className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-2" />
          </button>
          <button
            onClick={goToToday}
            className="text-sm sm:text-base font-semibold text-gray-800 hover:text-brand-600 transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-2" />
          </button>
        </div>

        {/* Right Section: DatePicker */}
        <div className="flex items-center justify-center md:justify-end w-full md:w-1/3 order-2 md:order-3">
          <I18nProvider locale="en-US">
            <DatePicker 
              className="w-full sm:w-64" 
              name="date"
              value={parseDate(format(currentDate, "yyyy-MM-dd"))}
              onChange={(val) => {
                if (val) {
                  setCurrentDate(new Date(val.year, val.month - 1, val.day));
                }
              }}
            >
              <DateField.Group fullWidth className="border border-gray-300 rounded-md shadow-sm h-9 px-2 bg-white flex items-center w-full">
                <DateField.Input className="text-xs sm:text-sm font-medium outline-none flex-1">
                  {(segment) => <DateField.Segment segment={segment} />}
                </DateField.Input>
                <DateField.Suffix>
                  <DatePicker.Trigger className="text-gray-500 hover:text-gray-700 ml-2">
                    <DatePicker.TriggerIndicator />
                  </DatePicker.Trigger>
                </DateField.Suffix>
              </DateField.Group>
              <DatePicker.Popover className="bg-white border border-gray-200 shadow-xl rounded-xl p-2 z-50">
                <Calendar aria-label="Event date">
                  <Calendar.Header className="flex items-center justify-between mb-2 px-1">
                    <Calendar.YearPickerTrigger className="font-semibold text-gray-900 flex items-center hover:bg-gray-50 px-2 py-1 rounded">
                      <Calendar.YearPickerTriggerHeading />
                      <Calendar.YearPickerTriggerIndicator className="ml-1 w-4 h-4" />
                    </Calendar.YearPickerTrigger>
                    <div className="flex gap-1">
                      <Calendar.NavButton slot="previous" className="p-1.5 hover:bg-gray-100 rounded text-gray-600" />
                      <Calendar.NavButton slot="next" className="p-1.5 hover:bg-gray-100 rounded text-gray-600" />
                    </div>
                  </Calendar.Header>
                  <Calendar.Grid className="border-collapse">
                    <Calendar.GridHeader>
                      {(day) => <Calendar.HeaderCell className="text-[11px] font-semibold text-gray-500 pb-2">{day}</Calendar.HeaderCell>}
                    </Calendar.GridHeader>
                    <Calendar.GridBody>
                      {(date) => <Calendar.Cell date={date} className="w-8 h-8 text-sm flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer data-[selected=true]:bg-gray-900 data-[selected=true]:text-white" />}
                    </Calendar.GridBody>
                  </Calendar.Grid>
                  <Calendar.YearPickerGrid className="mt-2 grid grid-cols-4 gap-2">
                    <Calendar.YearPickerGridBody>
                      {({year}) => <Calendar.YearPickerCell year={year} className="px-2 py-1 text-sm rounded hover:bg-gray-100 cursor-pointer" />}
                    </Calendar.YearPickerGridBody>
                  </Calendar.YearPickerGrid>
                </Calendar>
              </DatePicker.Popover>
            </DatePicker>
          </I18nProvider>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-gray-200 shrink-0">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="py-2.5 text-center text-[10px] sm:text-[11px] font-semibold text-gray-500 border-r border-gray-200 last:border-r-0 truncate">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="flex-1 grid grid-cols-7 overflow-y-auto">
          {calendarDays.map((day) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);

            // Filter bookings for this day
            const dayBookings = bookings.filter((b) => {
              if (!b.scheduled_at) return false;
              const date = parseISO(b.scheduled_at);
              return isSameDay(date, day);
            }).sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[90px] sm:min-h-[120px] border-b border-r border-gray-200 flex flex-col p-0.5 sm:p-1 bg-white ${
                  !isCurrentMonth ? "bg-gray-50/30" : ""
                }`}
              >
                {/* Day Cell Header (Top-Left) */}
                <div className="flex justify-start mb-0.5 sm:mb-1 px-0.5 sm:px-1 mt-0.5 sm:mt-1">
                  <div
                    className={`text-xs sm:text-[13px] font-medium w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-full ${
                      isTodayDate
                        ? "bg-gray-900 text-white"
                        : !isCurrentMonth
                        ? "text-gray-400"
                        : "text-gray-700"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                </div>

                {/* Appointments List */}
                <div className="flex-1 overflow-y-auto space-y-[2px] custom-scrollbar px-0.5 sm:px-1">
                  {dayBookings.map((booking) => {
                    const theme = STATUS_THEMES[booking.status] || STATUS_THEMES.PENDING;
                    
                    return (
                      <Tooltip 
                        key={booking.id} 
                        content={`Status: ${booking.status}`}
                        delay={500}
                        placement="top"
                      >
                        <div
                          onClick={(e) => handleEventClick(e, booking.id)}
                          className={`flex flex-col 2xl:flex-row 2xl:items-center justify-between px-1 sm:px-1.5 py-0.5 rounded-[4px] cursor-pointer transition-colors overflow-hidden ${theme.bg} ${theme.text} hover:opacity-80`}
                        >
                          <span className="text-[8px] sm:text-[10px] font-semibold truncate w-full">
                            {booking.client_name}
                          </span>
                          <span className="text-[8px] sm:text-[10px] font-medium opacity-80 truncate hidden xl:block">
                            {format(parseISO(booking.scheduled_at), "h:mm a")}
                          </span>
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
