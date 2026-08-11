'use client';

import React, { useEffect, useState } from 'react';
import { Megaphone, ExternalLink, X } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

interface BottomAdBannerProps {
  /** 구글 애드센스 클라이언트 ID (예: ca-pub-XXXXXXXXXXXXXXXX) */
  adSenseClient?: string;
  /** 구글 애드센스 슬롯 ID (예: 1234567890) */
  adSenseSlot?: string;
}

export default function BottomAdBanner({
  adSenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-1234567890123456',
  adSenseSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT || '1234567890',
}: BottomAdBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isNativeApp, setIsNativeApp] = useState<boolean>(false);

  useEffect(() => {
    // 웹에서는 광고 완전 비노출, 모바일 앱(Capacitor Native) 환경에서만 노출
    if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
      setIsNativeApp(true);
    }
  }, []);

  if (!isNativeApp || !isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-0 sm:px-4 pb-0 sm:pb-2">
      <div className="pointer-events-auto w-full max-w-2xl bg-white/95 backdrop-blur-md border-t sm:border border-slate-200/90 sm:rounded-2xl shadow-2xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 text-slate-900 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
        {/* 광고 실물 영역 (AdSense / AdMob 연동 플레이스홀더 및 테스트 배너) */}
        <div className="flex-1 flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center flex-shrink-0 text-amber-800 shadow-2xs">
            <Megaphone className="w-4 h-4 animate-bounce" />
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <span className="bg-slate-900 text-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded tracking-tighter uppercase">
                AD / 광고
              </span>
              <span className="text-xs font-black text-slate-900 truncate">
                Kount 카카오톡 대화 분석 파트너스
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-bold truncate">
              구글 애드센스(Web) & 애드몹(Mobile) 하단 고정 배너
            </p>
          </div>
        </div>

        {/* 광고 연결 & 닫기 버튼 */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <a
            href="https://kount.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <span>더보기</span>
            <ExternalLink className="w-3 h-3 text-amber-400" />
          </a>

          <button
            onClick={() => setIsVisible(false)}
            aria-label="광고 닫기"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 실제 애드센스 광고 단위 태그 (AdSense 활성화 시 주석 해제하여 사용) */}
        {/* 
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: '50px' }}
          data-ad-client={adSenseClient}
          data-ad-slot={adSenseSlot}
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
        */}
      </div>
    </div>
  );
}
