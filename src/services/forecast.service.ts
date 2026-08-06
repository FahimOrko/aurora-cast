import { FORECAST } from "../constants/forecast.js";
import { AppError } from "../utils/AppError.js";
import { weatherClient } from "../clients/weather.client.js";
import { WeatherForecastResponse } from "../schemas/weather.schema.js";

type HourlyForecast = {
  time: string;
  cloudCover: number;
  visibility: number;
  precipitation: number;
};

type WeatherSummary = {
  averageCloudCover: number;
  averageVisibility: number;
  totalPrecipitation: number;
};

type BestViewingWindow = {
  start: string;
  end: string;
  cloudCover: number;
  visibility: number;
};

function getDayForecast(
  weather: WeatherForecastResponse,
  date: string,
): HourlyForecast[] {
  return weather.hourly.time
    .map((time, index) => ({
      time,
      cloudCover: weather.hourly.cloud_cover[index],
      visibility: weather.hourly.visibility[index],
      precipitation: weather.hourly.precipitation[index],
    }))
    .filter((hour) => hour.time.startsWith(date));
}

function getNightForecast(
  weather: WeatherForecastResponse,
  dayForecast: HourlyForecast[],
  date: string,
): HourlyForecast[] {
  const dayIndex = weather.daily.time.findIndex((day) => day === date);

  if (dayIndex === -1) {
    throw new AppError("No daily weather data available.", 404);
  }

  const sunrise = weather.daily.sunrise[dayIndex];
  const sunset = weather.daily.sunset[dayIndex];

  return dayForecast.filter(
    (hour) => hour.time < sunrise || hour.time > sunset,
  );
}

function calculateWeatherSummary(
  nightForecast: HourlyForecast[],
): WeatherSummary {
  const averageCloudCover =
    nightForecast.reduce((sum, hour) => sum + hour.cloudCover, 0) /
    nightForecast.length;

  const averageVisibility =
    nightForecast.reduce((sum, hour) => sum + hour.visibility, 0) /
    nightForecast.length;

  const totalPrecipitation = nightForecast.reduce(
    (sum, hour) => sum + hour.precipitation,
    0,
  );

  return {
    averageCloudCover: Math.round(averageCloudCover),
    averageVisibility: Math.round(averageVisibility),
    totalPrecipitation: Math.round(totalPrecipitation * 100) / 100,
  };
}

function determineViewingConditions(summary: WeatherSummary) {
  let score = FORECAST.MAX_SCORE;

  // Cloud cover has the biggest impact
  score -= summary.averageCloudCover * FORECAST.CLOUD_COVER_WEIGHT;

  // Rain or snow is bad for viewing
  if (summary.totalPrecipitation > 0) {
    score -= FORECAST.PRECIPITATION_PENALTY;
  }

  // Poor visibility
  if (summary.averageVisibility < 10000) {
    score -= FORECAST.LOW_VISIBILITY_PENALTY;
  }

  score = Math.max(0, Math.min(FORECAST.MAX_SCORE, Math.round(score)));

  let conditions = "Poor";

  if (score >= FORECAST.EXCELLENT_SCORE) {
    conditions = "Excellent";
  } else if (score >= FORECAST.GOOD_SCORE) {
    conditions = "Good";
  } else if (score >= FORECAST.FAIR_SCORE) {
    conditions = "Fair";
  }

  return {
    score,
    conditions,
  };
}

function getBestViewingWindow(
  nightForecast: HourlyForecast[],
): BestViewingWindow {
  const sorted = [...nightForecast].sort((a, b) => {
    if (a.cloudCover !== b.cloudCover) {
      return a.cloudCover - b.cloudCover;
    }

    return b.visibility - a.visibility;
  });

  const best = sorted[0];

  const index = nightForecast.findIndex((hour) => hour.time === best.time);

  return {
    start: best.time,
    end: nightForecast[index + 1]?.time ?? best.time,
    cloudCover: best.cloudCover,
    visibility: best.visibility,
  };
}

async function getForecast(date: string, latitude: number, longitude: number) {
  const weather = await weatherClient.getForecast(latitude, longitude);

  const dayForecast = getDayForecast(weather, date);

  if (dayForecast.length === 0) {
    throw new AppError("No forecast available for the requested date.", 404);
  }

  const nightForecast = getNightForecast(weather, dayForecast, date);

  if (nightForecast.length === 0) {
    throw new AppError(
      "No nighttime forecast available for the requested date.",
      404,
    );
  }

  const summary = calculateWeatherSummary(nightForecast);
  const bestViewingWindow = getBestViewingWindow(nightForecast);
  const viewingConditions = determineViewingConditions(summary);

  return {
    summary,
    bestViewingWindow,
    viewingConditions,
  };
}

export const forecastService = {
  getForecast,
};
