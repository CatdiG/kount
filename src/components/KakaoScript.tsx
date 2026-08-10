'use client';

import Script from 'next/script';

declare global {
  interface Window {
    Kakao?: any;
  }
}

// 🔑 카카오 디벨로퍼스(https://developers.kakao.com)에서 발급받은 JavaScript 키
// .env.local 파일의 NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY 값을 읽거나 아래 따옴표 안에 키를 직접 입력하세요.
export const KAKAO_JAVASCRIPT_KEY = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY || 'YOUR_JAVASCRIPT_KEY';

export default function KakaoScript() {
  const handleKakaoLoad = () => {
    if (typeof window !== 'undefined' && window.Kakao) {
      if (!window.Kakao.isInitialized() && KAKAO_JAVASCRIPT_KEY && KAKAO_JAVASCRIPT_KEY !== 'YOUR_JAVASCRIPT_KEY') {
        try {
          window.Kakao.init(KAKAO_JAVASCRIPT_KEY);
          console.log('✅ [Kakao SDK] 카카오 자바스크립트 SDK 초기화 완료');
        } catch (err) {
          console.error('❌ [Kakao SDK] 초기화 오류:', err);
        }
      }
    }
  };

  return (
    <Script
      src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
      integrity="sha384-NWAHeioTCgB2JJcuQAChSoHceCu11gC2FktRvgDGv1w43P5xP4y4WdF+VnSsmN+d"
      crossOrigin="anonymous"
      onLoad={handleKakaoLoad}
      strategy="afterInteractive"
    />
  );
}
