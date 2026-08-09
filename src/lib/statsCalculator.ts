import { ChatMessage, ParsingResult, SpecialRankings, UserStat } from '@/types/chat';
import { isValidKakaoNickname } from '@/lib/kakaotalkParser';

export function cleanTextFirstPass(text: string): string {
  return text
    .replace(/@\S+/g, ' ')
    .replace(/(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, ' ')
    .replace(/[^가-힣\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const COMMON_STOP_NOISE = new Set([
  '사진', '동영상', '음성메시지', '이모티콘', '삭제된', '메시지입니다',
  '오늘', '어제', '내일', '지금', '하나', '두개', '세개', '거기', '여기',
  '네네', '오케이', 'ㅋㅋㅋ', 'ㅎㅎㅎ', '감사', '수고', '안녕하세요',
]);

export function calculateChatStats(messages: ChatMessage[]): ParsingResult {
  if (!messages || messages.length === 0) {
    return {
      messages: [],
      userStats: [],
      specialRankings: {
        pingPongKing: [],
        keyboardWarrior: [],
        salaryLupin: [],
        commentAlba: [],
        miracleDobby: [],
        angangEmoji: [],
        questionKiller: [],
      },
      totalMessages: 0,
      totalCharacters: 0,
      uniqueUsersCount: 0,
      startDateStr: '-',
      endDateStr: '-',
      totalDays: 0,
      hourlyDistribution: Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        label: `${h}시`,
        count: 0,
      })),
      dailyDistribution: [],
      topKeywords: [],
    };
  }

  const totalRoomMessages = messages.length;

  // Step 1: Per-user data aggregation
  const userMap = new Map<
    string,
    {
      totalMessages: number;
      charCount: number;
      profanityCount: number;
      cryingCount: number;
      questionCount: number;
      morningCount: number;
      workHourMessages: number;
      commentCount: number;
      activeDays: Set<string>;
      words: string[];
      rawWordMap: Map<string, number>;
      replyDeltas: number[];
      pingPongExamples: string[];
      profanityExamples: string[];
      cryingExamples: string[];
      questionExamples: string[];
      morningExamples: string[];
      workHourExamples: { timeStr: string; content: string }[];
      allContentMessages: string[];
    }
  >();

  let totalCharacters = 0;
  const hourlyCount = new Array(24).fill(0);
  const dailyCountMap = new Map<string, number>();
  const wordFrequencyMap = new Map<string, number>();

  let prevMessage: ChatMessage | null = null;

  messages.forEach((msg) => {
    totalCharacters += msg.charCount;
    hourlyCount[msg.hour]++;
    dailyCountMap.set(msg.dateStr, (dailyCountMap.get(msg.dateStr) || 0) + 1);

    if (!isValidKakaoNickname(msg.nickname)) {
      return;
    }

    if (!userMap.has(msg.nickname)) {
      userMap.set(msg.nickname, {
        totalMessages: 0,
        charCount: 0,
        profanityCount: 0,
        cryingCount: 0,
        questionCount: 0,
        morningCount: 0,
        workHourMessages: 0,
        commentCount: 0,
        activeDays: new Set<string>(),
        words: [],
        rawWordMap: new Map<string, number>(),
        replyDeltas: [],
        profanityExamples: [],
        pingPongExamples: [],
        cryingExamples: [],
        questionExamples: [],
        morningExamples: [],
        workHourExamples: [],
        allContentMessages: [],
      });
    }

    const userData = userMap.get(msg.nickname)!;
    userData.totalMessages += 1;
    userData.charCount += msg.charCount;
    userData.activeDays.add(msg.dateStr);
    userData.allContentMessages.push(msg.content);

    if (msg.isProfanity) {
      userData.profanityCount += 1;
      userData.profanityExamples.push(msg.content);
    }

    const cryingMatches = msg.content.match(/[ㅠㅜ]{2,}/g);
    if (cryingMatches) {
      userData.cryingCount += 1;
      userData.cryingExamples.push(msg.content);
    }

    const contentWithoutUrls = msg.content.replace(/(https?:\/\/[^\s]+|www\.[^\s]+)/gi, '');
    const contentWithoutReactions = contentWithoutUrls.replace(/(?:오호|오|아|어|음|엥|응|읭|잉|하|허)[\?!]+|\(\?+\)/gi, '');
    const questionMatches = contentWithoutReactions.match(/\?/g);
    if (questionMatches) {
      userData.questionCount += 1;
      userData.questionExamples.push(msg.content);
    }

    const morningMatches = msg.content.match(/모닝|몬잉|머닝/gi);
    if (morningMatches) {
      userData.morningCount += 1;
      userData.morningExamples.push(msg.content);
    }

    // Work hour check: 09:00 ~ 18:00
    if (msg.hour >= 9 && msg.hour < 18) {
      userData.workHourMessages += 1;
      if (userData.workHourExamples.length < 10) {
        userData.workHourExamples.push({ timeStr: msg.timeStr, content: msg.content });
      }
    }

    const cleanedContent = cleanTextFirstPass(msg.content);
    const tokens = cleanedContent.split(/\s+/).filter((w) => w.length >= 2);

    tokens.forEach((t) => {
      const lower = t.toLowerCase();
      userData.words.push(lower);
      wordFrequencyMap.set(lower, (wordFrequencyMap.get(lower) || 0) + 1);

      if (!COMMON_STOP_NOISE.has(lower)) {
        userData.rawWordMap.set(lower, (userData.rawWordMap.get(lower) || 0) + 1);
      }
    });

    if (prevMessage && prevMessage.nickname !== msg.nickname) {
      userData.commentCount += 1;
      const deltaSec = (msg.timestamp.getTime() - prevMessage.timestamp.getTime()) / 1000;
      if (deltaSec >= 0 && deltaSec <= 3600) {
        userData.replyDeltas.push(deltaSec);
        if (deltaSec <= 120 && msg.content.trim().length >= 2 && !msg.content.includes('http')) {
          if (userData.pingPongExamples.length < 10 && !userData.pingPongExamples.includes(msg.content)) {
            userData.pingPongExamples.push(msg.content);
          }
        }
      }
    }
    prevMessage = msg;
  });

  const userStats: UserStat[] = Array.from(userMap.entries()).map(([nickname, data]) => {
    const percentage = Number(((data.totalMessages / totalRoomMessages) * 100).toFixed(1));
    const profanityRatio = Number(((data.profanityCount / data.totalMessages) * 100).toFixed(1));
    const workHourRatio = Number(((data.workHourMessages / data.totalMessages) * 100).toFixed(1));

    let avgReplyTimeSeconds: number | null = null;
    let avgReplyTimeFormatted = '-';

    if (data.replyDeltas.length > 0) {
      const sumSec = data.replyDeltas.reduce((a, b) => a + b, 0);
      avgReplyTimeSeconds = Number((sumSec / data.replyDeltas.length).toFixed(1));
      avgReplyTimeFormatted = formatDuration(avgReplyTimeSeconds);
    }

    const totalWords = data.words.length;
    const uniqueWords = new Set(data.words).size;
    const ttr = totalWords > 0 ? Number(((uniqueWords / totalWords) * 100).toFixed(1)) : 0;
    const avgMessageLength = Number((data.charCount / data.totalMessages).toFixed(1));

    // Calculate Member Speech Habits & Catchphrases Top 3
    const topCatchphrases = Array.from(data.rawWordMap.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    let speechHabitTag = '💬 톡방 소통 분위기 메이커';
    if (avgMessageLength >= 35) {
      speechHabitTag = '📝 장문 논리 전개형';
    } else if (avgMessageLength <= 10) {
      speechHabitTag = '⚡ 단문 연타 타자파';
    } else if (workHourRatio >= 60) {
      speechHabitTag = '💼 업무시간 톡방 지킴이';
    } else if (profanityRatio >= 5) {
      speechHabitTag = '🔥 화끈한 사이다 입담파';
    } else if (avgReplyTimeSeconds !== null && avgReplyTimeSeconds <= 30) {
      speechHabitTag = '🏓 초스피드 핑퐁 답장파';
    }

    const topWord = topCatchphrases[0]?.word || '';
    const secondWord = topCatchphrases[1]?.word || '';

    const topWordText = topWord ? `'${topWord}'` : '대화';
    const secondWordText = secondWord ? `, '${secondWord}'` : '';
    const lengthDesc = avgMessageLength >= 25 ? '알찬 장문' : '간결한 단문';

    const speechSummary = `${nickname} 님은 주로 ${topWordText}${secondWordText} 표현을 즐겨 쓰며, 평균 ${avgMessageLength}자의 ${lengthDesc} 메시지로 대화를 이끄는 습관이 있습니다.`;

    let signatureMessage = '';

    if (topWord) {
      const matchMsgs = data.allContentMessages.filter(
        (m) => m.toLowerCase().includes(topWord) && !m.includes('http') && !m.includes('@')
      );
      if (matchMsgs.length > 0) {
        signatureMessage = matchMsgs[0];
      }
    }

    if (!signatureMessage && secondWord) {
      const matchMsgs2 = data.allContentMessages.filter(
        (m) => m.toLowerCase().includes(secondWord) && !m.includes('http') && !m.includes('@')
      );
      if (matchMsgs2.length > 0) {
        signatureMessage = matchMsgs2[0];
      }
    }

    if (!signatureMessage) {
      const suitableMsgs = data.allContentMessages.filter(
        (m) => m.length >= 8 && m.length <= 40 && !m.includes('http') && !m.includes('@')
      );
      signatureMessage = suitableMsgs.length > 0 ? suitableMsgs[0] : data.allContentMessages[0] || '';
    }

    const pingPongExamples = Array.from(new Set(data.pingPongExamples)).slice(0, 5);
    const profanityExamples = data.profanityExamples;
    const cryingExamples = data.cryingExamples;
    const questionExamples = data.questionExamples;
    const morningExamples = data.morningExamples;
    const workHourExamples = data.workHourExamples.slice(0, 5);

    return {
      nickname,
      rank: 0,
      totalMessages: data.totalMessages,
      percentage,
      replyCount: data.replyDeltas.length,
      avgReplyTimeSeconds,
      avgReplyTimeFormatted,
      pingPongExamples,
      profanityCount: data.profanityCount,
      profanityRatio,
      profanityExamples,
      cryingCount: data.cryingCount,
      cryingExamples,
      questionCount: data.questionCount,
      questionExamples,
      morningCount: data.morningCount,
      morningExamples,
      workHourMessages: data.workHourMessages,
      workHourRatio,
      workHourExamples,
      commentCount: data.commentCount,
      uniqueWordsCount: uniqueWords,
      totalWordsCount: totalWords,
      ttr,
      speechHabitTag,
      topCatchphrases,
      speechSummary,
      signatureMessage,
      activeDaysCount: data.activeDays.size,
      avgMessageLength,
    };
  });

  userStats.sort((a, b) => b.totalMessages - a.totalMessages);
  userStats.forEach((stat, idx) => {
    stat.rank = idx + 1;
  });

  const pingPongCandidates = userStats.filter((u) => u.avgReplyTimeSeconds !== null && u.replyCount >= 3);
  pingPongCandidates.sort((a, b) => (a.avgReplyTimeSeconds || 99999) - (b.avgReplyTimeSeconds || 99999));

  pingPongCandidates.forEach((stat, idx) => {
    if (idx === 0) {
      stat.pingPongRank = 1;
    } else if (stat.avgReplyTimeSeconds === pingPongCandidates[idx - 1].avgReplyTimeSeconds) {
      stat.pingPongRank = pingPongCandidates[idx - 1].pingPongRank;
    } else {
      stat.pingPongRank = (pingPongCandidates[idx - 1].pingPongRank || 1) + 1;
    }
  });

  const pingPongKing = pingPongCandidates.filter((u) => (u.pingPongRank || 99) <= 3);

  const keyboardCandidates = userStats.filter((u) => u.profanityCount > 0);
  keyboardCandidates.sort((a, b) => b.profanityCount - a.profanityCount || b.profanityRatio - a.profanityRatio || b.totalMessages - a.totalMessages);

  // 동점자 공동 순위 부여 (Dense Ranking: 공동 1위가 있어도 다음 순위는 2위, 3위로 연속 부여)
  keyboardCandidates.forEach((stat, idx) => {
    if (idx === 0) {
      stat.profanityRank = 1;
    } else if (stat.profanityCount === keyboardCandidates[idx - 1].profanityCount) {
      stat.profanityRank = keyboardCandidates[idx - 1].profanityRank;
    } else {
      stat.profanityRank = (keyboardCandidates[idx - 1].profanityRank || 1) + 1;
    }
  });

  const keyboardWarrior = keyboardCandidates.filter((u) => (u.profanityRank || 99) <= 3);

  const salaryCandidates = userStats.filter((u) => u.workHourMessages > 0);
  salaryCandidates.sort((a, b) => b.workHourMessages - a.workHourMessages || b.workHourRatio - a.workHourRatio);

  salaryCandidates.forEach((stat, idx) => {
    if (idx === 0) {
      stat.salaryRank = 1;
    } else if (stat.workHourMessages === salaryCandidates[idx - 1].workHourMessages) {
      stat.salaryRank = salaryCandidates[idx - 1].salaryRank;
    } else {
      stat.salaryRank = (salaryCandidates[idx - 1].salaryRank || 1) + 1;
    }
  });

  const salaryLupin = salaryCandidates.filter((u) => (u.salaryRank || 99) <= 3);

  const commentCandidates = userStats.filter((u) => u.commentCount > 0);
  commentCandidates.sort((a, b) => b.commentCount - a.commentCount || b.totalMessages - a.totalMessages);

  commentCandidates.forEach((stat, idx) => {
    if (idx === 0) {
      stat.commentRank = 1;
    } else if (stat.commentCount === commentCandidates[idx - 1].commentCount) {
      stat.commentRank = commentCandidates[idx - 1].commentRank;
    } else {
      stat.commentRank = (commentCandidates[idx - 1].commentRank || 1) + 1;
    }
  });

  const commentAlba = commentCandidates.filter((u) => (u.commentRank || 99) <= 3);

  const morningCandidates = userStats.filter(
    (u) => u.morningCount > 0 && !u.nickname.includes('오픈채팅봇')
  );
  morningCandidates.sort((a, b) => b.morningCount - a.morningCount || b.totalMessages - a.totalMessages);

  morningCandidates.forEach((stat, idx) => {
    if (idx === 0) {
      stat.morningRank = 1;
    } else if (stat.morningCount === morningCandidates[idx - 1].morningCount) {
      stat.morningRank = morningCandidates[idx - 1].morningRank;
    } else {
      stat.morningRank = (morningCandidates[idx - 1].morningRank || 1) + 1;
    }
  });

  const miracleDobby = morningCandidates.filter((u) => (u.morningRank || 99) <= 3);

  const angangCandidates = userStats.filter((u) => u.cryingCount > 0);
  angangCandidates.sort((a, b) => b.cryingCount - a.cryingCount || b.totalMessages - a.totalMessages);

  angangCandidates.forEach((stat, idx) => {
    if (idx === 0) {
      stat.cryingRank = 1;
    } else if (stat.cryingCount === angangCandidates[idx - 1].cryingCount) {
      stat.cryingRank = angangCandidates[idx - 1].cryingRank;
    } else {
      stat.cryingRank = (angangCandidates[idx - 1].cryingRank || 1) + 1;
    }
  });

  const angangEmoji = angangCandidates.filter((u) => (u.cryingRank || 99) <= 3);

  const questionCandidates = userStats.filter((u) => u.questionCount > 0);
  questionCandidates.sort((a, b) => b.questionCount - a.questionCount || b.totalMessages - a.totalMessages);

  questionCandidates.forEach((stat, idx) => {
    if (idx === 0) {
      stat.questionRank = 1;
    } else if (stat.questionCount === questionCandidates[idx - 1].questionCount) {
      stat.questionRank = questionCandidates[idx - 1].questionRank;
    } else {
      stat.questionRank = (questionCandidates[idx - 1].questionRank || 1) + 1;
    }
  });

  const questionKiller = questionCandidates.filter((u) => (u.questionRank || 99) <= 3);

  const specialRankings: SpecialRankings = {
    pingPongKing,
    keyboardWarrior,
    salaryLupin,
    commentAlba,
    miracleDobby,
    angangEmoji,
    questionKiller,
  };

  const sortedDates = Array.from(dailyCountMap.keys()).sort();
  const startDateStr = sortedDates[0] || '-';
  const endDateStr = sortedDates[sortedDates.length - 1] || '-';

  // 🔥 시작일(Start Date)과 종료일(End Date)을 모두 포함(Inclusive)하여 타임존 독립적으로 일수 계산
  let totalDays = 0;
  if (startDateStr !== '-' && endDateStr !== '-') {
    const sParts = startDateStr.split('-').map((v) => parseInt(v, 10));
    const eParts = endDateStr.split('-').map((v) => parseInt(v, 10));

    if (sParts.length === 3 && eParts.length === 3 && !sParts.some(isNaN) && !eParts.some(isNaN)) {
      const startUtc = Date.UTC(sParts[0], sParts[1] - 1, sParts[2]);
      const endUtc = Date.UTC(eParts[0], eParts[1] - 1, eParts[2]);
      const diffMs = endUtc - startUtc;
      totalDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
    } else {
      totalDays = sortedDates.length;
    }
  } else {
    totalDays = sortedDates.length;
  }

  const hourlyDistribution = hourlyCount.map((count, hour) => ({
    hour,
    label: `${hour}시`,
    count,
  }));

  const dailyDistribution = sortedDates.map((dateStr) => {
    const count = dailyCountMap.get(dateStr) || 0;
    const parts = dateStr.split('-').map((v) => parseInt(v, 10));
    let dayOfWeekIdx = 0;
    if (parts.length === 3 && !parts.some(isNaN)) {
      const dObj = new Date(parts[0], parts[1] - 1, parts[2]);
      dayOfWeekIdx = dObj.getDay();
    }
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const label = `${dateStr.slice(5)} (${dayNames[dayOfWeekIdx] || ''})`;
    return {
      dateStr,
      label,
      count,
    };
  });

  const topKeywords = Array.from(wordFrequencyMap.entries())
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 20);

  return {
    messages,
    userStats,
    specialRankings,
    totalMessages: totalRoomMessages,
    totalCharacters,
    uniqueUsersCount: userStats.length,
    startDateStr,
    endDateStr,
    totalDays,
    hourlyDistribution,
    dailyDistribution,
    topKeywords,
  };
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}초`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (secs === 0) return `${mins}분`;
  return `${mins}분 ${secs}초`;
}
