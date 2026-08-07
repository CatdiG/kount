'use client';

import React from 'react';
import { ParsingResult } from '@/types/chat';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Clock, Sparkles } from 'lucide-react';

interface ChatChartsProps {
  parsingResult: ParsingResult;
  isCapture?: boolean;
}

export default function ChatCharts({ parsingResult, isCapture = false }: ChatChartsProps) {
  const { hourlyDistribution, topKeywords } = parsingResult;

  const captureWidth = 405;
  const captureHeight = 175;

  const formatXAxisHour = (hourVal: any) => {
    const h = Number(hourVal);
    return `${h}시`;
  };

  const timeTicks = [0, 3, 6, 9, 12, 15, 18, 21];

  return (
    <div className={`w-full ${isCapture ? 'space-y-3' : 'max-w-6xl mx-auto space-y-4'}`}>
      <div className={isCapture ? 'space-y-3' : 'space-y-4'}>
        {/* Chart 1: 24시간대별 대화 분포 */}
        <div className={`rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center ${isCapture ? 'p-3.5' : 'p-4 sm:p-5'}`}>
          <div className={`flex items-center gap-1.5 w-full justify-center text-center ${isCapture ? 'mb-2' : 'mb-3'}`}>
            <Clock className={`${isCapture ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-indigo-600 flex-shrink-0`} />
            <h3 className={`${isCapture ? 'text-xs font-extrabold' : 'text-sm sm:text-base font-bold'} text-slate-900`}>24시간대별 채팅 타임라인</h3>
          </div>
          <div className={`${isCapture ? 'w-[405px] h-[175px]' : 'h-64 w-full'} flex items-center justify-center`}>
            {isCapture ? (
              <AreaChart width={captureWidth} height={captureHeight} data={hourlyDistribution} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHourlyLightCap" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" ticks={timeTicks} tickFormatter={formatXAxisHour} stroke="#64748b" fontSize={8} />
                <YAxis stroke="#64748b" fontSize={8} />
                {/* 9시 & 18시 연한 빨간 세로 점선 */}
                <ReferenceLine x={9} stroke="#f87171" strokeDasharray="3 3" strokeWidth={1.5} />
                <ReferenceLine x={18} stroke="#f87171" strokeDasharray="3 3" strokeWidth={1.5} />
                <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHourlyLightCap)" />
              </AreaChart>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHourlyLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="hour" ticks={timeTicks} tickFormatter={formatXAxisHour} stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  {/* 9시 & 18시 연한 빨간 세로 점선 */}
                  <ReferenceLine x={9} stroke="#f87171" strokeDasharray="3 3" strokeWidth={1.5} />
                  <ReferenceLine x={18} stroke="#f87171" strokeDasharray="3 3" strokeWidth={1.5} />
                  <Tooltip
                    formatter={(val: any) => [`${val ?? 0}개 메시지`, '채팅 수']}
                    labelFormatter={(label: any) => `시간대: ${formatXAxisHour(label)}`}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#cbd5e1',
                      borderRadius: '0.75rem',
                      color: '#0f172a',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorHourlyLight)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: 최다 사용 키워드 Top 20 */}
        <div className={`rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between ${isCapture ? 'p-3.5' : 'p-4 sm:p-5'}`}>
          <div className={`flex items-center gap-1.5 w-full justify-center text-center ${isCapture ? 'mb-2' : 'mb-3'}`}>
            <Sparkles className={`${isCapture ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-amber-500 flex-shrink-0`} />
            <h3 className={`${isCapture ? 'text-xs font-extrabold' : 'text-sm sm:text-base font-bold'} text-slate-900`}>
              최다 사용 키워드 Top 20
            </h3>
            <Sparkles className={`${isCapture ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-amber-500 flex-shrink-0`} />
          </div>
          <div className={`flex flex-wrap items-center justify-center ${isCapture ? 'gap-1.5 py-1.5' : 'gap-2 py-3'}`}>
            {topKeywords.length === 0 ? (
              <p className="text-slate-400 text-xs italic">키워드가 추출되지 않았습니다.</p>
            ) : (
              topKeywords.slice(0, 20).map((kw, i) => {
                const sizes = isCapture
                  ? ['text-[10px]', 'text-[10px] font-bold', 'text-[11px] font-bold', 'text-xs font-bold']
                  : ['text-xs', 'text-xs font-bold', 'text-sm font-bold', 'text-base font-bold'];
                const fontClass = sizes[Math.min(Math.floor(kw.value / 3), 3)];
                const badgeGradients = [
                  'bg-indigo-50 text-indigo-700 border-indigo-200',
                  'bg-purple-50 text-purple-700 border-purple-200',
                  'bg-pink-50 text-pink-700 border-pink-200',
                  'bg-amber-50 text-amber-800 border-amber-200',
                  'bg-emerald-50 text-emerald-800 border-emerald-200',
                ];
                const grad = badgeGradients[i % badgeGradients.length];

                return (
                  <span
                    key={kw.text}
                    className={`${isCapture ? 'px-2 py-0.8 rounded-lg' : 'px-2.5 py-1 rounded-xl'} border ${grad} ${fontClass} transition-transform cursor-default`}
                  >
                    #{kw.text} ({kw.value})
                  </span>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
