import { convertToUTC, durationBetween } from "~/utils/dates";

interface CompetitionDurationProps {
  startsAt: Date;
  endsAt: Date;
  showUTC: boolean;
}

export default function CompetitionDuration(props: CompetitionDurationProps) {
  const { showUTC } = props;

  const duration = durationBetween(props.startsAt, props.endsAt);

  const durationSegments = [];
  if (duration.days > 0) durationSegments.push(`${duration.days} days`);
  if (duration.hours > 0) durationSegments.push(`${duration.hours} hours`);
  if (duration.minutes > 0) durationSegments.push(`${duration.minutes} minutes`);

  return (
    <div className="flex h-24 w-full flex-col items-center overflow-hidden rounded-lg border border-gray-500">
      <div className="grid w-full grow grid-cols-2 items-center divide-x divide-gray-500">
        <div className="flex flex-col px-4 py-3">
          <span className="text-xs text-gray-200">Start</span>
          <span className="line-clamp-1 text-sm">{formatDate(props.startsAt, showUTC)}</span>
        </div>
        <div className="flex flex-col px-4 py-3">
          <span className="text-xs text-gray-200">End</span>
          <span className="line-clamp-1 text-sm">{formatDate(props.endsAt, showUTC)}</span>
        </div>
      </div>
      <div className="line-clamp-1 w-full overflow-hidden truncate border-t border-gray-500 px-4 py-2 text-xs text-gray-200">
        Duration: {durationSegments.join(", ")}
      </div>
    </div>
  );
}

function formatDate(date: Date, showUTC: boolean) {
  return (showUTC ? convertToUTC(date) : date).toLocaleDateString("UTC", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}
