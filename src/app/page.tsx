'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { ParsingResult } from '@/types/chat';
import FileUploader from '@/components/FileUploader';
import DateRangeFilter from '@/components/DateRangeFilter';
import SummaryCards from '@/components/SummaryCards';
import KakaoTalkShareCard from '@/components/KakaoTalkShareCard';
import BottomAdBanner from '@/components/BottomAdBanner';
import { RefreshCw, Shield } from 'lucide-react';
import { readWebFileAsText } from '@/lib/filesystemUtils';
import { useChatData } from '@/context/ChatDataContext';
import { calculateChatStats } from '@/lib/statsCalculator';

/**
 * 🔑 [관리자 모드 (Admin Mode) 인증 및 접속 가이드]
 * 일반 사용자 화면에서는 관리자 메뉴/버튼이 절대 표시되지 않습니다.
 *
 * 📌 관리자 모드 활성화 (ON) 테스트 방법 (3가지 중 편한 방법 사용):
 * 1. URL 접속: 브라우저 주소창에 `http://localhost:3000/?admin=true` 로 접속
 * 2. F12 개발자도구 콘솔: `enableKountAdmin()` 실행
 * 3. 로컬스토리지 설정: `localStorage.setItem('kount_admin_auth', 'true')` 입력 후 새로고침
 *
 * 🔒 관리자 모드 비활성화 (OFF) 방법:
 * 1. F12 개발자도구 콘솔: `disableKountAdmin()` 실행
 * 2. 로컬스토리지 삭제: `localStorage.removeItem('kount_admin_auth')` 입력 후 새로고침
 */
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

  // Admin authorization state (hidden by default for regular users)
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const adminParam = params.get('admin');

    // 1. URL 파라미터가 ?admin=false / ?admin=off / ?admin=clear 일 경우 로컬스토리지 인증 제거
    if (adminParam === 'false' || adminParam === 'off' || adminParam === 'clear') {
      localStorage.removeItem('kount_admin_auth');
      setIsAdminAuthorized(false);
    } 
    // 2. URL 파라미터가 ?admin=true 또는 ?mode=admin 일 경우 로컬스토리지 인증 저장
    else if (adminParam === 'true' || adminParam === '1' || params.get('mode') === 'admin') {
      localStorage.setItem('kount_admin_auth', 'true');
      setIsAdminAuthorized(true);
    } 
    // 3. 일반 접속 시 브라우저 로컬스토리지의 kount_admin_auth 검사
    else {
      const isAuth = localStorage.getItem('kount_admin_auth') === 'true';
      setIsAdminAuthorized(isAuth);
    }

    // F12 개발자도구 콘솔 헬퍼 함수
    (window as any).enableKountAdmin = () => {
      localStorage.setItem('kount_admin_auth', 'true');
      console.log('✅ [Kount] 관리자 인증이 활성화되었습니다.');
      window.location.href = '/?admin=true';
    };

    (window as any).disableKountAdmin = () => {
      localStorage.removeItem('kount_admin_auth');
      console.log('🔒 [Kount] 관리자 인증이 해제되었습니다.');
      window.location.href = '/?admin=clear';
    };
  }, []);

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

  // Date-filtered calculation (User Mode only calculates when user uploaded data exists)
  const parsingResult: ParsingResult | null = useMemo(() => {
    if (!isUserUploaded || !allMessages || allMessages.length === 0) return null;

    if (!startDate && !endDate) {
      return rawParsingResult;
    }

    const filtered = allMessages.filter(
      (m) => (!startDate || m.dateStr >= startDate) && (!endDate || m.dateStr <= endDate)
    );

    return calculateChatStats(filtered);
  }, [isUserUploaded, allMessages, rawParsingResult, startDate, endDate]);

  const handleRangeChange = (newStart: string, newEnd: string) => {
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  const handleResetToSample = () => {
    setStartDate('');
    setEndDate('');
    clearData();
  };

  const minDateStr = isUserUploaded && allMessages.length > 0 ? allMessages[0].dateStr : '';
  const maxDateStr = isUserUploaded && allMessages.length > 0 ? allMessages[allMessages.length - 1].dateStr : '';

  return (
    <div className="min-h-screen bg-slate-100 sm:py-8 flex flex-col items-center justify-start selection:bg-indigo-500 selection:text-white font-sans">
      {/* Clean User View Mobile / Responsive Container */}
      <main className="w-full sm:max-w-2xl bg-slate-50 min-h-screen sm:min-h-0 sm:rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col relative">
        {/* 1. Header Bar */}
        <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3 flex items-center justify-between shadow-2xs header-safe-padding">
          <div className="flex items-center gap-2">
            <Image
              src="/kount-app-logo.png"
              alt="Kount 앱 로고"
              width={32}
              height={32}
              className="object-contain flex-shrink-0"
              unoptimized
            />
            <div>
              <h1 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
                Kount <span className="text-xs text-slate-500 font-bold">(카카오톡 대화 분석기)</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUserUploaded && (
              <button
                onClick={handleResetToSample}
                className="flex items-center gap-1 text-xs font-extrabold px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>데이터 초기화</span>
              </button>
            )}

            {/* 관리자 인증 신호가 저장된 디바이스/브라우저에만 관리자 모드 버튼 노출 */}
            {isAdminAuthorized && (
              <Link
                href="/admin"
                className="flex items-center gap-1 text-xs font-extrabold px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 transition-all active:scale-95 shadow-xs"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>관리자 모드</span>
              </Link>
            )}
          </div>
        </header>

        {/* 2. 대화 파일 업로드 / '공유한 대화가 없습니다.' 카드 */}
        {!isUserUploaded && (
          <section className="px-4 pt-6 flex-1 flex flex-col justify-center items-center">
            <FileUploader
              onDataParsed={(rawText, fileName) => handleProcessText(rawText, fileName, true)}
            />
          </section>
        )}

        {/* 3. 분석 기간 필터 */}
        {isUserUploaded && allMessages.length > 0 && (
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
          <div className="p-8 text-center space-y-3 flex-1 flex flex-col justify-center items-center">
            <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-slate-700">대화 데이터를 분석하고 있습니다...</p>
          </div>
        )}

        {/* 4. 카카오톡 대화 분석 리포트 & 성향 분석 공유 */}
        {!isLoading && isUserUploaded && parsingResult && (
          <div className="space-y-3 pt-[9px] flex-1">
            {/* 전체 대화 요약 카드 */}
            <section className="px-4">
              <SummaryCards parsingResult={parsingResult} />
            </section>

            {/* 카카오톡 대화 성향 분석 리포트 & 공유 카드 */}
            <section className="px-4">
              <KakaoTalkShareCard parsingResult={parsingResult} />
            </section>
          </div>
        )}

        {/* Footer (웹 뷰 클린 패딩 적용) */}
        <footer className="pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,12px))] text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5 mt-auto flex-shrink-0">
          <img src="/kount-logo-trans.png" alt="Kount Logo" className="w-[18px] h-[18px] object-contain flex-shrink-0" />
          <span>Kount 카카오톡 대화 분석기</span>
        </footer>
      </main>

      {/* 📢 화면 최하단 고정 배너 광고 (Web Google AdSense & Mobile AdMob 고정 배너) */}
      <BottomAdBanner />
    </div>
  );
}
