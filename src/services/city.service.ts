import Fuse from "fuse.js";
import { AppError } from "../utils/AppError.js";
import { FINNISH_CITIES_WITH_LAT_LON } from "../constants/cities.js";

type FinnishCity = {
  name: string;
  latitude: number;
  longitude: number;
};

const fuse = new Fuse<FinnishCity>(FINNISH_CITIES_WITH_LAT_LON, {
  keys: ["name"],
  threshold: 0.4,
  ignoreLocation: true,
});

function findClosestCity(city: string): FinnishCity | null {
  const result = fuse.search(city);

  if (!result.length) {
    throw new AppError("No matching city found", 404);
  }

  return result[0].item;
}

export const cityService = {
  findClosestCity,
};
