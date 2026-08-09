'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Filter, RotateCcw } from 'lucide-react';

interface DateRangeFilterProps {
  minDateStr: string;
  maxDateStr: string;
  startDate: string;
  endDate: string;
  onRangeChange: (newStart: string, newEnd: string) => void;
  filteredCount: number;
  totalCount: number;
}

type PresetType = 'all' | 'lastWeek' | '7d' | '30d' | '90d' | 'custom';

export default function DateRangeFilter({
  minDateStr,
  maxDateStr,
  startDate,
  endDate,
  onRangeChange,
  filteredCount,
  totalCount,
}: DateRangeFilterProps) {
  const [selectedPreset, setSelectedPreset] = useState<PresetType | null>(null);

  const format = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Today-based Last Week Calculation (Monday ~ Sunday)
  const lastWeekRange = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

    // Calculate distance back to this week's Monday
    const distanceToThisMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const thisMonday = new Date(today);
    thisMonday.setDate(today.getDate() - distanceToThisMonday);

    // Last week Monday = this week Monday - 7 days
    const lastMonday = new Date(thisMonday);
    lastMonday.setDate(thisMonday.getDate() - 7);

    // Last week Sunday = last week Monday + 6 days
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);

    const startStr = format(lastMonday);
    const endStr = format(lastSunday);

    const startMonth = lastMonday.getMonth() + 1;
    const startDateNum = lastMonday.getDate();
    const endMonth = lastSunday.getMonth() + 1;
    const endDateNum = lastSunday.getDate();

    const label = `저번 주 (${startMonth}.${startDateNum}~${endMonth}.${endDateNum})`;

    return { startStr, endStr, label };
  }, []);

  // Sync active preset state with current startDate / endDate props
  const activePreset = useMemo<PresetType | null>(() => {
    if (!startDate && !endDate) {
      return null; // When no date range is explicitly selected, do NOT highlight '전체' or any button
    }
    if (startDate === minDateStr && endDate === maxDateStr) {
      return 'all';
    }
    if (startDate === lastWeekRange.startStr && endDate === lastWeekRange.endStr) {
      return 'lastWeek';
    }
    return selectedPreset || 'custom';
  }, [startDate, endDate, minDateStr, maxDateStr, selectedPreset, lastWeekRange]);

  if (!minDateStr || !maxDateStr || minDateStr === '-') return null;

  // Preset Handlers
  const handlePreset = (type: PresetType) => {
    setSelectedPreset(type);

    if (type === 'all') {
      onRangeChange(minDateStr, maxDateStr);
      return;
    }

    if (type === 'lastWeek') {
      onRangeChange(lastWeekRange.startStr, lastWeekRange.endStr);
      return;
    }

    const maxDate = new Date(maxDateStr);
    const days = type === '7d' ? 6 : type === '30d' ? 29 : 89;
    const start = new Date(maxDate);
    start.setDate(start.getDate() - days);

    const minDate = new Date(minDateStr);
    const effectiveStart = start < minDate ? minDate : start;

    onRangeChange(format(effectiveStart), maxDateStr);
  };

  const handleCustomDateChange = (newStart: string, newEnd: string) => {
    setSelectedPreset('custom');
    onRangeChange(newStart, newEnd);
  };

  const handleReset = () => {
    setSelectedPreset(null);
    onRangeChange('', '');
  };

  return (
    <div className="w-full my-3 bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-xs space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 flex-shrink-0">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
              분석 기간 선택
            </h3>
          </div>
        </div>

        {/* Filtered Messages Count Badge */}
        <div className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono flex-shrink-0">
          <span className="text-indigo-600 font-extrabold">{filteredCount.toLocaleString()}</span> / {totalCount.toLocaleString()}개
        </div>
      </div>

      {/* Quick Presets Grid */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 pb-1 text-xs overflow-x-auto scrollbar-none justify-between sm:justify-start">
          <button
            onClick={() => handlePreset('all')}
            className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg border whitespace-nowrap transition-all ${
              activePreset === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            전체
          </button>

          <button
            onClick={() => handlePreset('lastWeek')}
            className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg border whitespace-nowrap transition-all ${
              activePreset === 'lastWeek'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            월~일요일(해당주)
          </button>

          <button
            onClick={() => handlePreset('7d')}
            className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg border whitespace-nowrap transition-all ${
              activePreset === '7d'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            최근 7일
          </button>

          <button
            onClick={() => handlePreset('30d')}
            className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg border whitespace-nowrap transition-all ${
              activePreset === '30d'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            최근 30일
          </button>

          <button
            onClick={() => handlePreset('90d')}
            className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg border whitespace-nowrap transition-all ${
              activePreset === '90d'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            최근 90일
          </button>
        </div>

        {/* Custom Input Inputs & Reset Button */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs flex-1 min-w-[240px]">
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 flex-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <input
                type="date"
                value={startDate || ''}
                min={minDateStr}
                max={endDate || maxDateStr}
                onChange={(e) => handleCustomDateChange(e.target.value, endDate || maxDateStr)}
                className="bg-transparent border-0 text-[11px] font-mono font-bold text-slate-800 focus:outline-none w-full cursor-pointer"
              />
            </div>
            <span className="text-slate-400 font-bold text-xs">~</span>
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 flex-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <input
                type="date"
                value={endDate || ''}
                min={startDate || minDateStr}
                max={maxDateStr}
                onChange={(e) => handleCustomDateChange(startDate || minDateStr, e.target.value)}
                className="bg-transparent border-0 text-[11px] font-mono font-bold text-slate-800 focus:outline-none w-full cursor-pointer"
              />
            </div>
          </div>

          {(startDate || endDate) && (
            <button
              onClick={handleReset}
              className="px-2.5 py-1 text-[11px] font-extrabold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all flex items-center gap-1 active:scale-95 flex-shrink-0"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>초기화</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
