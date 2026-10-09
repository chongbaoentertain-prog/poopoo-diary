import type { Ref } from 'react';
import { Poo } from '../../components/poo/Poo';
import { getCharacter } from '../../data/characters';
import { DEFAULT_MOOD, getMoodLabel } from '../../data/moods';
import type { DateKey } from '../../types/diary';
import { getCalendarWeeks, wrapText, type ShareCardData } from './shareCardData';

export const CARD_WIDTH = 360;
const FONT_FAMILY = "'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif"; // 导出成图片时读不到网页字体,只能用系统字体
const INK_COLOR = '#3a2a22';
const PAPER_COLOR = '#fffaf1';
const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];
const SINGLE_DAY_CARD_HEIGHT = 500;
const CALENDAR_CELL_WIDTH = 44;
const CALENDAR_ROW_HEIGHT = 46;
const QUOTE_MAX_WIDTH = 15;

const formatMonthAndDay = (date: DateKey) => `${Number(date.slice(5, 7))}月${Number(date.slice(8))}日`;
const getQuoteLines = (data: ShareCardData) => wrapText(data.quote, QUOTE_MAX_WIDTH);
const getQuoteBoxHeight = (quoteLines: string[]) => 28 + quoteLines.length * 22;

export function getCardHeight(data: ShareCardData): number {
  if (data.fromDate === data.toDate) return SINGLE_DAY_CARD_HEIGHT;
  // 标题和主角 200 + 日历(表头 20 + 每周一行)+ 文案框 + 页脚,各留 12 的间距
  return 220 + getCalendarWeeks(data).length * CALENDAR_ROW_HEIGHT + 12 + getQuoteBoxHeight(getQuoteLines(data)) + 12 + 36;
}

interface ShareCardProps {
  data: ShareCardData;
  hideNickname: boolean;
  hideMood: boolean;
  svgRef?: Ref<SVGSVGElement>;
}

/**
 * 分享卡片。整张是一个 SVG,预览和导出图片用的是同一份,所见即所得。
 * hideNickname / hideMood:用户在分享前选择隐藏的信息。
 */
export function ShareCard({ data, hideNickname, hideMood, svgRef }: ShareCardProps) {
  const cardHeight = getCardHeight(data);
  const headlineStamp = data.headlineStamp;
  const headlineCharacter = headlineStamp ? getCharacter(headlineStamp.characterId) : null;
  const accentColor = headlineCharacter?.accentColor ?? '#e8a62a';
  const isSingleDay = data.fromDate === data.toDate;
  const footerText = `${hideNickname ? '匿名噗友' : data.nickname}${data.headlineStreak > 0 ? ` · 连续 ${data.headlineStreak} 天` : ''}`;
  const quoteLines = getQuoteLines(data);
  const moodToDraw = (stampMood: typeof DEFAULT_MOOD) => (hideMood ? DEFAULT_MOOD : stampMood);

  return (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${CARD_WIDTH} ${cardHeight}`} width={CARD_WIDTH} height={cardHeight}
      fontFamily={FONT_FAMILY} role="img" aria-label="分享卡片" style={{ display: 'block', width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id="share-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={accentColor} stopOpacity=".42" /><stop offset=".62" stopColor={PAPER_COLOR} />
        </linearGradient>
      </defs>
      <rect width={CARD_WIDTH} height={cardHeight} rx="28" fill={PAPER_COLOR} />
      <rect width={CARD_WIDTH} height={cardHeight} rx="28" fill="url(#share-bg)" />
      <text x="24" y="40" fontSize="16" fontWeight="700" fill={INK_COLOR}>噗噗日记</text>
      <text x={CARD_WIDTH - 24} y="40" fontSize="14" textAnchor="end" fill={INK_COLOR} opacity=".7">
        {isSingleDay ? formatMonthAndDay(data.fromDate) : `${formatMonthAndDay(data.fromDate)} – ${formatMonthAndDay(data.toDate)}`}
      </text>

      {isSingleDay && headlineStamp && headlineCharacter && (
        <g>
          <g transform="translate(70 56)"><Poo characterId={headlineStamp.characterId} stage={headlineStamp.stage} size={220} mood={moodToDraw(headlineStamp.mood)} /></g>
          <text x={CARD_WIDTH / 2} y="312" fontSize="24" fontWeight="700" textAnchor="middle" fill={INK_COLOR}>{headlineCharacter.stageNames[headlineStamp.stage - 1]}</text>
          <text x={CARD_WIDTH / 2} y="334" fontSize="12" textAnchor="middle" fill={INK_COLOR} opacity=".65">{headlineCharacter.name} · {headlineCharacter.attribute}属性</text>
          {!hideMood && (
            <g>
              <rect x={CARD_WIDTH / 2 - 52} y="346" width="104" height="26" rx="13" fill={accentColor} opacity=".9" />
              <text x={CARD_WIDTH / 2} y="364" fontSize="13" fontWeight="700" textAnchor="middle" fill="#fff">今日心情 · {getMoodLabel(headlineStamp.mood)}</text>
            </g>
          )}
          <QuoteBox lines={quoteLines} y={388} />
        </g>
      )}

      {!isSingleDay && headlineStamp && headlineCharacter && (
        <g>
          <g transform="translate(20 62)"><Poo characterId={headlineStamp.characterId} stage={headlineStamp.stage} size={120} mood={moodToDraw(headlineStamp.mood)} showScene={false} /></g>
          <text x="150" y="82" fontSize="14" fontWeight="700" fill={INK_COLOR}>{headlineCharacter.stageNames[headlineStamp.stage - 1]}</text>
          {([['签到天数', data.checkedInDayCount], ['最长连续', data.longestStreak]] as const).map(([label, value], columnIndex) => (
            <g key={label} transform={`translate(${150 + columnIndex * 100} 126)`}>
              <text fontSize="34" fontWeight="700" fill={INK_COLOR}>{value}</text><text y="20" fontSize="12" fill={INK_COLOR} opacity=".7">{label}</text>
            </g>
          ))}
          {!hideMood && data.mostFrequentMood && (
            <text x="150" y="176" fontSize="13" fill={INK_COLOR}>最常心情 · <tspan fontWeight="700">{getMoodLabel(data.mostFrequentMood.mood)}</tspan> ×{data.mostFrequentMood.count}</text>
          )}
          <g transform="translate(24 200)">
            {WEEKDAY_LABELS.map((label, columnIndex) => (
              <text key={label} x={columnIndex * CALENDAR_CELL_WIDTH + 22} y="12" fontSize="11" textAnchor="middle" fill={INK_COLOR} opacity=".55">{label}</text>
            ))}
            {getCalendarWeeks(data).map((week, rowIndex) => week.map((cell, columnIndex) => {
              if (cell.date < data.fromDate || cell.date > data.toDate) return null;
              return (
                <g key={cell.date} transform={`translate(${columnIndex * CALENDAR_CELL_WIDTH} ${20 + rowIndex * CALENDAR_ROW_HEIGHT})`}>
                  <rect x="2" y="2" width="40" height="42" rx="9" fill="#fff" opacity={cell.stamp ? 0.75 : 0.35} />
                  <text x="6" y="12" fontSize="8" fill={INK_COLOR} opacity=".5">{Number(cell.date.slice(8))}</text>
                  {cell.stamp && (
                    <g transform="translate(5 6)">
                      <Poo characterId={cell.stamp.characterId} stage={cell.stamp.stage} size={34} mood={moodToDraw(cell.stamp.mood)} showScene={false} />
                    </g>
                  )}
                </g>
              );
            }))}
          </g>
          <QuoteBox lines={quoteLines} y={cardHeight - 36 - 12 - getQuoteBoxHeight(quoteLines)} />
        </g>
      )}

      <text x={CARD_WIDTH / 2} y={cardHeight - 22} fontSize="13" textAnchor="middle" fill={INK_COLOR} opacity=".75">{footerText}</text>
    </svg>
  );
}

function QuoteBox({ lines, y }: { lines: string[]; y: number }) {
  return (
    <g>
      <rect x="24" y={y} width={CARD_WIDTH - 48} height={getQuoteBoxHeight(lines)} rx="16" fill="#fff" opacity=".8" />
      {lines.map((line, lineIndex) => (
        <text key={line} x={CARD_WIDTH / 2} y={y + 30 + lineIndex * 22} fontSize="16" fontWeight="600" textAnchor="middle" fill={INK_COLOR}>{line}</text>
      ))}
    </g>
  );
}
