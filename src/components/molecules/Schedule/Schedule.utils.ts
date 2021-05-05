import { getSecondsFromStartOfDay, ONE_HOUR_IN_SECONDS } from "utils/time";

export const HOUR_WIDTH = 200; // px

export const calcStartPosition = (
  startTimeUtcSeconds: number,
  scheduleStartHour: number
) => {
  const startTimeTodaySeconds = getSecondsFromStartOfDay(startTimeUtcSeconds);

  return Math.floor(
    HOUR_WIDTH / 2 +
      (startTimeTodaySeconds / ONE_HOUR_IN_SECONDS - scheduleStartHour) *
        HOUR_WIDTH
  );
};
