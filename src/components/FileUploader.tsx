'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Sparkles, CheckCircle2 } from 'lucide-react';
import { SAMPLE_KAKAOTALK_LOG } from '@/lib/sampleData';
import { checkAndRequestPermissions, readWebFileAsText } from '@/lib/filesystemUtils';

interface FileUploaderProps {
  onDataParsed: (rawText: string, fileName: string) => void;
}

export default function FileUploader({ onDataParsed }: FileUploaderProps) {
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
      await checkAndRequestPermissions();
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

  const handleSampleLoad = () => {
    setLoadedFileName('kakaotalk_sample_1week.txt (샘플 대화)');
    onDataParsed(SAMPLE_KAKAOTALK_LOG, 'kakaotalk_sample_1week.txt');
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-5 sm:p-8 text-center transition-all duration-300 backdrop-blur-md ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/80 scale-[1.01] shadow-lg shadow-indigo-500/10'
            : 'border-slate-300 bg-white/90 hover:border-indigo-400 hover:bg-slate-50/80 shadow-sm hover:shadow-md'
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

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-xs">
            <UploadCloud className="w-8 h-8 text-indigo-600 stroke-[2.5] animate-bounce" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-slate-900 whitespace-nowrap tracking-tight">
              카카오톡 대화 내용 파일 (.txt / .csv) 업로드
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              카카오톡 대화내용을 업로드 하여 대화 리포트를 생성해보세요.
            </p>
            <div className="pt-1">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-50/80 border border-indigo-200/80 text-indigo-950 text-[11px] sm:text-xs font-bold shadow-2xs whitespace-nowrap">
                <span>📁</span>
                <span className="whitespace-nowrap">
                  파일을 이 곳으로 <span className="text-indigo-600 font-extrabold underline underline-offset-2">드래그 앤 드롭</span> 하거나 클릭하여 선택하세요.
                </span>
              </div>
            </div>
          </div>



          {statusMessage && (
            <div
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl border font-bold text-xs sm:text-sm mt-2 ${
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
            <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 font-medium text-sm mt-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>성공: 분석 완료 ({loadedFileName})</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
