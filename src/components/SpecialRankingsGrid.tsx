'use client';

import React from 'react';
import Image from 'next/image';
import { SpecialRankings, UserStat } from '@/types/chat';
import { PROFANITY_REGEX } from '@/lib/kakaotalkParser';
import { Zap, Flame, Briefcase, Crown, Quote, MessageSquare } from 'lucide-react';

interface SpecialRankingsGridProps {
  specialRankings: SpecialRankings;
}

// 🟢 👊 원본 이모지 자체의 모양과 디테일 테두리는 100% 유지하며, 형광기를 없앤 묵직하고 자연스러운 헐크 그린 적용
export function HulkNativeEmoji({ className = 'text-2xl' }: { className?: string }) {
  return (
    <span
      className={`inline-block align-middle font-normal ${className}`}
      style={{
        filter: 'hue-rotate(85deg) saturate(1.35) brightness(0.88) contrast(1.15)',
        display: 'inline-block',
      }}
    >
      👊
    </span>
  );
}

// 💰 🕵️‍♂️ 사용자 제공 원본 도둑 이미지를 이모티콘 스타일 컴포넌트로 생성
export function ThiefAvatarEmoji({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/thief-avatar.png"
      alt="월급루팡 도둑 이모티콘"
      width={size}
      height={size}
      className="inline-block align-middle object-contain transition-transform hover:scale-110"
      unoptimized
    />
  );
}

// 🤖 사용자 제공 원본 로봇 이미지를 투명 이모티콘 스타일 컴포넌트로 생성
export function CommentAlbaRobotEmoji({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/comment-alba-robot.png"
      alt="댓글알바 로봇 이모티콘"
      width={size}
      height={size}
      className="inline-block align-middle object-contain transition-transform hover:scale-110"
      unoptimized
    />
  );
}

export default function SpecialRankingsGrid({ specialRankings }: SpecialRankingsGridProps) {
  const { pingPongKing, keyboardWarrior, salaryLupin, commentAlba } = specialRankings;

  return (
    <div className="w-full max-w-6xl mx-auto my-10 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold tracking-wide">
          <Crown className="w-3.5 h-3.5 text-amber-500" />
          명예의 전당 👑
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          🏆 분석결과
        </h2>
        <p className="text-slate-600 text-sm max-w-2xl mx-auto">
          각 순위별 1위~3위 수상자가 남긴 실제 대화 대표 예시 문장과 주요 수치가 하이라이트된 분석결과입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <RankingCard
          title={
            <span className="inline-flex items-center gap-1.5">
              <span>핑퐁왕</span>
              <span className="text-2xl leading-none">🏓</span>
            </span>
          }
          subtitle="다른 사람이 말하면 평균 답장 시간이 가장 짧은 닉네임"
          icon={<Zap className="w-5 h-5 text-indigo-600" />}
          users={pingPongKing}
          metricFormatter={(u) => u.avgReplyTimeFormatted}
          category="pingpong"
          getExamples={() => []}
          emptyText="답장 반응속도를 집계할 데이터가 부족합니다."
        />

        <RankingCard
          title={
            <span className="inline-flex items-center gap-1.5">
              <span>손가락만 헐크</span>
              <HulkNativeEmoji className="text-2xl" />
            </span>
          }
          subtitle="비속어·욕설 사용 건수가 가장 많은 닉네임"
          icon={<Flame className="w-5 h-5 text-indigo-600" />}
          users={keyboardWarrior}
          metricFormatter={(u) => `비속어 ${u.profanityCount}건`}
          category="keyboard"
          getExamples={(u) => {
            if (!u.profanityExamples || u.profanityExamples.length === 0) return [];
            const limit = u.profanityCount >= 5 ? 5 : u.profanityCount;
            return u.profanityExamples.slice(0, limit);
          }}
          emptyText="비속어 사용자가 없거나 데이터가 부족합니다."
        />

        <RankingCard
          title={
            <span className="inline-flex items-center gap-1.5">
              <span>월급루팡</span>
              <ThiefAvatarEmoji size={28} />
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

        <RankingCard
          title={
            <span className="inline-flex items-center gap-1.5">
              <span>댓글알바</span>
              <CommentAlbaRobotEmoji size={28} />
            </span>
          }
          subtitle="다른 사람 대화에 댓글/답글을 가장 많이 남긴 닉네임"
          icon={<MessageSquare className="w-5 h-5 text-indigo-600" />}
          users={commentAlba}
          metricFormatter={(u) => `댓글 ${u.commentCount}개`}
          category="comment"
          getExamples={() => []}
          emptyText="댓글/답글 작성 데이터가 부족합니다."
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
  category: 'pingpong' | 'keyboard' | 'lupin' | 'comment';
  getExamples: (u: UserStat) => string[];
  emptyText: string;
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
        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 leading-snug mt-0.5">{subtitle}</p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-xs text-slate-400 py-6 text-center italic">{emptyText}</div>
      ) : category === 'keyboard' ? (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
          {(() => {
            const groupMap = new Map<number, { rank: number; profanityCount: number; users: UserStat[]; examples: { nickname: string; content: string }[] }>();

            users.forEach((u) => {
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
              const rankBadge = group.rank === 1 ? '🥇' : group.rank === 2 ? '🥈' : group.rank === 3 ? '🥉' : <span className="text-xs font-black text-slate-500 w-5 text-center">{group.rank}</span>;
              const medalPrefix = group.rank === 1 ? '🥇 ' : group.rank === 2 ? '🥈 ' : group.rank === 3 ? '🥉 ' : '';
              const rankTitleText = isTie
                ? `${medalPrefix}공동 ${group.rank}위`
                : group.rank === 1
                ? '🥇 1위'
                : group.rank === 2
                ? '🥈 2위'
                : group.rank === 3
                ? '🥉 3위'
                : `${group.rank}위`;

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
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full inline-block flex-shrink-0">
                            {medalPrefix}공동 {group.rank}위
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md border flex-shrink-0 whitespace-nowrap self-center bg-slate-100 text-slate-700 border-slate-200">
                      비속어 {group.profanityCount}건
                    </span>
                  </div>

                  {group.examples.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800">
                        <Quote className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span>
                          {rankTitleText} ({nicknamesStr}) 님의 대화 내용:
                        </span>
                      </div>
                      <div className="space-y-1 bg-slate-100/60 p-2 rounded-xl border border-slate-200/80">
                        {group.examples.slice(0, 5 * group.users.length).map((exItem, exIdx) => {
                          const userIdx = group.users.findIndex((u) => u.nickname === exItem.nickname);
                          const palettes = [
                            { bg: 'bg-indigo-50/90 border-indigo-200/80', badge: 'text-indigo-950', num: 'text-indigo-600' },
                            { bg: 'bg-emerald-50/90 border-emerald-200/80', badge: 'text-emerald-950', num: 'text-emerald-600' },
                            { bg: 'bg-amber-50/90 border-amber-200/80', badge: 'text-amber-950', num: 'text-amber-600' },
                            { bg: 'bg-rose-50/90 border-rose-200/80', badge: 'text-rose-950', num: 'text-rose-600' },
                            { bg: 'bg-purple-50/90 border-purple-200/80', badge: 'text-purple-950', num: 'text-purple-600' },
                            { bg: 'bg-teal-50/90 border-teal-200/80', badge: 'text-teal-950', num: 'text-teal-600' },
                          ];
                          const style = palettes[(userIdx >= 0 ? userIdx : 0) % palettes.length];

                          return (
                            <div
                              key={exIdx}
                              className={`flex items-start gap-1.5 text-xs text-slate-800 p-1.5 rounded-lg border shadow-2xs ${style.bg}`}
                            >
                              <span className={`font-extrabold flex-shrink-0 ${style.num}`}>
                                {exIdx + 1}.
                              </span>
                              <div className="break-all leading-relaxed font-semibold">
                                <span className={`font-black mr-1 ${style.badge}`}>[{exItem.nickname}]:</span>
                                <HighlightedText text={exItem.content} category="keyboard" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      ) : (
        <div className="space-y-2.5">
          {users.slice(0, 3).map((user, idx) => {
            const examples = idx === 0 ? getExamples(user) : [];

            return (
              <div
                key={user.nickname}
                className={`p-3 rounded-xl border transition-all space-y-2 ${
                  idx === 0
                    ? 'bg-indigo-50/60 border-indigo-200 shadow-2xs'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <span className="text-base flex-shrink-0 leading-none">
                      {medals[idx]}
                    </span>
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight break-all">
                      {user.nickname}
                    </span>
                  </div>

                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md border flex-shrink-0 ${
                      idx === 0
                        ? 'bg-white text-indigo-700 border-indigo-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {metricFormatter(user)}
                  </span>
                </div>

                {examples.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800">
                      <Quote className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>
                        {idx === 0 ? '🥇 1위' : idx === 1 ? '🥈 2위' : '🥉 3위'} {user.nickname} 님의 대화 내용:
                      </span>
                    </div>
                    <div className="space-y-1 bg-amber-50/60 p-2 rounded-xl border border-amber-200/80">
                      {examples.slice(0, 5).map((ex, exIdx) => (
                        <div
                          key={exIdx}
                          className="flex items-start gap-1.5 text-xs text-slate-800 bg-white/90 p-1.5 rounded-lg border border-amber-200/60 shadow-2xs"
                        >
                          <span className="text-amber-600 font-extrabold flex-shrink-0">
                            {exIdx + 1}.
                          </span>
                          <div className="break-all leading-relaxed">
                            <HighlightedText text={ex} category={category} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HighlightedText({
  text,
  category,
}: {
  text: string;
  category: 'pingpong' | 'keyboard' | 'lupin' | 'comment';
}) {
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
          className="bg-amber-200/90 text-amber-950 px-0 py-0.5 rounded-xs font-black border-b border-amber-400"
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

  return <span>{text}</span>;
}
