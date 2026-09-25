import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes, Madhab } from 'adhan';

export interface FormattedPrayerTimes {
  cityName: string;
  latitude: number;
  longitude: number;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  nextPrayerName: string;
  nextPrayerFormattedTime: string;
  timeRemainingFormatted: string;
  secondsRemaining: number;
  qiblaBearing: number;
}

export interface CityOption {
  name: string;
  country: string;
  lat: number;
  lng: number;
}

export const POPULAR_CITIES: CityOption[] = [
  { name: 'Makkah al-Mukarramah', country: 'Saudi Arabia', lat: 21.4225, lng: 39.8262 },
  { name: 'Madinah al-Munawwarah', country: 'Saudi Arabia', lat: 24.4672, lng: 39.6111 },
  { name: 'Jerusalem (Al-Quds)', country: 'Palestine', lat: 31.7683, lng: 35.2137 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784 },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 },
  { name: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lng: 90.4125 },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456 },
  { name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.139, lng: 101.6869 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
  { name: 'New York', country: 'United States', lat: 40.7128, lng: -74.006 },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832 },
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
];

export function formatTime12h(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Calculate Qibla angle from location coordinates to Kaaba (21.422487, 39.826206)
export function calculateQiblaBearing(lat: number, lng: number): number {
  const kaabaLat = (21.422487 * Math.PI) / 180;
  const kaabaLng = (39.826206 * Math.PI) / 180;
  const userLat = (lat * Math.PI) / 180;
  const userLng = (lng * Math.PI) / 180;

  const y = Math.sin(kaabaLng - userLng);
  const x =
    Math.cos(userLat) * Math.tan(kaabaLat) -
    Math.sin(userLat) * Math.cos(kaabaLng - userLng);

  let qibla = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((qibla + 360) % 360);
}

export function calculatePrayerTimes(
  latitude: number = 21.4225,
  longitude: number = 39.8262,
  cityName: string = 'Makkah al-Mukarramah',
  methodName: 'MuslimWorldLeague' | 'ISNA' | 'UmmAlQura' | 'Karachi' | 'Egyptian' = 'MuslimWorldLeague',
  isHanafi: boolean = false
): FormattedPrayerTimes {
  const coordinates = new Coordinates(latitude, longitude);
  const now = new Date();

  let params;
  switch (methodName) {
    case 'ISNA':
      params = CalculationMethod.NorthAmerica();
      break;
    case 'UmmAlQura':
      params = CalculationMethod.UmmAlQura();
      break;
    case 'Karachi':
      params = CalculationMethod.Karachi();
      break;
    case 'Egyptian':
      params = CalculationMethod.Egyptian();
      break;
    default:
      params = CalculationMethod.MuslimWorldLeague();
  }

  if (isHanafi) {
    params.madhab = Madhab.Hanafi;
  } else {
    params.madhab = Madhab.Shafi;
  }

  const prayerTimes = new AdhanPrayerTimes(coordinates, now, params);

  const fajrStr = formatTime12h(prayerTimes.fajr);
  const sunriseStr = formatTime12h(prayerTimes.sunrise);
  const dhuhrStr = formatTime12h(prayerTimes.dhuhr);
  const asrStr = formatTime12h(prayerTimes.asr);
  const maghribStr = formatTime12h(prayerTimes.maghrib);
  const ishaStr = formatTime12h(prayerTimes.isha);

  const nextPrayer = prayerTimes.nextPrayer();
  let nextPrayerName = 'Fajr';
  let nextPrayerTime = prayerTimes.fajr;

  if (nextPrayer === 'fajr') {
    nextPrayerName = 'Fajr';
    nextPrayerTime = prayerTimes.fajr;
  } else if (nextPrayer === 'sunrise') {
    nextPrayerName = 'Sunrise';
    nextPrayerTime = prayerTimes.sunrise;
  } else if (nextPrayer === 'dhuhr') {
    nextPrayerName = 'Dhuhr';
    nextPrayerTime = prayerTimes.dhuhr;
  } else if (nextPrayer === 'asr') {
    nextPrayerName = 'Asr';
    nextPrayerTime = prayerTimes.asr;
  } else if (nextPrayer === 'maghrib') {
    nextPrayerName = 'Maghrib';
    nextPrayerTime = prayerTimes.maghrib;
  } else if (nextPrayer === 'isha') {
    nextPrayerName = 'Isha';
    nextPrayerTime = prayerTimes.isha;
  } else {
    // Tomorrow Fajr calculation
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowPrayers = new AdhanPrayerTimes(coordinates, tomorrow, params);
    nextPrayerTime = tomorrowPrayers.fajr;
    nextPrayerName = 'Fajr (Tomorrow)';
  }

  const diffMs = nextPrayerTime.getTime() - now.getTime();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const timeRemainingFormatted =
    hours > 0
      ? `${hours}h ${minutes}m ${seconds}s`
      : `${minutes}m ${seconds}s`;

  const qiblaBearing = calculateQiblaBearing(latitude, longitude);

  return {
    cityName,
    latitude,
    longitude,
    fajr: fajrStr,
    sunrise: sunriseStr,
    dhuhr: dhuhrStr,
    asr: asrStr,
    maghrib: maghribStr,
    isha: ishaStr,
    nextPrayerName,
    nextPrayerFormattedTime: formatTime12h(nextPrayerTime),
    timeRemainingFormatted,
    secondsRemaining: totalSeconds,
    qiblaBearing,
  };
}
