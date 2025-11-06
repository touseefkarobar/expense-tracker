import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  createdAt: string;
}

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <div className="space-y-4">
      {items.map(item => (
        <div key={item.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-sm">
          <div className="font-medium text-slate-800">{item.actor}</div>
          <div className="text-slate-600">{item.action}</div>
          <span className="text-xs text-slate-500">
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </span>
        </div>
      ))}
    </div>
  );
}
