export const FORECAST = {
  MAX_SCORE: 100,

  CLOUD_COVER_WEIGHT: 0.6,
  PRECIPITATION_PENALTY: 20,
  LOW_VISIBILITY_PENALTY: 20,

  EXCELLENT_SCORE: 80,
  GOOD_SCORE: 60,
  FAIR_SCORE: 40,
};

export const KP_VISIBILITY_TABLE = [
  { kp: 0, latitude: 66.5 },
  { kp: 1, latitude: 64.5 },
  { kp: 2, latitude: 62.4 },
  { kp: 3, latitude: 60.4 },
  { kp: 4, latitude: 58.3 },
  { kp: 5, latitude: 56.3 },
  { kp: 6, latitude: 54.2 },
  { kp: 7, latitude: 52.2 },
  { kp: 8, latitude: 50.1 },
  { kp: 9, latitude: 48.1 },
];
