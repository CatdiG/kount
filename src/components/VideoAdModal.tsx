'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, CheckCircle2, X, Sparkles, Volume2, VolumeX, ShieldCheck, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VideoAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdCompleted: () => void;
  rewardTitle?: string;
  adTitle?: string;
  adUnitIdMobile?: string;
  adUnitIdWeb?: string;
}

export default function VideoAdModal({
  isOpen,
  onClose,
  onAdCompleted,
  rewardTitle = '프리미엄 대화 분석 결과 및 전체 카드 잠금해제',
  adTitle = 'Kount 파트너스 동영상 스폰서 광고',
  adUnitIdMobile = 'ca-app-pub-3940256099942544/5224354917', // AdMob Rewarded Video Test ID
  adUnitIdWeb = 'ca-pub-1234567890123456',
}: VideoAdModalProps) {
  const [adState, setAdState] = useState<'loading' | 'playing' | 'completed'>('loading');
  const [countdown, setCountdown] = useState<number>(5); // 5초 시청 후 보상 지급
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. 광고 오픈 시 초기화 및 로드 처리
  useEffect(() => {
    if (!isOpen) {
      setAdState('loading');
      setCountdown(5);
      setProgress(0);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // 광고 로딩 모의 시뮬레이션 (1초 후 재생)
    const loadTimer = setTimeout(() => {
      setAdState('playing');
    }, 1000);

    return () => clearTimeout(loadTimer);
  }, [isOpen]);

  // 2. 동영상 광고 재생 타이머 & 프로그레스 바 연동
  useEffect(() => {
    if (adState !== 'playing') return;

    const totalSeconds = 5;
    const intervalTime = 100; // 0.1초 단위 업데이트
    let elapsed = 0;

    timerRef.current = setInterval(() => {
      elapsed += 0.1;
      const remaining = Math.max(0, Math.ceil(totalSeconds - elapsed));
      const currentProgress = Math.min(100, (elapsed / totalSeconds) * 100);

      setCountdown(remaining);
      setProgress(currentProgress);

      if (elapsed >= totalSeconds) {
        if (timerRef.current) clearInterval(timerRef.current);
        setAdState('completed');
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
        } catch (e) {}
      }
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [adState]);

  if (!isOpen) return null;

  const handleClaimReward = () => {
    onAdCompleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white">
        
        {/* 상단 뷰 헤더 */}
        <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded tracking-tighter uppercase">
              REWARD AD / 보상형 광고
            </span>
            <span className="text-xs font-bold text-slate-300 truncate max-w-[200px]">
              {adTitle}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. STATE: LOADING (광고 로딩 중) */}
        {adState === 'loading' && (
          <div className="p-12 flex flex-col items-center justify-center space-y-4 text-center min-h-[300px]">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-slate-200">
                동영상 광고를 안전하게 로드하고 있습니다...
              </p>
              <p className="text-xs text-slate-400">
                Google AdMob / AdSense 네트워크 준비 중
              </p>
            </div>
          </div>
        )}

        {/* 2. STATE: PLAYING (동영상 광고 재생 중) */}
        {adState === 'playing' && (
          <div className="relative flex flex-col min-h-[340px] bg-slate-950 overflow-hidden">
            {/* 동영상 가상 비주얼 플레이어 뷰 */}
            <div className="relative flex-1 flex flex-col justify-between p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950">
              {/* 상단 카운트다운 & 음소거 컨트롤 */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 shadow-xs">
                  <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                  <span className="text-xs font-black text-amber-300 font-mono">
                    {countdown > 0 ? `${countdown}초 후 보상 지급` : '시청 완료!'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* 중앙 브랜드 비주얼 카드 */}
              <div className="my-6 text-center space-y-3 z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-500 p-0.5 shadow-xl flex items-center justify-center">
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-black text-white tracking-tight">
                    Kount AI Premium Sponsor
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    광고 시청 혜택: {rewardTitle}
                  </p>
                </div>
              </div>

              {/* 하단 프로그레스 바 */}
              <div className="w-full z-10 space-y-1.5">
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-indigo-400 h-full transition-all duration-100 ease-linear rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 font-extrabold">
                  <span>PLAYING AD</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>

              {/* 동영상 애니메이션 오버레이 배경 */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        )}

        {/* 3. STATE: COMPLETED (시청 완료 & 보상 수령 준비) */}
        {adState === 'completed' && (
          <div className="p-8 flex flex-col items-center justify-center space-y-5 text-center bg-slate-900 min-h-[320px]">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-white">
                🎉 동영상 광고 시청 완료!
              </h3>
              <p className="text-xs text-slate-300 font-bold max-w-xs">
                [{rewardTitle}] 보상이 준비되었습니다. 버튼을 눌러 바로 혜택을 받으세요!
              </p>
            </div>

            <button
              onClick={handleClaimReward}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-100" />
              <span>보상 수령 및 혜택 잠금해제</span>
            </button>
          </div>
        )}

        {/* 하단 개발 및 AdMob / AdSense 연동 주석 가이드 */}
        <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex items-center justify-between">
          <span>Google AdMob Rewarded Video Ready</span>
          <span className="text-amber-400/90 font-bold">Capacitor & Web Auto Sync</span>
        </div>
      </div>
    </div>
  );
}
