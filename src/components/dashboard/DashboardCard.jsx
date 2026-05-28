import { Card, CardHeader, CardContent, Separator } from "@heroui/react";

/**
 * DashboardCard
 * A clean HeroUI-based card container.
 *
 * Props:
 *   title    {string}  – card heading
 *   children {node}    – card body content
 */
export default function DashboardCard({ title, children }) {
  return (
    <Card className="border-none bg-white/70 backdrop-blur-md shadow-sm">
      {title && (
        <>
          <CardHeader className="px-5 py-4">
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
              {title}
            </h3>
          </CardHeader>
          <Separator className="opacity-50" />
        </>
      )}
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}
