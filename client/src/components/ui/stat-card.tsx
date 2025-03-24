import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  trend?: {
    value: string;
    direction: "up" | "down";
  };
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  trend,
}: StatCardProps) {
  return (
    <div className="p-5 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-500">{title}</div>
          <div className="mt-1 text-3xl font-semibold text-gray-800">{value}</div>
        </div>
        <div className={cn("p-3 rounded-full", iconBgColor)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
      {trend && (
        <div
          className={cn(
            "mt-4 text-sm",
            trend.direction === "up" ? "text-green-500" : "text-red-500"
          )}
        >
          <span className="inline-flex items-center">
            <svg
              className="w-3 h-3 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  trend.direction === "up"
                    ? "M5 10l7-7m0 0l7 7m-7-7v18"
                    : "M19 14l-7 7m0 0l-7-7m7 7V3"
                }
              />
            </svg>
            {trend.value} from last month
          </span>
        </div>
      )}
    </div>
  );
}
