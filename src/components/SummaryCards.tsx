'use client';

import React from 'react';
import { ParsingResult } from '@/types/chat';
import { MessageCircle, Users, Calendar } from 'lucide-react';

interface SummaryCardsProps {
  parsingResult: ParsingResult;
}

export default function SummaryCards({ parsingResult }: SummaryCardsProps) {
  const {
    totalMessages,
    uniqueUsersCount,
    totalDays,
  } = parsingResult;

  return (
    <div className="w-full my-2 grid grid-cols-3 gap-2">
      {/* Card 1: 총 메시지 수 */}
      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between text-center">
        <div className="flex items-center justify-center text-indigo-600">
          <MessageCircle className="w-4 h-4" />
        </div>
        <div className="mt-1">
          <p className="text-[10px] text-slate-500 font-bold">총 메시지</p>
          <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
            {totalMessages.toLocaleString()}<span className="text-[10px] font-semibold text-slate-500">개</span>
          </h4>
        </div>
      </div>

      {/* Card 2: 참여 인원 */}
      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between text-center">
        <div className="flex items-center justify-center text-purple-600">
          <Users className="w-4 h-4" />
        </div>
        <div className="mt-1">
          <p className="text-[10px] text-slate-500 font-bold">참여 멤버</p>
          <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
            {uniqueUsersCount}<span className="text-[10px] font-semibold text-slate-500">명</span>
          </h4>
        </div>
      </div>

      {/* Card 3: 분석 대화 기간 */}
      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between text-center">
        <div className="flex items-center justify-center text-emerald-600">
          <Calendar className="w-4 h-4" />
        </div>
        <div className="mt-1">
          <p className="text-[10px] text-slate-500 font-bold">대화 기간</p>
          <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">
            {totalDays}일간
          </h4>
        </div>
      </div>
    </div>
  );
}
