import { AppError } from "../utils/AppError.js";
import { auroraClient } from "../clients/aurora.client.js";
import type { AuroraForecastResponse } from "../schemas/aurora.schema.js";

export type AuroraPeriod = {
  date: string;
  start: string;
  end: string;
  kp: number;
  activity: "Low" | "Moderate" | "Strong" | "Severe";
};

function getActivityLevel(kp: number): AuroraPeriod["activity"] {
  if (kp >= 6) return "Severe";
  if (kp >= 5) return "Strong";
  if (kp >= 3) return "Moderate";
  return "Low";
}

function parseAuroraTime(time: string) {
  const match = time.match(/^([A-Za-z]{3})\s+(\d{2})\s+(\d{2})-(\d{2})$/);

  if (!match) {
    throw new AppError(`Invalid aurora time format: ${time}`, 502);
  }

  const [, month, day, startHour, endHour] = match;
  const currentYear = new Date().getFullYear();
  const date = new Date(`${month} ${day}, ${currentYear} ${startHour}:00`);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(`Invalid aurora date: ${time}`, 502);
  }

  const isoDate = date.toISOString().slice(0, 10);

  return {
    date: isoDate,
    start: `${isoDate}T${startHour}:00`,
    end: `${isoDate}T${endHour}:00`,
  };
}

function mapAuroraForecast(forecast: AuroraForecastResponse): AuroraPeriod[] {
  if (forecast.x.length !== forecast.y.length) {
    throw new AppError("Invalid aurora forecast data.", 502);
  }

  return forecast.x.map((time, index) => {
    const kp = forecast.y[index];
    const parsedTime = parseAuroraTime(time);

    return { ...parsedTime, kp, activity: getActivityLevel(kp) };
  });
}

function getForecastDates(periods: AuroraPeriod[]): string[] {
  return [...new Set(periods.map((period) => period.date))].sort();
}

async function getAuroraForecast() {
  const forecast = await auroraClient.getAuroraForecast();
  return mapAuroraForecast(forecast);
}

export const auroraService = {
  getAuroraForecast,
  getForecastDates,
};
