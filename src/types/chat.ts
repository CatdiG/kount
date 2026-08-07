export interface ChatMessage {
  id: string;
  timestamp: Date;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:mm
  nickname: string;
  content: string;
  hour: number; // 0-23
  dayOfWeek: number; // 0-6 (0 = Sun, 1 = Mon...)
  isProfanity: boolean;
  wordCount: number;
  charCount: number;
}

export interface UserStat {
  nickname: string;
  rank: number;
  totalMessages: number;
  percentage: number; // % of room total
  
  // 핑퐁왕 (Ping-Pong King)
  replyCount: number;
  avgReplyTimeSeconds: number | null;
  avgReplyTimeFormatted: string;
  pingPongExamples?: string[];

  // 키보드워리어 (Keyboard Warrior)
  profanityCount: number;
  profanityRatio: number; // (profanity messages / total messages) * 100
  profanityRank?: number;
  profanityExamples?: string[];

  // 월급루팡 (Salary Lupin)
  workHourMessages: number; // 09:00 ~ 18:00
  workHourRatio: number; // (workHourMessages / totalMessages) * 100
  workHourExamples?: { timeStr: string; content: string }[];

  // 댓글알바 (Comment Alba)
  commentCount: number;
  commentRank?: number;

  // Diversity stats
  uniqueWordsCount: number;
  totalWordsCount: number;
  ttr: number; // (unique / total) * 100 Type-Token Ratio

  // Speech habit & style analysis
  speechHabitTag: string;
  topCatchphrases: { word: string; count: number }[];
  speechSummary: string;
  signatureMessage?: string;

  // Additional detail stats
  activeDaysCount: number;
  avgMessageLength: number;
}

export interface SpecialRankings {
  pingPongKing: UserStat[];
  keyboardWarrior: UserStat[];
  salaryLupin: UserStat[];
  commentAlba: UserStat[];
}

export interface ParsingResult {
  messages: ChatMessage[];
  userStats: UserStat[];
  specialRankings: SpecialRankings;
  totalMessages: number;
  totalCharacters: number;
  uniqueUsersCount: number;
  startDateStr: string;
  endDateStr: string;
  totalDays: number;
  hourlyDistribution: { hour: number; label: string; count: number }[];
  dailyDistribution: { dateStr: string; count: number }[];
  topKeywords: { text: string; value: number }[];
}
