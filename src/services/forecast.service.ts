import { AppError } from "../utils/AppError.js";
import { weatherService, type HourlyForecast } from "./weather.service.js";
import { auroraService, type AuroraPeriod } from "./aurora.service.js";
import { KP_VISIBILITY_TABLE } from "../constants/forecast.js";

export type AuroraConditions = "Poor" | "Possible" | "Good" | "Excellent";

export type ForecastWindow = {
  time: string;
  cloudCover: number;
  kp: number;
  score: number;
  conditions: AuroraConditions;
};

export type DayForecast = {
  date: string;
  bestViewingWindow: ForecastWindow;
  hourly: ForecastWindow[];
};

export type ForecastResult =
  | {
      date: string;
      predictable: true;
      bestViewingWindow: ForecastWindow;
      hourly: ForecastWindow[];
    }
  | {
      date: string;
      predictable: false;
      message: string;
    };

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getRequiredKp(latitude: number): number {
  if (latitude >= KP_VISIBILITY_TABLE[0].latitude) return 0;
  if (latitude <= KP_VISIBILITY_TABLE[9].latitude) return 9;

  for (let i = 0; i < KP_VISIBILITY_TABLE.length - 1; i++) {
    const upper = KP_VISIBILITY_TABLE[i];
    const lower = KP_VISIBILITY_TABLE[i + 1];

    if (latitude <= upper.latitude && latitude >= lower.latitude) {
      const fraction =
        (upper.latitude - latitude) / (upper.latitude - lower.latitude);
      return upper.kp + fraction * (lower.kp - upper.kp);
    }
  }

  return 9;
}

function findAuroraPeriod(periods: AuroraPeriod[], time: string): AuroraPeriod {
  return (
    periods.find((p) => time >= p.start && time < p.end) ??
    periods[periods.length - 1]
  );
}

function calculateAuroraScore(
  kp: number,
  latitude: number,
  cloudCover: number,
): number {
  const requiredKp = getRequiredKp(latitude);

  // kp exactly at threshold -> 50 (coin-flip). +2 above -> 100. -2 below -> 0.
  const activityScore = clamp(((kp - requiredKp + 2) / 4) * 100, 0, 100);

  // Cloud cover is a gate, not an additive factor — no clear sky, no visibility.
  const clearSkyFraction = (100 - cloudCover) / 100;

  return Math.round(clamp(activityScore * clearSkyFraction, 0, 100));
}

function getAuroraConditions(score: number): AuroraConditions {
  if (score >= 75) return "Excellent";
  if (score >= 50) return "Good";
  if (score >= 25) return "Possible";
  return "Poor";
}

function scoreNightHours(
  nightHours: HourlyForecast[],
  auroraPeriods: AuroraPeriod[],
  latitude: number,
): ForecastWindow[] {
  return nightHours.map((hour) => {
    const period = findAuroraPeriod(auroraPeriods, hour.time);
    const score = calculateAuroraScore(period.kp, latitude, hour.cloudCover);

    return {
      time: hour.time,
      cloudCover: hour.cloudCover,
      kp: period.kp,
      score,
      conditions: getAuroraConditions(score),
    };
  });
}

async function getForecast(
  date: string,
  latitude: number,
  longitude: number,
): Promise<ForecastResult> {
  const auroraForecast = await auroraService.getAuroraForecast();
  const dates = auroraService.getForecastDates(auroraForecast);

  const maxDate = dates[dates.length - 1];

  if (date > maxDate) {
    throw new AppError(
      `Aurora activity can't be predicted that far ahead. Forecasts are only available up to ${maxDate}.`,
      400,
    );
  }

  if (!dates.includes(date)) {
    throw new AppError(
      "No forecast data available for the requested date.",
      404,
    );
  }

  const nightHoursByDate = await weatherService.getNightHoursForDates(
    [date],
    latitude,
    longitude,
  );

  const nightHours = nightHoursByDate.get(date);
  if (!nightHours) {
    throw new AppError(
      "No nighttime weather data available for the requested date.",
      404,
    );
  }

  const auroraForDate = auroraForecast.filter((p) => p.date === date);
  if (auroraForDate.length === 0) {
    throw new AppError(
      "No aurora forecast available for the requested date.",
      404,
    );
  }

  const hourly = scoreNightHours(nightHours, auroraForDate, latitude);
  const bestViewingWindow = hourly.reduce((best, current) =>
    current.score > best.score ? current : best,
  );

  return { date, predictable: true, bestViewingWindow, hourly };
}

export const forecastService = {
  getForecast,
};
