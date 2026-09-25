import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes, Madhab } from 'adhan';

export interface FormattedPrayerTimes {
  cityName: string;
  country: string;
  latitude: number;
  longitude: number;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  sunsetRange: string; // e.g. "5:37 - 5:52 PM"
  isha: string;
  midnight: string;
  tahajjud: string;
  
  // Date objects for status calculation
  fajrDate: Date;
  sunriseDate: Date;
  dhuhrDate: Date;
  asrDate: Date;
  maghribDate: Date;
  ishaDate: Date;

  // Next prayer
  nextPrayerName: string;
  nextPrayerArabic: string;
  nextPrayerFormattedTime: string;
  timeRemainingFormatted: string;
  secondsRemaining: number;
  currentPrayerName: string;

  // Solar Arc
  isDaytime: boolean;
  sunProgressPercent: number; // 0% at sunrise to 100% at sunset
  daylightRemainingFormatted: string;
  daylightTotalFormatted: string;

  // Qibla
  qiblaBearing: number;
  qiblaCardinal: string;
  kaabaDistanceKm: number;

  // Hijri
  hijriFormatted: string;
  gregorianFormatted: string;
}

export interface CityOption {
  name: string;
  country: string;
  lat: number;
  lng: number;
}

export const KAABA_LAT = 21.422487;
export const KAABA_LNG = 39.826206;

export const POPULAR_CITIES: CityOption[] = [
  { name: 'Makkah al-Mukarramah', country: 'Saudi Arabia', lat: 21.4225, lng: 39.8262 },
  { name: 'Madinah al-Munawwarah', country: 'Saudi Arabia', lat: 24.4672, lng: 39.6111 },
  { name: 'Jerusalem (Al-Quds)', country: 'Palestine', lat: 31.7683, lng: 35.2137 },
  { name: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lng: 90.4125 },
  { name: 'Chittagong', country: 'Bangladesh', lat: 22.3569, lng: 91.7832 },
  { name: 'Sylhet', country: 'Bangladesh', lat: 24.8949, lng: 91.8687 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784 },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 },
  { name: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lng: 46.6753 },
  { name: 'Karachi', country: 'Pakistan', lat: 24.8607, lng: 67.0011 },
  { name: 'Lahore', country: 'Pakistan', lat: 31.5204, lng: 74.3587 },
  { name: 'Islamabad', country: 'Pakistan', lat: 33.6844, lng: 73.0479 },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456 },
  { name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.139, lng: 101.6869 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
  { name: 'Birmingham', country: 'United Kingdom', lat: 52.4862, lng: -1.8904 },
  { name: 'New York', country: 'United States', lat: 40.7128, lng: -74.006 },
  { name: 'Chicago', country: 'United States', lat: 41.8781, lng: -87.6298 },
  { name: 'Los Angeles', country: 'United States', lat: 34.0522, lng: -118.2437 },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832 },
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
  { name: 'Casablanca', country: 'Morocco', lat: 33.5731, lng: -7.5898 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198 },
];

export function formatTime12h(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Calculate Great Circle Distance in KM to Kaaba
export function calculateKaabaDistance(lat: number, lng: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((KAABA_LAT - lat) * Math.PI) / 180;
  const dLng = ((KAABA_LNG - lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((KAABA_LAT * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Calculate Qibla angle from location coordinates to Kaaba
export function calculateQiblaBearing(lat: number, lng: number): number {
  const kaabaLat = (KAABA_LAT * Math.PI) / 180;
  const kaabaLng = (KAABA_LNG * Math.PI) / 180;
  const userLat = (lat * Math.PI) / 180;
  const userLng = (lng * Math.PI) / 180;

  const y = Math.sin(kaabaLng - userLng);
  const x =
    Math.cos(userLat) * Math.tan(kaabaLat) -
    Math.sin(userLat) * Math.cos(kaabaLng - userLng);

  let qibla = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((qibla + 360) % 360);
}

export function bearingToCardinal(bearing: number): string {
  const cardinals = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'
  ];
  const index = Math.round(bearing / 22.5) % 16;
  return cardinals[index];
}

export function getHijriDate(date: Date = new Date(), offsetDays: number = 0): string {
  const adjusted = new Date(date);
  adjusted.setDate(adjusted.getDate() + offsetDays);

  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return formatter.format(adjusted) + ' AH';
  } catch {
    return '13 Rabi al-Awwal 1448 AH';
  }
}

export function calculatePrayerTimes(
  latitude: number = 21.4225,
  longitude: number = 39.8262,
  cityName: string = 'Makkah al-Mukarramah',
  methodName: 'MuslimWorldLeague' | 'ISNA' | 'UmmAlQura' | 'Karachi' | 'Egyptian' = 'MuslimWorldLeague',
  isHanafi: boolean = false,
  hijriOffset: number = 0
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

  // Sunset range (Maghrib start to +15 mins twilight period)
  const sunsetEndTime = new Date(prayerTimes.maghrib.getTime() + 15 * 60 * 1000);
  const sunsetRange = `${formatTime12h(prayerTimes.maghrib)} - ${formatTime12h(sunsetEndTime)}`;

  // Midnight (Halfway between Maghrib and tomorrow's Fajr)
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowPrayers = new AdhanPrayerTimes(coordinates, tomorrow, params);
  const nightDurationMs = tomorrowPrayers.fajr.getTime() - prayerTimes.maghrib.getTime();
  const midnightDate = new Date(prayerTimes.maghrib.getTime() + nightDurationMs / 2);
  const tahajjudStartDate = new Date(prayerTimes.maghrib.getTime() + (nightDurationMs * 2) / 3);

  const midnightStr = formatTime12h(midnightDate);
  const tahajjudStr = formatTime12h(tahajjudStartDate);

  // Next prayer
  const nextPrayer = prayerTimes.nextPrayer();
  let nextPrayerName = 'Fajr';
  let nextPrayerArabic = 'الفجر';
  let nextPrayerTime = prayerTimes.fajr;

  if (nextPrayer === 'fajr') {
    nextPrayerName = 'Fajr';
    nextPrayerArabic = 'الفجر';
    nextPrayerTime = prayerTimes.fajr;
  } else if (nextPrayer === 'sunrise') {
    nextPrayerName = 'Sunrise';
    nextPrayerArabic = 'الشروق';
    nextPrayerTime = prayerTimes.sunrise;
  } else if (nextPrayer === 'dhuhr') {
    nextPrayerName = 'Dhuhr';
    nextPrayerArabic = 'الظهر';
    nextPrayerTime = prayerTimes.dhuhr;
  } else if (nextPrayer === 'asr') {
    nextPrayerName = 'Asr';
    nextPrayerArabic = 'العصر';
    nextPrayerTime = prayerTimes.asr;
  } else if (nextPrayer === 'maghrib') {
    nextPrayerName = 'Maghrib';
    nextPrayerArabic = 'المغرب';
    nextPrayerTime = prayerTimes.maghrib;
  } else if (nextPrayer === 'isha') {
    nextPrayerName = 'Isha';
    nextPrayerArabic = 'العشاء';
    nextPrayerTime = prayerTimes.isha;
  } else {
    nextPrayerTime = tomorrowPrayers.fajr;
    nextPrayerName = 'Fajr';
    nextPrayerArabic = 'الفجر';
  }

  // Active / Current Prayer
  let currentPrayerName = 'Isha';
  if (now >= prayerTimes.fajr && now < prayerTimes.sunrise) {
    currentPrayerName = 'Fajr';
  } else if (now >= prayerTimes.sunrise && now < prayerTimes.dhuhr) {
    currentPrayerName = 'Duha';
  } else if (now >= prayerTimes.dhuhr && now < prayerTimes.asr) {
    currentPrayerName = 'Dhuhr';
  } else if (now >= prayerTimes.asr && now < prayerTimes.maghrib) {
    currentPrayerName = 'Asr';
  } else if (now >= prayerTimes.maghrib && now < prayerTimes.isha) {
    currentPrayerName = 'Maghrib';
  } else {
    currentPrayerName = 'Isha';
  }

  // Time remaining
  const diffMs = nextPrayerTime.getTime() - now.getTime();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const timeRemainingFormatted =
    hours > 0
      ? `${hours}h ${minutes}m ${seconds}s`
      : `${minutes}m ${seconds}s`;

  // Solar Arc Calculations
  const sunriseMs = prayerTimes.sunrise.getTime();
  const sunsetMs = prayerTimes.maghrib.getTime();
  const nowMs = now.getTime();
  const isDaytime = nowMs >= sunriseMs && nowMs <= sunsetMs;

  let sunProgressPercent = 0;
  let daylightRemainingFormatted = '0m';
  const totalDaylightMs = sunsetMs - sunriseMs;
  const totalDaylightHours = Math.floor(totalDaylightMs / 3600000);
  const totalDaylightMins = Math.floor((totalDaylightMs % 3600000) / 60000);
  const daylightTotalFormatted = `${totalDaylightHours}h ${totalDaylightMins}m`;

  if (nowMs < sunriseMs) {
    sunProgressPercent = 0;
    daylightRemainingFormatted = daylightTotalFormatted;
  } else if (nowMs > sunsetMs) {
    sunProgressPercent = 100;
    daylightRemainingFormatted = '0m (Night)';
  } else {
    sunProgressPercent = Math.min(100, Math.max(0, ((nowMs - sunriseMs) / totalDaylightMs) * 100));
    const remMs = sunsetMs - nowMs;
    const remHours = Math.floor(remMs / 3600000);
    const remMins = Math.floor((remMs % 3600000) / 60000);
    daylightRemainingFormatted = remHours > 0 ? `${remHours}h ${remMins}m` : `${remMins}m`;
  }

  // Qibla calculations
  const qiblaBearing = calculateQiblaBearing(latitude, longitude);
  const qiblaCardinal = bearingToCardinal(qiblaBearing);
  const kaabaDistanceKm = calculateKaabaDistance(latitude, longitude);

  // Matched city object
  const cityObj = POPULAR_CITIES.find((c) => c.name === cityName);
  const country = cityObj ? cityObj.country : 'World';

  // Dates
  const gregorianFormatted = now.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const hijriFormatted = getHijriDate(now, hijriOffset);

  return {
    cityName,
    country,
    latitude,
    longitude,
    fajr: fajrStr,
    sunrise: sunriseStr,
    dhuhr: dhuhrStr,
    asr: asrStr,
    maghrib: maghribStr,
    sunsetRange,
    isha: ishaStr,
    midnight: midnightStr,
    tahajjud: tahajjudStr,
    fajrDate: prayerTimes.fajr,
    sunriseDate: prayerTimes.sunrise,
    dhuhrDate: prayerTimes.dhuhr,
    asrDate: prayerTimes.asr,
    maghribDate: prayerTimes.maghrib,
    ishaDate: prayerTimes.isha,
    nextPrayerName,
    nextPrayerArabic,
    nextPrayerFormattedTime: formatTime12h(nextPrayerTime),
    timeRemainingFormatted,
    secondsRemaining: totalSeconds,
    currentPrayerName,
    isDaytime,
    sunProgressPercent,
    daylightRemainingFormatted,
    daylightTotalFormatted,
    qiblaBearing,
    qiblaCardinal,
    kaabaDistanceKm,
    hijriFormatted,
    gregorianFormatted,
  };
}

