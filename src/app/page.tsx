'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { ParsingResult } from '@/types/chat';
import FileUploader from '@/components/FileUploader';
import DateRangeFilter from '@/components/DateRangeFilter';
import SummaryCards from '@/components/SummaryCards';
import KakaoTalkShareCard from '@/components/KakaoTalkShareCard';
import { MessageSquare, RefreshCw, Shield } from 'lucide-react';
import { readWebFileAsText } from '@/lib/filesystemUtils';
import { useChatData } from '@/context/ChatDataContext';
import { calculateChatStats } from '@/lib/statsCalculator';

export default function Home() {
  const {
    allMessages,
    parsingResult: rawParsingResult,
    isLoading,
    isUserUploaded,
    processChatText,
    clearData,
  } = useChatData();

  // Date Filtering State
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleProcessText = (rawText: string, fileName: string, triggerConfetti = true) => {
    setStartDate('');
    setEndDate('');
    processChatText(rawText, fileName, true);
    if (triggerConfetti) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  // Date-filtered calculation
  const parsingResult: ParsingResult | null = useMemo(() => {
    if (!allMessages || allMessages.length === 0) return null;

    if (!startDate && !endDate) {
      return rawParsingResult;
    }

    const filtered = allMessages.filter(
      (m) => (!startDate || m.dateStr >= startDate) && (!endDate || m.dateStr <= endDate)
    );

    return calculateChatStats(filtered);
  }, [allMessages, rawParsingResult, startDate, endDate]);

  const handleRangeChange = (newStart: string, newEnd: string) => {
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.csv';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const content = await readWebFileAsText(file);
          handleProcessText(content, file.name, true);
        } catch (err: any) {
          alert(`[파일 읽기 실패]\n${err?.message || String(err)}`);
        }
      }
    };
    input.click();
  };

  const handleResetToSample = () => {
    setStartDate('');
    setEndDate('');
    clearData();
  };

  const minDateStr = allMessages.length > 0 ? allMessages[0].dateStr : '';
  const maxDateStr = allMessages.length > 0 ? allMessages[allMessages.length - 1].dateStr : '';

  return (
    <div className="min-h-screen bg-slate-100 sm:py-8 flex flex-col items-center justify-start selection:bg-indigo-500 selection:text-white font-sans">
      {/* Clean User View Mobile / Responsive Container */}
      <main className="w-full sm:max-w-2xl bg-slate-50 min-h-screen sm:min-h-0 sm:rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col relative pb-12">
        {/* 1. Header Bar */}
        <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600 shadow-sm text-white">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
                Kount <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-extrabold border border-indigo-200">v1.0.0</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUserUploaded ? (
              <button
                onClick={handleResetToSample}
                className="flex items-center gap-1 text-xs font-extrabold px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>예시 데이터 보기</span>
              </button>
            ) : (
              <button
                onClick={handleFileSelect}
                className="flex items-center gap-1 text-xs font-extrabold px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>새 파일 업로드</span>
              </button>
            )}

            <Link
              href="/admin"
              className="flex items-center gap-1 text-xs font-extrabold px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 transition-all active:scale-95 shadow-xs"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>관리자 모드</span>
            </Link>
          </div>
        </header>

        {/* 2. 카카오톡 대화 내용 파일 (.txt / .csv) 업로드 박스 */}
        <section className="px-4 pt-4">
          <FileUploader
            onDataParsed={(rawText, fileName) => handleProcessText(rawText, fileName, true)}
          />
        </section>

        {/* 3. 분석 기간 필터 */}
        {allMessages.length > 0 && (
          <section className="px-4 pt-3">
            <DateRangeFilter
              minDateStr={minDateStr}
              maxDateStr={maxDateStr}
              startDate={startDate}
              endDate={endDate}
              onRangeChange={handleRangeChange}
              filteredCount={parsingResult?.totalMessages || 0}
              totalCount={allMessages.length}
            />
          </section>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="p-8 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-slate-700">대화 데이터를 분석하고 있습니다...</p>
          </div>
        )}

        {/* 4. 카카오톡 대화 분석 리포트 & 성향 분석 공유 */}
        {!isLoading && parsingResult && (
          <div className="space-y-6 pt-4">
            {/* 전체 대화 요약 카드 */}
            <section className="px-4">
              <SummaryCards parsingResult={parsingResult} />
            </section>

            {/* 카카오톡 대화 성향 분석 리포트 & 공유 카드 */}
            <section className="px-4 pb-4">
              <KakaoTalkShareCard parsingResult={parsingResult} />
            </section>

            {/* Footer */}
            <footer className="pt-4 text-center text-xs text-slate-400 font-medium space-y-1">
              <p>Kount 카카오톡 대화 분석기</p>
              <p className="text-[11px] text-slate-500 font-mono">App Version v1.0.0</p>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}
