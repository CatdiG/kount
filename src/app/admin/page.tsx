'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FileUploader from '@/components/FileUploader';
import DateRangeFilter from '@/components/DateRangeFilter';
import SummaryCards from '@/components/SummaryCards';
import KakaoTalkShareCard from '@/components/KakaoTalkShareCard';
import { useChatData } from '@/context/ChatDataContext';
import { calculateChatStats } from '@/lib/statsCalculator';
import { ParsingResult } from '@/types/chat';
import { checkAndRequestPermissions, testFileAccessPermission, testInternetConnection } from '@/lib/filesystemUtils';
import { Settings, Shield, FileText, Download, Trash2, ArrowLeft, Layers, Lock } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  const {
    allMessages,
    parsingResult: rawParsingResult,
    parseDiag,
    activeFileName,
    isLoading,
    processChatText,
    clearData,
  } = useChatData();

  const [diagStatus, setDiagStatus] = useState<string | null>(null);
  const [showIgnoredModal, setShowIgnoredModal] = useState<boolean>(false);

  // Date Filtering State in Admin View
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // 🔒 Admin authorization check
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const hasAdminParam = params.get('admin') === 'true' || params.get('mode') === 'admin';

    if (hasAdminParam) {
      localStorage.setItem('kount_admin_auth', 'true');
    }

    const storedAuth = localStorage.getItem('kount_admin_auth') === 'true';
    if (!storedAuth) {
      alert('🔒 관리자 접근 권한이 없습니다. 일반 사용자 화면으로 이동합니다.');
      router.replace('/');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  const handleDisableAdminAccess = () => {
    if (confirm('관리자 인증 신호를 삭제하고 일반 사용자 모드로 전환하시겠습니까?')) {
      localStorage.removeItem('kount_admin_auth');
      router.replace('/');
    }
  };

  const handleProcessText = async (rawText: string, fileName: string, isFromUpload: boolean = false) => {
    try {
      await checkAndRequestPermissions();
    } catch {
      // Permission request fallback
    }
    processChatText(rawText, fileName, isFromUpload);
  };

  const handleTestFileAccess = async () => {
    setDiagStatus('📂 파일 읽기 권한 검사 중...');
    try {
      const result = await testFileAccessPermission();
      const msg = `성공: ${result.message}`;
      setDiagStatus(`✅ ${msg}`);
      alert(msg);
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      setDiagStatus(`❌ 실패: ${errMsg}`);
      alert(`[파일 읽기 접근 실패]\n\n${errMsg}`);
    }
  };

  const handleTestInternet = async () => {
    setDiagStatus('🌐 인터넷 연결 상태 검사 중...');
    try {
      const result = await testInternetConnection();
      const msg = `성공: ${result.message}`;
      setDiagStatus(`✅ ${msg}`);
      alert(msg);
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      setDiagStatus(`❌ 실패: ${errMsg}`);
      alert(`[인터넷 통신 실패]\n\n${errMsg}`);
    }
  };

  const handleDownloadIgnoredLines = () => {
    if (!parseDiag || !parseDiag.allIgnoredLines) return;
    const content = parseDiag.allIgnoredLines
      .map((item) => `[Line ${item.lineNumber}] [${item.reason}] ${item.content}`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kount_admin_ignored_lines_${activeFileName || 'chat'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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

  const minDateStr = allMessages.length > 0 ? allMessages[0].dateStr : '';
  const maxDateStr = allMessages.length > 0 ? allMessages[allMessages.length - 1].dateStr : '';

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-slate-300 space-y-3 font-mono text-xs">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-slate-200">🔒 관리자 인증 권한 확인 중...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 pb-16 bg-slate-950 text-slate-100 min-h-screen">
      {/* 1. Admin Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white flex items-center gap-1.5">
                Kount 관리자 콘솔 <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">v1.0.0</span>
              </h1>
              <p className="text-[11px] text-slate-400">
                실시간 진단 리포트, 전수 라인 정산 및 전체 통계 통합 화면
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDisableAdminAccess}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-950/90 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-bold transition-all border border-rose-800/80 active:scale-95 cursor-pointer"
              title="관리자 인증 신호 삭제 및 사용자 모드 전환"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>관리자 모드 해제</span>
            </button>

            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              사용자 뷰 보기
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-6 pt-4">
        {/* Admin Diagnostic Test Tools */}
        <section className="px-4">
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-amber-400" />
                시스템 연결 & 파일 접근성 디버깅 도구
              </h2>
              {diagStatus && (
                <span className="text-[11px] text-amber-300 font-mono">
                  {diagStatus}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleTestFileAccess}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
              >
                📂 파일 읽기 권한 테스트
              </button>
              <button
                onClick={handleTestInternet}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
              >
                🌐 인터넷 통신 연결 테스트
              </button>
              {activeFileName && (
                <button
                  onClick={clearData}
                  className="py-2 px-3 bg-rose-950/80 hover:bg-rose-900 active:scale-95 text-rose-300 text-xs font-bold rounded-xl border border-rose-800/80 transition-all flex items-center gap-1.5 ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  데이터 초기화
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 2. 카카오톡 대화 내용 파일 (.txt / .csv) 업로드 박스 */}
        <section className="px-4">
          <FileUploader
            onDataParsed={(rawText, fileName) => handleProcessText(rawText, fileName, true)}
          />
        </section>

        {/* 3. Live Parsing Diagnostic Report Card (분석 기간 선택 바로 위로 이동 완료!) */}
        {parseDiag && (
          <section className="px-4">
            <div className="p-4 bg-slate-900 text-white rounded-3xl shadow-xl border border-slate-700 text-xs font-mono space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                  🔍 파싱 실시간 정밀 진단 리포트 (Admin)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  F12 DevTools Console 동기화
                </span>
              </div>

              {/* 5-Category Line Accounting Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-300 pt-1">
                <div className="p-2 bg-slate-950/70 rounded-xl border border-slate-800">
                  📄 파일 총 줄 수: <strong className="text-white block text-sm">{parseDiag.totalLines.toLocaleString()}줄</strong>
                </div>
                <div className="p-2 bg-slate-950/70 rounded-xl border border-slate-800">
                  💬 수집 완료 대화: <strong className="text-emerald-400 block text-sm">{parseDiag.parsedMessagesCount.toLocaleString()}개</strong>
                </div>
                <div className="p-2 bg-slate-950/70 rounded-xl border border-slate-800">
                  📊 본문 줄바꿈 연결: <strong className="text-purple-300 block text-sm">{parseDiag.multiLineContinuationCount.toLocaleString()}줄</strong>
                </div>
                <div className="p-2 bg-slate-950/70 rounded-xl border border-slate-800">
                  📢 시스템공지/구분선: <strong className="text-amber-300 block text-sm">{parseDiag.totalSystemNoticesCount.toLocaleString()}줄</strong>
                </div>
                <div className="p-2 bg-slate-950/70 rounded-xl border border-slate-800">
                  🌫️ 빈 줄 (Empty Lines): <strong className="text-slate-400 block text-sm">{parseDiag.emptyLinesCount.toLocaleString()}줄</strong>
                </div>
                <div className="p-2 bg-slate-950/70 rounded-xl border border-slate-800">
                  ⚠️ 실제 누락 대화: <strong className={parseDiag.unmatchedDiscardedCount > 0 ? "text-rose-400 block text-sm" : "text-emerald-400 block text-sm"}>{parseDiag.unmatchedDiscardedCount > 0 ? `${parseDiag.unmatchedDiscardedCount}줄` : '0줄 (완벽)'}</strong>
                </div>
              </div>

              {/* Mathematical Line Accounting Formula Box */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-amber-500/30 text-[11px] text-slate-200 leading-relaxed">
                <div className="font-bold text-amber-300 mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  📐 [100% 라인 정산 및 무결성 검증 수식]
                </div>
                <div className="font-mono text-emerald-300">
                  총 {parseDiag.totalLines.toLocaleString()}줄 = 대화({parseDiag.parsedMessagesCount.toLocaleString()}) + 줄바꿈({parseDiag.multiLineContinuationCount.toLocaleString()}) + 공지/구분선({parseDiag.totalSystemNoticesCount.toLocaleString()}) + 빈줄({parseDiag.emptyLinesCount.toLocaleString()}) + 누락({parseDiag.unmatchedDiscardedCount})
                </div>
                <div className="text-[10px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800 flex flex-wrap gap-x-3 gap-y-1">
                  <span>• 날짜구분선: <strong className="text-sky-300">{parseDiag.dateHeaderLinesCount.toLocaleString()}줄</strong></span>
                  <span>• 입퇴장/삭제알림: <strong className="text-rose-300">{parseDiag.filteredSystemMessageMatchesCount.toLocaleString()}줄</strong></span>
                  <span>• 메타배너/타이틀: <strong className="text-slate-300">{parseDiag.systemBannerLinesCount.toLocaleString()}줄</strong></span>
                </div>
              </div>

              {parseDiag.firstParsedMessage && parseDiag.lastParsedMessage && (
                <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px]">
                  <div className="text-sky-300 font-bold flex items-start gap-1.5">
                    <span className="shrink-0">📌 [파일 시작 첫 대화]:</span>
                    <span className="text-slate-200 font-normal break-all line-clamp-1">
                      {parseDiag.firstParsedMessage.dateStr} {parseDiag.firstParsedMessage.timeStr} | [{parseDiag.firstParsedMessage.nickname}]: &quot;{parseDiag.firstParsedMessage.content}&quot;
                    </span>
                  </div>
                  <div className="text-emerald-300 font-bold flex items-start gap-1.5">
                    <span className="shrink-0">🏁 [파일 마지막 EOF 대화]:</span>
                    <span className="text-slate-200 font-normal break-all line-clamp-1">
                      {parseDiag.lastParsedMessage.dateStr} {parseDiag.lastParsedMessage.timeStr} | [{parseDiag.lastParsedMessage.nickname}]: &quot;{parseDiag.lastParsedMessage.content}&quot;
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons for Full Audit */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowIgnoredModal(true)}
                  className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <FileText className="w-3.5 h-3.5" />
                  📋 무시/제외 라인 모달 보기 ({parseDiag.allIgnoredLines.length.toLocaleString()}개)
                </button>
                <button
                  onClick={handleDownloadIgnoredLines}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  📥 제외 라인 TXT 다운로드
                </button>
              </div>

              {/* Inline Scrollable List of All System Notices & Dividers */}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2 text-xs font-bold text-amber-300">
                  <span>📢 시스템공지/구분선 전체 목록 ({parseDiag.allIgnoredLines.length.toLocaleString()}줄 전수 노출)</span>
                  <span className="text-[10px] text-slate-400 font-normal">위아래로 스크롤하여 전체 확인 가능</span>
                </div>
                <div className="flex flex-col gap-1 text-[11px] text-slate-300 bg-black/80 p-3 rounded-2xl border border-slate-800 overflow-y-auto max-h-64">
                  {parseDiag.allIgnoredLines.map((item, idx) => (
                    <div key={idx} className="break-all border-b border-slate-800/60 pb-1.5 last:border-0 last:pb-0 font-mono flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold shrink-0">[줄 {item.lineNumber}]</span>
                      <span className={
                        item.reason === 'DATE_HEADER'
                          ? 'text-sky-400 font-semibold shrink-0'
                          : item.reason === 'SYSTEM_NOTICE'
                          ? 'text-slate-400 font-semibold shrink-0'
                          : 'text-rose-400 font-bold shrink-0'
                      }>
                        [{item.reason}]
                      </span>
                      <span className="text-slate-200">{item.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. 분석 기간 필터 (파싱 정밀 진단 리포트 바로 아래 위치!) */}
        {allMessages.length > 0 && (
          <section className="px-4">
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

        {/* 5. 카카오톡 대화 분석 리포트 & 성향 분석 공유 */}
        {!isLoading && parsingResult && (
          <div className="space-y-6 text-slate-900">
            <div className="px-4">
              <div className="py-2 px-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs font-bold flex items-center justify-between">
                <span>📊 사용자 리포트 및 통계 화면 (관리자 동기화 보기)</span>
                <span className="text-[10px] text-amber-400">v1.0.0</span>
              </div>
            </div>

            {/* 전체 대화 요약 카드 */}
            <section className="px-4">
              <SummaryCards parsingResult={parsingResult} />
            </section>

            {/* 카카오톡 대화 성향 분석 리포트 & 공유 카드 */}
            <section className="px-4 pb-4">
              <KakaoTalkShareCard parsingResult={parsingResult} />
            </section>
          </div>
        )}

        {/* Ignored Lines Audit Modal */}
        {showIgnoredModal && parseDiag && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 text-white rounded-3xl border border-slate-700 w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <div>
                  <h3 className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                    📋 무시/제외된 전체 라인 투명 감사 모달
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    총 {parseDiag.allIgnoredLines.length.toLocaleString()}개 제외 라인 (날짜구분선/시스템공지/미인식)
                  </p>
                </div>
                <button
                  onClick={() => setShowIgnoredModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 overflow-y-auto flex-1 flex flex-col gap-1.5 bg-black/50 text-[11px]">
                {parseDiag.allIgnoredLines.map((item, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 break-all leading-snug">
                    <span className="text-amber-400 font-bold mr-1.5">[Line {item.lineNumber}]</span>
                    <span className={
                      item.reason === 'DATE_HEADER'
                        ? 'text-sky-400 px-1.5 py-0.5 rounded bg-sky-950 mr-1.5 font-sans font-semibold'
                        : item.reason === 'SYSTEM_NOTICE'
                        ? 'text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 mr-1.5 font-sans font-semibold'
                        : 'text-rose-400 px-1.5 py-0.5 rounded bg-rose-950 mr-1.5 font-sans font-bold'
                    }>
                      {item.reason}
                    </span>
                    <span className="text-slate-200">{item.content}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-2">
                <button
                  onClick={handleDownloadIgnoredLines}
                  className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  📥 TXT 파일로 다운로드
                </button>
                <button
                  onClick={() => setShowIgnoredModal(false)}
                  className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer with v1.0.0 */}
        <footer className="pt-8 text-center text-xs text-slate-500 font-medium space-y-1">
          <p>Kount 카카오톡 대화 분석기 Admin Console</p>
          <p className="text-[11px] text-amber-500/80 font-mono">App Version v1.0.0</p>
        </footer>
      </div>
    </main>
  );
}
