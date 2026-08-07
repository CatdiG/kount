'use client';

import React from 'react';
import { UserStat } from '@/types/chat';
import { Quote, MessageCircle } from 'lucide-react';

interface UserSpeechHabitsProps {
  userStats: UserStat[];
}

export function formatCatchphrases(user: UserStat): React.ReactNode {
  if (!user.topCatchphrases || user.topCatchphrases.length === 0) {
    return <span className="text-slate-400 italic">데이터 부족</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {user.topCatchphrases.map((item, idx) => (
        <span
          key={idx}
          className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-900 font-bold text-xs border border-indigo-100 shadow-2xs whitespace-nowrap"
        >
          &quot;{item.word}&quot;{' '}
          <span className="text-indigo-600 font-mono text-[11px] font-bold">({item.count}회)</span>
        </span>
      ))}
    </div>
  );
}

export default function UserSpeechHabits({ userStats }: UserSpeechHabitsProps) {
  return (
    <div className="w-full max-w-6xl mx-auto my-8 space-y-4">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              🗣️ 멤버별 대표 말버릇
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              전체 멤버({userStats.length}명)의 입착어(Top 3 말버릇)와 대화 수치를 간결하게 한눈에 파악하세요.
            </p>
          </div>
        </div>
      </div>

      {/* Compact High-Density Table Layout */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
              <th className="py-3 px-4 w-16 text-center">순위</th>
              <th className="py-3 px-4 w-44">닉네임</th>
              <th className="py-3 px-4 w-44">대화 스타일 유형</th>
              <th className="py-3 px-4">대표 입착어 (말버릇 Top 3)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {userStats.map((user, idx) => (
              <tr
                key={user.nickname}
                className={`hover:bg-slate-50/80 transition-colors ${
                  idx < 3 ? 'bg-indigo-50/20' : 'bg-white'
                }`}
              >
                {/* 순위 */}
                <td className="py-3.5 px-4 font-mono font-bold text-slate-600 text-center">
                  {idx === 0 ? (
                    <span className="text-base" title="1위 금메달">🥇</span>
                  ) : idx === 1 ? (
                    <span className="text-base" title="2위 은메달">🥈</span>
                  ) : idx === 2 ? (
                    <span className="text-base" title="3위 동메달">🥉</span>
                  ) : (
                    `${idx + 1}위`
                  )}
                </td>

                {/* 닉네임 + 대화 수 */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col">
                    <span className="font-extrabold text-slate-900 text-sm truncate max-w-[150px]">
                      {user.nickname}
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-600 font-mono">
                      {user.totalMessages.toLocaleString()}회 대화
                    </span>
                  </div>
                </td>

                {/* 대화 스타일 유형 태그 */}
                <td className="py-3.5 px-4">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-extrabold text-[11px] border border-slate-200 shadow-2xs whitespace-nowrap">
                    💬 열혈 대화러
                  </span>
                </td>

                {/* 대표 입착어 (Top 3) */}
                <td className="py-3.5 px-4">{formatCatchphrases(user)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HighlightedSignatureText({
  text,
  catchphrases,
}: {
  text: string;
  catchphrases: string[];
}) {
  if (!catchphrases || catchphrases.length === 0) {
    return <span>&quot;{text}&quot;</span>;
  }

  const validPhrases = catchphrases.filter((c) => c && c.length >= 2);
  if (validPhrases.length === 0) {
    return <span>&quot;{text}&quot;</span>;
  }

  const pattern = validPhrases.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');

  const parts = text.split(regex);

  return (
    <span>
      &quot;
      {parts.map((part, i) =>
        validPhrases.some((vp) => vp.toLowerCase() === part.toLowerCase()) ? (
          <mark
            key={i}
            className="bg-amber-200 text-amber-950 font-black px-0 py-0 rounded-xs"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
      &quot;
    </span>
  );
}
