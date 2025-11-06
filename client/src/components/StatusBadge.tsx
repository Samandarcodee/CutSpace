import { Badge } from "@/components/ui/badge";

type BookingStatus = "pending" | "accepted" | "rejected";

interface StatusBadgeProps {
  status: BookingStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: "Kutilmoqda",
      className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    },
    accepted: {
      label: "Qabul qilindi",
      className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    },
    rejected: {
      label: "Rad etildi",
      className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={config.className} data-testid={`status-${status}`}>
      {config.label}
    </Badge>
  );
}
