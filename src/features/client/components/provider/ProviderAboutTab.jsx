import {
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { Card } from "@heroui/react";
import ProviderGallery from "./ProviderGallery";

function AboutRow({ icon: Icon, label, value }) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3 py-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-page">
        <Icon className="h-4 w-4 text-text-muted" aria-hidden="true" />
      </span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{label}</p>
        <p className="mt-0.5 text-[14px] font-medium text-text-primary">{value}</p>
      </div>
    </div>
  );
}

export default function ProviderAboutTab({ about, operatingHours = [], gallery = [] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">

      <ProviderGallery gallery={gallery} />

      {about?.description && (
        <Card className="border-none p-5 shadow-none ring-1 ring-black/[0.06] lg:col-span-2">
          <h3 className="text-[15px] font-bold text-text-primary">About</h3>
          <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-text-secondary">
            {about.description}
          </p>
        </Card>
      )}

      <Card className="border-none p-5 shadow-none ring-1 ring-black/[0.06]">
        <h3 className="text-[15px] font-bold text-text-primary">Contact & location</h3>
        <div className="mt-2 divide-y divide-gray-100">
          <AboutRow icon={MapPinIcon} label="Address" value={about?.address} />
          <AboutRow icon={PhoneIcon} label="Phone" value={about?.phone} />
          <AboutRow icon={EnvelopeIcon} label="Email" value={about?.email} />
          <AboutRow icon={WrenchScrewdriverIcon} label="Service type" value={about?.typeLabel} />
        </div>
      </Card>

      <Card className="border-none p-5 shadow-none ring-1 ring-black/[0.06]">
        <h3 className="text-[15px] font-bold text-text-primary">Opening hours</h3>
        <ul className="mt-3 space-y-2">
          {operatingHours.map((day) => (
            <li
              key={day.dayOfWeek}
              className="flex items-center justify-between text-[14px]"
            >
              <span className="font-medium text-text-tertiary">{day.dayName}</span>
              <span className={day.isClosed ? "text-text-muted" : "font-semibold text-text-primary"}>
                {day.isClosed
                  ? "Closed"
                  : `${day.openTime} – ${day.closeTime}`}
              </span>
            </li>
          ))}
        </ul>
      </Card>

    </div>
  );
}
