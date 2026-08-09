'use client';

import React, { useState, useMemo } from 'react';
import { UserStat } from '@/types/chat';
import { Search, ArrowUpDown, MessageSquare, Zap, Flame, Briefcase, BookOpen } from 'lucide-react';

interface OverallStatsTableProps {
  userStats: UserStat[];
  totalMessages: number;
}

type SortKey = 'rank' | 'totalMessages' | 'avgReplyTimeSeconds' | 'profanityRatio' | 'workHourMessages' | 'ttr';

export default function OverallStatsTable({ userStats, totalMessages }: OverallStatsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder(key === 'rank' || key === 'avgReplyTimeSeconds' ? 'asc' : 'desc');
    }
  };

  const filteredAndSortedStats = useMemo(() => {
    let result = [...userStats];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((u) => u.nickname.toLowerCase().includes(term));
    }

    result.sort((a, b) => {
      let valA: number = 0;
      let valB: number = 0;

      switch (sortKey) {
        case 'rank':
          valA = a.rank;
          valB = b.rank;
          break;
        case 'totalMessages':
          valA = a.totalMessages;
          valB = b.totalMessages;
          break;
        case 'avgReplyTimeSeconds':
          valA = a.avgReplyTimeSeconds ?? 999999;
          valB = b.avgReplyTimeSeconds ?? 999999;
          break;
        case 'profanityRatio':
          valA = a.profanityRatio;
          valB = b.profanityRatio;
          break;
        case 'workHourMessages':
          valA = a.workHourMessages;
          valB = b.workHourMessages;
          break;
        case 'ttr':
          valA = a.ttr;
          valB = b.ttr;
          break;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [userStats, searchTerm, sortKey, sortOrder]);

  return (
    <div className="w-full max-w-6xl mx-auto my-10 space-y-4">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-md">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            닉네임별 전체 채팅 통계 ({userStats.length}명)
          </h3>
          <p className="text-xs text-slate-500">
            각 지표 헤더를 클릭하면 해당 항목 기준으로 정렬할 수 있습니다.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="닉네임 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap min-w-[540px]">
          <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-600 border-b border-slate-200">
            <tr>
              <th className="py-3 px-2 text-center w-12">
                <button
                  onClick={() => handleSort('rank')}
                  className="inline-flex items-center gap-0.5 hover:text-slate-900"
                >
                  순위 <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3">닉네임</th>
              <th className="py-3 px-3 text-right">
                <button
                  onClick={() => handleSort('totalMessages')}
                  className="inline-flex items-center gap-0.5 hover:text-slate-900"
                >
                  총 메시지 <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3 text-right">
                <button
                  onClick={() => handleSort('avgReplyTimeSeconds')}
                  className="inline-flex items-center gap-0.5 hover:text-amber-700"
                >
                  <Zap className="w-3 h-3 text-amber-600" /> 핑퐁속도 <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3 text-right">
                <button
                  onClick={() => handleSort('profanityRatio')}
                  className="inline-flex items-center gap-0.5 hover:text-red-700"
                >
                  <Flame className="w-3 h-3 text-red-600" /> 비속어 <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3 text-right">
                <button
                  onClick={() => handleSort('workHourMessages')}
                  className="inline-flex items-center gap-0.5 hover:text-emerald-700"
                >
                  <Briefcase className="w-3 h-3 text-emerald-600" /> 근무시간 <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3 text-right">
                <button
                  onClick={() => handleSort('ttr')}
                  className="inline-flex items-center gap-0.5 hover:text-sky-700"
                >
                  <BookOpen className="w-3 h-3 text-sky-600" /> 어휘수 <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAndSortedStats.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              filteredAndSortedStats.map((u) => (
                <tr
                  key={u.nickname}
                  className="hover:bg-slate-50 transition-colors duration-150"
                >
                  {/* Rank */}
                  <td className="py-2.5 px-2 text-center font-bold">
                    {u.rank === 1 ? (
                      <span className="inline-block w-6 h-6 leading-6 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px]">
                        1위
                      </span>
                    ) : u.rank === 2 ? (
                      <span className="inline-block w-6 h-6 leading-6 rounded-full bg-slate-200 text-slate-800 border border-slate-300 text-[10px]">
                        2위
                      </span>
                    ) : u.rank === 3 ? (
                      <span className="inline-block w-6 h-6 leading-6 rounded-full bg-amber-200/60 text-amber-950 border border-amber-400 text-[10px]">
                        3위
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">{u.rank}위</span>
                    )}
                  </td>

                  {/* Nickname */}
                  <td className="py-2.5 px-3 font-extrabold text-slate-900 max-w-[120px] truncate">
                    {u.nickname}
                  </td>

                  {/* Total Messages */}
                  <td className="py-2.5 px-3 text-right font-extrabold text-indigo-700 font-mono">
                    {u.totalMessages.toLocaleString()}개
                  </td>

                  {/* Ping Pong Speed */}
                  <td className="py-2.5 px-3 text-right font-mono text-xs">
                    {u.avgReplyTimeFormatted === '-' ? (
                      <span className="text-slate-400">-</span>
                    ) : (
                      <span className="text-amber-800 font-bold">
                        {u.avgReplyTimeFormatted}
                      </span>
                    )}
                  </td>

                  {/* Profanity Ratio */}
                  <td className="py-2.5 px-3 text-right font-mono text-xs">
                    {u.profanityRatio > 0 ? (
                      <span className="text-red-600 font-bold">
                        {u.profanityCount}개
                      </span>
                    ) : (
                      <span className="text-slate-400">0개</span>
                    )}
                  </td>

                  {/* Work Hour Messages */}
                  <td className="py-2.5 px-3 text-right font-mono text-xs">
                    <span className="text-emerald-700 font-bold">
                      {u.workHourMessages}개
                    </span>
                  </td>

                  {/* Vocabulary TTR */}
                  <td className="py-2.5 px-3 text-right font-mono text-xs">
                    <span className="text-sky-700 font-semibold">{u.ttr}%</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
