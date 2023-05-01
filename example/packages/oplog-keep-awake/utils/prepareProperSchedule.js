// Later.js can't properly handle seconds > 60 intervals.
// This is straightforward and not ideal fix to handle that
const prepareProperSchedule = ({ intervalSeconds = 60, parser }) => {
  // Seconds
  if (intervalSeconds <= 60) {
    return parser.recur().every(intervalSeconds).second();
  }

  // Minutes
  if (intervalSeconds <= 3600) {
    const intervalMinutes = Math.round(intervalSeconds / 60);

    return parser.recur().every(intervalMinutes).minute();
  }

  // Hours
  const intervalHours = Math.round(intervalSeconds / 3600);

  return parser.recur().every(intervalHours).hour();
};

export default prepareProperSchedule;
