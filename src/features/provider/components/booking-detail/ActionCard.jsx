import React from "react";
import { 
  Button, 
  Calendar, 
  DateField, 
  DatePicker, 
  Label, 
  TimeField 
} from "@heroui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { parseDate, Time } from "@internationalized/date";

export default function ActionCard({ 
  deliveryDate, 
  setDeliveryDate, 
  deliveryTime, 
  setDeliveryTime, 
  handleAccept, 
  onOpenDecline, 
  isMutating 
}) {

  let parsedDate = null;
  try {
    if (deliveryDate) parsedDate = parseDate(deliveryDate);
  } catch (e) {
    // console.error("Invalid deliveryDate:", deliveryDate);
  }
  
  let parsedTime = null;
  try {
    if (deliveryTime) {
      const [h, m] = deliveryTime.split(':').map(Number);
      parsedTime = new Time(h, m);
    }
  } catch (e) {
    // console.error("Invalid deliveryTime:", deliveryTime);
  }

  const handleDateChange = (date) => {
    if (date) {
      setDeliveryDate(`${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`);
    } else {
      setDeliveryDate("");
    }
  };

  const handleTimeChange = (time) => {
    if (time) {
      setDeliveryTime(`${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`);
    } else {
      setDeliveryTime("");
    }
  };

  return (
    <div className="p-6 border border-amber-200/40 bg-amber-50/15 rounded-2xl">
      <div className="flex items-center gap-2 mb-5 border-b border-amber-100 pb-3">
        <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
        <h3 className="font-semibold text-amber-900 text-sm tracking-tight">Action Required</h3>
      </div>
      
      <div className="flex flex-col gap-6">
        <div className="space-y-4">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
            Expected Delivery Date & Time
          </p>
          
          <div className="w-full sm:w-80">
            <DatePicker
              name="date"
              value={parsedDate}
              onChange={handleDateChange}
              className="w-full"
            >
              {({state}) => (
                <>
                  <DateField.Group className="flex items-center bg-white border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl px-3 py-2 text-sm shadow-sm transition-all h-10 w-full" fullWidth>
                    <DateField.Input className="flex-1 outline-none text-gray-700 font-medium">
                      {(segment) => <DateField.Segment segment={segment} />}
                    </DateField.Input>
                    <DateField.Suffix>
                      <DatePicker.Trigger className="text-gray-400 hover:text-gray-600 transition-colors">
                        <DatePicker.TriggerIndicator />
                      </DatePicker.Trigger>
                    </DateField.Suffix>
                  </DateField.Group>
                  <DatePicker.Popover className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 flex flex-col gap-3 z-50">
                    <Calendar aria-label="Event date">
                      <Calendar.Header className="flex items-center justify-between px-2 py-1 mb-2">
                        <Calendar.YearPickerTrigger className="font-semibold text-gray-800 hover:bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer">
                          <Calendar.YearPickerTriggerHeading />
                          <Calendar.YearPickerTriggerIndicator />
                        </Calendar.YearPickerTrigger>
                        <div className="flex gap-1">
                          <Calendar.NavButton slot="previous" className="p-1 hover:bg-gray-100 rounded-md text-gray-600 cursor-pointer" />
                          <Calendar.NavButton slot="next" className="p-1 hover:bg-gray-100 rounded-md text-gray-600 cursor-pointer" />
                        </div>
                      </Calendar.Header>
                      <Calendar.Grid>
                        <Calendar.GridHeader>
                          {(day) => <Calendar.HeaderCell className="text-[10px] text-gray-400 font-semibold text-center pb-2 uppercase">{day}</Calendar.HeaderCell>}
                        </Calendar.GridHeader>
                        <Calendar.GridBody>
                          {(date) => <Calendar.Cell date={date} className="text-sm text-center p-1 w-8 h-8 rounded-full hover:bg-blue-50 focus:bg-blue-600 focus:text-white aria-selected:bg-blue-600 aria-selected:text-white cursor-pointer" />}
                        </Calendar.GridBody>
                      </Calendar.Grid>
                      <Calendar.YearPickerGrid className="grid grid-cols-4 gap-2 mt-2">
                        <Calendar.YearPickerGridBody>
                          {({year}) => <Calendar.YearPickerCell year={year} className="text-sm text-center p-1 rounded-md hover:bg-gray-100 cursor-pointer" />}
                        </Calendar.YearPickerGridBody>
                      </Calendar.YearPickerGrid>
                    </Calendar>
                    
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <Label className="text-xs font-semibold text-gray-600 mr-4">Time</Label>
                      <TimeField
                        value={parsedTime}
                        onChange={handleTimeChange}
                      >
                        <TimeField.Group className="flex items-center bg-gray-50 border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-100 rounded-lg px-2 py-1 text-sm transition-all" variant="secondary">
                          <TimeField.Input className="flex-1 outline-none text-gray-700 font-medium">
                            {(segment) => <TimeField.Segment segment={segment} />}
                          </TimeField.Input>
                        </TimeField.Group>
                      </TimeField>
                    </div>
                  </DatePicker.Popover>
                </>
              )}
            </DatePicker>
          </div>
          
          <p className="text-[10px] text-amber-700/60 leading-relaxed">
            Provide the client with an expected ready time when accepting.
          </p>
        </div>

        {/* Action Buttons Row - Bottom Left */}
        <div className="flex gap-3 justify-start mt-2">
          <Button 
            color="primary" 
            className="font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 px-6 h-10 text-xs transition-all"
            isLoading={isMutating}
            onPress={handleAccept}
          >
            Accept Request
          </Button>
          <Button 
            color="danger" 
            variant="flat" 
            className="font-semibold bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl px-6 h-10 text-xs transition-all"
            onPress={onOpenDecline}
          >
            Decline Request
          </Button>
        </div>
      </div>
    </div>
  );
}
