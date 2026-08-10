'use client';

import React, { useRef, useState } from 'react';
import { toPng, toBlob } from 'html-to-image';
import { ParsingResult, UserStat } from '@/types/chat';
import { PROFANITY_REGEX } from '@/lib/kakaotalkParser';
import ChatCharts from '@/components/ChatCharts';
import { KAKAO_JAVASCRIPT_KEY } from '@/components/KakaoScript';
import { PingPongEmoji, KeyboardWarriorEmoji, HulkNativeEmoji, ThiefAvatarEmoji, CommentAlbaRobotEmoji, MiracleDobbyEmoji, AngangEmoji, QuestionEmoji, SpeechHabitEmoji, TrophySpeechEmoji, HallOfFameEmoji, ReportHeaderEmoji, CrystalBallEmoji } from '@/components/SpecialRankingsGrid';
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
  const { pingPongKing, keyboardWarrior, salaryLupin, commentAlba, miracleDobby, angangEmoji, questionKiller } = specialRankings;

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
        const captureOptions = { cacheBust: true, pixelRatio: 2.5, width: 440 };

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

  // 💛 카카오톡 어플 공유 (Kakao JavaScript SDK 공유 API)
  const handleShareToKakaoApp = async () => {
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

      const validRefs = capturePageRefs.current.filter((ref): ref is HTMLDivElement => ref !== null);
      const shareFiles: File[] = [];

      for (let i = 0; i < validRefs.length; i++) {
        const captureOptions = { cacheBust: true, pixelRatio: 2.5, width: 440 };

        const blob = await toBlob(validRefs[i], captureOptions);
        if (blob) {
          shareFiles.push(
            new File([blob], `분석결과_${i + 1}페이지.png`, { type: 'image/png' })
          );
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
    <div className="w-full max-w-6xl mx-auto my-8 space-y-4">
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
              emptyText="아침 인사(모닝/몬잉/머닝) 사용자가 없거나 부족합니다."
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
              emptyText="ㅠㅠ/ㅜㅜ 사용자가 없거나 부족합니다."
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
                    카카오톡 대화 분석 리포트
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

          {/* Section 2: 멤버별 순위& 레퍼토리 (전체 멤버 묶음) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 shadow-2xs flex-grow my-1 overflow-hidden box-border break-inside-avoid">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <SpeechHabitEmoji size={26} /> 멤버별 순위& 레퍼토리
              </h3>
              <span className="text-[9px] text-slate-500 font-mono">
                총 {userStats.length}명
              </span>
            </div>

            <div className="space-y-1.5">
              {userStats.map((user) => (
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
        </div>

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

          {/* Body: 3 Special Cards (핑퐁왕, 월급루팡, 댓글알바) */}
          <div className="space-y-3 flex-shrink-0">
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
          </div>
        </div>

        {/* 🌅 PAGE 3 (명예의 전당 Part 2): 미라클 도비, 랜선 여포 */}
        <div
          ref={(el) => { capturePageRefs.current[2] = el; }}
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

          {/* Body: 2 Special Cards (미라클 도비, 랜선 여포) */}
          <div className="space-y-3 flex-shrink-0">
            <UnifiedSpecialCard
              title="미라클 도비"
              subtitle="아침 개같은거 또 왔네"
              icon={<MiracleDobbyEmoji size={28} />}
              users={miracleDobby}
              metricFormatter={(u) => `${u.morningCount}개`}
              category="morning"
              getExamples={() => []}
              emptyText="아침 인사(모닝/몬잉/머닝) 사용자가 없거나 부족합니다."
            />

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
        </div>

        {/* 😭 PAGE 4 (명예의 전당 Part 3): 앙앙이, 물음표 살인마 */}
        <div
          ref={(el) => { capturePageRefs.current[3] = el; }}
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

          {/* Body: 2 Special Cards (앙앙이, 물음표 살인마) */}
          <div className="space-y-3 flex-shrink-0">
            <UnifiedSpecialCard
              title="앙앙이"
              subtitle="대화 중 눈물을 가장 많이 흘린 사람"
              icon={<AngangEmoji size={28} />}
              users={angangEmoji}
              metricFormatter={(u) => `${u.cryingCount}개`}
              category="angang"
              getExamples={(u) => u.cryingExamples || []}
              emptyText="ㅠㅠ/ㅜㅜ 사용자가 없거나 부족합니다."
            />

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
        </div>

        {/* 📈 PAGE 5 (대화 성향 분석 독립 페이지): ChatCharts */}
        <div
          ref={(el) => { capturePageRefs.current[4] = el; }}
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
            <ChatCharts parsingResult={parsingResult} />
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
  category: 'keyboard' | 'angang' | 'question' | 'morning';
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
  category: 'pingpong' | 'keyboard' | 'lupin' | 'comment' | 'morning' | 'angang' | 'question';
  getExamples: (u: UserStat) => string[];
  emptyText: string;
}) {
  const isKeyboard = category === 'keyboard';
  const isAngang = category === 'angang';
  const isQuestion = category === 'question';
  const isMorning = category === 'morning';
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
        (isKeyboard || isAngang || isQuestion || isMorning) ? (
          <div className="space-y-1.5">
            {(() => {
              const groupMap = new Map<number, { rank: number; count: number; users: UserStat[]; examples: { nickname: string; content: string }[] }>();

              displayUsers.forEach((u) => {
                const r = isKeyboard ? (u.profanityRank || 1) : isAngang ? (u.cryingRank || 1) : isMorning ? (u.morningRank || 1) : (u.questionRank || 1);
                const cnt = isKeyboard ? u.profanityCount : isAngang ? u.cryingCount : isMorning ? u.morningCount : u.questionCount;
                const exList = isKeyboard ? u.profanityExamples : isAngang ? u.cryingExamples : isMorning ? u.morningExamples : u.questionExamples;

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

              const specialGroups = Array.from(groupMap.values()).sort((a, b) => a.rank - b.rank).slice(0, 3);

              return specialGroups.map((group) => {
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
  const c = color || (defaultCategory === 'keyboard' ? 'rose' : defaultCategory === 'angang' ? 'sky' : defaultCategory === 'question' ? 'purple' : defaultCategory === 'morning' ? 'emerald' : 'indigo');
  const px = (defaultCategory === 'keyboard' || defaultCategory === 'morning') ? 'px-0' : 'px-0.5';

  switch (c) {
    case 'rose':
      return `bg-rose-200/90 text-rose-950 ${px} py-0.5 rounded-xs font-black border-b border-rose-400`;
    case 'sky':
      return `bg-sky-200/90 text-sky-950 ${px} py-0.5 rounded-xs font-black border-b border-sky-400`;
    case 'amber':
      return `bg-amber-200/90 text-amber-950 ${px} py-0.5 rounded-xs font-black border-b border-amber-400`;
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

const MORNING_HIGHLIGHT_REGEX = /(모닝|몬잉|머닝)/gi;

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

const CRYING_REGEX = /([ㅠㅜ]{2,})/g;

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
