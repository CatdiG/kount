'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { toPng, toBlob } from 'html-to-image';
import { ParsingResult, UserStat } from '@/types/chat';
import { PROFANITY_REGEX } from '@/lib/kakaotalkParser';
import ChatCharts from '@/components/ChatCharts';
import { KAKAO_JAVASCRIPT_KEY } from '@/components/KakaoScript';
import { PingPongEmoji, KeyboardWarriorEmoji, HulkNativeEmoji, ThiefAvatarEmoji, CommentAlbaRobotEmoji, MiracleDobbyEmoji, PotatoEmoji, AngangEmoji, QuestionEmoji, SpeechHabitEmoji, TrophySpeechEmoji, HallOfFameEmoji, ReportHeaderEmoji, CrystalBallEmoji } from '@/components/SpecialRankingsGrid';
import {
  Download,
  Share2,
  Crown,
  Zap,
  Flame,
  Briefcase,
  Quote,
  MessageCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
} from 'lucide-react';

interface KakaoTalkShareCardProps {
  parsingResult: ParsingResult;
}

export function formatPeakHourPeriod(hour: number): string {
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const nextHour = hour + 1;
  const nextDisplayHour = nextHour === 24 ? 12 : nextHour > 12 ? nextHour - 12 : nextHour;
  const nextPeriod = nextHour < 12 || nextHour === 24 ? '오전' : '오후';

  if (period === nextPeriod) {
    return `${period} ${displayHour}시~${nextDisplayHour}시`;
  }
  return `${period} ${displayHour}시 ~ ${nextPeriod} ${nextDisplayHour}시`;
}

// 🏷️ 브랜딩 워터마크 (kount (카카오톡 대화 분석기) 로고 표식)
function BrandingWatermark({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-end gap-1.5 text-[11px] font-black text-slate-500 font-mono pt-1 pb-0 -mb-1.5 flex-shrink-0 select-none px-1 ${className}`}
    >
      <Image
        src="/kount-app-logo.png"
        alt="kount logo"
        width={14}
        height={14}
        className="w-3.5 h-3.5 object-contain inline-block flex-shrink-0 opacity-90"
        unoptimized
      />
      <span className="tracking-tight text-slate-700 font-black text-[10.5px]">
        kount{' '}
        <span className="text-[9.5px] font-bold text-slate-500">
          (카카오톡 대화 분석기)
        </span>
      </span>
    </div>
  );
}

// 🥇 1위 금메달, 🥈 2위 은메달, 🥉 3위 동메달
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return <span className="text-base flex-shrink-0 leading-none" title="1위 금메달">🥇</span>;
  }
  if (rank === 2) {
    return <span className="text-base flex-shrink-0 leading-none" title="2위 은메달">🥈</span>;
  }
  if (rank === 3) {
    return <span className="text-base flex-shrink-0 leading-none" title="3위 동메달">🥉</span>;
  }
  return (
    <span className="text-xs font-extrabold text-slate-500 flex-shrink-0 min-w-[26px] text-center font-mono whitespace-nowrap">
      {rank}위
    </span>
  );
}

export interface SpecialItemMeta {
  id: string;
  title: string;
  icon: React.ReactNode;
}

export const HALL_OF_FAME_ITEMS: SpecialItemMeta[] = [
  { id: 'pingpong', title: '핑퐁왕', icon: <PingPongEmoji size={20} /> },
  { id: 'lupin', title: '월급루팡', icon: <ThiefAvatarEmoji size={20} /> },
  { id: 'comment', title: '댓글알바', icon: <CommentAlbaRobotEmoji size={20} /> },
  { id: 'morning', title: '미라클 도비', icon: <MiracleDobbyEmoji size={20} /> },
  { id: 'potato', title: '감자... 좀 쪄줄래?', icon: <PotatoEmoji size={20} /> },
  { id: 'keyboard', title: '랜선 여포', icon: <KeyboardWarriorEmoji size={20} /> },
  { id: 'angang', title: '앙앙이', icon: <AngangEmoji size={20} /> },
  { id: 'question', title: '물음표 살인마', icon: <QuestionEmoji size={20} /> },
];

export const CHAT_CHART_ITEMS: SpecialItemMeta[] = [
  { id: 'timeline', title: '24시간대별 대화 그래프', icon: <Clock className="w-4 h-4 text-indigo-600" /> },
  { id: 'keywords', title: '최다 사용 키워드 Top20', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
];

export default function KakaoTalkShareCard({ parsingResult }: KakaoTalkShareCardProps) {
  // 📸 캡처 대상 3개 페이지 Refs
  const capturePageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 🎯 카테고리 & 소제목 선택 상태
  const [isOverviewSelected, setIsOverviewSelected] = useState<boolean>(true);
  const [selectedHallOfFameIds, setSelectedHallOfFameIds] = useState<string[]>([
    'pingpong',
    'lupin',
    'comment',
    'morning',
    'potato',
    'keyboard',
    'angang',
    'question',
  ]);
  const [selectedChartIds, setSelectedChartIds] = useState<string[]>([
    'timeline',
    'keywords',
  ]);

  const toggleHallOfFameItem = (id: string) => {
    setSelectedHallOfFameIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllHallOfFame = () => {
    setSelectedHallOfFameIds([
      'pingpong',
      'lupin',
      'comment',
      'morning',
      'potato',
      'keyboard',
      'angang',
      'question',
    ]);
  };

  const deselectAllHallOfFame = () => {
    setSelectedHallOfFameIds([]);
  };

  const toggleChartItem = (id: string) => {
    setSelectedChartIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllCharts = () => {
    setSelectedChartIds(['timeline', 'keywords']);
  };

  const deselectAllCharts = () => {
    setSelectedChartIds([]);
  };

  const handleSelectAll = () => {
    setIsOverviewSelected(true);
    selectAllHallOfFame();
    selectAllCharts();
  };

  const handleDeselectAll = () => {
    setIsOverviewSelected(false);
    deselectAllHallOfFame();
    deselectAllCharts();
  };

  const totalSelectedCount =
    (isOverviewSelected ? 1 : 0) + selectedHallOfFameIds.length + selectedChartIds.length;

  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    userStats,
    specialRankings,
    totalMessages,
    uniqueUsersCount,
    startDateStr,
    endDateStr,
    hourlyDistribution,
  } = parsingResult;

  const top3Chatters = userStats.slice(0, 3);
  const { pingPongKing, keyboardWarrior, salaryLupin, commentAlba, miracleDobby, potatoEmoji, angangEmoji, questionKiller } = specialRankings;

  let peakHour = 0;
  let peakCount = 0;
  hourlyDistribution.forEach((item) => {
    if (item.count > peakCount) {
      peakCount = item.count;
      peakHour = item.hour;
    }
  });

  const peakHourText = formatPeakHourPeriod(peakHour);

  // 🔥 이미지 다운로드 (선택된 카드를 순차적으로 캡처 및 다운로드)
  const handleDownloadAllPages = async () => {
    if (totalSelectedCount === 0) {
      alert('저장할 카드를 최소 1개 이상 선택해 주세요.');
      return;
    }
    setIsGenerating(true);
    try {
      let pageNum = 1;

      // 1. Page 1: 기본 리포트 (Part 1: 1~10위)
      if (isOverviewSelected && capturePageRefs.current[0]) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        const captureOptions = { cacheBust: true, pixelRatio: 2.5, width: 440 };
        const dataUrl = await toPng(capturePageRefs.current[0], captureOptions);
        const link = document.createElement('a');
        link.download = userStats.length > 10
          ? `kount_분석결과_${pageNum}페이지_기본리포트-1.png`
          : `kount_분석결과_${pageNum}페이지_기본리포트.png`;
        link.href = dataUrl;
        link.click();
        pageNum++;
      }

      // 1b. Page 1b: 기본 리포트 (Part 2: 11위~) (10명 이상인 경우에만 추가)
      if (isOverviewSelected && userStats.length > 10 && capturePageRefs.current[8]) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        const captureOptions = { cacheBust: true, pixelRatio: 2.5, width: 440 };
        const dataUrl = await toPng(capturePageRefs.current[8], captureOptions);
        const link = document.createElement('a');
        link.download = `kount_분석결과_${pageNum}페이지_기본리포트-2.png`;
        link.href = dataUrl;
        link.click();
        pageNum++;
      }

      // 2. Page 2: 명예의 전당 Part 1 (핑퐁왕, 월급루팡, 댓글알바)
      const hasPart1 = ['pingpong', 'lupin', 'comment'].some((id) => selectedHallOfFameIds.includes(id));
      if (hasPart1 && capturePageRefs.current[1]) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        const captureOptions = { cacheBust: true, pixelRatio: 2.5, width: 440 };
        const dataUrl = await toPng(capturePageRefs.current[1], captureOptions);
        const link = document.createElement('a');
        link.download = `kount_분석결과_${pageNum}페이지_명예의전당_Part1.png`;
        link.href = dataUrl;
        link.click();
        pageNum++;
      }

      // 3. Page 3: 미라클 도비
      if (selectedHallOfFameIds.includes('morning') && capturePageRefs.current[2]) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        const captureOptions = { cacheBust: true, pixelRatio: 2.5, width: 440 };
        const dataUrl = await toPng(capturePageRefs.current[2], captureOptions);
        const link = document.createElement('a');
        link.download = `kount_분석결과_${pageNum}페이지_미라클도비.png`;
        link.href = dataUrl;
        link.click();
        pageNum++;
      }

      // 4. Page 4: 감자.. 좀 쪄줄래?
      if (selectedHallOfFameIds.includes('potato') && capturePageRefs.current[3]) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        const captureOptions = { cacheBust: true, pixelRatio: 2.5, width: 440 };
        const dataUrl = await toPng(capturePageRefs.current[3], captureOptions);
        const link = document.createElement('a');
        link.download = `kount_분석결과_${pageNum}페이지_감자좀쪄줄래.png`;
        link.href = dataUrl;
        link.click();
        pageNum++;
      }

      // 5. Page 5: 랜선 여포
      if (selectedHallOfFameIds.includes('keyboard') && capturePageRefs.current[4]) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        const captureOptions = { cacheBust: true, pixelRatio: 2.5, width: 440 };
        const dataUrl = await toPng(capturePageRefs.current[4], captureOptions);
        const link = document.createElement('a');
        link.download = `kount_분석결과_${pageNum}페이지_랜선여포.png`;
        link.href = dataUrl;
        link.click();
        pageNum++;
      }

      // 6. Page 6: 앙앙이
      if (selectedHallOfFameIds.includes('angang') && capturePageRefs.current[5]) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        const captureOptions = { cacheBust: true, pixelRatio: 2.5, width: 440 };
        const dataUrl = await toPng(capturePageRefs.current[5], captureOptions);
        const link = document.createElement('a');
        link.download = `kount_분석결과_${pageNum}페이지_앙앙이.png`;
        link.href = dataUrl;
        link.click();
        pageNum++;
      }

      // 7. Page 7: 물음표 살인마
      if (selectedHallOfFameIds.includes('question') && capturePageRefs.current[6]) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        const captureOptions = { cacheBust: true, pixelRatio: 2.5, width: 440 };
        const dataUrl = await toPng(capturePageRefs.current[6], captureOptions);
        const link = document.createElement('a');
        link.download = `kount_분석결과_${pageNum}페이지_물음표살인마.png`;
        link.href = dataUrl;
        link.click();
        pageNum++;
      }

      // 8. Page 8: 대화 성향 분석
      if (selectedChartIds.length > 0 && capturePageRefs.current[7]) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        const captureOptions = { cacheBust: true, pixelRatio: 2.5, width: 440 };
        const dataUrl = await toPng(capturePageRefs.current[7], captureOptions);
        const link = document.createElement('a');
        link.download = `kount_분석결과_${pageNum}페이지_대화성향분석.png`;
        link.href = dataUrl;
        link.click();
        pageNum++;
      }
    } catch (err) {
      console.error('Failed to generate images:', err);
      alert('이미지 저장 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 💛 카카오톡 어플 공유 (Kakao JavaScript SDK 공유 API)
  const handleShareToKakaoApp = async () => {
    if (totalSelectedCount === 0) {
      alert('공유할 카드를 최소 1개 이상 선택해 주세요.');
      return;
    }
    setIsGenerating(true);
    try {
      // 1. 카카오 자바스크립트 SDK 초기화 상태 확인 및 동적 초기화 시도
      const activeKakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY || KAKAO_JAVASCRIPT_KEY;
      if (typeof window !== 'undefined' && window.Kakao) {
        if (!window.Kakao.isInitialized() && activeKakaoKey && activeKakaoKey !== 'YOUR_JAVASCRIPT_KEY') {
          try {
            window.Kakao.init(activeKakaoKey);
          } catch (e) {
            console.error('Kakao.init error:', e);
          }
        }
      }

      // 2. 카카오톡 SDK가 초기화되어 있는 경우 Kakao.Share.sendDefault 메시지 발송 API 실행
      if (typeof window !== 'undefined' && window.Kakao && window.Kakao.isInitialized()) {
        const rawLocation = typeof window !== 'undefined' ? window.location.href : '';
        const targetUrl = (rawLocation.startsWith('http://') || rawLocation.startsWith('https://'))
          ? rawLocation
          : 'https://kount.app';

        const top1Str = top3Chatters[0] ? `${top3Chatters[0].nickname} (${top3Chatters[0].totalMessages.toLocaleString()}개)` : '없음';
        const top2Str = top3Chatters[1] ? `${top3Chatters[1].nickname} (${top3Chatters[1].totalMessages.toLocaleString()}개)` : '없음';
        const top3Str = top3Chatters[2] ? `${top3Chatters[2].nickname} (${top3Chatters[2].totalMessages.toLocaleString()}개)` : '없음';

        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: '카카오톡 대화 분석 리포트',
            description: `분석기간: ${startDateStr} ~ ${endDateStr}\n총 ${totalMessages.toLocaleString()}개 메시지 (${uniqueUsersCount}명 참여)\n🥇 1위: ${top1Str}\n🥈 2위: ${top2Str}\n🥉 3위: ${top3Str}`,
            imageUrl: `${typeof window !== 'undefined' ? window.location.origin : 'https://kount.app'}/icon-512.png`,
            link: {
              mobileWebUrl: targetUrl,
              webUrl: targetUrl,
            },
          },
          buttons: [
            {
              title: '📊 대화 분석 리포트 보기',
              link: {
                mobileWebUrl: targetUrl,
                webUrl: targetUrl,
              },
            },
          ],
        });

        setCopiedStatus('kakaoApp');
        setTimeout(() => setCopiedStatus(null), 2500);
        return;
      }

      // 3. Fallback 1: Native Web Share API (이미지 파일 함께 전달)
      const formatTop3List = (users: UserStat[], formatFn: (u: UserStat) => string) => {
        if (!users || users.length === 0) return '없음';
        return users
          .slice(0, 3)
          .map((u, i) => `${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} ${u.nickname} (${formatFn(u)})`)
          .join(', ');
      };

      const formatHabits = (users: UserStat[]) => {
        return users
          .slice(0, 5)
          .map((u) => {
            const catchphraseText =
              u.topCatchphrases && u.topCatchphrases.length > 0
                ? u.topCatchphrases.map((t) => `"${t.word}"`).join(', ')
                : '없음';
            return `• ${u.nickname} (${u.totalMessages.toLocaleString()}회): ${catchphraseText}`;
          })
          .join('\n');
      };

      const textSummary = `
[카카오톡 대화 분석 완벽 리포트]
📅 분석 기간: ${startDateStr} ~ ${endDateStr} (${totalMessages.toLocaleString()}개 메시지, ${uniqueUsersCount}명)

🥇 [카카오톡 상주민]
${userStats
  .slice(0, 3)
  .map(
    (u, i) =>
      ` ${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} ${u.nickname}: ${u.totalMessages.toLocaleString()}개`
  )
  .join('\n')}

💬 [멤버별 순위& 레퍼토리]
${formatHabits(userStats)}

👑 [명예의 전당 Top 3]
🏓 핑퐁왕: ${formatTop3List(pingPongKing, (u) => u.avgReplyTimeFormatted)}
💻 랜선 여포: ${formatTop3List(keyboardWarrior, (u) => `${u.profanityCount}개`)}
💼 월급루팡: ${formatTop3List(salaryLupin, (u) => `${u.workHourMessages}개`)}
      `.trim();

      const shareFiles: File[] = [];
      let pageNum = 1;

      if (isOverviewSelected && capturePageRefs.current[0]) {
        const captureOptions = { cacheBust: true, pixelRatio: 2.5, width: 440 };
        const blob = await toBlob(capturePageRefs.current[0], captureOptions);
        if (blob) {
          shareFiles.push(
            new File(
              [blob],
              userStats.length > 10
                ? `kount_분석결과_${pageNum}페이지_기본리포트-1.png`
                : `kount_분석결과_${pageNum}페이지_기본리포트.png`,
              { type: 'image/png' }
            )
          );
          pageNum++;
        }
      }

      if (isOverviewSelected && userStats.length > 10 && capturePageRefs.current[8]) {
        const captureOptions = { cacheBust: true, pixelRatio: 2.5, width: 440 };
        const blob = await toBlob(capturePageRefs.current[8], captureOptions);
        if (blob) {
          shareFiles.push(
            new File([blob], `kount_분석결과_${pageNum}페이지_기본리포트-2.png`, { type: 'image/png' })
          );
          pageNum++;
        }
      }

      const hasPart1 = ['pingpong', 'lupin', 'comment'].some((id) => selectedHallOfFameIds.includes(id));
      if (hasPart1 && capturePageRefs.current[1]) {
        const captureOptions = { cacheBust: true, pixelRatio: 2.5, width: 440 };
        const blob = await toBlob(capturePageRefs.current[1], captureOptions);
        if (blob) {
          shareFiles.push(
            new File([blob], `kount_분석결과_${pageNum}페이지_명예의전당_Part1.png`, { type: 'image/png' })
          );
          pageNum++;
        }
      }

      if (selectedHallOfFameIds.includes('morning') && capturePageRefs.current[2]) {
        const captureOptions = { cacheBust: true, pixelRatio: 2.5, width: 440 };
        const blob = await toBlob(capturePageRefs.current[2], captureOptions);
        if (blob) {
          shareFiles.push(
            new File([blob], `kount_분석결과_${pageNum}페이지_미라클도비.png`, { type: 'image/png' })
          );
          pageNum++;
        }
      }

      if (selectedHallOfFameIds.includes('potato') && capturePageRefs.current[3]) {
        const captureOptions = { cacheBust: true, pixelRatio: 2.5, width: 440 };
        const blob = await toBlob(capturePageRefs.current[3], captureOptions);
        if (blob) {
          shareFiles.push(
            new File([blob], `kount_분석결과_${pageNum}페이지_감자좀쪄줄래.png`, { type: 'image/png' })
          );
          pageNum++;
        }
      }

      if (selectedHallOfFameIds.includes('keyboard') && capturePageRefs.current[4]) {
        const captureOptions = { cacheBust: true, pixelRatio: 2.5, width: 440 };
        const blob = await toBlob(capturePageRefs.current[4], captureOptions);
        if (blob) {
          shareFiles.push(
            new File([blob], `kount_분석결과_${pageNum}페이지_랜선여포.png`, { type: 'image/png' })
          );
          pageNum++;
        }
      }

      if (selectedHallOfFameIds.includes('angang') && capturePageRefs.current[5]) {
        const captureOptions = { cacheBust: true, pixelRatio: 2.5, width: 440 };
        const blob = await toBlob(capturePageRefs.current[5], captureOptions);
        if (blob) {
          shareFiles.push(
            new File([blob], `kount_분석결과_${pageNum}페이지_앙앙이.png`, { type: 'image/png' })
          );
          pageNum++;
        }
      }

      if (selectedHallOfFameIds.includes('question') && capturePageRefs.current[6]) {
        const captureOptions = { cacheBust: true, pixelRatio: 2.5, width: 440 };
        const blob = await toBlob(capturePageRefs.current[6], captureOptions);
        if (blob) {
          shareFiles.push(
            new File([blob], `kount_분석결과_${pageNum}페이지_물음표살인마.png`, { type: 'image/png' })
          );
          pageNum++;
        }
      }

      if (selectedChartIds.length > 0 && capturePageRefs.current[7]) {
        const captureOptions = { cacheBust: true, pixelRatio: 2.5, width: 440 };
        const blob = await toBlob(capturePageRefs.current[7], captureOptions);
        if (blob) {
          shareFiles.push(
            new File([blob], `kount_분석결과_${pageNum}페이지_대화성향분석.png`, { type: 'image/png' })
          );
          pageNum++;
        }
      }

      if (shareFiles.length > 0 && navigator.share && navigator.canShare && navigator.canShare({ files: shareFiles })) {
        await navigator.share({
          title: '카카오톡 대화 분석 리포트',
          text: textSummary,
          files: shareFiles,
        });
        setCopiedStatus('kakaoApp');
        setTimeout(() => setCopiedStatus(null), 2500);
        return;
      }

      // 4. Fallback 2: 클립보드 복사 및 카카오톡 웹 링크 공유기
      await navigator.clipboard.writeText(textSummary);
      const rawLocation = typeof window !== 'undefined' ? window.location.href : '';
      const targetUrl = (rawLocation.startsWith('http://') || rawLocation.startsWith('https://'))
        ? rawLocation
        : 'https://kount.app';
      const shareUrl = `https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(
        targetUrl
      )}&text=${encodeURIComponent(textSummary)}`;
      
      try {
        const win = window.open(shareUrl, '_blank', 'noopener,noreferrer');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          window.location.href = shareUrl;
        }
      } catch {
        window.location.href = shareUrl;
      }
      
      setCopiedStatus('kakaoApp');
      setTimeout(() => setCopiedStatus(null), 2500);
    } catch (err) {
      console.error('Failed to share:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* 💻 [웹사이트 화면 Display 리포트 컨테이너] */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl divide-y divide-slate-200">
        {/* Section 1: Top 3 & 개요 Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-b from-indigo-50/60 to-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center">
                <ReportHeaderEmoji size={48} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                    카카오톡 대화 분석 리포트
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  📅 {startDateStr} ~ {endDateStr} ({totalMessages.toLocaleString()}개 메시지, {uniqueUsersCount}명)
                </p>
              </div>
            </div>
          </div>

        {/* Section 1: 카카오톡 상주민 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <TrophySpeechEmoji size={32} /> 카카오톡 상주민
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">
              총 {totalMessages.toLocaleString()}개 기준
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {top3Chatters.map((user, idx) => {
              const medalBgStyles = [
                'bg-gradient-to-b from-amber-100 via-yellow-100 to-amber-200 border-amber-400 text-amber-950',
                'bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 border-slate-400 text-slate-900',
                'bg-gradient-to-b from-[#f8d7c4] via-[#e5a073] to-[#c66e2e] border-[#a85317] text-[#3b1702]',
              ];

              const metricBadgeStyles = [
                'bg-amber-200/80 text-amber-950 border-amber-400',
                'bg-slate-200/90 text-slate-900 border-slate-400',
                'bg-[#f0ba97] text-[#3b1702] border-[#a85317]',
              ];

              return (
                <div
                  key={user.nickname}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center gap-1 ${medalBgStyles[idx]}`}
                >
                  <span className="text-[11px] font-black">
                    {idx === 0 ? '🥇 1위' : idx === 1 ? '🥈 2위' : '🥉 3위'}
                  </span>
                  <span className="font-extrabold text-xs truncate max-w-full">
                    {user.nickname}
                  </span>
                  <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded border ${metricBadgeStyles[idx]}`}>
                    {user.totalMessages.toLocaleString()}개
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

        {/* Section 2: 멤버별 순위& 레퍼토리 */}
        <div className="p-4 sm:p-6 bg-white space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <SpeechHabitEmoji size={32} /> 멤버별 순위& 레퍼토리
            </h3>
          </div>

          <div className="space-y-2">
            {userStats.map((user) => (
              <div
                key={user.nickname}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs overflow-hidden box-border whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-shrink-0 whitespace-nowrap">
                  <RankBadge rank={user.rank} />
                  <span className="font-extrabold text-slate-900 text-xs truncate max-w-[85px] sm:max-w-[100px] whitespace-nowrap">
                    {user.nickname}
                  </span>
                  <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 flex-shrink-0 font-mono whitespace-nowrap inline-block">
                    {user.totalMessages.toLocaleString()}회
                  </span>
                </div>

                <div className="flex items-center gap-1 min-w-0 flex-shrink-0 whitespace-nowrap overflow-hidden">
                  <div className="flex items-center gap-1 flex-nowrap overflow-hidden">
                    {user.topCatchphrases && user.topCatchphrases.length > 0 ? (
                      user.topCatchphrases.map((item, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-white text-slate-800 font-extrabold text-[10px] whitespace-nowrap flex-shrink-0 border border-slate-200 shadow-2xs"
                        >
                          &quot;{item.word}&quot;{' '}
                          <span className="text-indigo-600 font-mono text-[9px]">
                            ({item.count})
                          </span>
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic text-[10px]">데이터 부족</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: 명예의 전당 */}
        <div className="p-4 sm:p-6 bg-white space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <HallOfFameEmoji size={35} /> 명예의 전당
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <UnifiedSpecialCard
              title="핑퐁왕"
              subtitle="다른 사람이 말하면 평균 답장 시간이 가장 짧은 사람"
              icon={<PingPongEmoji size={32} />}
              users={pingPongKing}
              metricFormatter={(u) => u.avgReplyTimeFormatted}
              category="pingpong"
              getExamples={() => []}
              emptyText="답장 반응속도 데이터가 부족합니다."
            />

            <UnifiedSpecialCard
              title="월급루팡"
              subtitle="오전 9시~오후 6시 사이 채팅 메시지가 가장 많은 사람"
              icon={<ThiefAvatarEmoji size={32} />}
              users={salaryLupin}
              metricFormatter={(u) => `${u.workHourMessages}개`}
              category="lupin"
              getExamples={() => []}
              emptyText="근무시간 내 메시지가 없습니다."
            />

            <UnifiedSpecialCard
              title="댓글알바"
              subtitle="다른 사람 대화에 댓글/답글을 가장 많이 남긴 사람"
              icon={<CommentAlbaRobotEmoji size={32} />}
              users={commentAlba}
              metricFormatter={(u) => `${u.commentCount}개`}
              category="comment"
              getExamples={() => []}
              emptyText="댓글/답글 작성 데이터가 부족합니다."
            />

            <UnifiedSpecialCard
              title="미라클 도비"
              subtitle="아침 개같은거 또 왔네"
              icon={<MiracleDobbyEmoji size={32} />}
              users={miracleDobby}
              metricFormatter={(u) => `${u.morningCount}개`}
              category="morning"
              getExamples={() => []}
              emptyText="아침 인사(모닝/몬잉/머닝/모닁/마닝) 사용자가 없거나 부족합니다."
            />

            <UnifiedSpecialCard
              title="감자... 좀 쪄줄래?"
              subtitle="끼니를 제일 잘 챙기는 사람"
              icon={<PotatoEmoji size={32} />}
              users={potatoEmoji}
              metricFormatter={(u) => `${u.potatoCount}개`}
              category="potato"
              getExamples={(u) => u.potatoExamples || []}
              emptyText="맛점/맛저 인사 사용자가 없거나 부족합니다."
            />

            <UnifiedSpecialCard
              title="랜선 여포"
              subtitle="비속어·욕설 사용 건수가 가장 많은 사람"
              icon={<KeyboardWarriorEmoji size={32} />}
              users={keyboardWarrior}
              metricFormatter={(u) => `${u.profanityCount}개`}
              category="keyboard"
              getExamples={(u) => u.profanityExamples || []}
              emptyText="비속어 사용자가 없거나 부족합니다."
            />

            <UnifiedSpecialCard
              title="앙앙이"
              subtitle="대화 중 눈물을 가장 많이 흘린 사람"
              icon={<AngangEmoji size={32} />}
              users={angangEmoji}
              metricFormatter={(u) => `${u.cryingCount}개`}
              category="angang"
              getExamples={(u) => u.cryingExamples || []}
              emptyText="눈물/울음(ㅠㅠ/ㅜㅜ/ㅠ_ㅠ/ㅜ_ㅜ/ㅠ_ㅜ/ㅜ_ㅠ) 사용자가 없거나 부족합니다."
            />

            <UnifiedSpecialCard
              title="물음표 살인마"
              subtitle="대화 중 '?'를 가장 많이 사용한 사람"
              icon={<QuestionEmoji size={32} />}
              users={questionKiller}
              metricFormatter={(u) => `${u.questionCount}개`}
              category="question"
              getExamples={(u) => u.questionExamples || []}
              emptyText="물음표(?) 사용자가 없거나 부족합니다."
            />
          </div>
        </div>

        {/* Section 4: 대화 성향 분석 */}
        <div className="p-4 sm:p-6 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center">
                <CrystalBallEmoji size={42} />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                  대화 성향 분석
                </h2>
              </div>
            </div>
          </div>
          <ChatCharts parsingResult={parsingResult} />
        </div>
      </div>

      {/* 📱 [공유/다운로드 전용 캡처 DOM - 440px 세로 모바일 세로형 스크린 핏 & 잘림 없는 3페이지 분할] */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none space-y-6">
        {/* 🟡 PAGE 1 (기본 대시보드): 카카오톡 상주민 Top 3 + 멤버별 순위& 레퍼토리 (전체) */}
        <div
          ref={(el) => { capturePageRefs.current[0] = el; }}
          className="w-[440px] h-auto overflow-hidden rounded-3xl p-5 bg-white border border-slate-200 text-slate-900 flex flex-col justify-start box-border relative space-y-4 break-inside-avoid"
        >
          {/* Top Header Bar */}
          <div className="border-b border-slate-200 pb-3 space-y-1.5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                  <ReportHeaderEmoji size={36} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    카카오톡 대화 분석 리포트{userStats.length > 10 ? ' -1' : ''}
                  </h2>
                  <p className="text-[10px] text-slate-500 font-medium">
                    📅 {startDateStr} ~ {endDateStr} ({totalMessages.toLocaleString()}개 대화, {uniqueUsersCount}명)
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] pt-1">
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold">
                참여 멤버: 총 {uniqueUsersCount}명
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                골든 타임: {peakHourText} 🔥
              </span>
            </div>
          </div>

          {/* Section 1: 카카오톡 상주민 */}
          <div className="space-y-2 flex-shrink-0 break-inside-avoid">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <TrophySpeechEmoji size={26} /> 카카오톡 상주민
              </h3>
              <span className="text-[9px] text-slate-500 font-mono">
                총 {totalMessages.toLocaleString()}개 기준
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {top3Chatters.map((user, idx) => {
                const medalBgStylesMobile = [
                  'bg-gradient-to-b from-amber-100 via-yellow-100 to-amber-200 border-amber-400 text-amber-950',
                  'bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 border-slate-400 text-slate-900',
                  'bg-gradient-to-b from-[#f8d7c4] via-[#e5a073] to-[#c66e2e] border-[#a85317] text-[#3b1702]',
                ];

                const metricBadgeStylesMobile = [
                  'bg-amber-200/80 text-amber-950 border-amber-400',
                  'bg-slate-200/90 text-slate-900 border-slate-400',
                  'bg-[#f0ba97] text-[#3b1702] border-[#a85317]',
                ];

                return (
                  <div
                    key={user.nickname}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center gap-1 ${medalBgStylesMobile[idx]}`}
                  >
                    <span className="text-[11px] font-black">
                      {idx === 0 ? '🥇 1위' : idx === 1 ? '🥈 2위' : '🥉 3위'}
                    </span>
                    <span className="font-extrabold text-xs truncate max-w-full">
                      {user.nickname}
                    </span>
                    <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded border ${metricBadgeStylesMobile[idx]}`}>
                      {user.totalMessages.toLocaleString()}개
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: 멤버별 순위& 레퍼토리 (1~10위) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 shadow-2xs flex-grow my-1 overflow-hidden box-border break-inside-avoid">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <SpeechHabitEmoji size={26} /> 멤버별 순위& 레퍼토리 {userStats.length > 10 ? '(1~10위)' : ''}
              </h3>
              <span className="text-[9px] text-slate-500 font-mono">
                총 {userStats.length}명
              </span>
            </div>

            <div className="space-y-1.5">
              {userStats.slice(0, 10).map((user) => (
                <div
                  key={user.nickname}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 text-xs shadow-2xs overflow-hidden box-border whitespace-nowrap break-inside-avoid"
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-shrink-0 whitespace-nowrap">
                    <RankBadge rank={user.rank} />
                    <span className="font-extrabold text-slate-900 text-xs truncate max-w-[85px] sm:max-w-[100px] whitespace-nowrap">
                      {user.nickname}
                    </span>
                    <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 flex-shrink-0 font-mono whitespace-nowrap inline-block">
                      {user.totalMessages.toLocaleString()}회
                    </span>
                  </div>

                  <div className="flex items-center gap-1 min-w-0 flex-shrink-0 whitespace-nowrap overflow-hidden">
                    <div className="flex items-center gap-1 flex-nowrap overflow-hidden">
                      {user.topCatchphrases && user.topCatchphrases.length > 0 ? (
                        user.topCatchphrases.map((item, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-900 font-extrabold text-[10px] whitespace-nowrap flex-shrink-0 border border-slate-200"
                          >
                            &quot;{item.word}&quot;{' '}
                            <span className="text-indigo-600 font-mono text-[9px]">
                              ({item.count})
                            </span>
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-[10px]">데이터 부족</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <BrandingWatermark />
        </div>

        {/* 🟡 PAGE 1b (기본 리포트 Part 2): 10명 초과 시 11위부터 나머지 (상주민 Top 3 포함) */}
        {userStats.length > 10 && (
          <div
            ref={(el) => { capturePageRefs.current[8] = el; }}
            className="w-[440px] h-auto overflow-hidden rounded-3xl p-5 bg-white border border-slate-200 text-slate-900 flex flex-col justify-start box-border relative space-y-4 break-inside-avoid"
          >
            {/* Top Header Bar */}
            <div className="border-b border-slate-200 pb-3 space-y-1.5 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                    <ReportHeaderEmoji size={36} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                      카카오톡 대화 분석 리포트 -2
                    </h2>
                    <p className="text-[10px] text-slate-500 font-medium">
                      📅 {startDateStr} ~ {endDateStr} ({totalMessages.toLocaleString()}개 대화, {uniqueUsersCount}명)
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] pt-1">
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold">
                  참여 멤버: 총 {uniqueUsersCount}명
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                  골든 타임: {peakHourText} 🔥
                </span>
              </div>
            </div>

            {/* Section 1: 카카오톡 상주민 (두페이지로 나눌 때 상단에 상주민 둘 다 표시) */}
            <div className="space-y-2 flex-shrink-0 break-inside-avoid">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <TrophySpeechEmoji size={26} /> 카카오톡 상주민
                </h3>
                <span className="text-[9px] text-slate-500 font-mono">
                  총 {totalMessages.toLocaleString()}개 기준
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {top3Chatters.map((user, idx) => {
                  const medalBgStylesMobile = [
                    'bg-gradient-to-b from-amber-100 via-yellow-100 to-amber-200 border-amber-400 text-amber-950',
                    'bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 border-slate-400 text-slate-900',
                    'bg-gradient-to-b from-[#f8d7c4] via-[#e5a073] to-[#c66e2e] border-[#a85317] text-[#3b1702]',
                  ];
                  const metricBadgeStylesMobile = [
                    'bg-amber-200/80 text-amber-950 border-amber-400',
                    'bg-slate-200/90 text-slate-900 border-slate-400',
                    'bg-[#f0ba97] text-[#3b1702] border-[#a85317]',
                  ];
                  return (
                    <div
                      key={user.nickname}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center gap-1 ${medalBgStylesMobile[idx]}`}
                    >
                      <span className="text-[11px] font-black">
                        {idx === 0 ? '🥇 1위' : idx === 1 ? '🥈 2위' : '🥉 3위'}
                      </span>
                      <span className="font-extrabold text-xs truncate max-w-full">
                        {user.nickname}
                      </span>
                      <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded border ${metricBadgeStylesMobile[idx]}`}>
                        {user.totalMessages.toLocaleString()}개
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: 멤버별 순위& 레퍼토리 (11위부터 나머지) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 shadow-2xs flex-grow my-1 overflow-hidden box-border break-inside-avoid">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <SpeechHabitEmoji size={26} /> 멤버별 순위& 레퍼토리 (11위~)
                </h3>
                <span className="text-[9px] text-slate-500 font-mono">
                  총 {userStats.length}명
                </span>
              </div>

              <div className="space-y-1.5">
                {userStats.slice(10).map((user) => (
                  <div
                    key={user.nickname}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 text-xs shadow-2xs overflow-hidden box-border whitespace-nowrap break-inside-avoid"
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-shrink-0 whitespace-nowrap">
                      <RankBadge rank={user.rank} />
                      <span className="font-extrabold text-slate-900 text-xs truncate max-w-[85px] sm:max-w-[100px] whitespace-nowrap">
                        {user.nickname}
                      </span>
                      <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 flex-shrink-0 font-mono whitespace-nowrap inline-block">
                        {user.totalMessages.toLocaleString()}회
                      </span>
                    </div>

                    <div className="flex items-center gap-1 min-w-0 flex-shrink-0 whitespace-nowrap overflow-hidden">
                      <div className="flex items-center gap-1 flex-nowrap overflow-hidden">
                        {user.topCatchphrases && user.topCatchphrases.length > 0 ? (
                          user.topCatchphrases.map((item, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-900 font-extrabold text-[10px] whitespace-nowrap flex-shrink-0 border border-slate-200"
                            >
                              &quot;{item.word}&quot;{' '}
                              <span className="text-indigo-600 font-mono text-[9px]">
                                ({item.count})
                              </span>
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">데이터 부족</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <BrandingWatermark />
          </div>
        )}

        {/* 👑 PAGE 2 (명예의 전당 Part 1): 핑퐁왕, 월급루팡, 댓글알바 */}
        <div
          ref={(el) => { capturePageRefs.current[1] = el; }}
          className="w-[440px] h-auto overflow-hidden rounded-3xl p-5 bg-white border border-slate-200 text-slate-900 flex flex-col justify-start box-border relative break-inside-avoid space-y-3.5"
        >
          {/* Top Header Bar */}
          <div className="border-b border-slate-200 pb-2.5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <HallOfFameEmoji size={28} /> 명예의 전당
                </h3>
              </div>
            </div>
          </div>

          {/* Body: Part 1 Cards (PingPong, Lupin, Comment) */}
          <div className="space-y-3 flex-shrink-0">
            {selectedHallOfFameIds.includes('pingpong') && (
              <UnifiedSpecialCard
                title="핑퐁왕"
                subtitle="답장 시간이 가장 짧은 사람"
                icon={<PingPongEmoji size={28} />}
                users={pingPongKing}
                metricFormatter={(u) => u.avgReplyTimeFormatted}
                category="pingpong"
                getExamples={() => []}
                emptyText="데이터 부족"
              />
            )}

            {selectedHallOfFameIds.includes('lupin') && (
              <UnifiedSpecialCard
                title="월급루팡"
                subtitle="근무시간(09시~18시) 대화 작성 건수가 가장 많은 사람"
                icon={<ThiefAvatarEmoji size={28} />}
                users={salaryLupin}
                metricFormatter={(u) => `${u.workHourMessages}개`}
                category="lupin"
                getExamples={() => []}
                emptyText="근무시간 내 메시지가 없습니다."
              />
            )}

            {selectedHallOfFameIds.includes('comment') && (
              <UnifiedSpecialCard
                title="댓글알바"
                subtitle="다른 사람 대화에 댓글/답글을 가장 많이 남긴 사람"
                icon={<CommentAlbaRobotEmoji size={28} />}
                users={commentAlba}
                metricFormatter={(u) => `${u.commentCount}개`}
                category="comment"
                getExamples={() => []}
                emptyText="댓글/답글 작성 데이터가 부족합니다."
              />
            )}
          </div>
          <BrandingWatermark className="-mt-2 pr-1" />
        </div>

        {/* 🌅 PAGE 3 (명예의 전당): 미라클 도비 (개별 1페이지) */}
        <div
          ref={(el) => { capturePageRefs.current[2] = el; }}
          className="w-[440px] h-auto overflow-hidden rounded-3xl p-5 bg-white border border-slate-200 text-slate-900 flex flex-col justify-start box-border relative break-inside-avoid space-y-3.5"
        >
          <div className="border-b border-slate-200 pb-2.5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <HallOfFameEmoji size={28} /> 명예의 전당
              </h3>
            </div>
          </div>
          <div className="space-y-3 flex-shrink-0">
            <UnifiedSpecialCard
              title="미라클 도비"
              subtitle="아침 개같은거 또 왔네"
              icon={<MiracleDobbyEmoji size={28} />}
              users={miracleDobby}
              metricFormatter={(u) => `${u.morningCount}개`}
              category="morning"
              getExamples={() => []}
              emptyText="아침 인사(모닝/몬잉/머닝/모닁/마닝) 사용자가 없거나 부족합니다."
            />
          </div>
          <BrandingWatermark className="-mt-2 pr-1" />
        </div>

        {/* 🥔 PAGE 4 (명예의 전당): 감자... 좀 쪄줄래? (개별 1페이지) */}
        <div
          ref={(el) => { capturePageRefs.current[3] = el; }}
          className="w-[440px] h-auto overflow-hidden rounded-3xl p-5 bg-white border border-slate-200 text-slate-900 flex flex-col justify-start box-border relative break-inside-avoid space-y-3.5"
        >
          <div className="border-b border-slate-200 pb-2.5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <HallOfFameEmoji size={28} /> 명예의 전당
              </h3>
            </div>
          </div>
          <div className="space-y-3 flex-shrink-0">
            <UnifiedSpecialCard
              title="감자... 좀 쪄줄래?"
              subtitle="끼니를 제일 잘 챙기는 사람"
              icon={<PotatoEmoji size={28} />}
              users={potatoEmoji}
              metricFormatter={(u) => `${u.potatoCount}개`}
              category="potato"
              getExamples={(u) => u.potatoExamples || []}
              emptyText="맛점/맛저 인사 사용자가 없거나 부족합니다."
            />
          </div>
          <BrandingWatermark className="-mt-2 pr-1" />
        </div>

        {/* 💻 PAGE 5 (명예의 전당): 랜선 여포 (개별 1페이지) */}
        <div
          ref={(el) => { capturePageRefs.current[4] = el; }}
          className="w-[440px] h-auto overflow-hidden rounded-3xl p-5 bg-white border border-slate-200 text-slate-900 flex flex-col justify-start box-border relative break-inside-avoid space-y-3.5"
        >
          <div className="border-b border-slate-200 pb-2.5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <HallOfFameEmoji size={28} /> 명예의 전당
              </h3>
            </div>
          </div>
          <div className="space-y-3 flex-shrink-0">
            <UnifiedSpecialCard
              title="랜선 여포"
              subtitle="비속어·욕설 사용 건수가 가장 많은 사람"
              icon={<KeyboardWarriorEmoji size={28} />}
              users={keyboardWarrior}
              metricFormatter={(u) => `${u.profanityCount}개`}
              category="keyboard"
              getExamples={(u) => u.profanityExamples || []}
              emptyText="데이터 부족"
            />
          </div>
          <BrandingWatermark className="-mt-2 pr-1" />
        </div>

        {/* 😭 PAGE 6 (명예의 전당): 앙앙이 (개별 1페이지) */}
        <div
          ref={(el) => { capturePageRefs.current[5] = el; }}
          className="w-[440px] h-auto overflow-hidden rounded-3xl p-5 bg-white border border-slate-200 text-slate-900 flex flex-col justify-start box-border relative break-inside-avoid space-y-3.5"
        >
          <div className="border-b border-slate-200 pb-2.5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <HallOfFameEmoji size={28} /> 명예의 전당
              </h3>
            </div>
          </div>
          <div className="space-y-3 flex-shrink-0">
            <UnifiedSpecialCard
              title="앙앙이"
              subtitle="대화 중 눈물을 가장 많이 흘린 사람"
              icon={<AngangEmoji size={28} />}
              users={angangEmoji}
              metricFormatter={(u) => `${u.cryingCount}개`}
              category="angang"
              getExamples={(u) => u.cryingExamples || []}
              emptyText="눈물/울음(ㅠㅠ/ㅜㅜ/ㅠ_ㅠ/ㅜ_ㅜ/ㅠ_ㅜ/ㅜ_ㅠ) 사용자가 없거나 부족합니다."
            />
          </div>
          <BrandingWatermark className="-mt-2 pr-1" />
        </div>

        {/* ❓ PAGE 7 (명예의 전당): 물음표 살인마 (개별 1페이지) */}
        <div
          ref={(el) => { capturePageRefs.current[6] = el; }}
          className="w-[440px] h-auto overflow-hidden rounded-3xl p-5 bg-white border border-slate-200 text-slate-900 flex flex-col justify-start box-border relative break-inside-avoid space-y-3.5"
        >
          <div className="border-b border-slate-200 pb-2.5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <HallOfFameEmoji size={28} /> 명예의 전당
              </h3>
            </div>
          </div>
          <div className="space-y-3 flex-shrink-0">
            <UnifiedSpecialCard
              title="물음표 살인마"
              subtitle="대화 중 '?'를 가장 많이 사용한 사람"
              icon={<QuestionEmoji size={28} />}
              users={questionKiller}
              metricFormatter={(u) => `${u.questionCount}개`}
              category="question"
              getExamples={(u) => u.questionExamples || []}
              emptyText="물음표(?) 사용자가 없거나 부족합니다."
            />
          </div>
          <BrandingWatermark className="-mt-2 pr-1" />
        </div>

        {/* 📈 PAGE 8 (대화 성향 분석): ChatCharts (그래프 & 키워드 Top20 묶음 1페이지) */}
        <div
          ref={(el) => { capturePageRefs.current[7] = el; }}
          className="w-[440px] h-auto overflow-hidden rounded-3xl p-5 bg-white border border-slate-200 text-slate-900 flex flex-col justify-start box-border relative break-inside-avoid space-y-3.5"
        >
          {/* Top Header Bar */}
          <div className="border-b border-slate-200 pb-3 space-y-1.5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                  <CrystalBallEmoji size={30} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    대화 성향 분석
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* Body: ChatCharts */}
          <div className="flex-shrink-0 break-inside-avoid pt-1">
            <ChatCharts
              parsingResult={parsingResult}
              showTimeline={selectedChartIds.includes('timeline')}
              showKeywords={selectedChartIds.includes('keywords')}
            />
          </div>
          <BrandingWatermark />
        </div>
      </div>

      {/* 💛 하단 액션 컨트롤 센터 (카카오톡 분석 카드 선택 및 다운로드/공유) */}
      <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-3xl flex flex-col space-y-3.5 shadow-lg mt-3 text-slate-900">
        {/* 1. 상단 액션 버튼 2개 (카톡으로 공유하기 / 선택 카드 다운로드) */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={handleShareToKakaoApp}
            disabled={isGenerating || totalSelectedCount === 0}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] text-xs sm:text-sm font-black shadow-md transition-all active:scale-95 border border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-amber-950 flex-shrink-0" />
            <span>
              {copiedStatus === 'kakaoApp'
                ? '공유 완료!'
                : `카톡으로 공유하기 (${totalSelectedCount}개)`}
            </span>
          </button>

          <button
            onClick={handleDownloadAllPages}
            disabled={isGenerating || totalSelectedCount === 0}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="w-4 h-4 flex-shrink-0" />
            <span>
              {isGenerating
                ? '이미지 생성 중...'
                : `선택 카드 다운로드 (${totalSelectedCount}개)`}
            </span>
          </button>
        </div>

        {/* 2. 그 밑: 선택됨 카운터 & 전체 선택 / 전체 해제 버튼 */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 pt-0.5">
          <span className="text-xs font-mono font-extrabold px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
            선택됨: <span className="text-indigo-600 font-black">{totalSelectedCount}</span> / {1 + HALL_OF_FAME_ITEMS.length + CHAT_CHART_ITEMS.length}개
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSelectAll}
              className="text-[11px] font-extrabold px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200 active:scale-95 cursor-pointer"
            >
              전체 선택
            </button>
            <button
              onClick={handleDeselectAll}
              className="text-[11px] font-extrabold px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all border border-slate-200 active:scale-95 cursor-pointer"
            >
              전체 해제
            </button>
          </div>
        </div>

        {/* Section 1: 🏆 기본 리포트 */}
        <div>
          <button
            type="button"
            onClick={() => setIsOverviewSelected(!isOverviewSelected)}
            className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer select-none active:scale-[0.99] ${
              isOverviewSelected
                ? 'bg-gradient-to-r from-indigo-50/80 to-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg flex-shrink-0 leading-none">🏆</span>
              <span className="font-black text-xs text-slate-900 truncate">
                기본 리포트
              </span>
            </div>
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold flex-shrink-0 transition-all ${
                isOverviewSelected
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-200 text-slate-400 border border-slate-300'
              }`}
            >
              {isOverviewSelected ? '✓' : ''}
            </div>
          </button>
        </div>

        {/* Section 2: 👑 명예의 전당 (소제목 8종 개별 선택) */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>👑 명예의 전당</span>
              <span className="text-[10px] text-slate-500 font-mono font-normal">
                ({selectedHallOfFameIds.length}/8)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={selectAllHallOfFame}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200 cursor-pointer"
              >
                명예의 전당 모두 선택
              </button>
              <button
                type="button"
                onClick={deselectAllHallOfFame}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all border border-slate-200 cursor-pointer"
              >
                해제
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
            {HALL_OF_FAME_ITEMS.map((item) => {
              const isSelected = selectedHallOfFameIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleHallOfFameItem(item.id)}
                  className={`px-2 py-2 rounded-xl border text-left flex items-center justify-between gap-1 transition-all cursor-pointer select-none active:scale-[0.98] h-9 ${
                    isSelected
                      ? 'bg-gradient-to-b from-indigo-50/90 to-white border-indigo-500 ring-2 ring-indigo-500/15 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
                    <div className="flex-shrink-0 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="font-extrabold text-[9.5px] xs:text-[10px] sm:text-[11px] text-slate-900 tracking-tighter whitespace-nowrap shrink min-w-0">
                      {item.title}
                    </span>
                  </div>
                  <div
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center text-[8px] sm:text-[9px] font-extrabold flex-shrink-0 transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 text-slate-400 border border-slate-300'
                    }`}
                  >
                    {isSelected ? '✓' : ''}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: 📈 대화 성향 분석 (소제목 2종 개별 선택) */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>📈 대화 성향 분석</span>
              <span className="text-[10px] text-slate-500 font-mono font-normal">
                ({selectedChartIds.length}/2)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={selectAllCharts}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200 cursor-pointer"
              >
                대화성향 모두 선택
              </button>
              <button
                type="button"
                onClick={deselectAllCharts}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all border border-slate-200 cursor-pointer"
              >
                해제
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CHAT_CHART_ITEMS.map((item) => {
              const isSelected = selectedChartIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleChartItem(item.id)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer select-none active:scale-[0.98] h-9 ${
                    isSelected
                      ? 'bg-gradient-to-b from-indigo-50/90 to-white border-indigo-500 ring-2 ring-indigo-500/15 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                    <div className="flex-shrink-0 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="font-extrabold text-xs text-slate-900 truncate min-w-0">
                      {item.title}
                    </span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold flex-shrink-0 transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 text-slate-400 border border-slate-300'
                    }`}
                  >
                    {isSelected ? '✓' : ''}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {totalSelectedCount === 0 && (
          <p className="text-[11px] font-extrabold text-rose-500 text-center animate-pulse pt-1">
            ⚠️ 최소 1개 이상의 카드를 선택해 주세요.
          </p>
        )}
      </div>

      {/* 🔝 맨 위로 이동 버튼 (웹 전용) */}
      <button
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] cursor-pointer mt-3 group"
      >
        <ChevronUp className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-transform group-hover:-translate-y-0.5" />
        <span>맨 위로 올라가기</span>
      </button>
    </div>
  );
}

function UnifiedKeyboardExamplesList({
  group,
  category,
}: {
  group: {
    rank: number;
    count?: number;
    users: UserStat[];
    examples: { nickname: string; content: string }[];
  };
  category: 'keyboard' | 'angang' | 'question' | 'morning' | 'potato';
}) {
  const [expandedUserNicknames, setExpandedUserNicknames] = React.useState<Record<string, boolean>>({});

  const toggleUserExpanded = (nickname: string) => {
    setExpandedUserNicknames((prev) => ({
      ...prev,
      [nickname]: !prev[nickname],
    }));
  };

  const userExamplesMap = React.useMemo(() => {
    return group.users.map((u) => {
      const userExs = group.examples.filter((ex) => ex.nickname === u.nickname);
      return {
        user: u,
        examples: userExs,
      };
    });
  }, [group]);

  const palettes = category === 'keyboard' ? [
    { bg: 'bg-rose-50/95 border-rose-200/90', badge: 'text-rose-950', quote: 'text-rose-600', color: 'rose' },
    { bg: 'bg-amber-50/95 border-amber-200/90', badge: 'text-amber-950', quote: 'text-amber-600', color: 'amber' },
    { bg: 'bg-orange-50/95 border-orange-200/90', badge: 'text-orange-950', quote: 'text-orange-600', color: 'orange' },
    { bg: 'bg-fuchsia-50/95 border-fuchsia-200/90', badge: 'text-fuchsia-950', quote: 'text-fuchsia-600', color: 'fuchsia' },
  ] : category === 'angang' ? [
    { bg: 'bg-sky-50/95 border-sky-200/90', badge: 'text-sky-950', quote: 'text-sky-600', color: 'sky' },
    { bg: 'bg-amber-50/95 border-amber-200/90', badge: 'text-amber-950', quote: 'text-amber-600', color: 'amber' },
    { bg: 'bg-teal-50/95 border-teal-200/90', badge: 'text-teal-950', quote: 'text-teal-600', color: 'teal' },
    { bg: 'bg-fuchsia-50/95 border-fuchsia-200/90', badge: 'text-fuchsia-950', quote: 'text-fuchsia-600', color: 'fuchsia' },
  ] : category === 'question' ? [
    { bg: 'bg-purple-50/95 border-purple-200/90', badge: 'text-purple-950', quote: 'text-purple-600', color: 'purple' },
    { bg: 'bg-amber-50/95 border-amber-200/90', badge: 'text-amber-950', quote: 'text-amber-600', color: 'amber' },
    { bg: 'bg-fuchsia-50/95 border-fuchsia-200/90', badge: 'text-fuchsia-950', quote: 'text-fuchsia-600', color: 'fuchsia' },
    { bg: 'bg-teal-50/95 border-teal-200/90', badge: 'text-teal-950', quote: 'text-teal-600', color: 'teal' },
  ] : category === 'potato' ? [
    { bg: 'bg-orange-50/95 border-orange-200/90', badge: 'text-orange-950', quote: 'text-orange-600', color: 'orange' },
    { bg: 'bg-amber-50/95 border-amber-200/90', badge: 'text-amber-950', quote: 'text-amber-600', color: 'amber' },
    { bg: 'bg-rose-50/95 border-rose-200/90', badge: 'text-rose-950', quote: 'text-rose-600', color: 'rose' },
    { bg: 'bg-fuchsia-50/95 border-fuchsia-200/90', badge: 'text-fuchsia-950', quote: 'text-fuchsia-600', color: 'fuchsia' },
  ] : [
    { bg: 'bg-emerald-50/95 border-emerald-200/90', badge: 'text-emerald-950', quote: 'text-emerald-600', color: 'emerald' },
    { bg: 'bg-amber-50/95 border-amber-200/90', badge: 'text-amber-950', quote: 'text-amber-600', color: 'amber' },
    { bg: 'bg-lime-50/95 border-lime-200/90', badge: 'text-lime-950', quote: 'text-lime-600', color: 'lime' },
    { bg: 'bg-teal-50/95 border-teal-200/90', badge: 'text-teal-950', quote: 'text-teal-600', color: 'teal' },
  ];


  return (
    <div className="space-y-1.5 pt-0.5">
      {userExamplesMap.map((uItem, uIdx) => {
        const isUserExpanded = !!expandedUserNicknames[uItem.user.nickname];
        const visibleExs = isUserExpanded ? uItem.examples : uItem.examples.slice(0, 3);
        const style = palettes[uIdx % palettes.length];
        const uTotal = uItem.examples.length;
        const uHasMore = uTotal > 3;
        const uRemaining = uTotal - 3;

        if (visibleExs.length === 0) return null;

        return (
          <div key={uItem.user.nickname} className="space-y-1">
            {visibleExs.map((exItem, exIdx) => {
              const isLastEx = exIdx === visibleExs.length - 1;

              return (
                <div
                  key={`${exItem.nickname}-${exIdx}`}
                  className={`border rounded-lg p-1.5 text-[9px] text-slate-800 leading-relaxed font-medium break-all flex items-start justify-between gap-1 ${style.bg} ${!isUserExpanded ? 'line-clamp-2' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <Quote className={`w-2.5 h-2.5 inline mr-1 flex-shrink-0 ${style.quote}`} />
                    <span className={`font-black mr-1 ${style.badge}`}>[{exItem.nickname}]:</span>
                    {category === 'angang' ? (
                      <HighlightedCryingText text={exItem.content} customColor={style.color} />
                    ) : category === 'question' ? (
                      <HighlightedQuestionText text={exItem.content} customColor={style.color} />
                    ) : category === 'morning' ? (
                      <HighlightedMorningText text={exItem.content} customColor={style.color} />
                    ) : category === 'potato' ? (
                      <HighlightedPotatoText text={exItem.content} customColor={style.color} />
                    ) : (
                      <HighlightedProfanityText text={exItem.content} customColor={style.color} />
                    )}
                  </div>

                  {isLastEx && uHasMore && (
                    <button
                      onClick={() => toggleUserExpanded(uItem.user.nickname)}
                      className={`ml-1 flex-shrink-0 text-[8px] font-black flex items-center gap-0.5 hover:underline cursor-pointer active:scale-95 transition-all self-end ${style.quote}`}
                    >
                      {isUserExpanded ? (
                        <>
                          <span>접기</span>
                          <ChevronUp className="w-2.5 h-2.5" />
                        </>
                      ) : (
                        <>
                          <span>더보기 ({uRemaining}개)</span>
                          <ChevronDown className="w-2.5 h-2.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// 👑 명예의 전당 통합 카드 컴포넌트 (1위 ~ 3위 모두 표시)
function UnifiedSpecialCard({
  title,
  subtitle,
  icon,
  users,
  metricFormatter,
  category,
  getExamples,
  emptyText,
}: {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  icon: React.ReactNode;
  users: UserStat[];
  metricFormatter: (u: UserStat) => string;
  category: 'pingpong' | 'keyboard' | 'lupin' | 'comment' | 'morning' | 'potato' | 'angang' | 'question';
  getExamples: (u: UserStat) => string[];
  emptyText: string;
}) {
  const isKeyboard = category === 'keyboard';
  const isAngang = category === 'angang';
  const isQuestion = category === 'question';
  const isMorning = category === 'morning';
  const isPotato = category === 'potato';
  const displayUsers = users || [];
  const medals = ['🥇 1위', '🥈 2위', '🥉 3위'];

  return (
    <div className="rounded-2xl border bg-slate-50 border-slate-200 p-3 space-y-2 transition-all shadow-xs overflow-hidden box-border">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex-shrink-0 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
              {title}
            </h3>
            <p className="text-[9px] text-slate-500 font-medium leading-tight mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {displayUsers.length > 0 ? (
        (isKeyboard || isAngang || isQuestion || isMorning || isPotato) ? (
          <div className="space-y-1.5">
            {(() => {
              const groupMap = new Map<number, { rank: number; count: number; users: UserStat[]; examples: { nickname: string; content: string }[] }>();

              displayUsers.forEach((u) => {
                const r = isKeyboard ? (u.profanityRank || 1) : isAngang ? (u.cryingRank || 1) : isMorning ? (u.morningRank || 1) : isPotato ? (u.potatoRank || 1) : (u.questionRank || 1);
                const cnt = isKeyboard ? u.profanityCount : isAngang ? u.cryingCount : isMorning ? u.morningCount : isPotato ? u.potatoCount : u.questionCount;
                const exList = isKeyboard ? u.profanityExamples : isAngang ? u.cryingExamples : isMorning ? u.morningExamples : isPotato ? u.potatoExamples : u.questionExamples;

                if (!groupMap.has(r)) {
                  groupMap.set(r, {
                    rank: r,
                    count: cnt,
                    users: [],
                    examples: [],
                  });
                }
                const group = groupMap.get(r)!;
                group.users.push(u);
                if (exList) {
                  exList.forEach((ex) => {
                    group.examples.push({ nickname: u.nickname, content: ex });
                  });
                }
              });

              return Array.from(groupMap.values()).sort((a, b) => a.rank - b.rank).slice(0, 3).map((group) => {
                const isTie = group.users.length > 1;
                const nicknamesStr = group.users.map((u) => u.nickname).join(', ');
                const bgStyle = 'bg-white border-slate-200 text-slate-900';
                const medalPrefix = group.rank === 1 ? '🥇 ' : group.rank === 2 ? '🥈 ' : group.rank === 3 ? '🥉 ' : '';
                const rankText = isTie
                  ? `${medalPrefix}공동 ${group.rank}위`
                  : group.rank <= 3
                  ? medals[group.rank - 1]
                  : `🏅 ${group.rank}위`;

                const metricText = `${group.count}개`;

                return (
                  <div key={`share-group-${group.rank}`} className="space-y-1">
                    <div className={`rounded-xl border p-2 flex items-center justify-between gap-2 shadow-2xs ${bgStyle}`}>
                      <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-1">
                        <span className="text-[11px] font-black flex-shrink-0">
                          {rankText}
                        </span>
                        <span className="font-extrabold text-xs whitespace-normal break-words leading-normal text-slate-900">
                          {nicknamesStr}
                        </span>
                      </div>

                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border flex-shrink-0 whitespace-nowrap self-center inline-block bg-slate-50 text-slate-700 border-slate-200">
                        {metricText}
                      </span>
                    </div>

                    {group.examples.length > 0 && (
                      <UnifiedKeyboardExamplesList group={group} category={category} />
                    )}
                  </div>
                );
              });
            })()}
          </div>
        ) : (
          <div className="space-y-1">
            {displayUsers.map((user, idx) => {
              const isFirst = idx === 0;
              const bgStyle = isFirst
                ? 'bg-indigo-50/70 border-indigo-200/90 text-indigo-950 font-bold'
                : 'bg-white border-slate-200 text-slate-900';

              return (
                <div key={user.nickname} className="space-y-1">
                  <div className={`rounded-xl border p-1.5 flex items-center justify-between shadow-2xs ${bgStyle}`}>
                    <div className="flex items-center gap-1.5 min-w-0 pr-1">
                      <span className="text-[11px] font-black flex-shrink-0">
                        {medals[idx]}
                      </span>
                      <span className="font-extrabold text-xs truncate">
                        {user.nickname}
                      </span>
                    </div>

                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border flex-shrink-0 whitespace-nowrap inline-block ${isFirst ? 'bg-white text-indigo-900 border-indigo-200 shadow-2xs' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                      {metricFormatter(user)}
                    </span>
                  </div>

                  {getExamples(user).length > 0 && (
                    <div className="space-y-1 pt-0.5">
                      {getExamples(user).map((ex, exIdx) => (
                        <div
                          key={exIdx}
                          className="bg-amber-50/90 border border-amber-200/90 rounded-lg p-1.5 text-[9px] text-slate-800 leading-relaxed font-medium break-all"
                        >
                          <Quote className="w-2.5 h-2.5 text-amber-600 inline mr-1 flex-shrink-0" />
                          <HighlightedProfanityText text={ex} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 text-center text-xs italic">
          {emptyText}
        </div>
      )}
    </div>
  );
}

function getShareMarkClass(color: string | undefined, defaultCategory: string) {
  const c = color || (defaultCategory === 'keyboard' ? 'rose' : defaultCategory === 'angang' ? 'sky' : defaultCategory === 'question' ? 'purple' : defaultCategory === 'morning' ? 'emerald' : defaultCategory === 'potato' ? 'orange' : 'indigo');
  const px = (defaultCategory === 'keyboard' || defaultCategory === 'morning' || defaultCategory === 'potato') ? 'px-0' : 'px-0.5';

  switch (c) {
    case 'rose':
      return `bg-rose-200/90 text-rose-950 ${px} py-0.5 rounded-xs font-black border-b border-rose-400`;
    case 'sky':
      return `bg-sky-200/90 text-sky-950 ${px} py-0.5 rounded-xs font-black border-b border-sky-400`;
    case 'amber':
      return `bg-amber-200/90 text-amber-950 ${px} py-0.5 rounded-xs font-black border-b border-amber-400`;
    case 'yellow':
      return `bg-yellow-200/90 text-yellow-950 ${px} py-0.5 rounded-xs font-black border-b border-yellow-400`;
    case 'emerald':
      return `bg-emerald-200/90 text-emerald-950 ${px} py-0.5 rounded-xs font-black border-b border-emerald-400`;
    case 'purple':
      return `bg-purple-200/90 text-purple-950 ${px} py-0.5 rounded-xs font-black border-b border-purple-400`;
    case 'fuchsia':
      return `bg-fuchsia-200/90 text-fuchsia-950 ${px} py-0.5 rounded-xs font-black border-b border-fuchsia-400`;
    case 'teal':
      return `bg-teal-200/90 text-teal-950 ${px} py-0.5 rounded-xs font-black border-b border-teal-400`;
    case 'orange':
      return `bg-orange-200/90 text-orange-950 ${px} py-0.5 rounded-xs font-black border-b border-orange-400`;
    case 'lime':
      return `bg-lime-200/90 text-lime-950 ${px} py-0.5 rounded-xs font-black border-b border-lime-400`;
    case 'cyan':
      return `bg-cyan-200/90 text-cyan-950 ${px} py-0.5 rounded-xs font-black border-b border-cyan-400`;
    default:
      return `bg-indigo-200/90 text-indigo-950 ${px} py-0.5 rounded-xs font-black border-b border-indigo-400`;
  }
}

const POTATO_HIGHLIGHT_REGEX = /(맛점|맛쩜|맛저|맛쩌)/gi;

// 감자.. 좀 쪄쭐까? 끼니 하이라이트
function HighlightedPotatoText({ text, customColor }: { text: string; customColor?: string }) {
  const parts = text.split(POTATO_HIGHLIGHT_REGEX);
  const markClassName = getShareMarkClass(customColor, 'potato');

  return (
    <span>
      {parts.map((part, i) => {
        const isMatch = POTATO_HIGHLIGHT_REGEX.test(part);
        POTATO_HIGHLIGHT_REGEX.lastIndex = 0;

        if (isMatch) {
          return (
            <mark
              key={i}
              className={markClassName}
            >
              {part}
            </mark>
          );
        }
        return part;
      })}
    </span>
  );
}

// 헐크 비속어 하이라이트 (px-0 적용)
function HighlightedProfanityText({ text, customColor }: { text: string; customColor?: string }) {
  const parts = text.split(PROFANITY_REGEX);
  const markClassName = getShareMarkClass(customColor, 'keyboard');

  return (
    <span>
      {parts.map((part, i) => {
        const isMatch = PROFANITY_REGEX.test(part);
        PROFANITY_REGEX.lastIndex = 0;

        if (isMatch) {
          return (
            <mark
              key={i}
              className={markClassName}
            >
              {part}
            </mark>
          );
        }
        return part;
      })}
    </span>
  );
}

const MORNING_HIGHLIGHT_REGEX = /(모닝|몬잉|머닝|모닁|마닝)/gi;

// 미라클 도비 아침 인사 하이라이트
function HighlightedMorningText({ text, customColor }: { text: string; customColor?: string }) {
  const parts = text.split(MORNING_HIGHLIGHT_REGEX);
  const markClassName = getShareMarkClass(customColor, 'morning');

  return (
    <span>
      {parts.map((part, i) => {
        const isMatch = MORNING_HIGHLIGHT_REGEX.test(part);
        MORNING_HIGHLIGHT_REGEX.lastIndex = 0;

        if (isMatch) {
          return (
            <mark
              key={i}
              className={markClassName}
            >
              {part}
            </mark>
          );
        }
        return part;
      })}
    </span>
  );
}

const CRYING_REGEX = /([ㅠㅜ][_.\-~^]?[ㅠㅜ]|[ㅠㅜ]{2,})/g;

// 앙앙이 ㅠㅠ/ㅜㅜ 하이라이트
function HighlightedCryingText({ text, customColor }: { text: string; customColor?: string }) {
  const parts = text.split(CRYING_REGEX);
  const markClassName = getShareMarkClass(customColor, 'angang');

  return (
    <span>
      {parts.map((part, i) => {
        const isMatch = CRYING_REGEX.test(part);
        CRYING_REGEX.lastIndex = 0;

        if (isMatch) {
          return (
            <mark
              key={i}
              className={markClassName}
            >
              {part}
            </mark>
          );
        }
        return part;
      })}
    </span>
  );
}

// 물음표 살인마 ? 하이라이트 (링크/URL 내 ? 및 감탄/리액션 표현 '오?', '오호?', '아?', '어?', '(?)' 제외)
function HighlightedQuestionText({ text, customColor }: { text: string; customColor?: string }) {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const parts = text.split(urlRegex);
  const markClassName = getShareMarkClass(customColor, 'question');

  return (
    <span>
      {parts.map((part, i) => {
        if (!part) return null;
        const isUrl = /(https?:\/\/[^\s]+|www\.[^\s]+)/i.test(part);
        if (isUrl) {
          return <React.Fragment key={i}>{part}</React.Fragment>;
        }

        const reactionQuestionRegex = /((?:오호|오|아|어|음|엥|응|읭|잉|하|허)[\?!]+|\(\?+\))/gi;
        const subParts = part.split(reactionQuestionRegex);

        return (
          <React.Fragment key={i}>
            {subParts.map((sub, j) => {
              if (reactionQuestionRegex.test(sub)) {
                reactionQuestionRegex.lastIndex = 0;
                return <React.Fragment key={j}>{sub}</React.Fragment>;
              }
              reactionQuestionRegex.lastIndex = 0;

              const qParts = sub.split(/(\?+)/g);
              return (
                <React.Fragment key={j}>
                  {qParts.map((qSub, k) => {
                    if (qSub.startsWith('?')) {
                      return (
                        <mark
                          key={k}
                          className={markClassName}
                        >
                          {qSub}
                        </mark>
                      );
                    }
                    return qSub;
                  })}
                </React.Fragment>
              );
            })}
          </React.Fragment>
        );
      })}
    </span>
  );
}
