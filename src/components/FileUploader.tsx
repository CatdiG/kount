'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, Share2 } from 'lucide-react';
import { readWebFileAsText } from '@/lib/filesystemUtils';

interface FileUploaderProps {
  onDataParsed: (rawText: string, fileName: string) => void;
  isUploaded?: boolean;
}

export default function FileUploader({ onDataParsed, isUploaded = false }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loadedFileName, setLoadedFileName] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.csv')) {
      const errText = '.txt 또는 .csv 형태의 카카오톡 대화 내보내기 파일만 지원합니다.';
      setStatusMessage({ type: 'error', text: errText });
      alert(`[파일 형식 오류]\n${errText}`);
      return;
    }

    try {
      const content = await readWebFileAsText(file);
      if (content) {
        setLoadedFileName(file.name);
        setStatusMessage({ type: 'success', text: `성공: 파일(${file.name})을 성공적으로 읽었습니다.` });
        alert(`성공: 대화 파일(${file.name})을 성공적으로 읽어왔습니다!`);
        onDataParsed(content, file.name);
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.error('File reading error:', err);
      setStatusMessage({ type: 'error', text: `실패: ${errMsg}` });
      alert(`[파일 읽기 실패]\n${errMsg}`);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const hasFile = isUploaded || !!loadedFileName;

  return (
    <div className="w-full max-w-md mx-auto my-2 text-center">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer p-4 text-center space-y-3 transition-all duration-300 rounded-2xl ${
          isDragging ? 'bg-amber-50/80 ring-2 ring-amber-400' : ''
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".txt,.csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {/* 대화 파일 업로드 전(공유한 대화가 없을 때만) 아이콘 및 안내 문구 노출 */}
        {!hasFile && (
          <>
            {/* Bouncing Upload Icon */}
            <div className="w-16 h-16 rounded-full bg-amber-100/90 border border-amber-300 flex items-center justify-center mx-auto text-amber-950 shadow-xs">
              <UploadCloud className="w-8 h-8 text-amber-950 stroke-[2.5] animate-bounce" />
            </div>

            {/* Text */}
            <div className="space-y-1.5">
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                공유한 대화가 없습니다.
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium whitespace-nowrap">
                카카오톡 대화 내보내기 파일(.txt / .csv)을 업로드하거나 앱으로 공유해 주세요.
              </p>
            </div>

            {/* Action Button & Drag hint */}
            <div className="pt-2 space-y-2 text-center">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] text-xs font-black shadow-sm transition-all active:scale-95 border border-amber-300 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-amber-950 flex-shrink-0" />
                <span>카카오톡 대화 파일 선택하기</span>
              </button>
              <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                (또는 파일을 이 곳으로 드래그 앤 드롭 하세요)
              </p>
            </div>
          </>
        )}

        {/* 대화 파일이 업로드/공유된 상태에서의 콤팩트 재선택 버튼 */}
        {hasFile && (
          <div className="py-1">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 border border-slate-200 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
              <span>다른 대화 파일 선택하기</span>
            </button>
          </div>
        )}

        {/* Status Messages */}
        {statusMessage && (
          <div
            className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-xl border font-bold text-xs mt-2 max-w-xs mx-auto ${
              statusMessage.type === 'success'
                ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
                : 'text-rose-700 bg-rose-50 border-rose-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {loadedFileName && !statusMessage && (
          <div className="flex items-center justify-center space-x-2 text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 font-medium text-xs mt-2 max-w-xs mx-auto">
            <CheckCircle2 className="w-4 h-4" />
            <span>성공: 분석 완료 ({loadedFileName})</span>
          </div>
        )}
      </div>
    </div>
  );
}
