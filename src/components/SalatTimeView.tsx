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
  CheckCircle,
  Navigation,
  Sun,
  Moon,
  Sunrise as SunriseIcon,
  Sunset as SunsetIcon,
} from 'lucide-react';
import { soundHaptics } from '../utils/audioHaptics';

interface SalatTimeViewProps {
  soundEnabled: boolean;
}

export const SalatTimeView: React.FC<SalatTimeViewProps> = ({ soundEnabled }) => {
  const [selectedCity, setSelectedCity] = useState<CityOption>(POPULAR_CITIES[0]); // Makkah default
  const [method, setMethod] = useState<'MuslimWorldLeague' | 'ISNA' | 'UmmAlQura' | 'Karachi' | 'Egyptian'>('MuslimWorldLeague');
  const [isHanafi, setIsHanafi] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isPlayingAdhan, setIsPlayingAdhan] = useState(false);

  // Prayer times state
  const [prayerData, setPrayerData] = useState<FormattedPrayerTimes>(() =>
    calculatePrayerTimes(selectedCity.lat, selectedCity.lng, selectedCity.name, method, isHanafi)
  );

  // Recalculate prayer data every second for live countdown
  useEffect(() => {
    const updateTimes = () => {
      setPrayerData(calculatePrayerTimes(selectedCity.lat, selectedCity.lng, selectedCity.name, method, isHanafi));
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [selectedCity, method, isHanafi]);

  // Audio for Adhan
  const adhanAudioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlayAdhan = () => {
    if (!adhanAudioRef.current) {
      adhanAudioRef.current = new Audio(
        'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3' // Clean fallback preview recitation
      );
      adhanAudioRef.current.onended = () => setIsPlayingAdhan(false);
    }

    if (isPlayingAdhan) {
      adhanAudioRef.current.pause();
      setIsPlayingAdhan(false);
    } else {
      adhanAudioRef.current.play().catch(() => {});
      setIsPlayingAdhan(true);
      if (soundEnabled) soundHaptics.playMilestone();
    }
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
          name: 'Your Current Location',
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
        alert('Could not access your location. Showing default city.');
      }
    );
  };

  const prayersList = [
    { name: 'Fajr', time: prayerData.fajr, icon: <Moon className="w-5 h-5 text-indigo-400" />, arabic: 'الفجر' },
    { name: 'Sunrise', time: prayerData.sunrise, icon: <SunriseIcon className="w-5 h-5 text-amber-400" />, arabic: 'الشروق' },
    { name: 'Dhuhr', time: prayerData.dhuhr, icon: <Sun className="w-5 h-5 text-amber-300" />, arabic: 'الظهر' },
    { name: 'Asr', time: prayerData.asr, icon: <Sun className="w-5 h-5 text-orange-400" />, arabic: 'العصر' },
    { name: 'Maghrib', time: prayerData.maghrib, icon: <SunsetIcon className="w-5 h-5 text-rose-400" />, arabic: 'المغرب' },
    { name: 'Isha', time: prayerData.isha, icon: <Moon className="w-5 h-5 text-blue-400" />, arabic: 'العشاء' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-teal-950/80 border border-emerald-500/30 p-5 sm:p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>مواقيت الصلاة • Prescribed Prayer Times</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Salat Times &amp; Qibla Direction
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Astronomical precision calculations based on official Islamic calculation methods with live second-by-second countdown.
            </p>
          </div>

          {/* Quick Adhan Button */}
          <button
            onClick={togglePlayAdhan}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold border transition active:scale-95 cursor-pointer shadow-lg ${
              isPlayingAdhan
                ? 'bg-rose-600/30 border-rose-500 text-rose-300'
                : 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300 hover:bg-emerald-600/40'
            }`}
          >
            {isPlayingAdhan ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isPlayingAdhan ? 'Stop Adhan' : 'Listen to Adhan'}</span>
          </button>
        </div>
      </div>

      {/* Primary Highlight Card: Next Prayer & Countdown */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-emerald-950 via-slate-900 to-teal-950 p-6 sm:p-8 border border-emerald-500/40 shadow-2xl text-center">
        <div className="text-xs font-bold tracking-widest text-emerald-400 uppercase mb-2">
          Next Prescribed Prayer
        </div>

        <div className="text-3xl sm:text-5xl font-black text-white tracking-tight flex items-center justify-center gap-3">
          <span>{prayerData.nextPrayerName}</span>
          <span className="text-emerald-400 font-normal text-2xl sm:text-4xl">
            {prayerData.nextPrayerFormattedTime}
          </span>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-semibold">
          <Clock className="w-4 h-4 animate-spin-slow" />
          <span>Time Remaining: {prayerData.timeRemainingFormatted}</span>
        </div>

        <div className="mt-3 text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>{selectedCity.name} ({selectedCity.country})</span>
        </div>
      </div>

      {/* Location & Calculation Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/90 p-4 rounded-3xl border border-slate-800">
        {/* City Select */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
            Select City
          </label>
          <select
            value={selectedCity.name}
            onChange={(e) => {
              const city = POPULAR_CITIES.find((c) => c.name === e.target.value) || POPULAR_CITIES[0];
              setSelectedCity(city);
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            {POPULAR_CITIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.country})
              </option>
            ))}
          </select>
        </div>

        {/* GPS Auto-detect */}
        <div className="flex flex-col justify-end">
          <button
            onClick={handleDetectLocation}
            disabled={isLocating}
            className="w-full flex items-center justify-center gap-2 bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-800/60 rounded-xl px-3 py-2 text-xs text-emerald-300 font-semibold transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'Auto-Detect My GPS'}</span>
          </button>
        </div>

        {/* Calculation Method */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
            Calculation Method
          </label>
          <select
            value={method}
            onChange={(e: any) => setMethod(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="MuslimWorldLeague">Muslim World League (MWL)</option>
            <option value="UmmAlQura">Umm Al-Qura (Makkah)</option>
            <option value="ISNA">ISNA (North America)</option>
            <option value="Egyptian">Egyptian General Authority</option>
            <option value="Karachi">Univ. of Islamic Sciences Karachi</option>
          </select>
        </div>
      </div>

      {/* Prayer Schedule Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
        {prayersList.map((prayer) => {
          const isNext = prayerData.nextPrayerName.includes(prayer.name);

          return (
            <div
              key={prayer.name}
              className={`p-4 rounded-2xl border text-center transition-all ${
                isNext
                  ? 'bg-gradient-to-b from-emerald-900/60 to-slate-900 border-emerald-500/60 shadow-xl shadow-emerald-950/40 scale-102'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-center mb-2">{prayer.icon}</div>
              <div className="font-arabic text-emerald-400 text-sm font-bold">
                {prayer.arabic}
              </div>
              <h4 className="text-xs font-bold text-white mt-0.5">{prayer.name}</h4>
              <div className="text-sm sm:text-base font-extrabold text-emerald-300 mt-2">
                {prayer.time}
              </div>
              {isNext && (
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  Next Up
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Qibla Direction Compass Section */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>Qibla Direction (اتجاه القبلة)</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Facing the Holy Kaaba (الكعبة المشرفة)
          </h3>
          <p className="text-xs text-slate-400 max-w-md">
            From {selectedCity.name}, the Qibla bearing is calculated at{' '}
            <span className="text-emerald-400 font-bold">{prayerData.qiblaBearing}° from True North</span>.
          </p>
        </div>

        {/* Visual Compass Dial */}
        <div className="relative w-36 h-36 rounded-full border-4 border-slate-800 bg-slate-950/80 flex items-center justify-center shadow-inner">
          {/* Compass Rose Markings */}
          <span className="absolute top-1 text-[10px] font-bold text-slate-400">N</span>
          <span className="absolute bottom-1 text-[10px] font-bold text-slate-400">S</span>
          <span className="absolute left-2 text-[10px] font-bold text-slate-400">W</span>
          <span className="absolute right-2 text-[10px] font-bold text-slate-400">E</span>

          {/* Compass Pointer Needle pointing to Qibla */}
          <div
            className="w-1 h-24 rounded-full transition-transform duration-700 ease-out flex flex-col justify-between items-center"
            style={{ transform: `rotate(${prayerData.qiblaBearing}deg)` }}
          >
            <div className="w-3 h-3 border-l-4 border-r-4 border-b-8 border-transparent border-b-emerald-400 -mt-1" />
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
            <div className="w-2 h-6 bg-slate-600 rounded-full" />
          </div>

          <div className="absolute font-bold text-xs text-emerald-300">
            {prayerData.qiblaBearing}°
          </div>
        </div>
      </div>
    </div>
  );
};
