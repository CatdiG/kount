'use client';

import React from 'react';
import Image from 'next/image';
import { SpecialRankings, UserStat } from '@/types/chat';
import { PROFANITY_REGEX } from '@/lib/kakaotalkParser';
import { Zap, Flame, Briefcase, Crown, Quote, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

interface SpecialRankingsGridProps {
  specialRankings: SpecialRankings;
}

// 💻 🤬 사용자 제공 원본 랜선 여포 이미지를 이모티콘 스타일 컴포넌트로 생성
export function KeyboardWarriorEmoji({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/keyboard-warrior-emoji.png"
      alt="랜선 여포 이모티콘"
      width={size}
      height={size}
      className="inline-block align-middle object-contain pointer-events-none select-none"
      unoptimized
    />
  );
}

// 기존 하위 호환을 위한 HulkNativeEmoji 별칭
export function HulkNativeEmoji({ size = 28 }: { size?: number }) {
  return <KeyboardWarriorEmoji size={size} />;
}

// 💰 🕵️‍♂️ 사용자 제공 원본 도둑 이미지를 이모티콘 스타일 컴포넌트로 생성
export function ThiefAvatarEmoji({ size = 28 }: { size?: number }) {
  const scaledSize = Math.round(size * 1.15);
  return (
    <Image
      src="/thief-avatar.png"
      alt="월급루팡 도둑 이모티콘"
      width={scaledSize}
      height={scaledSize}
      className="inline-block align-middle object-contain pointer-events-none select-none"
      unoptimized
    />
  );
}

// 👽 💻 사용자 제공 원본 댓글알바 외계인 개발자 이모티콘 컴포넌트 생성
export function CommentAlbaRobotEmoji({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/comment-alba-emoji.png"
      alt="댓글알바 이모티콘"
      width={size}
      height={size}
      className="inline-block align-middle object-contain pointer-events-none select-none"
      unoptimized
    />
  );
}

// 🌅 🌄 사용자 제공 원본 미라클 도비 아침 일출 이모티콘 컴포넌트 생성
export function MiracleDobbyEmoji({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/miracle-dobby-emoji.png"
      alt="미라클 도비 이모티콘"
      width={size}
      height={size}
      className="inline-block align-middle object-contain pointer-events-none select-none"
      unoptimized
    />
  );
}

// 😭 사용자 제공 원본 앙앙이 슬픈 이모티콘 컴포넌트 생성
export function AngangEmoji({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/angang-emoji.png"
      alt="앙앙이 슬픈 이모티콘"
      width={size}
      height={size}
      className="inline-block align-middle object-contain pointer-events-none select-none"
      unoptimized
    />
  );
}

// ❓ 사용자 제공 원본 물음표 이모티콘 컴포넌트 생성
export function QuestionEmoji({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/question-emoji.png"
      alt="물음표 살인마 이모티콘"
      width={size}
      height={size}
      className="inline-block align-middle object-contain pointer-events-none select-none"
      unoptimized
    />
  );
}

// 🔮 사용자 제공 원본 대화 성향 분석 수정구슬 이모티콘 컴포넌트 생성
export function CrystalBallEmoji({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/crystal-ball-emoji.png"
      alt="대화 성향 분석 이모티콘"
      width={size}
      height={size}
      className="inline-block align-middle object-contain pointer-events-none select-none"
      unoptimized
    />
  );
}

// 💬 😃 사용자 제공 원본 말버릇 말풍선 이모티콘 컴포넌트 생성
export function SpeechHabitEmoji({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/speech-habit-emoji.png"
      alt="멤버별 순위& 레퍼토리 이모티콘"
      width={size}
      height={size}
      className="inline-block align-middle object-contain pointer-events-none select-none"
      unoptimized
    />
  );
}

// 🏆 🗣️ 사용자 제공 원본 카카오톡 상주민 트로피 말풍선 이모티콘 컴포넌트 생성
export function TrophySpeechEmoji({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/trophy-speech-emoji.png"
      alt="카카오톡 상주민 이모티콘"
      width={size}
      height={size}
      className="inline-block align-middle object-contain pointer-events-none select-none"
      unoptimized
    />
  );
}

// 🎆 👍 사용자 제공 원본 카카오톡 대화 분석 리포트 불꽃 따봉 이모티콘 컴포넌트 생성
export function ReportHeaderEmoji({ size = 38 }: { size?: number }) {
  return (
    <Image
      src="/report-header-emoji.png"
      alt="카카오톡 대화 분석 리포트 이모티콘"
      width={size}
      height={size}
      className="inline-block align-middle object-contain pointer-events-none select-none"
      unoptimized
    />
  );
}

// 👑 😊 사용자 제공 원본 명예의 전당 왕관 얼굴 이모티콘 컴포넌트 생성
export function HallOfFameEmoji({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/hall-of-fame-emoji.png"
      alt="명예의 전당 이모티콘"
      width={size}
      height={size}
      className="inline-block align-middle object-contain pointer-events-none select-none"
      unoptimized
    />
  );
}

// 🏓 🏸 사용자 제공 원본 핑퐁왕 셔틀콕 이모티콘 컴포넌트 생성
export function PingPongEmoji({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/pingpong-emoji.png"
      alt="핑퐁왕 이모티콘"
      width={size}
      height={size}
      className="inline-block align-middle object-contain pointer-events-none select-none"
      unoptimized
    />
  );
}

export default function SpecialRankingsGrid({ specialRankings }: SpecialRankingsGridProps) {
  const { pingPongKing, keyboardWarrior, salaryLupin, commentAlba, miracleDobby, angangEmoji, questionKiller } = specialRankings;

  return (
    <div className="w-full max-w-6xl mx-auto my-10 space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center">
            <HallOfFameEmoji size={45} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              명예의 전당
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              각 순위별 1위~3위 수상자가 남긴 실제 대화 대표 예시 문장과 주요 수치가 하이라이트된 분석결과입니다.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <RankingCard
          title="핑퐁왕"
          subtitle="다른 사람이 말하면 평균 답장 시간이 가장 짧은 사람"
          icon={<PingPongEmoji size={28} />}
          users={pingPongKing}
          metricFormatter={(u) => u.avgReplyTimeFormatted}
          category="pingpong"
          getExamples={() => []}
          emptyText="답장 반응속도를 집계할 데이터가 부족합니다."
        />

        <RankingCard
          title="월급루팡"
          subtitle="오전 9시~오후 6시 사이 채팅 메시지가 가장 많은 사람"
          icon={<ThiefAvatarEmoji size={28} />}
          users={salaryLupin}
          metricFormatter={(u) => `${u.workHourMessages}개`}
          category="lupin"
          getExamples={() => []}
          emptyText="근무시간 내 메시지가 없습니다."
        />

        <RankingCard
          title="댓글알바"
          subtitle="다른 사람 대화에 댓글/답글을 가장 많이 남긴 사람"
          icon={<CommentAlbaRobotEmoji size={28} />}
          users={commentAlba}
          metricFormatter={(u) => `${u.commentCount}개`}
          category="comment"
          getExamples={() => []}
          emptyText="댓글/답글 작성 데이터가 부족합니다."
        />

        <RankingCard
          title="미라클 도비"
          subtitle="아침 개같은거 또 왔네"
          icon={<MiracleDobbyEmoji size={28} />}
          users={miracleDobby}
          metricFormatter={(u) => `${u.morningCount}개`}
          category="morning"
          getExamples={() => []}
          emptyText="아침 인사(모닝/몬잉/머닝) 사용자가 없거나 데이터가 부족합니다."
        />

        <RankingCard
          title="랜선 여포"
          subtitle="비속어·욕설 사용 건수가 가장 많은 사람"
          icon={<KeyboardWarriorEmoji size={28} />}
          users={keyboardWarrior}
          metricFormatter={(u) => `${u.profanityCount}개`}
          category="keyboard"
          getExamples={(u) => u.profanityExamples || []}
          emptyText="비속어 사용자가 없거나 데이터가 부족합니다."
        />

        <RankingCard
          title="앙앙이"
          subtitle="대화 중 눈물을 가장 많이 흘린 사람"
          icon={<AngangEmoji size={28} />}
          users={angangEmoji}
          metricFormatter={(u) => `${u.cryingCount}개`}
          category="angang"
          getExamples={(u) => u.cryingExamples || []}
          emptyText="ㅠㅠ/ㅜㅜ 사용자가 없거나 데이터가 부족합니다."
        />

        <RankingCard
          title="물음표 살인마"
          subtitle="대화 중 '?'를 가장 많이 사용한 사람"
          icon={<QuestionEmoji size={28} />}
          users={questionKiller}
          metricFormatter={(u) => `${u.questionCount}개`}
          category="question"
          getExamples={(u) => u.questionExamples || []}
          emptyText="물음표(?) 사용자가 없거나 데이터가 부족합니다."
        />
      </div>
    </div>
  );
}

interface RankingCardProps {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  icon: React.ReactNode;
  users: UserStat[];
  metricFormatter: (u: UserStat) => string;
  category: 'pingpong' | 'keyboard' | 'lupin' | 'comment' | 'morning' | 'angang' | 'question';
  getExamples: (u: UserStat) => string[];
  emptyText: string;
}

interface SpecialGroupType {
  rank: number;
  count: number;
  users: UserStat[];
  examples: { nickname: string; content: string }[];
}

function KeyboardExamplesList({
  group,
  category,
}: {
  group: SpecialGroupType;
  category: 'pingpong' | 'keyboard' | 'lupin' | 'comment' | 'morning' | 'angang' | 'question';
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
    { bg: 'bg-rose-50/95 border-rose-200/90', badge: 'text-rose-950', num: 'text-rose-600', color: 'rose' },
    { bg: 'bg-amber-50/95 border-amber-200/90', badge: 'text-amber-950', num: 'text-amber-600', color: 'amber' },
    { bg: 'bg-orange-50/95 border-orange-200/90', badge: 'text-orange-950', num: 'text-orange-600', color: 'orange' },
    { bg: 'bg-fuchsia-50/95 border-fuchsia-200/90', badge: 'text-fuchsia-950', num: 'text-fuchsia-600', color: 'fuchsia' },
  ] : category === 'angang' ? [
    { bg: 'bg-sky-50/95 border-sky-200/90', badge: 'text-sky-950', num: 'text-sky-600', color: 'sky' },
    { bg: 'bg-amber-50/95 border-amber-200/90', badge: 'text-amber-950', num: 'text-amber-600', color: 'amber' },
    { bg: 'bg-teal-50/95 border-teal-200/90', badge: 'text-teal-950', num: 'text-teal-600', color: 'teal' },
    { bg: 'bg-fuchsia-50/95 border-fuchsia-200/90', badge: 'text-fuchsia-950', num: 'text-fuchsia-600', color: 'fuchsia' },
  ] : category === 'question' ? [
    { bg: 'bg-purple-50/95 border-purple-200/90', badge: 'text-purple-950', num: 'text-purple-600', color: 'purple' },
    { bg: 'bg-amber-50/95 border-amber-200/90', badge: 'text-amber-950', num: 'text-amber-600', color: 'amber' },
    { bg: 'bg-fuchsia-50/95 border-fuchsia-200/90', badge: 'text-fuchsia-950', num: 'text-fuchsia-600', color: 'fuchsia' },
    { bg: 'bg-teal-50/95 border-teal-200/90', badge: 'text-teal-950', num: 'text-teal-600', color: 'teal' },
  ] : category === 'morning' ? [
    { bg: 'bg-emerald-50/95 border-emerald-200/90', badge: 'text-emerald-950', num: 'text-emerald-600', color: 'emerald' },
    { bg: 'bg-amber-50/95 border-amber-200/90', badge: 'text-amber-950', num: 'text-amber-600', color: 'amber' },
    { bg: 'bg-lime-50/95 border-lime-200/90', badge: 'text-lime-950', num: 'text-lime-600', color: 'lime' },
    { bg: 'bg-teal-50/95 border-teal-200/90', badge: 'text-teal-950', num: 'text-teal-600', color: 'teal' },
  ] : [
    { bg: 'bg-indigo-50/90 border-indigo-200/80', badge: 'text-indigo-950', num: 'text-indigo-600', color: 'indigo' },
    { bg: 'bg-amber-50/90 border-amber-200/80', badge: 'text-amber-950', num: 'text-amber-600', color: 'amber' },
    { bg: 'bg-teal-50/90 border-teal-200/80', badge: 'text-teal-950', num: 'text-teal-600', color: 'teal' },
    { bg: 'bg-orange-50/90 border-orange-200/80', badge: 'text-orange-950', num: 'text-orange-600', color: 'orange' },
  ];

  return (
    <div className="pt-2 border-t border-slate-200/80 space-y-2">
      <div className={`space-y-2 p-2 rounded-xl border ${category === 'keyboard' ? 'bg-rose-50/60 border-rose-200/80' : category === 'angang' ? 'bg-sky-50/60 border-sky-200/80' : category === 'question' ? 'bg-purple-50/60 border-purple-200/80' : category === 'morning' ? 'bg-emerald-50/60 border-emerald-200/80' : 'bg-slate-100/60 border-slate-200/80'}`}>
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
                    className={`flex items-start justify-between gap-1.5 text-xs text-slate-800 p-1.5 rounded-lg border shadow-2xs ${style.bg}`}
                  >
                    <div className="flex items-start gap-1.5 min-w-0 flex-1">
                      <span className={`font-extrabold flex-shrink-0 ${style.num}`}>
                        {exIdx + 1}.
                      </span>
                      <div className={`break-all leading-relaxed font-semibold flex-1 ${!isUserExpanded ? 'line-clamp-2' : ''}`}>
                        <span className={`font-black mr-1 ${style.badge}`}>[{exItem.nickname}]:</span>
                        <HighlightedText text={exItem.content} category={category} customColor={style.color} />
                      </div>
                    </div>

                    {isLastEx && uHasMore && (
                      <button
                        onClick={() => toggleUserExpanded(uItem.user.nickname)}
                        className={`ml-1 flex-shrink-0 text-[10px] sm:text-[11px] font-black flex items-center gap-0.5 hover:underline cursor-pointer active:scale-95 transition-all self-end mb-0.5 ${style.num}`}
                      >
                        {isUserExpanded ? (
                          <>
                            <span>접기</span>
                            <ChevronUp className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            <span>더보기 ({uRemaining}개 더보기)</span>
                            <ChevronDown className="w-3 h-3" />
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
    </div>
  );
}

function StandardExamplesList({
  examples,
  category,
}: {
  examples: string[];
  category: 'pingpong' | 'keyboard' | 'lupin' | 'comment' | 'morning' | 'angang' | 'question';
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const totalCount = examples.length;
  const visibleExamples = isExpanded ? examples : examples.slice(0, 3);
  const hasMore = totalCount > 3;

  if (totalCount === 0) return null;

  return (
    <div className="pt-2 border-t border-slate-200/80 space-y-2">
      <div className="space-y-1">
        {visibleExamples.map((ex, exIdx) => {
          const isLastEx = exIdx === visibleExamples.length - 1;

          return (
            <div
              key={exIdx}
              className="flex items-start justify-between gap-1.5 text-xs text-slate-800 bg-white/90 p-1.5 rounded-lg border border-amber-200/60 shadow-2xs"
            >
              <div className="flex items-start gap-1.5 min-w-0 flex-1">
                <span className="text-amber-600 font-extrabold flex-shrink-0">
                  {exIdx + 1}.
                </span>
                <div className={`break-all leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
                  <HighlightedText text={ex} category={category} />
                </div>
              </div>

              {isLastEx && hasMore && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="ml-1 flex-shrink-0 text-[10px] sm:text-[11px] font-black text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-0.5 cursor-pointer transition-all active:scale-95 self-end mb-0.5"
                >
                  {isExpanded ? (
                    <>
                      <span>접기</span>
                      <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <span>더보기 ({totalCount - 3}개 더보기)</span>
                      <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RankingCard({
  title,
  subtitle,
  icon,
  users,
  metricFormatter,
  category,
  getExamples,
  emptyText,
}: RankingCardProps) {
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 leading-snug mt-0.5">{subtitle}</p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-xs text-slate-400 py-6 text-center italic">{emptyText}</div>
      ) : (category === 'keyboard' || category === 'angang' || category === 'question' || category === 'morning') ? (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
          {(() => {
            const isKeyboard = category === 'keyboard';
            const isAngang = category === 'angang';
            const isMorning = category === 'morning';
            const groupMap = new Map<number, SpecialGroupType>();

            users.forEach((u) => {
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
              const rankBadge = group.rank === 1 ? '🥇' : group.rank === 2 ? '🥈' : group.rank === 3 ? '🥉' : <span className="text-xs font-black text-slate-500 w-5 text-center">{group.rank}</span>;
              
              const metricText = `${group.count}개`;

              return (
                <div
                  key={`group-rank-${group.rank}`}
                  className="p-3 rounded-xl border border-slate-200 bg-white transition-all space-y-2"
                >
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                      <span className="text-base flex-shrink-0 leading-none">
                        {rankBadge}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0 flex-1">
                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm leading-normal break-words whitespace-pre-wrap">
                          {nicknamesStr}
                        </span>
                        {isTie && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            (공동)
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-700 flex-shrink-0 whitespace-nowrap self-center inline-block">
                      {metricText}
                    </span>
                  </div>

                  {group.examples.length > 0 && (
                    <KeyboardExamplesList
                      group={group}
                      category={category}
                    />
                  )}
                </div>
              );
            });
          })()}
        </div>
      ) : (
        <div className="space-y-3">
          {users.slice(0, 3).map((user, idx) => {
            const isFirst = idx === 0;
            const bgStyle = isFirst
              ? 'bg-indigo-50/70 border-indigo-200/90 text-indigo-950 font-bold shadow-xs'
              : 'bg-white border-slate-200 text-slate-900';

            const examples = getExamples(user);

            return (
              <div
                key={user.nickname}
                className={`p-3 rounded-xl border transition-all space-y-2 ${bgStyle}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="text-base flex-shrink-0 leading-none">
                      {medals[idx]}
                    </span>
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                      {user.nickname}
                    </span>
                  </div>

                  <span className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded border flex-shrink-0 whitespace-nowrap inline-block ${isFirst ? 'bg-white text-indigo-900 border-indigo-200 shadow-2xs' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                    {metricFormatter(user)}
                  </span>
                </div>

                {examples.length > 0 && (
                  <StandardExamplesList
                    examples={examples}
                    category={category}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getMarkClass(color: string | undefined, defaultCategory: string) {
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

function HighlightedText({
  text,
  category,
  customColor,
}: {
  text: string;
  category: 'pingpong' | 'keyboard' | 'lupin' | 'comment' | 'morning' | 'angang' | 'question';
  customColor?: string;
}) {
  const markClassName = getMarkClass(customColor, category);

  if (category === 'keyboard') {
    const rawSource = PROFANITY_REGEX.source;
    const globalRegex = new RegExp(rawSource, 'gi');

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = globalRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      const matchedText = match[0];

      if (matchIndex > lastIndex) {
        elements.push(text.slice(lastIndex, matchIndex));
      }

      elements.push(
        <mark
          key={matchIndex}
          className={markClassName}
        >
          {matchedText}
        </mark>
      );

      lastIndex = matchIndex + matchedText.length;
    }

    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }

    return <span>{elements}</span>;
  }

  if (category === 'angang') {
    const cryingRegex = /([ㅠㅜ]{2,})/g;
    const parts = text.split(cryingRegex);

    return (
      <span>
        {parts.map((part, i) => {
          const isMatch = cryingRegex.test(part);
          cryingRegex.lastIndex = 0;

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

  if (category === 'question') {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
    const parts = text.split(urlRegex);

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

  if (category === 'morning') {
    const morningRegex = /(모닝|몬잉|머닝)/gi;
    const parts = text.split(morningRegex);

    return (
      <span>
        {parts.map((part, i) => {
          const isMatch = morningRegex.test(part);
          morningRegex.lastIndex = 0;

          if (isMatch) {
            return (
              <mark
                key={i}
                className="bg-emerald-200/90 text-emerald-950 px-0 py-0.5 rounded-xs font-black border-b border-emerald-400"
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

  return <span>{text}</span>;
}
