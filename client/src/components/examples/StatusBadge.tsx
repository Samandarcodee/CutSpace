import StatusBadge from '../StatusBadge';

export default function StatusBadgeExample() {
  return (
    <div className="flex gap-2 flex-wrap p-4">
      <StatusBadge status="pending" />
      <StatusBadge status="accepted" />
      <StatusBadge status="rejected" />
    </div>
  );
}
