// @ts-ignore
import fs from "node:fs/promises";
import { ALL_FINNISH_CITIES } from "../src/constants/cities.js";

type Location = {
  name: string;
  latitude: number;
  longitude: number;
};

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
};

const OUTPUT_FILE = "./src/data/finnish-locations.json";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocodeCity(city: string): Promise<Location | null> {
  const params = new URLSearchParams({
    q: `${city}, Finland`,
    format: "json",
    limit: "1",
    countrycodes: "fi",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      headers: {
        "User-Agent": "aurora-app/1.0",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Geocoding failed for ${city}: ${response.status}`);
  }

  const results = (await response.json()) as NominatimResult[];

  if (results.length === 0) {
    console.warn(`Could not find: ${city}`);
    return null;
  }

  return {
    name: city,
    latitude: Number(results[0].lat),
    longitude: Number(results[0].lon),
  };
}

async function main() {
  const locations: Location[] = [];

  for (const city of ALL_FINNISH_CITIES) {
    console.log(`Geocoding: ${city}`);

    try {
      const location = await geocodeCity(city);

      if (location) {
        locations.push(location);
      }
    } catch (error) {
      console.error(`Failed: ${city}`, error);
    }

    // Be polite to the public API.
    await sleep(1100);
  }

  await fs.mkdir("./src/data", { recursive: true });

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(locations, null, 2), "utf8");

  console.log(
    `Finished. Saved ${locations.length} locations to ${OUTPUT_FILE}`,
  );
}

main().catch((error) => {
  console.error(error);
  // @ts-ignore
  process.exit(1);
});
