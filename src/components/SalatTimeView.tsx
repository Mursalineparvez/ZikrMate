import React, { useState, useEffect, useRef } from 'react';
import {
  calculatePrayerTimes,
  FormattedPrayerTimes,
  POPULAR_CITIES,
  CityOption,
} from '../utils/prayerTimes';
import {
  Clock,
  Compass,
  MapPin,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronDown,
  Navigation,
  Sun,
  Moon,
  Sunrise as SunriseIcon,
  Sunset as SunsetIcon,
  Bell,
  BellOff,
  SlidersHorizontal,
  RotateCw,
  CheckCircle2,
  Calendar,
  Search,
  Share2,
  Info,
} from 'lucide-react';
import { soundHaptics } from '../utils/audioHaptics';

interface SalatTimeViewProps {
  soundEnabled: boolean;
}

export const SalatTimeView: React.FC<SalatTimeViewProps> = ({ soundEnabled }) => {
  // City and calculation parameters
  const [selectedCity, setSelectedCity] = useState<CityOption>(() => {
    try {
      const saved = localStorage.getItem('zikrmate_salat_city');
      if (saved) return JSON.parse(saved);
    } catch {}
    return POPULAR_CITIES[3]; // Default to Dhaka or Makkah
  });

  const [method, setMethod] = useState<'MuslimWorldLeague' | 'ISNA' | 'UmmAlQura' | 'Karachi' | 'Egyptian'>(() => {
    try {
      const saved = localStorage.getItem('zikrmate_salat_method');
      if (saved) return JSON.parse(saved);
    } catch {}
    return 'Karachi';
  });

  const [isHanafi, setIsHanafi] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('zikrmate_salat_hanafi');
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return true;
  });

  const [hijriOffset, setHijriOffset] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('zikrmate_hijri_offset');
      if (saved) return Number(saved);
    } catch {}
    return 0;
  });

  // Notifications per prayer (Fajr, Dhuhr, Asr, Maghrib, Isha)
  const [activeAlerts, setActiveAlerts] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('zikrmate_salat_alerts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true };
  });

  // Device orientation / Qibla state
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [isCompassActive, setIsCompassActive] = useState<boolean>(false);
  const [hasCompassSensor, setHasCompassSensor] = useState<boolean>(false);
  const [manualCompassRotation, setManualCompassRotation] = useState<number>(0);

  // UI Modals / Drawers
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const [citySearchQuery, setCitySearchQuery] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isPlayingAdhan, setIsPlayingAdhan] = useState<boolean>(false);
  const [activeAdhanName, setActiveAdhanName] = useState<string>('Makkah Adhan');

  // Prayer times state
  const [prayerData, setPrayerData] = useState<FormattedPrayerTimes>(() =>
    calculatePrayerTimes(
      selectedCity.lat,
      selectedCity.lng,
      selectedCity.name,
      method,
      isHanafi,
      hijriOffset
    )
  );

  // Save preferences
  useEffect(() => {
    try {
      localStorage.setItem('zikrmate_salat_city', JSON.stringify(selectedCity));
      localStorage.setItem('zikrmate_salat_method', JSON.stringify(method));
      localStorage.setItem('zikrmate_salat_hanafi', JSON.stringify(isHanafi));
      localStorage.setItem('zikrmate_hijri_offset', String(hijriOffset));
      localStorage.setItem('zikrmate_salat_alerts', JSON.stringify(activeAlerts));
    } catch {}
  }, [selectedCity, method, isHanafi, hijriOffset, activeAlerts]);

  // Recalculate prayer data every second for live countdown
  useEffect(() => {
    const updateTimes = () => {
      setPrayerData(
        calculatePrayerTimes(
          selectedCity.lat,
          selectedCity.lng,
          selectedCity.name,
          method,
          isHanafi,
          hijriOffset
        )
      );
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [selectedCity, method, isHanafi, hijriOffset]);

  // Compass handling (Device orientation or Touch Drag simulation)
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let heading = 0;
      if ((e as any).webkitCompassHeading !== undefined) {
        // iOS
        heading = (e as any).webkitCompassHeading;
      } else if (e.alpha !== null) {
        // Android (relative to magnetic north)
        heading = 360 - e.alpha;
      }
      setDeviceHeading(Math.round(heading));
      setHasCompassSensor(true);
    };

    if (isCompassActive) {
      if (typeof window !== 'undefined' && 'ondeviceorientation' in window) {
        // Request iOS 13+ permission if needed
        if (
          typeof (DeviceOrientationEvent as any).requestPermission === 'function'
        ) {
          (DeviceOrientationEvent as any)
            .requestPermission()
            .then((permissionState: string) => {
              if (permissionState === 'granted') {
                window.addEventListener('deviceorientation', handleOrientation);
              }
            })
            .catch(() => {});
        } else {
          window.addEventListener('deviceorientation', handleOrientation);
        }
      }
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isCompassActive]);

  // Audio for Adhan
  const adhanAudioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlayAdhan = (title: string = 'Adhan') => {
    if (!adhanAudioRef.current) {
      adhanAudioRef.current = new Audio(
        'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3'
      );
      adhanAudioRef.current.onended = () => setIsPlayingAdhan(false);
    }

    if (isPlayingAdhan) {
      adhanAudioRef.current.pause();
      setIsPlayingAdhan(false);
    } else {
      setActiveAdhanName(title);
      adhanAudioRef.current.currentTime = 0;
      adhanAudioRef.current.play().catch(() => {});
      setIsPlayingAdhan(true);
      if (soundEnabled) soundHaptics.playMilestone();
    }
  };

  // Toggle alert on prayer
  const toggleAlert = (name: string) => {
    setActiveAlerts((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
    if (soundEnabled) soundHaptics.playTap();
  };

  // Detect GPS
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const customCity: CityOption = {
          name: 'Current Location',
          country: 'Local GPS',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setSelectedCity(customCity);
        setIsLocating(false);
        if (soundEnabled) soundHaptics.playMilestone();
      },
      () => {
        setIsLocating(false);
        alert('Could not detect location. Please select your city from the list.');
      }
    );
  };

  // Filtered popular cities
  const filteredCities = POPULAR_CITIES.filter((c) =>
    c.name.toLowerCase().includes(citySearchQuery.toLowerCase()) ||
    c.country.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

  // Calculate sun position along quadratic curve
  // Curve points: P0 = (50, 150), P1 = (250, 15), P2 = (450, 150)
  // t is 0.0 at sunrise, 0.5 at solar noon, 1.0 at sunset
  const t = Math.max(0, Math.min(1, prayerData.sunProgressPercent / 100));
  const sunX = (1 - t) * (1 - t) * 50 + 2 * (1 - t) * t * 250 + t * t * 450;
  const sunY = (1 - t) * (1 - t) * 150 + 2 * (1 - t) * t * 15 + t * t * 150;

  // Qibla orientation angle relative to current phone direction
  const effectiveCompassAngle = isCompassActive
    ? (prayerData.qiblaBearing - deviceHeading + 360) % 360
    : (prayerData.qiblaBearing - manualCompassRotation + 360) % 360;

  const isFacingKaaba =
    Math.abs(effectiveCompassAngle) <= 6 ||
    Math.abs(effectiveCompassAngle - 360) <= 6;

  // Prayer Cards Data
  const prayerCards = [
    {
      name: 'Fajr',
      arabic: 'الفجر',
      description: 'Dawn Prayer',
      time: prayerData.fajr,
      timeWindow: `${prayerData.fajr} - ${prayerData.sunrise}`,
      icon: <Moon className="w-5 h-5 text-indigo-400" />,
      color: 'from-indigo-950/40 to-slate-900/60 border-indigo-500/30',
      activeColor: 'ring-2 ring-indigo-500 bg-indigo-950/70 border-indigo-500',
      isActive: prayerData.currentPrayerName === 'Fajr',
      isNext: prayerData.nextPrayerName === 'Fajr',
    },
    {
      name: 'Sunrise',
      arabic: 'الشروق',
      description: 'Sun Rising (Ishraq starts in 15m)',
      time: prayerData.sunrise,
      timeWindow: `${prayerData.sunrise} (Forbidden to pray during sunrise)`,
      icon: <SunriseIcon className="w-5 h-5 text-amber-400" />,
      color: 'from-amber-950/30 to-slate-900/60 border-amber-500/30',
      activeColor: 'ring-2 ring-amber-500 bg-amber-950/60 border-amber-500',
      isActive: prayerData.currentPrayerName === 'Duha',
      isNext: prayerData.nextPrayerName === 'Sunrise',
    },
    {
      name: 'Dhuhr',
      arabic: 'الظهر',
      description: 'Midday Prayer',
      time: prayerData.dhuhr,
      timeWindow: `${prayerData.dhuhr} - ${prayerData.asr}`,
      icon: <Sun className="w-5 h-5 text-amber-300" />,
      color: 'from-yellow-950/30 to-slate-900/60 border-yellow-500/30',
      activeColor: 'ring-2 ring-yellow-500 bg-yellow-950/60 border-yellow-500',
      isActive: prayerData.currentPrayerName === 'Dhuhr',
      isNext: prayerData.nextPrayerName === 'Dhuhr',
    },
    {
      name: 'Asr',
      arabic: 'العصر',
      description: isHanafi ? 'Afternoon (Hanafi)' : 'Afternoon (Standard/Shafi)',
      time: prayerData.asr,
      timeWindow: `${prayerData.asr} - ${prayerData.maghrib}`,
      icon: <Sun className="w-5 h-5 text-orange-400" />,
      color: 'from-orange-950/30 to-slate-900/60 border-orange-500/30',
      activeColor: 'ring-2 ring-orange-500 bg-orange-950/60 border-orange-500',
      isActive: prayerData.currentPrayerName === 'Asr',
      isNext: prayerData.nextPrayerName === 'Asr',
    },
    {
      name: 'Sunset / Maghrib',
      arabic: 'المغرب',
      description: 'Sunset Prayer',
      time: prayerData.sunsetRange,
      singleTime: prayerData.maghrib,
      timeWindow: `${prayerData.maghrib} - ${prayerData.isha}`,
      icon: <SunsetIcon className="w-5 h-5 text-rose-400" />,
      color: 'from-rose-950/30 to-slate-900/60 border-rose-500/30',
      activeColor: 'ring-2 ring-rose-500 bg-rose-950/60 border-rose-500',
      isActive: prayerData.currentPrayerName === 'Maghrib',
      isNext: prayerData.nextPrayerName === 'Maghrib',
    },
    {
      name: 'Isha',
      arabic: 'العشاء',
      description: 'Night Prayer',
      time: prayerData.isha,
      timeWindow: `${prayerData.isha} - Midnight (${prayerData.midnight})`,
      icon: <Moon className="w-5 h-5 text-blue-400" />,
      color: 'from-blue-950/30 to-slate-900/60 border-blue-500/30',
      activeColor: 'ring-2 ring-blue-500 bg-blue-950/60 border-blue-500',
      isActive: prayerData.currentPrayerName === 'Isha',
      isNext: prayerData.nextPrayerName === 'Isha',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto pb-10">
      {/* 1. TOP BAR & HIJRI DATE CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950/70 to-slate-900 rounded-3xl border border-emerald-500/30 p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Decorative subtle Islamic background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Location Selector Pill */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowSettingsDrawer(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 transition cursor-pointer active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {selectedCity.name}, {selectedCity.country}
              </span>
              <ChevronDown className="w-3 h-3 text-emerald-400 opacity-80" />
            </button>

            <button
              onClick={handleDetectLocation}
              disabled={isLocating}
              title="Detect Current GPS Location"
              className="p-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-emerald-400 hover:bg-slate-700 transition cursor-pointer active:scale-95"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-400 border border-slate-700/60">
              {isHanafi ? 'Hanafi' : 'Shafi'} • {method}
            </span>
          </div>

          {/* Quick Adhan & Settings Actions */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => togglePlayAdhan('Adhan Recitation')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer active:scale-95 shadow-md ${
                isPlayingAdhan
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
              }`}
            >
              {isPlayingAdhan ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Stop Adhan</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Play Adhan</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowSettingsDrawer(true)}
              title="Prayer Settings"
              className="p-2 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer active:scale-95"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Hijri & Gregorian Date Display */}
        <div className="mt-4 pt-4 border-t border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>{prayerData.hijriFormatted}</span>
            </div>
            <div className="text-xs sm:text-sm text-emerald-300/80 font-medium mt-0.5">
              {prayerData.gregorianFormatted}
            </div>
          </div>

          {/* Current Solar Status Pill */}
          <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-2xl px-3 py-2 text-xs">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
              {prayerData.isDaytime ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span>Daylight: {prayerData.daylightRemainingFormatted} left</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Night Phase • Tahajjud: {prayerData.tahajjud}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. SOLAR ARC & SUN TRACKER CARD (Centerpiece) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-emerald-500/30 p-5 sm:p-7 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Solar Trajectory &amp; Next Prayer
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {prayerData.isDaytime ? 'Sun in Sky' : 'After Sunset'}
          </span>
        </div>

        {/* Next Prayer Highlight Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-teal-950/80 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-lg">
          <div>
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
              Upcoming Salat • الصلاة القادمة
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-0.5 flex items-center justify-center sm:justify-start gap-2">
              <span>{prayerData.nextPrayerName}</span>
              <span className="font-arabic text-emerald-400 text-lg">({prayerData.nextPrayerArabic})</span>
              <span className="text-emerald-300 font-normal text-xl sm:text-2xl">
                {prayerData.nextPrayerFormattedTime}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold">
              <Clock className="w-4 h-4 animate-spin-slow text-emerald-400" />
              <span>In {prayerData.timeRemainingFormatted}</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Live second countdown</span>
          </div>
        </div>

        {/* Visual SVG Solar Arc */}
        <div className="relative w-full max-w-2xl mx-auto py-2">
          <svg
            viewBox="0 0 500 200"
            className="w-full h-auto overflow-visible select-none drop-shadow-md"
          >
            <defs>
              {/* Sky Arc Gradient */}
              <linearGradient id="skyArcGradient" x1="0%" y1="100%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.4" />
              </linearGradient>

              {/* Sky Fill under curve */}
              <linearGradient id="skyFillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
              </linearGradient>

              {/* Sun Radiant Glow */}
              <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
                <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Background Area under the Arc */}
            <path
              d="M 50 150 Q 250 15 450 150 L 450 155 L 50 155 Z"
              fill="url(#skyFillGradient)"
            />

            {/* Horizon Baseline */}
            <line
              x1="30"
              y1="150"
              x2="470"
              y2="150"
              stroke="#334155"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* The Solar Arc Path */}
            <path
              d="M 50 150 Q 250 15 450 150"
              fill="none"
              stroke="url(#skyArcGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Sunrise Point Marker (Left) */}
            <circle cx="50" cy="150" r="5" fill="#f59e0b" />
            <text
              x="50"
              y="172"
              textAnchor="middle"
              className="fill-amber-400 font-bold text-[11px]"
            >
              Sunrise
            </text>
            <text
              x="50"
              y="188"
              textAnchor="middle"
              className="fill-slate-300 text-[10px]"
            >
              {prayerData.sunrise}
            </text>

            {/* Solar Noon / Dhuhr Peak Marker (Apex) */}
            <circle cx="250" cy="82" r="4" fill="#10b981" />
            <text
              x="250"
              y="60"
              textAnchor="middle"
              className="fill-emerald-400 font-bold text-[11px]"
            >
              Solar Noon (Dhuhr)
            </text>
            <text
              x="250"
              y="74"
              textAnchor="middle"
              className="fill-slate-300 text-[10px]"
            >
              {prayerData.dhuhr}
            </text>

            {/* Sunset / Maghrib Point Marker (Right) */}
            <circle cx="450" cy="150" r="5" fill="#f43f5e" />
            <text
              x="450"
              y="172"
              textAnchor="middle"
              className="fill-rose-400 font-bold text-[11px]"
            >
              Sunset
            </text>
            <text
              x="450"
              y="188"
              textAnchor="middle"
              className="fill-slate-300 text-[10px]"
            >
              {prayerData.sunsetRange}
            </text>

            {/* Real-time Sun / Moon indicator moving along the trajectory */}
            {prayerData.isDaytime ? (
              <g transform={`translate(${sunX}, ${sunY})`} className="cursor-pointer">
                {/* Radiant Pulsing Sun Disk */}
                <circle cx="0" cy="0" r="22" fill="url(#sunGlow)" />
                <circle cx="0" cy="0" r="10" fill="#fef08a" stroke="#f59e0b" strokeWidth="2" />
                <circle cx="0" cy="0" r="16" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
              </g>
            ) : (
              /* Night Time Moon Marker */
              <g transform="translate(250, 150)">
                <circle cx="0" cy="0" r="12" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
                <path
                  d="M -3 -6 A 6 6 0 0 0 4 5 A 7 7 0 1 1 -3 -6"
                  fill="#c7d2fe"
                />
              </g>
            )}
          </svg>

          {/* Under Arc Stats Strip */}
          <div className="flex flex-wrap items-center justify-around gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
            <div className="px-3 py-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Daylight</span>
              <span className="text-xs font-extrabold text-amber-300">{prayerData.daylightTotalFormatted}</span>
            </div>
            <div className="px-3 py-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Remaining Daylight</span>
              <span className="text-xs font-extrabold text-emerald-300">{prayerData.daylightRemainingFormatted}</span>
            </div>
            <div className="px-3 py-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Salat Phase</span>
              <span className="text-xs font-extrabold text-white">{prayerData.currentPrayerName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PRAYER TIMINGS SCHEDULE CARDS (Precise Islamic App layout) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Today's Prescribed Prayers</span>
            <span className="text-xs font-normal text-emerald-400 font-arabic">مواقيت الصلوات الخمس</span>
          </h3>
          <span className="text-xs text-slate-400">All 5 Obligatory &amp; Solar Milestones</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {prayerCards.map((card) => {
            const hasAlert = activeAlerts[card.name] ?? false;

            return (
              <div
                key={card.name}
                className={`relative rounded-3xl p-4 transition-all duration-300 border bg-gradient-to-br ${
                  card.isActive
                    ? 'ring-2 ring-emerald-400/80 bg-slate-900 border-emerald-400/70 shadow-xl shadow-emerald-950/40 scale-102'
                    : card.isNext
                    ? 'bg-slate-900/90 border-emerald-500/50 hover:border-emerald-500/80'
                    : 'bg-slate-900/75 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Active or Next Tag */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                      {card.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{card.name}</span>
                        <span className="font-arabic text-emerald-400 text-xs font-normal">
                          {card.arabic}
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {/* Bell Alert Toggle */}
                  <button
                    onClick={() => toggleAlert(card.name)}
                    title={hasAlert ? `Disable ${card.name} notification` : `Enable ${card.name} notification`}
                    className={`p-2 rounded-full transition cursor-pointer active:scale-90 ${
                      hasAlert
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800/60 text-slate-500 border border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    {hasAlert ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Prayer Time Display */}
                <div className="mt-3 flex items-baseline justify-between">
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {card.time}
                  </div>

                  {/* Status Badge */}
                  {card.isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Active Now
                    </span>
                  ) : card.isNext ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                      Next Up
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">
                      Standard Window
                    </span>
                  )}
                </div>

                {/* Subtext info */}
                <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-800/60 pt-2 flex items-center justify-between">
                  <span>{card.timeWindow}</span>
                  {card.isActive && (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Time to Pray
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. MODERN QIBLA COMPASS CARD */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left max-w-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>Qibla Direction • اتجاه القبلة</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Facing the Holy Kaaba (الكعبة)
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              From <strong className="text-white">{selectedCity.name}</strong>, the Qibla bearing is{' '}
              <span className="text-emerald-400 font-bold text-sm">
                {prayerData.qiblaBearing}° {prayerData.qiblaCardinal}
              </span>{' '}
              from True North.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 font-medium">
                🕋 Distance: <strong className="text-emerald-300">{prayerData.kaabaDistanceKm.toLocaleString()} km</strong>
              </span>

              {isFacingKaaba && (
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold animate-bounce">
                  ✨ Perfectly Facing Kaaba!
                </span>
              )}
            </div>

            {/* Action Buttons for Compass */}
            <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
              <button
                onClick={() => {
                  setIsCompassActive(!isCompassActive);
                  if (soundEnabled) soundHaptics.playTap();
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold border transition cursor-pointer active:scale-95 shadow-lg ${
                  isCompassActive
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-950/50'
                    : 'bg-emerald-950/70 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/60'
                }`}
              >
                <Compass className={`w-4 h-4 ${isCompassActive ? 'animate-spin-slow' : ''}`} />
                <span>{isCompassActive ? 'Live Sensor Active' : 'Calibrate / Live Sensor'}</span>
              </button>

              {/* Manual rotate button for desktop testing */}
              <button
                onClick={() => {
                  setManualCompassRotation((prev) => (prev + 30) % 360);
                  if (soundEnabled) soundHaptics.playTap();
                }}
                title="Rotate Compass Test (+30°)"
                className="p-2 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white transition active:scale-90"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Tip: Hold device flat away from magnetic objects for optimal accuracy.
            </p>
          </div>

          {/* Visual Compass Dial */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 border-slate-800 bg-slate-950/90 flex items-center justify-center shadow-2xl p-2 select-none">
            {/* Outer Degree Markings Ring */}
            <div className="absolute inset-1 rounded-full border border-slate-800/60 pointer-events-none" />

            {/* Cardinal Points */}
            <span className="absolute top-2 text-xs font-black text-rose-400">N</span>
            <span className="absolute bottom-2 text-xs font-bold text-slate-400">S</span>
            <span className="absolute left-3 text-xs font-bold text-slate-400">W</span>
            <span className="absolute right-3 text-xs font-bold text-slate-400">E</span>

            {/* Kaaba Marker icon on perimeter at exact bearing */}
            <div
              className="absolute inset-0 flex items-start justify-center transition-transform duration-500 pointer-events-none"
              style={{ transform: `rotate(${prayerData.qiblaBearing}deg)` }}
            >
              <div className="flex flex-col items-center -mt-2">
                <span className="text-base" role="img" aria-label="Kaaba">
                  🕋
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 mt-0.5" />
              </div>
            </div>

            {/* Rotating Needle Pointer */}
            <div
              className="w-1.5 h-36 sm:h-44 rounded-full transition-transform duration-300 ease-out flex flex-col justify-between items-center z-10"
              style={{ transform: `rotate(${effectiveCompassAngle}deg)` }}
            >
              {/* North / Kaaba emerald pointer */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-0 h-0 border-l-[7px] border-r-[7px] border-b-[18px] border-transparent transition-colors ${
                    isFacingKaaba ? 'border-b-amber-300 scale-110 drop-shadow-md' : 'border-b-emerald-400'
                  }`}
                />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 -mt-1 shadow-md shadow-emerald-400/80" />
              </div>

              {/* South tail pointer */}
              <div className="flex flex-col items-center">
                <div className="w-1.5 h-8 bg-slate-600 rounded-full" />
              </div>
            </div>

            {/* Center Dial Hub */}
            <div className="absolute w-12 h-12 rounded-full bg-slate-900 border-2 border-emerald-500/60 flex flex-col items-center justify-center text-center shadow-lg z-20">
              <span className="text-[11px] font-black text-white leading-none">
                {prayerData.qiblaBearing}°
              </span>
              <span className="text-[8px] font-bold text-emerald-400 leading-none mt-0.5">
                {prayerData.qiblaCardinal}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. SETTINGS DRAWER / MODAL */}
      {showSettingsDrawer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Prayer Calculation Settings</h3>
              </div>
              <button
                onClick={() => setShowSettingsDrawer(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Search / Select City */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Choose Location
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search city (e.g. Dhaka, London, Makkah)..."
                  value={citySearchQuery}
                  onChange={(e) => setCitySearchQuery(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 mt-2">
                {filteredCities.map((city) => (
                  <button
                    key={`${city.name}-${city.country}`}
                    onClick={() => {
                      setSelectedCity(city);
                      setCitySearchQuery('');
                      if (soundEnabled) soundHaptics.playTap();
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                      selectedCity.name === city.name
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{city.name}</span>
                    <span className="text-[10px] text-slate-500">{city.country}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculation Method */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Calculation Method
              </label>
              <select
                value={method}
                onChange={(e: any) => setMethod(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Karachi">Univ. of Islamic Sciences Karachi (Hanafi standard)</option>
                <option value="MuslimWorldLeague">Muslim World League (MWL)</option>
                <option value="UmmAlQura">Umm Al-Qura (Makkah al-Mukarramah)</option>
                <option value="ISNA">ISNA (North America)</option>
                <option value="Egyptian">Egyptian General Authority of Survey</option>
              </select>
            </div>

            {/* Asr Juristic Method */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Asr Juristic Calculation
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsHanafi(false)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    !isHanafi
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  Standard (Shafi/Maliki/Hanbali)
                </button>
                <button
                  type="button"
                  onClick={() => setIsHanafi(true)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    isHanafi
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  Hanafi (Shadow x2)
                </button>
              </div>
            </div>

            {/* Hijri Adjustment Offset */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Hijri Calendar Date Offset
              </label>
              <div className="flex items-center justify-between bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-300">Adjust Days</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHijriOffset((prev) => Math.max(-2, prev - 1))}
                    className="w-6 h-6 rounded bg-slate-700 text-white font-bold flex items-center justify-center hover:bg-slate-600 active:scale-95"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-emerald-400 min-w-[2rem] text-center">
                    {hijriOffset > 0 ? `+${hijriOffset}` : hijriOffset}
                  </span>
                  <button
                    onClick={() => setHijriOffset((prev) => Math.min(2, prev + 1))}
                    className="w-6 h-6 rounded bg-slate-700 text-white font-bold flex items-center justify-center hover:bg-slate-600 active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSettingsDrawer(false)}
              className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition active:scale-95 cursor-pointer mt-4"
            >
              Done &amp; Apply Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
