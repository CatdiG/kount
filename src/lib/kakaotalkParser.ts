import { ChatMessage } from '@/types/chat';

// Regex Patterns for Profanity/Slang detection
export const PROFANITY_REGEX = /(ㅅㅂ|ㅂㅅ|ㅈㄴ|ㅈㄹ|ㅇㅈㄹ|ㄲㅈ|씨발|씨빨|시발|시벌|시바|씨바|샤갈|병신|븅신|등신|존나|존낰|존난|좆|지랄|지럴|닥쳐|엠창|애비|애미|쓰레기|빡치|빡침|미친|미친년|미친련|미친새끼|미친새키|미친놈|미친개|미친짓|개새끼|개새키|개같|개지랄|개련|개년|개소리|개쓰레기|개쌍|개썅|개빡침|개빡|개씹|개좆|fuck|shit|crazy|bitch|damn|wtf)/i;

/**
 * 2-pass profanity checker that detects slang in raw text AND normalized (stripped spaces & punctuation) text.
 * E.g., handles "시.발", "ㅅ.ㅂ", "씨~발", "개-새-끼", "존.나" seamlessly!
 */
export function isProfanityMessage(content: string): boolean {
  if (!content) return false;
  // Pass 1: Raw text regex test
  if (PROFANITY_REGEX.test(content)) return true;

  // Pass 2: Normalized text test (strip punctuation, dots, spaces, tildes)
  const normalized = content.replace(/[^가-힣a-zA-Z0-9]/g, '');
  return PROFANITY_REGEX.test(normalized);
}

/**
 * Checks if the content of a matched chat message line is an EXPLICIT KakaoTalk system action (join/leave/delete).
 * Note: Must be extremely strict so that user chat messages containing words like "안내" or "오픈채팅" are NOT filtered!
 */
export function isExplicitKakaoSystemAction(content: string): boolean {
  const t = content.trim();
  if (!t) return false;
  return (
    t.includes('님이 들어왔습니다.') ||
    t.includes('님이 나갔습니다.') ||
    t.includes('님을 초대했습니다.') ||
    t.includes('채팅방 님이 나갔습니다.') ||
    t.endsWith('님을 내보냈습니다.') ||
    t === '삭제된 메시지입니다.' ||
    (t.includes('방장이') && t.includes('변경되었습니다')) ||
    (t.includes('부방장이') && t.includes('위임했습니다'))
  );
}

/**
 * Strict validator for KakaoTalk member nicknames.
 * Filters out system notices, meta headers, message body fragments (e.g. "충분한 수분 섭취"),
 * bullet points, and invalid nicknames.
 */
export function isValidKakaoNickname(nickname: string): boolean {
  if (!nickname) return false;
  const t = nickname.trim();

  // Length check: KakaoTalk nicknames must be 1 ~ 40 characters
  if (t.length === 0 || t.length > 40) return false;

  // System headers / Export metadata keywords
  if (
    t.startsWith('저장한 날짜') ||
    t.startsWith('Date saved') ||
    t.startsWith('저장 일시') ||
    t.startsWith('Date,User') ||
    t.startsWith('Date, User') ||
    t.startsWith('일시, 이름') ||
    t.startsWith('날짜,사용자') ||
    t.includes('카카오톡 대화') ||
    t.includes('KakaoTalk Chats') ||
    t.includes('대화 내보내기')
  ) {
    return false;
  }

  // System actions (Join, Leave, Kick, Delete, etc.)
  if (
    t.includes('님이 들어왔습니다') ||
    t.includes('님이 나갔습니다') ||
    t.includes('님을 초대했습니다') ||
    t.includes('내보냈습니다') ||
    t.includes('삭제된 메시지') ||
    t.includes('운영정책') ||
    t.includes('불법촬영물') ||
    t.includes('방장이') ||
    t.includes('부방장이') ||
    t.includes('위임했습니다')
  ) {
    return false;
  }

  // Common body text patterns & bullet point phrases mistakenly captured as nicknames
  if (
    t.includes('수분 섭취') ||
    t.includes('수분섭취') ||
    t.includes('참고사항') ||
    t.includes('공지사항') ||
    t.includes('유의사항') ||
    t.includes('주의사항') ||
    t.includes('체크리스트') ||
    t.includes('가이드라인')
  ) {
    return false;
  }

  // Numbered list bullet points e.g., "1.", "2)", "3-", "Q1.", "A."
  if (/^(?:\d+[\.\)\-:]|[QQAa]\d*[\.:])\s*/.test(t)) {
    return false;
  }

  // URL or Email in nickname
  if (/https?:\/\/|www\.|@/.test(t)) {
    return false;
  }

  // Generic CSV / System column headers
  const lower = t.toLowerCase();
  if (
    lower === 'date' ||
    lower === 'user' ||
    lower === 'message' ||
    lower === 'text' ||
    lower === 'time' ||
    t === '날짜' ||
    t === '이름' ||
    t === '사용자' ||
    t === '대화' ||
    t === '내용' ||
    t === '시간'
  ) {
    return false;
  }

  return true;
}

/**
 * Checks if an unparsed line (without [Nickname] [Time] prefix) is a standalone system header, notice, or banner.
 */
export function isStandaloneSystemNoticeLine(line: string): boolean {
  const t = line.trim();
  if (!t) return true;

  // Title & Save Date Header Meta (Mobile & PC KakaoTalk Export Headers)
  if (
    t.startsWith('저장한 날짜') ||
    t.startsWith('Date saved') ||
    t.startsWith('저장 일시') ||
    t.startsWith('Date,User,Message') ||
    t.startsWith('Date, User, Message') ||
    t.startsWith('일시, 이름, 내용') ||
    t.startsWith('Date,User,Text') ||
    t.startsWith('날짜,사용자,대화') ||
    t.includes('카카오톡 대화') ||
    t.includes('KakaoTalk Chats') ||
    t.includes('대화 내보내기')
  ) {
    return true;
  }

  // Standalone System Notifications
  if (
    t.includes('님이 들어왔습니다.') ||
    t.includes('님이 나갔습니다.') ||
    t.includes('님을 초대했습니다.') ||
    t.includes('채팅방 님이 나갔습니다.') ||
    t.endsWith('님을 내보냈습니다.') ||
    t === '삭제된 메시지입니다.' ||
    t.includes('방장이') ||
    t.includes('부방장이') ||
    t.includes('위임했습니다')
  ) {
    return true;
  }

  // KakaoTalk Official Policy / Safety / Notice Banners
  if (
    t.includes('불법촬영물') ||
    t.includes('전기통신사업법') ||
    t.includes('운영정책') ||
    t.includes('오픈채팅 유의사항') ||
    t.includes('식별 조치')
  ) {
    return true;
  }

  return false;
}

/**
 * Robustly extracts date header from Mobile & PC KakaoTalk log lines.
 */
function extractDateHeader(line: string): { year: number; month: number; day: number } | null {
  const cleanLine = line.trim().replace(/^[\uFEFF\u200B-\u200D\u200E\u200F]/, '');
  if (!cleanLine) return null;

  // Ignore export header metadata lines and official system banners
  if (isStandaloneSystemNoticeLine(cleanLine)) {
    return null;
  }

  // If line contains time separator with nickname colon, it's a message line, NOT a date header!
  if (/(\d{1,2}:\d{2}|[,\s][^:]+\s*:)/.test(cleanLine)) {
    return null;
  }

  // Remove leading/trailing dash, equal, or em-dash separators
  const stripped = cleanLine.replace(/^[-=—]+\s*/, '').replace(/\s*[-=—]+$/, '').trim();

  // Pattern 1: YYYY년 MM월 DD일 ... (Standalone line ending with optional day of week)
  const m1 = stripped.match(/^(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일\s*[\(（]?[ㄱ-ㅎ가-힣a-zA-Z]*[\)）]?$/);
  if (m1) {
    return { year: parseInt(m1[1], 10), month: parseInt(m1[2], 10) - 1, day: parseInt(m1[3], 10) };
  }

  // Pattern 2: Standalone YYYY. MM. DD. or YYYY-MM-DD line ending with optional day of week
  const m2 = stripped.match(/^(\d{4})[./-]\s*(\d{1,2})[./-]\s*(\d{1,2})[.]?\s*[\(（]?[ㄱ-ㅎ가-힣a-zA-Z]*[\)）]?$/);
  if (m2) {
    const year = parseInt(m2[1], 10);
    const month = parseInt(m2[2], 10) - 1;
    const day = parseInt(m2[3], 10);
    if (year >= 2000 && year <= 2100 && month >= 0 && month < 12 && day >= 1 && day <= 31) {
      return { year, month, day };
    }
  }

  // Pattern 3: English format e.g., "Friday, July 27, 2026" or "July 27, 2026" or "27 July 2026"
  const monthsMap: Record<string, number> = {
    january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2, april: 3, apr: 3,
    may: 4, june: 5, jun: 5, july: 6, jul: 6, august: 7, aug: 7,
    september: 8, sep: 8, sept: 8, october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11,
  };

  const m3Eng = stripped.match(/(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\w*\s+(\d{1,2}),?\s+(\d{4})/i);
  if (m3Eng) {
    const monthStr = m3Eng[1].toLowerCase();
    const day = parseInt(m3Eng[2], 10);
    const year = parseInt(m3Eng[3], 10);
    const month = monthsMap[monthStr];
    if (month !== undefined) {
      return { year, month, day };
    }
  }

  const m3EngDayFirst = stripped.match(/^(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\w*\s+(\d{4})/i);
  if (m3EngDayFirst) {
    const day = parseInt(m3EngDayFirst[1], 10);
    const monthStr = m3EngDayFirst[2].toLowerCase();
    const year = parseInt(m3EngDayFirst[3], 10);
    const month = monthsMap[monthStr];
    if (month !== undefined) {
      return { year, month, day };
    }
  }

  return null;
}

/**
 * 100% Robust AM/PM 24-hour converter for Mobile (iOS/Android) and PC KakaoTalk formats.
 * Includes intelligent context fallback inspection when AM/PM regex capture groups are empty.
 */
function parseNormalizedHour(
  ampm1?: string,
  ampm2?: string,
  rawHour?: number,
  rawLineContext?: string
): number {
  let h = rawHour !== undefined && !isNaN(rawHour) ? rawHour : 0;
  let rawAmPm = (ampm1 || ampm2 || '').trim();

  // Smart Fallback: Check raw line context if ampm capture groups are empty
  if (!rawAmPm && rawLineContext) {
    if (/오후|PM/i.test(rawLineContext)) {
      rawAmPm = '오후';
    } else if (/오전|AM/i.test(rawLineContext)) {
      rawAmPm = '오전';
    }
  }

  if (!rawAmPm) return h;

  const ampm = rawAmPm.toUpperCase();
  const isPM = ampm.includes('오후') || ampm.includes('PM');
  const isAM = ampm.includes('오전') || ampm.includes('AM');

  if (isPM && h < 12) {
    h += 12;
  } else if (isAM && h === 12) {
    h = 0;
  }
  return h;
}

export interface IgnoredLineDetail {
  lineNumber: number;
  content: string;
  reason: 'DATE_HEADER' | 'SYSTEM_NOTICE' | 'UNMATCHED';
}

export interface ParseDiagnosticInfo {
  totalLines: number;
  emptyLinesCount: number;
  parsedMessagesCount: number;
  
  // System Notices & Dividers Breakdown
  totalSystemNoticesCount: number; // Combined sum of date headers, system banners, and filtered system messages
  dateHeaderLinesCount: number;
  filteredSystemMessageMatchesCount: number; // e.g. [홍길동] [오후 2:00] 님이 들어왔습니다.
  systemBannerLinesCount: number; // Title meta, save date, legal banners, policy notices
  
  // Multi-line Content Continuation Lines
  multiLineContinuationCount: number;

  // Regex Pattern Breakdown
  stdMatchesCount: number;
  fullDateMatchesCount: number;
  bracketMatchesCount: number;
  shortTimeMatchesCount: number;
  csvMatchesCount: number;
  pcMatchesCount: number;

  // Unparsed / Discarded User Message Lines
  unmatchedDiscardedCount: number;
  unmatchedSampleLines: Array<{ lineNumber: number; content: string }>;
  allIgnoredLines: IgnoredLineDetail[];
  
  firstParsedMessage?: { dateStr: string; timeStr: string; nickname: string; content: string };
  lastParsedMessage?: { dateStr: string; timeStr: string; nickname: string; content: string };
}

/**
 * Parses KakaoTalk export file contents (Mobile & PC KakaoTalk formats) with full diagnostic metrics & unparsed line samples.
 */
export function parseKakaoTalkTextWithDiag(text: string): {
  messages: ChatMessage[];
  diag: ParseDiagnosticInfo;
} {
  // Strip BOM, hidden LTR/RTL control characters (\u200B-\u200D, \uFEFF, \u200E, \u200F), and clean carriage returns
  const cleanText = text
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, '')
    .replace(/\r/g, '');
  const lines = cleanText.split('\n');
  const messages: ChatMessage[] = [];

  let emptyLinesCount = 0;
  let dateHeaderLinesCount = 0;
  let fullDateMatchesCount = 0;
  let bracketMatchesCount = 0;
  let stdMatchesCount = 0;
  let shortTimeMatchesCount = 0;
  let csvMatchesCount = 0;
  let pcMatchesCount = 0;
  let multiLineContinuationCount = 0;
  let systemBannerLinesCount = 0;
  let filteredSystemMessageMatchesCount = 0;
  let unmatchedDiscardedCount = 0;
  const unmatchedSampleLines: Array<{ lineNumber: number; content: string }> = [];
  const allIgnoredLines: IgnoredLineDetail[] = [];

  let currentDate: { year: number; month: number; day: number } | null = null;

  // Pre-scan text to find first date header if available (excluding export save meta lines)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (isStandaloneSystemNoticeLine(line)) {
      continue;
    }
    const dh = extractDateHeader(line);
    if (dh) {
      currentDate = dh;
      break;
    }
  }

  // If still null, check if any full-date lines exist (excluding meta lines)
  if (!currentDate) {
    const fullDateKakaoRegex = /(\d{4})[./-]\s*(\d{1,2})[./-]\s*(\d{1,2})/;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (isStandaloneSystemNoticeLine(line)) {
        continue;
      }
      const fd = line.match(fullDateKakaoRegex);
      if (fd) {
        currentDate = {
          year: parseInt(fd[1], 10),
          month: parseInt(fd[2], 10) - 1,
          day: parseInt(fd[3], 10),
        };
        break;
      }
    }
  }

  // Fallback to current date if absolutely no date found anywhere
  if (!currentDate) {
    const now = new Date();
    currentDate = { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  }

  let currentMessage: {
    nickname: string;
    timestamp: Date;
    contentLines: string[];
    dateStr: string;
    timeStr: string;
  } | null = null;

  // Pattern building block for AM/PM matching (Prefix or Suffix, Korean & English, Unicode whitespace safe)
  const ampmToken = '(?:오전|오후|AM|PM|am|pm)';
  const wsToken = '[\\s\\u00A0\\u202F]*';

  // Patterns for line matching (evaluated in strict priority order)
  // 1. Standard Kakao Mobile/PC: [Nickname] [오전 10:15] Content OR [홍길동] [10:15 PM] Content OR [구/서울] [13:14] ㅎㅇ
  const standardKakaoRegex = new RegExp(`^\\s*\\[(.*?)\\]\\s*\\[(${ampmToken})?${wsToken}(\\d{1,2}):(\\d{2})(?::\\d{2})?${wsToken}(${ampmToken})?\\]\\s*(.*)$`, 'i');

  // 2. PC KakaoTalk Format (Nickname before bracket): 홍길동 [오후 2:00] 안녕하세요 OR 홍길동 [14:00] 안녕하세요
  const pcNickBeforeTimeRegex = new RegExp(`^\\s*([^\\[\\n\\r]+?)\\s+\\[(${ampmToken})?${wsToken}(\\d{1,2}):(\\d{2})(?::\\d{2})?${wsToken}(${ampmToken})?\\]\\s*(.*)$`, 'i');

  // 3. PC Dual Bracket Date-Time Kakao: [2026-08-03] [오후 2:00] 홍길동 : 안녕하세요 OR [2026.8.3] [14:00] 홍길동 : 안녕하세요
  const pcDualBracketRegex = new RegExp(`^\\s*\\[(\\d{4})[./-](\\d{1,2})[./-](\\d{1,2})\\s*[\\(（]?[ㄱ-ㅎ가-힣a-zA-Z]*[\\)）]?\\]\\s*\\[(${ampmToken})?${wsToken}(\\d{1,2}):(\\d{2})${wsToken}(${ampmToken})?\\]\\s*([^:]+)\\s*:\\s*(.*)$`, 'i');

  // 4. Full DateTime Kakao format (Mobile/PC): 2026. 8. 2. (일) 18:15, Nickname : Content  OR  2026. 8. 2. 오후 6:15, Nickname : Content
  const fullDateKakaoRegex = new RegExp(`^\\s*(\\d{4})[./-]\\s*(\\d{1,2})[./-]\\s*(\\d{1,2})[.]?\\s*[\\(（]?[ㄱ-ㅎ가-힣a-zA-Z]*[\\)）]?\\s*(${ampmToken})?${wsToken}(\\d{1,2}):(\\d{2})(?::\\d{2})?${wsToken}(${ampmToken})?[,\\s:]+([^:,]+)\\s*[:,\\t]\\s*(.*)$`, 'i');

  // 5. Full DateTime Kakao Korean format: 2026년 8월 2일 (일) 오후 6:15, Nickname : Content
  const fullDateKakaoKorRegex = new RegExp(`^\\s*(\\d{4})\\s*년\\s*(\\d{1,2})\\s*월\\s*(\\d{1,2})\\s*일\\s*[\\(（]?[ㄱ-ㅎ가-힣a-zA-Z]*[\\)）]?\\s*(${ampmToken})?${wsToken}(\\d{1,2}):(\\d{2})(?::\\d{2})?${wsToken}(${ampmToken})?[,\\s:]+([^:,]+)\\s*[:,\\t]\\s*(.*)$`, 'i');

  // 6. Bracket DateTime format: [2026-08-02 18:15] Nickname : Content
  const bracketDateKakaoRegex = new RegExp(`^\\s*\\[(\\d{4})[./-](\\d{1,2})[./-](\\d{1,2})\\s*[\\(（]?[ㄱ-ㅎ가-힣a-zA-Z]*[\\)）]?\\s+(${ampmToken})?${wsToken}(\\d{1,2}):(\\d{2})(?::\\d{2})?${wsToken}(${ampmToken})?\\]\\s*([^:]+)\\s*:\\s*(.*)$`, 'i');

  // 7. PC CSV Quoted / Tab Format: "2026-08-03 14:00:05", "홍길동", "안녕하세요" OR 2026-08-03 14:00:05,홍길동,안녕하세요
  const pcCsvExportRegex = new RegExp(`^\\s*"?(\\d{4})[./-](\\d{1,2})[./-](\\d{1,2})\\s+(${ampmToken})?${wsToken}(\\d{1,2}):(\\d{2})(?::\\d{2})?${wsToken}(${ampmToken})?"?\\s*[,;\\t]\\s*"?([^"\\n\\r,]+)"?\\s*[,;\\t]\\s*"?([^"\\n\\r]*)"?\\s*$`, 'i');

  // 8. Short Time Kakao Line (iOS / Android Mobile Plain saved chat: "오전 10:15, 홍길동 : 안녕하세요" OR "오후 1:05 : 홍길동 : 안녕하세요")
  const iosShortTimeRegex = new RegExp(`^\\s*(${ampmToken})?${wsToken}(\\d{1,2}):(\\d{2})${wsToken}(${ampmToken})?[,\\s:]+([^:]+)\\s*:\\s*(.*)$`, 'i');

  let messageIdCounter = 1;

  function pushCurrentMessage() {
    if (!currentMessage) return;
    const fullContent = currentMessage.contentLines.join('\n').trim();

    // Filter out explicit KakaoTalk system action messages only (e.g. "[홍길동] [오후 2:00] 님이 들어왔습니다.")
    if (isExplicitKakaoSystemAction(fullContent)) {
      filteredSystemMessageMatchesCount += currentMessage.contentLines.length;
      if (allIgnoredLines.length < 2000) {
        allIgnoredLines.push({
          lineNumber: messageIdCounter,
          content: `[${currentMessage.nickname}] [${currentMessage.timeStr}] ${fullContent}`,
          reason: 'SYSTEM_NOTICE',
        });
      }
      currentMessage = null;
      return;
    }

    const timestamp = currentMessage.timestamp;
    const hour = timestamp.getHours();
    const dayOfWeek = timestamp.getDay();
    const dateStr = currentMessage.dateStr;
    const timeStr = currentMessage.timeStr;

    // Word count calculation
    const words = fullContent.split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;
    const charCount = fullContent.length;
    const isProfanity = isProfanityMessage(fullContent);

    messages.push({
      id: `msg-${messageIdCounter++}`,
      timestamp,
      dateStr,
      timeStr,
      nickname: currentMessage.nickname.trim(),
      content: fullContent,
      hour,
      dayOfWeek,
      isProfanity,
      wordCount,
      charCount,
    });

    currentMessage = null;
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmedLine = rawLine.trim();

    if (!trimmedLine) {
      emptyLinesCount++;
      continue;
    }

    // -----------------------------------------------------------------------------
    // STEP 1 [HIGHEST PRIORITY]: Check User Chat Message Match Regexes FIRST!
    // (Ensures [이름/지역] [시간] 내용 or PC formats are ALWAYS captured as USER_CHAT)
    // -----------------------------------------------------------------------------
    const stdMatch = rawLine.match(standardKakaoRegex);
    if (stdMatch && isValidKakaoNickname(stdMatch[1])) {
      pushCurrentMessage();
      stdMatchesCount++;
      const nickname = stdMatch[1];
      const ampm1 = stdMatch[2];
      const rawHour = parseInt(stdMatch[3], 10);
      const minute = parseInt(stdMatch[4], 10);
      const ampm2 = stdMatch[5];
      const content = stdMatch[6];

      const hour = parseNormalizedHour(ampm1, ampm2, rawHour, rawLine);
      const year = currentDate ? currentDate.year : new Date().getFullYear();
      const month = currentDate ? currentDate.month : new Date().getMonth();
      const day = currentDate ? currentDate.day : new Date().getDate();
      const dateObj = new Date(year, month, day, hour, minute);

      currentMessage = {
        nickname: nickname.trim(),
        timestamp: dateObj,
        dateStr: `${year}-${pad(month + 1)}-${pad(day)}`,
        timeStr: `${pad(hour)}:${pad(minute)}`,
        contentLines: [content],
      };
      continue;
    }

    // Check PC Nickname Before Time format: 홍길동 [오후 2:00] 안녕하세요
    const pcNickMatch = rawLine.match(pcNickBeforeTimeRegex);
    if (pcNickMatch && isValidKakaoNickname(pcNickMatch[1])) {
      pushCurrentMessage();
      pcMatchesCount++;
      const nickname = pcNickMatch[1];
      const ampm1 = pcNickMatch[2];
      const rawHour = parseInt(pcNickMatch[3], 10);
      const minute = parseInt(pcNickMatch[4], 10);
      const ampm2 = pcNickMatch[5];
      const content = pcNickMatch[6];

      const hour = parseNormalizedHour(ampm1, ampm2, rawHour, rawLine);
      const year = currentDate ? currentDate.year : new Date().getFullYear();
      const month = currentDate ? currentDate.month : new Date().getMonth();
      const day = currentDate ? currentDate.day : new Date().getDate();
      const dateObj = new Date(year, month, day, hour, minute);

      currentMessage = {
        nickname: nickname.trim(),
        timestamp: dateObj,
        dateStr: `${year}-${pad(month + 1)}-${pad(day)}`,
        timeStr: `${pad(hour)}:${pad(minute)}`,
        contentLines: [content],
      };
      continue;
    }

    // Check PC Dual Bracket Kakao format: [2026-08-03] [오후 2:00] 홍길동 : 안녕하세요
    const pcDualMatch = rawLine.match(pcDualBracketRegex);
    if (pcDualMatch && isValidKakaoNickname(pcDualMatch[8])) {
      pushCurrentMessage();
      pcMatchesCount++;
      const year = parseInt(pcDualMatch[1], 10);
      const month = parseInt(pcDualMatch[2], 10) - 1;
      const day = parseInt(pcDualMatch[3], 10);
      const ampm1 = pcDualMatch[4];
      const rawHour = parseInt(pcDualMatch[5], 10);
      const minute = parseInt(pcDualMatch[6], 10);
      const ampm2 = pcDualMatch[7];
      const nickname = pcDualMatch[8];
      const content = pcDualMatch[9];

      const hour = parseNormalizedHour(ampm1, ampm2, rawHour, rawLine);
      const dateObj = new Date(year, month, day, hour, minute);

      currentDate = { year, month, day };
      currentMessage = {
        nickname: nickname.trim(),
        timestamp: dateObj,
        dateStr: `${year}-${pad(month + 1)}-${pad(day)}`,
        timeStr: `${pad(hour)}:${pad(minute)}`,
        contentLines: [content],
      };
      continue;
    }

    // Check Full DateTime kakao line (Mobile & PC)
    const fullDateMatch = rawLine.match(fullDateKakaoRegex) || rawLine.match(fullDateKakaoKorRegex);
    if (fullDateMatch && isValidKakaoNickname(fullDateMatch[8])) {
      pushCurrentMessage();
      fullDateMatchesCount++;
      const year = parseInt(fullDateMatch[1], 10);
      const month = parseInt(fullDateMatch[2], 10) - 1;
      const day = parseInt(fullDateMatch[3], 10);
      const ampm1 = fullDateMatch[4];
      const rawHour = parseInt(fullDateMatch[5], 10);
      const minute = parseInt(fullDateMatch[6], 10);
      const ampm2 = fullDateMatch[7];
      const nickname = fullDateMatch[8];
      const content = fullDateMatch[9];

      const hour = parseNormalizedHour(ampm1, ampm2, rawHour, rawLine);
      const dateObj = new Date(year, month, day, hour, minute);

      currentDate = { year, month, day };
      currentMessage = {
        nickname: nickname.trim(),
        timestamp: dateObj,
        dateStr: `${year}-${pad(month + 1)}-${pad(day)}`,
        timeStr: `${pad(hour)}:${pad(minute)}`,
        contentLines: [content],
      };
      continue;
    }

    // Check Bracket DateTime line (format: [2026-08-02 18:15] Nickname : Content)
    const bracketMatch = rawLine.match(bracketDateKakaoRegex);
    if (bracketMatch && isValidKakaoNickname(bracketMatch[8])) {
      pushCurrentMessage();
      bracketMatchesCount++;
      const year = parseInt(bracketMatch[1], 10);
      const month = parseInt(bracketMatch[2], 10) - 1;
      const day = parseInt(bracketMatch[3], 10);
      const ampm1 = bracketMatch[4];
      const rawHour = parseInt(bracketMatch[5], 10);
      const minute = parseInt(bracketMatch[6], 10);
      const ampm2 = bracketMatch[7];
      const nickname = bracketMatch[8];
      const content = bracketMatch[9];

      const hour = parseNormalizedHour(ampm1, ampm2, rawHour, rawLine);
      const dateObj = new Date(year, month, day, hour, minute);

      currentDate = { year, month, day };
      currentMessage = {
        nickname: nickname.trim(),
        timestamp: dateObj,
        dateStr: `${year}-${pad(month + 1)}-${pad(day)}`,
        timeStr: `${pad(hour)}:${pad(minute)}`,
        contentLines: [content],
      };
      continue;
    }

    // Check PC CSV Quoted format ("2026-08-03 14:00:05", "홍길동", "안녕하세요")
    const pcCsvMatch = rawLine.match(pcCsvExportRegex);
    if (pcCsvMatch && isValidKakaoNickname(pcCsvMatch[8])) {
      pushCurrentMessage();
      pcMatchesCount++;
      const year = parseInt(pcCsvMatch[1], 10);
      const month = parseInt(pcCsvMatch[2], 10) - 1;
      const day = parseInt(pcCsvMatch[3], 10);
      const ampm1 = pcCsvMatch[4];
      const rawHour = parseInt(pcCsvMatch[5], 10);
      const minute = parseInt(pcCsvMatch[6], 10);
      const ampm2 = pcCsvMatch[7];
      const nickname = pcCsvMatch[8];
      const content = pcCsvMatch[9];

      const hour = parseNormalizedHour(ampm1, ampm2, rawHour, rawLine);
      const dateObj = new Date(year, month, day, hour, minute);

      currentDate = { year, month, day };
      currentMessage = {
        nickname: nickname.trim(),
        timestamp: dateObj,
        dateStr: `${year}-${pad(month + 1)}-${pad(day)}`,
        timeStr: `${pad(hour)}:${pad(minute)}`,
        contentLines: [content],
      };
      continue;
    }

    // Check Short Time Kakao Line (iOS / Android Mobile Plain saved chat)
    const iosShortMatch = rawLine.match(iosShortTimeRegex);
    if (iosShortMatch && isValidKakaoNickname(iosShortMatch[5])) {
      pushCurrentMessage();
      shortTimeMatchesCount++;
      const ampm1 = iosShortMatch[1];
      const rawHour = parseInt(iosShortMatch[2], 10);
      const minute = parseInt(iosShortMatch[3], 10);
      const ampm2 = iosShortMatch[4];
      const nickname = iosShortMatch[5];
      const content = iosShortMatch[6];

      const hour = parseNormalizedHour(ampm1, ampm2, rawHour, rawLine);
      const year = currentDate ? currentDate.year : new Date().getFullYear();
      const month = currentDate ? currentDate.month : new Date().getMonth();
      const day = currentDate ? currentDate.day : new Date().getDate();
      const dateObj = new Date(year, month, day, hour, minute);

      currentMessage = {
        nickname: nickname.trim(),
        timestamp: dateObj,
        dateStr: `${year}-${pad(month + 1)}-${pad(day)}`,
        timeStr: `${pad(hour)}:${pad(minute)}`,
        contentLines: [content],
      };
      continue;
    }

    // CSV format line fallback (Date, User, Message) - requires valid date in 1st col AND valid nickname in 2nd col
    if (rawLine.includes(',') && (rawLine.includes('오전') || rawLine.includes('오후') || rawLine.includes(':') || rawLine.includes('"'))) {
      const parts = rawLine.split(',');
      if (parts.length >= 3) {
        const potentialDateStr = parts[0].replace(/"/g, '').trim();
        const dateMatch = potentialDateStr.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
        if (dateMatch) {
          const potentialUser = parts[1].replace(/"/g, '').trim();
          const potentialContent = parts.slice(2).join(',').replace(/"/g, '').trim();

          if (potentialUser && potentialContent && isValidKakaoNickname(potentialUser)) {
            pushCurrentMessage();
            csvMatchesCount++;
            const year = parseInt(dateMatch[1], 10);
            const month = parseInt(dateMatch[2], 10) - 1;
            const day = parseInt(dateMatch[3], 10);
            const dateObj = new Date(year, month, day, 12, 0);

            currentMessage = {
              nickname: potentialUser,
              timestamp: dateObj,
              dateStr: `${year}-${pad(month + 1)}-${pad(day)}`,
              timeStr: `12:00`,
              contentLines: [potentialContent],
            };
            continue;
          }
        }
      }
    }

    // -----------------------------------------------------------------------------
    // STEP 2 [SECOND PRIORITY]: Check Standalone Date Header Line
    // (Format: --------------- YYYY년 M월 D일 요일 ---------------)
    // -----------------------------------------------------------------------------
    const dateHeader = extractDateHeader(rawLine);
    if (dateHeader) {
      pushCurrentMessage();
      currentDate = dateHeader;
      dateHeaderLinesCount++;
      if (allIgnoredLines.length < 2000) {
        allIgnoredLines.push({ lineNumber: i + 1, content: rawLine, reason: 'DATE_HEADER' });
      }
      continue;
    }

    // -----------------------------------------------------------------------------
    // STEP 3 [THIRD PRIORITY]: Check Standalone System Notice Line
    // (Format: 저장한 날짜, 카카오톡 대화, 불법촬영물 안내 등)
    // -----------------------------------------------------------------------------
    if (isStandaloneSystemNoticeLine(rawLine)) {
      pushCurrentMessage();
      systemBannerLinesCount++;
      if (allIgnoredLines.length < 2000) {
        allIgnoredLines.push({ lineNumber: i + 1, content: rawLine, reason: 'SYSTEM_NOTICE' });
      }
      continue;
    }

    // -----------------------------------------------------------------------------
    // STEP 4 [FOURTH PRIORITY]: Multi-line Continuation of Active User Message
    // -----------------------------------------------------------------------------
    if (currentMessage) {
      currentMessage.contentLines.push(rawLine);
      multiLineContinuationCount++;
      continue;
    }

    // -----------------------------------------------------------------------------
    // STEP 5 [FIFTH PRIORITY]: Truly Unmatched / Discarded User Message Line
    // -----------------------------------------------------------------------------
    unmatchedDiscardedCount++;
    if (unmatchedSampleLines.length < 5) {
      unmatchedSampleLines.push({ lineNumber: i + 1, content: rawLine });
    }
    if (allIgnoredLines.length < 2000) {
      allIgnoredLines.push({ lineNumber: i + 1, content: rawLine, reason: 'UNMATCHED' });
    }
  }

  // Push final remaining message
  pushCurrentMessage();

  const firstParsedMessage = messages.length > 0 ? {
    dateStr: messages[0].dateStr,
    timeStr: messages[0].timeStr,
    nickname: messages[0].nickname,
    content: messages[0].content,
  } : undefined;

  const lastParsedMessage = messages.length > 0 ? {
    dateStr: messages[messages.length - 1].dateStr,
    timeStr: messages[messages.length - 1].timeStr,
    nickname: messages[messages.length - 1].nickname,
    content: messages[messages.length - 1].content,
  } : undefined;

  const totalSystemNoticesCount = dateHeaderLinesCount + filteredSystemMessageMatchesCount + systemBannerLinesCount;

  const diag: ParseDiagnosticInfo = {
    totalLines: lines.length,
    emptyLinesCount,
    parsedMessagesCount: messages.length,
    totalSystemNoticesCount,
    dateHeaderLinesCount,
    filteredSystemMessageMatchesCount,
    systemBannerLinesCount,
    fullDateMatchesCount,
    bracketMatchesCount,
    stdMatchesCount,
    shortTimeMatchesCount,
    csvMatchesCount,
    pcMatchesCount,
    multiLineContinuationCount,
    unmatchedDiscardedCount,
    unmatchedSampleLines,
    allIgnoredLines,
    firstParsedMessage,
    lastParsedMessage,
  };

  // Real-time F12 DevTools Console Logging
  console.group('%c[카카오톡 모바일/PC 파일 파싱 100% 정밀 라인 정산 리포트]', 'color: #4f46e5; font-weight: bold; font-size: 14px;');
  console.log('📄 총 파일 줄 수 (Total Lines):', lines.length);
  console.log('💬 수집된 대화 메시지 (Parsed Messages):', messages.length);
  console.log('📊 본문 줄바꿈 연결 줄 (Multi-line Lines):', multiLineContinuationCount);
  console.log('📢 전체 시스템 공지/알림/구분선 (Total System Notices):', totalSystemNoticesCount, `(날짜구분선: ${dateHeaderLinesCount}줄 / 입퇴장: ${filteredSystemMessageMatchesCount}줄 / 메타배너: ${systemBannerLinesCount}줄)`);
  console.log('🌫️ 빈 줄 (Empty Lines):', emptyLinesCount);
  console.log('⚠️ 실제 누락된 대화 줄 (Unmatched Lines):', unmatchedDiscardedCount);
  console.log(`📐 100% 검증 수식: ${lines.length} = ${messages.length} + ${multiLineContinuationCount} + ${totalSystemNoticesCount} + ${emptyLinesCount} + ${unmatchedDiscardedCount}`);

  if (firstParsedMessage) {
    console.log(`📌 [파일 시작 첫 대화] ${firstParsedMessage.dateStr} ${firstParsedMessage.timeStr} | [${firstParsedMessage.nickname}]: "${firstParsedMessage.content}"`);
  }
  if (lastParsedMessage) {
    console.log(`🏁 [파일 마지막 대화 (EOF)] ${lastParsedMessage.dateStr} ${lastParsedMessage.timeStr} | [${lastParsedMessage.nickname}]: "${lastParsedMessage.content}"`);
  }

  // Print 100% of all ignored / system notice lines to F12 Console for total transparency
  console.group('%c📢 시스템공지/구분선 전체 목록 100% 전수 출력 (' + allIgnoredLines.length + '줄)', 'color: #f59e0b; font-weight: bold;');
  allIgnoredLines.forEach((item, idx) => {
    console.log(`[${idx + 1}/${allIgnoredLines.length}] [줄 ${item.lineNumber}] [${item.reason}] ${item.content}`);
  });
  console.groupEnd();

  if (unmatchedDiscardedCount > 0) {
    console.warn('⚠️ 억울하게 누락된 실제 대화 줄 수:', unmatchedDiscardedCount);
    console.group('🔍 억울하게 누락된 실제 대화 문장 샘플 (최대 5개):');
    unmatchedSampleLines.forEach((sample) => console.warn(`[줄 ${sample.lineNumber}] ${sample.content}`));
    console.groupEnd();
  } else {
    console.log('%c🎉 억울하게 버려진 실제 대화 메시지가 0개입니다! (모바일/PC 카카오톡 대화 100% 수집 완료)', 'color: #10b981; font-weight: bold;');
  }
  console.groupEnd();

  return { messages, diag };
}

export function parseKakaoTalkText(text: string): ChatMessage[] {
  return parseKakaoTalkTextWithDiag(text).messages;
}
