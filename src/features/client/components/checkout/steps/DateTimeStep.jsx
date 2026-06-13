import { useFormContext } from "react-hook-form";
import { DatePicker, DateField, Label, Calendar, TimeField } from "@heroui/react";
import { I18nProvider } from "@react-aria/i18n";
import { getLocalTimeZone, today, now } from "@internationalized/date";
import { useMemo } from "react";
import { DAY_ABBR } from "@/store/slices/checkoutSlice";
import VehicleSelector from "@/features/client/components/checkout/VehicleSelector";
import { PhotoIcon } from "@heroicons/react/24/outline";

export default function DateTimeStep({
  operatingHours = [],
  vehicles = [],
  timeError,
  onAddVehicleClick,
}) {
  const { watch, setValue, register } = useFormContext();
  const selectedDate = watch("selectedDate");
  const selectedVehicleId = watch("selectedVehicleId");
  const dateTimeValue = watch("dateTimeValue");
  const photos = watch("photos") || [];

  const tz = getLocalTimeZone();
  // Using now() instead of today() ensures the picker also blocks past times on the current day
  const minValue = now(tz);
  const maxValue = today(tz).add({ days: 7 });

  // Determine operating hours for the selected day
  const dayHours = useMemo(() => {
    if (!dateTimeValue) return null;
    try {
      const dayOfWeek = dateTimeValue.toDate(tz).getDay();
      return operatingHours.find((h) => h.dayOfWeek === dayOfWeek) || null;
    } catch {
      return null;
    }
  }, [dateTimeValue, operatingHours, tz]);

  const isDateUnavailable = (date) => {
    const dayOfWeek = date.toDate(tz).getDay();
    const oh = operatingHours.find((h) => h.dayOfWeek === dayOfWeek);
    if (oh && (oh.isClosed || (!oh.openTime && !oh.closeTime))) return true;
    return false;
  };

  const handleDateTimeChange = (val) => {
    if (!val) return;
    setValue("dateTimeValue", val, { shouldValidate: true });
    // Extract JS date parts for the booking form
    try {
      const jsDate = val.toDate(tz);
      setValue("selectedDate", jsDate, { shouldValidate: true });
      const h = String(jsDate.getHours()).padStart(2, "0");
      const m = String(jsDate.getMinutes()).padStart(2, "0");
      setValue("selectedTime", `${h}:${m}`, { shouldValidate: true });
    } catch {
      // ignore parse errors
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) return;
    setValue("photos", [...photos, ...files.slice(0, 5 - photos.length)], { shouldValidate: true });
  };

  const removePhoto = (index) => {
    setValue("photos", photos.filter((_, i) => i !== index), { shouldValidate: true });
  };

  return (
    <div className="space-y-10">
      {/* Vehicle Selection */}
      <VehicleSelector
        vehicles={vehicles}
        selectedVehicleId={selectedVehicleId}
        onSelectVehicle={(id) => setValue("selectedVehicleId", id, { shouldValidate: true })}
        onAddVehicleClick={onAddVehicleClick}
      />

      {/* Date & Time Picker */}
      <div>
        <p className="text-[15px] font-semibold text-text-primary mb-1">Choose date & time</p>
        <p className="text-[12px] text-text-muted mb-5">
          {dayHours && !dayHours.isClosed
            ? `Operating hours: ${dayHours.openTime} – ${dayHours.closeTime}`
            : "Select any time in the next 7 days"}
        </p>
        <I18nProvider locale="en-US">
          <DatePicker
            granularity="minute"
            hourCycle={12}
            value={dateTimeValue || null}
            onChange={handleDateTimeChange}
            minValue={minValue}
            maxValue={maxValue}
            isDateUnavailable={isDateUnavailable}
            className="w-full max-w-sm"
            hideTimeZone
          >
            {({ state }) => (
              <>
                <Label className="text-[13px] font-medium text-text-muted uppercase tracking-wide mb-2">
                  Appointment date & time
                </Label>
                <DateField.Group fullWidth>
                  <DateField.Input>
                    {(segment) => <DateField.Segment segment={segment} />}
                  </DateField.Input>
                  <DateField.Suffix>
                    <DatePicker.Trigger type="button">
                      <DatePicker.TriggerIndicator />
                    </DatePicker.Trigger>
                  </DateField.Suffix>
                </DateField.Group>
                <DatePicker.Popover className="flex flex-col gap-3 p-2">
                  <Calendar aria-label="Appointment date" minValue={minValue} maxValue={maxValue} isDateUnavailable={isDateUnavailable}>
                    <Calendar.Header>
                      <Calendar.YearPickerTrigger>
                        <Calendar.YearPickerTriggerHeading />
                        <Calendar.YearPickerTriggerIndicator />
                      </Calendar.YearPickerTrigger>
                      <Calendar.NavButton slot="previous" />
                      <Calendar.NavButton slot="next" />
                    </Calendar.Header>
                    <Calendar.Grid>
                      <Calendar.GridHeader>
                        {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                      </Calendar.GridHeader>
                      <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
                    </Calendar.Grid>
                    <Calendar.YearPickerGrid>
                      <Calendar.YearPickerGridBody>
                        {({ year }) => <Calendar.YearPickerCell year={year} />}
                      </Calendar.YearPickerGridBody>
                    </Calendar.YearPickerGrid>
                  </Calendar>
                  <div className="flex items-center justify-between px-2 pb-2">
                    <Label className="text-[12px] text-text-muted font-medium">Time</Label>
                    <TimeField
                      aria-label="Time"
                      granularity="minute"
                      hourCycle={12}
                      hideTimeZone
                      name="time"
                      value={state.timeValue}
                      onChange={(v) => state.setTimeValue(v)}
                    >
                      <TimeField.Group variant="secondary">
                        <TimeField.Input>
                          {(segment) => <TimeField.Segment segment={segment} />}
                        </TimeField.Input>
                      </TimeField.Group>
                    </TimeField>
                  </div>
                </DatePicker.Popover>
              </>
            )}
          </DatePicker>
        </I18nProvider>
        {timeError && (
          <p className="mt-2 text-[13px] font-medium text-red-500">
            {timeError}
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <p className="text-[15px] font-semibold text-text-primary">Add notes (optional)</p>
        <p className="text-[12px] text-text-muted mt-1">
          Tell the service provider what you need or any specific concerns.
        </p>
        <textarea
          rows={4}
          {...register("notes")}
          placeholder="Describe what you need, e.g. 'Engine makes a knocking sound when accelerating'…"
          className="mt-4 w-full resize-none rounded-2xl border border-border-default bg-surface-hover px-5 py-4 text-[14px] text-text-primary placeholder:text-text-muted outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
        />
      </div>

      {/* Photos */}
      <div>
        <p className="text-[15px] font-semibold text-text-primary">
          Problem photos (optional, up to 5)
        </p>
        <p className="text-[12px] text-text-muted mt-1">
          Add photos to help the provider understand the issue better.
        </p>
        {photos.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {photos.map((photo, i) => (
              <div
                key={`${photo.name}-${i}`}
                className="relative group h-24 w-24 rounded-xl overflow-hidden ring-1 ring-black/5"
              >
                <img src={URL.createObjectURL(photo)} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        {photos.length < 5 && (
          <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border-default bg-surface-hover px-6 py-8 text-center transition-colors hover:border-brand-500/30 hover:bg-brand-500/[0.02]">
            <PhotoIcon className="h-7 w-7 text-text-muted" />
            <span className="text-[13px] font-medium text-text-tertiary">Click to add photos</span>
            <span className="text-[11px] text-text-muted">{photos.length}/5 uploaded</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
          </label>
        )}
      </div>
    </div>
  );
}
