import { Card, CardHeader, CardContent, Separator } from "@heroui/react";

/**
 * DashboardCard
 * A clean HeroUI-based card container.
 *
 * Props:
 *   title    {string}  – card heading
 *   children {node}    – card body content
 */
export default function DashboardCard({ title, subtitle, action, className = "", children }) {
  return (
    <Card className={`border border-gray-100 bg-white shadow-sm flex flex-col ${className}`}>
      {(title || action) && (
        <CardHeader className="px-6 pt-5 pb-2 flex flex-row flex-nowrap justify-between items-center w-full gap-4">
          <div className="flex flex-col">
            {title && (
              <h3 className="text-[15px] font-semibold text-gray-800">
                {title}
              </h3>
            )}
            {subtitle && (
              <span className="text-[13px] text-gray-500 mt-0.5">{subtitle}</span>
            )}
          </div>
          {action && <div>{action}</div>}
        </CardHeader>
      )}
      <CardContent className="p-6 flex-1 flex flex-col">{children}</CardContent>
    </Card>
  );
}
