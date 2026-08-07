'use client';

import React, { useRef, useState } from 'react';
import { toPng, toBlob } from 'html-to-image';
import { ParsingResult, UserStat } from '@/types/chat';
import { PROFANITY_REGEX } from '@/lib/kakaotalkParser';
import ChatCharts from '@/components/ChatCharts';
import { HulkNativeEmoji, ThiefAvatarEmoji, CommentAlbaRobotEmoji } from '@/components/SpecialRankingsGrid';
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

export default function KakaoTalkShareCard({ parsingResult }: KakaoTalkShareCardProps) {
  // 📸 캡처 대상 3개 페이지 Refs (Page 1: Top3+말버릇통합, Page 2: 핑퐁왕+헐크, Page 3: 월급루팡+대화성향분석)
  const capturePageRefs = useRef<(HTMLDivElement | null)[]>([]);

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
  const { pingPongKing, keyboardWarrior, salaryLupin, commentAlba } = specialRankings;

  let peakHour = 0;
  let peakCount = 0;
  hourlyDistribution.forEach((item) => {
    if (item.count > peakCount) {
      peakCount = item.count;
      peakHour = item.hour;
    }
  });

  const peakHourText = formatPeakHourPeriod(peakHour);

  // 총 캡처 페이지 수 = 3개 (황금 밸런스 3페이지 체제)
  const totalPages = 3;

  // 🔥 이미지 다운로드 (Page 1은 유연한 세로 길이 캡처, Page 2&3은 9:16 규격 캡처)
  const handleDownloadAllPages = async () => {
    setIsGenerating(true);
    try {
      const validRefs = capturePageRefs.current.filter((ref): ref is HTMLDivElement => ref !== null);

      for (let i = 0; i < validRefs.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        const captureOptions = { cacheBust: true, pixelRatio: 2.5, width: 450 };

        const dataUrl = await toPng(validRefs[i], captureOptions);
        const link = document.createElement('a');
        link.download = `분석결과_${i + 1}페이지.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Failed to generate images:', err);
      alert('이미지 저장 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 💛 카카오톡 어플 공유
  const handleShareToKakaoApp = async () => {
    setIsGenerating(true);
    try {
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
📱 [카카오톡 대화 분석 완벽 리포트]
📅 분석 기간: ${startDateStr} ~ ${endDateStr} (${totalMessages.toLocaleString()}개 메시지, ${uniqueUsersCount}명)

🥇 [전체 채팅 작성량 Top 3]
${userStats
  .slice(0, 3)
  .map(
    (u, i) =>
      ` ${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} ${u.nickname}: ${u.totalMessages.toLocaleString()}개`
  )
  .join('\n')}

🗣️ [멤버별 대표 말버릇]
${formatHabits(userStats)}

👑 [명예의 전당 Top 3]
🏓 핑퐁왕: ${formatTop3List(pingPongKing, (u) => u.avgReplyTimeFormatted)}
👊 손가락만 헐크: ${formatTop3List(keyboardWarrior, (u) => `${u.profanityCount}건`)}
💼 월급루팡: ${formatTop3List(salaryLupin, (u) => `${u.workHourMessages}회`)}
      `.trim();

      const validRefs = capturePageRefs.current.filter((ref): ref is HTMLDivElement => ref !== null);
      const shareFiles: File[] = [];

      for (let i = 0; i < validRefs.length; i++) {
        const captureOptions = { cacheBust: true, pixelRatio: 2.5, width: 450 };

        const blob = await toBlob(validRefs[i], captureOptions);
        if (blob) {
          shareFiles.push(
            new File([blob], `분석결과_${i + 1}페이지.png`, { type: 'image/png' })
          );
        }
      }

      if (shareFiles.length > 0 && navigator.share && navigator.canShare && navigator.canShare({ files: shareFiles })) {
        await navigator.share({
          title: '📱 카카오톡 대화 분석 리포트',
          text: textSummary,
          files: shareFiles,
        });
        setCopiedStatus('kakaoApp');
        setTimeout(() => setCopiedStatus(null), 2500);
        return;
      }

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
    <div className="w-full max-w-6xl mx-auto my-8 space-y-4">
      {/* 💻 [웹사이트 화면 Display 리포트 컨테이너] */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl divide-y divide-slate-200">
        {/* Section 1: Top 3 & 개요 Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-b from-indigo-50/60 to-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 text-white shadow-md flex-shrink-0">
                <Crown className="w-6 h-6 text-amber-200" />
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

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-xs overflow-hidden box-border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span className="text-amber-500">💬</span> 전체 채팅 작성량 Top 3
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                총 {totalMessages.toLocaleString()}개 기준
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {top3Chatters.map((user, idx) => {
                const medalBgStyles = [
                  'bg-gradient-to-br from-amber-100 via-yellow-100 to-amber-200 border-amber-400 shadow-xs text-amber-950',
                  'bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 border-slate-400 shadow-xs text-slate-900',
                  'bg-gradient-to-br from-[#f8d7c4] via-[#e5a073] to-[#c66e2e] border-[#a85317] shadow-xs text-[#3b1702]',
                ];

                const metricBadgeStyles = [
                  'bg-amber-200/80 text-amber-950 border-amber-400',
                  'bg-slate-200/90 text-slate-900 border-slate-400',
                  'bg-[#f0ba97] text-[#3b1702] border-[#a85317]',
                ];

                return (
                  <div
                    key={user.nickname}
                    className={`p-3 rounded-xl border flex items-center justify-between overflow-hidden box-border ${medalBgStyles[idx]}`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <span className="text-xs sm:text-sm font-extrabold flex-shrink-0">
                        {idx === 0 ? '🥇 1위' : idx === 1 ? '🥈 2위' : '🥉 3위'}
                      </span>
                      <span className="font-extrabold text-xs sm:text-sm truncate">
                        {user.nickname}
                      </span>
                    </div>

                    <span className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded border flex-shrink-0 ${metricBadgeStyles[idx]}`}>
                      {user.totalMessages.toLocaleString()}개
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 2: 멤버별 대표 말버릇 */}
        <div className="p-4 sm:p-6 bg-white space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              <span className="text-indigo-600">🗣️</span> 멤버별 대표 말버릇
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

        {/* Section 3: 명예의 전당 👑 */}
        <div className="p-4 sm:p-6 bg-slate-50/50 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                명예의 전당 👑
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <UnifiedSpecialCard
              title={
                <span className="inline-flex items-center gap-1.5">
                  <span>핑퐁왕</span>
                  <span className="text-xl leading-none">🏓</span>
                </span>
              }
              subtitle="다른 사람이 말하면 평균 답장 시간이 가장 짧은 닉네임"
              icon={<Zap className="w-4 h-4 text-indigo-600" />}
              users={pingPongKing}
              metricFormatter={(u) => u.avgReplyTimeFormatted}
              category="pingpong"
              getExamples={() => []}
              emptyText="답장 반응속도 데이터가 부족합니다."
            />

            <UnifiedSpecialCard
              title={
                <span className="inline-flex items-center gap-1.5">
                  <span>손가락만 헐크</span>
                  <HulkNativeEmoji className="text-lg" />
                </span>
              }
              subtitle="비속어·욕설 사용 건수가 가장 많은 닉네임"
              icon={<Flame className="w-4 h-4 text-indigo-600" />}
              users={keyboardWarrior}
              metricFormatter={(u) => `비속어 ${u.profanityCount}건`}
              category="keyboard"
              getExamples={(u) => {
                if (!u.profanityExamples || u.profanityExamples.length === 0) return [];
                const limit = u.profanityCount >= 5 ? 5 : u.profanityCount;
                return u.profanityExamples.slice(0, limit);
              }}
              emptyText="비속어 사용자가 없거나 부족합니다."
            />

            <UnifiedSpecialCard
              title={
                <span className="inline-flex items-center gap-1.5">
                  <span>월급루팡</span>
                  <ThiefAvatarEmoji size={26} />
                </span>
              }
              subtitle="오전 9시~오후 6시 사이 채팅 메시지가 가장 많은 닉네임"
              icon={<Briefcase className="w-5 h-5 text-indigo-600" />}
              users={salaryLupin}
              metricFormatter={(u) => `${u.workHourMessages}회`}
              category="lupin"
              getExamples={() => []}
              emptyText="근무시간 내 메시지가 없습니다."
            />

            <UnifiedSpecialCard
              title={
                <span className="inline-flex items-center gap-1.5">
                  <span>댓글알바</span>
                  <CommentAlbaRobotEmoji size={26} />
                </span>
              }
              subtitle="다른 사람 대화에 댓글/답글을 가장 많이 남긴 닉네임"
              icon={<MessageSquare className="w-4 h-4 text-indigo-600" />}
              users={commentAlba}
              metricFormatter={(u) => `댓글 ${u.commentCount}개`}
              category="comment"
              getExamples={() => []}
              emptyText="댓글/답글 작성 데이터가 부족합니다."
            />
          </div>

          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  대화 성향 분석 📈
                </h2>
              </div>
            </div>
            <ChatCharts parsingResult={parsingResult} />
          </div>
        </div>
      </div>

      {/* 📱 [공유/다운로드 전용 캡처 DOM] */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none space-y-6">
        {/* 🟡 PAGE 1 (통합 카드): 전체 채팅 작성량 Top 3 + 멤버별 대표 말버릇 (전체 수록) */}
        <div
          ref={(el) => { capturePageRefs.current[0] = el; }}
          className="w-[450px] min-h-[800px] rounded-3xl p-5 bg-white border border-slate-200 text-slate-900 flex flex-col justify-between box-border relative space-y-4"
        >
          {/* Top Header Bar */}
          <div className="border-b border-slate-200 pb-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 text-white shadow-sm">
                  <Crown className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    카톡 대화 분석 리포트
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

          {/* Section 1: 전체 채팅 작성량 Top 3 */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span className="text-amber-500">💬</span> 전체 채팅 작성량 Top 3
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

          {/* Section 2: 멤버별 대표 말버릇 (전체 멤버 묶음) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span className="text-indigo-600">🗣️</span> 멤버별 대표 말버릇 (전체)
              </h3>
              <span className="text-[9px] text-slate-500 font-mono">
                총 {userStats.length}명
              </span>
            </div>

            <div className="space-y-2">
              {userStats.map((user) => (
                <div
                  key={user.nickname}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 text-xs shadow-2xs overflow-hidden box-border whitespace-nowrap"
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

          {/* Footer */}
          <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200 font-mono">
            <span>💬 KakaoTalk Mobile Analytics Report</span>
            <span>1 / {totalPages} (Top3 & 말버릇 통합 카드)</span>
          </div>
        </div>

        {/* 👑 PAGE 2: 명예의 전당 👑 (핑퐁왕 & 손가락만 헐크) */}
        <div
          ref={(el) => { capturePageRefs.current[1] = el; }}
          className="w-[450px] min-h-[800px] h-auto overflow-visible rounded-3xl p-5 bg-white border border-slate-200 text-slate-900 flex flex-col justify-between box-border relative my-4"
        >
          {/* Top Header Bar */}
          <div className="border-b border-slate-200 pb-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-sm">
                  <Crown className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    명예의 전당 👑
                  </h2>
                  <p className="text-[10px] text-slate-500 font-medium">
                    📅 {startDateStr} ~ {endDateStr} ({totalMessages.toLocaleString()}개 대화)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Body: 핑퐁왕 & 손가락만 헐크 Cards (완벽 노-잘림) */}
          <div className="space-y-3 my-auto py-2">
            <UnifiedSpecialCard
              title={
                <span className="inline-flex items-center gap-1">
                  <span>핑퐁왕</span>
                  <span className="text-base sm:text-lg leading-none">🏓</span>
                </span>
              }
              subtitle="답장 시간이 가장 짧은 닉네임"
              icon={<Zap className="w-3.5 h-3.5 text-indigo-600" />}
              users={pingPongKing}
              metricFormatter={(u) => u.avgReplyTimeFormatted}
              category="pingpong"
              getExamples={() => []}
              emptyText="데이터 부족"
            />

            <UnifiedSpecialCard
              title={<span className="inline-flex items-center gap-1">손가락만 헐크 <HulkNativeEmoji className="text-base" /></span>}
              subtitle="비속어·욕설 사용 건수가 가장 많은 닉네임"
              icon={<Flame className="w-3.5 h-3.5 text-indigo-600" />}
              users={keyboardWarrior}
              metricFormatter={(u) => `비속어 ${u.profanityCount}건`}
              category="keyboard"
              getExamples={(u) => {
                if (!u.profanityExamples || u.profanityExamples.length === 0) return [];
                const limit = u.profanityCount >= 5 ? 5 : u.profanityCount;
                return u.profanityExamples.slice(0, limit);
              }}
              emptyText="데이터 부족"
            />
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200 font-mono">
            <span>💬 KakaoTalk Mobile Analytics Report</span>
            <span>2 / {totalPages} (명예의 전당 핑퐁왕 & 헐크 카드)</span>
          </div>
        </div>

        {/* 💼 PAGE 3: 명예의 전당 (월급루팡) & 📈 대화 성향 분석 */}
        <div
          ref={(el) => { capturePageRefs.current[2] = el; }}
          className="w-[450px] min-h-[800px] h-auto overflow-visible rounded-3xl p-5 bg-white border border-slate-200 text-slate-900 flex flex-col justify-between box-border relative my-4"
        >
          {/* Body: 2 Main Sections */}
          <div className="space-y-3.5 my-auto">
            {/* Section 1: 명예의 전당 👑 Main Top Header */}
            <div className="border-b border-slate-200 pb-2 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-sm">
                    <Crown className="w-5 h-5 text-amber-200" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                      명예의 전당 👑
                    </h2>
                    <p className="text-[10px] text-slate-500 font-medium">
                      📅 {startDateStr} ~ {endDateStr} ({totalMessages.toLocaleString()}개 대화)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 월급루팡 Card */}
            <UnifiedSpecialCard
              title={<span className="inline-flex items-center gap-1 text-xs"><span>월급루팡</span> <ThiefAvatarEmoji size={18} /></span>}
              subtitle="근무시간(09시~18시) 대화 작성 건수가 가장 많은 닉네임"
              icon={<Briefcase className="w-3.5 h-3.5 text-indigo-600" />}
              users={salaryLupin}
              metricFormatter={(u) => `${u.workHourMessages}회`}
              category="lupin"
              getExamples={() => []}
              emptyText="근무시간 내 메시지가 없습니다."
            />

            {/* 댓글알바 Card */}
            <UnifiedSpecialCard
              title={
                <span className="inline-flex items-center gap-1 text-xs">
                  <span>댓글알바</span>
                  <CommentAlbaRobotEmoji size={18} />
                </span>
              }
              subtitle="다른 사람 대화에 댓글/답글을 가장 많이 남긴 닉네임"
              icon={<MessageSquare className="w-3.5 h-3.5 text-indigo-600" />}
              users={commentAlba}
              metricFormatter={(u) => `댓글 ${u.commentCount}개`}
              category="comment"
              getExamples={() => []}
              emptyText="댓글/답글 작성 데이터가 부족합니다."
            />

            {/* Section 2: 대화 성향 분석 📈 Main Header */}
            <div className="border-b border-slate-200 pb-2 pt-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-sm">
                    <Crown className="w-5 h-5 text-amber-200" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                      대화 성향 분석 📈
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            {/* ChatCharts */}
            <ChatCharts parsingResult={parsingResult} isCapture={true} />
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200 font-mono">
            <span>💬 KakaoTalk Mobile Analytics Report</span>
            <span>3 / {totalPages} (명예의 전당 & 대화 성향 분석 카드)</span>
          </div>
        </div>
      </div>

      {/* 💛 하단 액션바 (카카오톡 분석 내용 공유) */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col space-y-3 shadow-xs mt-6">
        {/* Row 1: Title */}
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm flex-shrink-0">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              카카오톡 분석 내용 공유
            </h3>
          </div>
        </div>

        {/* Row 2: Action Buttons */}
        <div className="grid grid-cols-2 gap-2 w-full">
          {/* 💛 카카오톡 어플 공유 버튼 */}
          <button
            onClick={handleShareToKakaoApp}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-1.5 px-2.5 py-3 rounded-xl bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] text-xs font-black shadow-md transition-all active:scale-95 border border-amber-300 disabled:opacity-50"
          >
            <MessageCircle className="w-4 h-4 text-amber-950 flex-shrink-0" />
            <span>
              {copiedStatus === 'kakaoApp'
                ? '공유 완료!'
                : '카톡으로 공유하기'}
            </span>
          </button>

          {/* 📸 이미지 다운로드 버튼 */}
          <button
            onClick={handleDownloadAllPages}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-1.5 px-2.5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4 flex-shrink-0" />
            <span>이미지 다운로드</span>
          </button>
        </div>
      </div>
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
  category: 'pingpong' | 'keyboard' | 'lupin' | 'comment';
  getExamples: (u: UserStat) => string[];
  emptyText: string;
}) {
  const displayUsers = users ? (category === 'keyboard' ? users : users.slice(0, 3)) : [];
  const medals = ['🥇 1위', '🥈 2위', '🥉 3위'];

  return (
    <div className="rounded-2xl border bg-slate-50 border-slate-200 p-3 space-y-2 transition-all shadow-xs overflow-hidden box-border">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-white border border-slate-200 text-indigo-600 shadow-2xs">
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
        category === 'keyboard' ? (
          <div className="space-y-1.5">
            {(() => {
              const groupMap = new Map<number, { rank: number; profanityCount: number; users: UserStat[]; examples: { nickname: string; content: string }[] }>();

              displayUsers.forEach((u) => {
                const r = u.profanityRank || 1;
                if (!groupMap.has(r)) {
                  groupMap.set(r, {
                    rank: r,
                    profanityCount: u.profanityCount,
                    users: [],
                    examples: [],
                  });
                }
                const group = groupMap.get(r)!;
                group.users.push(u);
                if (u.profanityExamples) {
                  u.profanityExamples.forEach((ex) => {
                    if (!group.examples.some((e) => e.nickname === u.nickname && e.content === ex)) {
                      group.examples.push({ nickname: u.nickname, content: ex });
                    }
                  });
                }
              });

              const keyboardGroups = Array.from(groupMap.values()).sort((a, b) => a.rank - b.rank);

              return keyboardGroups.map((group) => {
                const isTie = group.users.length > 1;
                const nicknamesStr = group.users.map((u) => u.nickname).join(', ');
                const isFirst = group.rank === 1;
                const bgStyle = 'bg-white border-slate-200 text-slate-900';
                const medalPrefix = group.rank === 1 ? '🥇 ' : group.rank === 2 ? '🥈 ' : group.rank === 3 ? '🥉 ' : '';
                const rankText = isTie
                  ? `${medalPrefix}공동 ${group.rank}위`
                  : group.rank <= 3
                  ? medals[group.rank - 1]
                  : `🏅 ${group.rank}위`;

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
                        비속어 {group.profanityCount}건
                      </span>
                    </div>

                    {group.examples.length > 0 && (
                      <div className="space-y-1 pt-0.5">
                        {group.examples.slice(0, 5 * group.users.length).map((exItem, exIdx) => {
                          const userIdx = group.users.findIndex((u) => u.nickname === exItem.nickname);
                          const palettes = [
                            { bg: 'bg-indigo-50/95 border-indigo-200/90', badge: 'text-indigo-950', quote: 'text-indigo-600' },
                            { bg: 'bg-emerald-50/95 border-emerald-200/90', badge: 'text-emerald-950', quote: 'text-emerald-600' },
                            { bg: 'bg-amber-50/95 border-amber-200/90', badge: 'text-amber-950', quote: 'text-amber-600' },
                            { bg: 'bg-rose-50/95 border-rose-200/90', badge: 'text-rose-950', quote: 'text-rose-600' },
                            { bg: 'bg-purple-50/95 border-purple-200/90', badge: 'text-purple-950', quote: 'text-purple-600' },
                            { bg: 'bg-teal-50/95 border-teal-200/90', badge: 'text-teal-950', quote: 'text-teal-600' },
                          ];
                          const style = palettes[(userIdx >= 0 ? userIdx : 0) % palettes.length];

                          return (
                            <div
                              key={exIdx}
                              className={`border rounded-lg p-1.5 text-[9px] text-slate-800 leading-relaxed font-medium break-all ${style.bg}`}
                            >
                              <Quote className={`w-2.5 h-2.5 inline mr-1 flex-shrink-0 ${style.quote}`} />
                              <span className={`font-black mr-1 ${style.badge}`}>[{exItem.nickname}]:</span>
                              <HighlightedProfanityText text={exItem.content} />
                            </div>
                          );
                        })}
                      </div>
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

// 헐크 비속어 하이라이트 (px-0 적용)
function HighlightedProfanityText({ text }: { text: string }) {
  const parts = text.split(PROFANITY_REGEX);

  return (
    <span>
      {parts.map((part, i) => {
        const isMatch = PROFANITY_REGEX.test(part);
        PROFANITY_REGEX.lastIndex = 0;

        if (isMatch) {
          return (
            <mark
              key={i}
              className="bg-amber-200/90 text-amber-950 px-0 py-0.5 rounded-xs font-black border-b border-amber-400"
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
