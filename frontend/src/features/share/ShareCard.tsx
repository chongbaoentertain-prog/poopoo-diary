import type { Ref } from 'react';
import { Poo } from '../../components/poo/Poo';
import { charDef, MOODS } from '../../data/characters';
import { calendarCells, wrapText, type ShareData } from './shareCardData';

export const CARD_W = 360;
const FONT = "'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif"; // 导出成图片时读不到网页字体,只能用系统字体
const INK = '#3a2a22';
const PAPER = '#fffaf1';
const WEEK = ['一', '二', '三', '四', '五', '六', '日'];

const moodLabel = (id: string) => MOODS.find((m) => m.id === id)?.label ?? '';
const md = (d: string) => `${+d.slice(5, 7)}月${+d.slice(8)}日`;

const quoteLinesOf = (data: ShareData) => wrapText(data.quote, 15);
const quoteBoxH = (lines: string[]) => 28 + lines.length * 22;

export function cardHeight(data: ShareData): number {
  if (data.from === data.to) return 500;
  // 标题和主角 200 + 日历(表头 20 + 每周 46)+ 文案框 + 页脚,各留 12 的间距
  return 220 + calendarCells(data).length * 46 + 12 + quoteBoxH(quoteLinesOf(data)) + 12 + 36;
}

/**
 * 分享卡片。整张是一个 SVG,预览和导出图片用的是同一份,所见即所得。
 * hideNickname / hideMood:用户在分享前选择隐藏的信息。
 */
export function ShareCard({ data, hideNickname, hideMood, svgRef }: {
  data: ShareData; hideNickname: boolean; hideMood: boolean; svgRef?: Ref<SVGSVGElement>;
}) {
  const h = cardHeight(data);
  const hero = data.headline;
  const def = hero ? charDef(hero.characterId) : null;
  const accent = def?.accent ?? '#e8a62a';
  const single = data.from === data.to;
  const footer = `${hideNickname ? '匿名噗友' : data.nickname}${data.streak > 0 ? ` · 连续 ${data.streak} 天` : ''}`;
  const quoteLines = quoteLinesOf(data);

  return (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${CARD_W} ${h}`} width={CARD_W} height={h}
      fontFamily={FONT} role="img" aria-label="分享卡片" style={{ display: 'block', width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id="share-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={accent} stopOpacity=".42" /><stop offset=".62" stopColor={PAPER} />
        </linearGradient>
      </defs>
      <rect width={CARD_W} height={h} rx="28" fill={PAPER} />
      <rect width={CARD_W} height={h} rx="28" fill="url(#share-bg)" />
      <text x="24" y="40" fontSize="16" fontWeight="700" fill={INK}>噗噗日记</text>
      <text x={CARD_W - 24} y="40" fontSize="14" textAnchor="end" fill={INK} opacity=".7">{single ? md(data.from) : `${md(data.from)} – ${md(data.to)}`}</text>

      {single && hero && def && (
        <g>
          <g transform="translate(70 56)"><Poo characterId={hero.characterId} stage={hero.stage} size={220} mood={hideMood ? 'happy' : hero.mood} /></g>
          <text x={CARD_W / 2} y="312" fontSize="24" fontWeight="700" textAnchor="middle" fill={INK}>{def.stageNames[hero.stage - 1]}</text>
          <text x={CARD_W / 2} y="334" fontSize="12" textAnchor="middle" fill={INK} opacity=".65">{def.name} · {def.attr}属性</text>
          {!hideMood && (
            <g>
              <rect x={CARD_W / 2 - 52} y="346" width="104" height="26" rx="13" fill={accent} opacity=".9" />
              <text x={CARD_W / 2} y="364" fontSize="13" fontWeight="700" textAnchor="middle" fill="#fff">今日心情 · {moodLabel(hero.mood)}</text>
            </g>
          )}
          <Quote lines={quoteLines} y={388} />
        </g>
      )}

      {!single && hero && def && (
        <g>
          <g transform="translate(20 62)"><Poo characterId={hero.characterId} stage={hero.stage} size={120} mood={hideMood ? 'happy' : hero.mood} scene={false} /></g>
          <text x="150" y="82" fontSize="14" fontWeight="700" fill={INK}>{def.stageNames[hero.stage - 1]}</text>
          {([['签到天数', data.checkedDays], ['最长连续', data.longest]] as const).map(([k, v], i) => (
            <g key={k} transform={`translate(${150 + i * 100} 126)`}>
              <text fontSize="34" fontWeight="700" fill={INK}>{v}</text><text y="20" fontSize="12" fill={INK} opacity=".7">{k}</text>
            </g>
          ))}
          {!hideMood && data.topMood && <text x="150" y="176" fontSize="13" fill={INK}>最常心情 · <tspan fontWeight="700">{moodLabel(data.topMood.mood)}</tspan> ×{data.topMood.count}</text>}
          <g transform="translate(24 200)">
            {WEEK.map((w, i) => <text key={w} x={i * 44 + 22} y="12" fontSize="11" textAnchor="middle" fill={INK} opacity=".55">{w}</text>)}
            {calendarCells(data).map((week, r) => week.map((c, i) => {
              if (c.date < data.from || c.date > data.to) return null;
              return (
                <g key={c.date} transform={`translate(${i * 44} ${20 + r * 46})`}>
                  <rect x="2" y="2" width="40" height="42" rx="9" fill="#fff" opacity={c.stamp ? 0.75 : 0.35} />
                  <text x="6" y="12" fontSize="8" fill={INK} opacity=".5">{+c.date.slice(8)}</text>
                  {c.stamp && <g transform="translate(5 6)"><Poo characterId={c.stamp.characterId} stage={c.stamp.stage} size={34} mood={hideMood ? 'happy' : c.stamp.mood} scene={false} /></g>}
                </g>
              );
            }))}
          </g>
          <Quote lines={quoteLines} y={h - 36 - 12 - quoteBoxH(quoteLines)} />
        </g>
      )}

      <text x={CARD_W / 2} y={h - 22} fontSize="13" textAnchor="middle" fill={INK} opacity=".75">{footer}</text>
    </svg>
  );
}

function Quote({ lines, y }: { lines: string[]; y: number }) {
  return (
    <g>
      <rect x="24" y={y} width={CARD_W - 48} height={28 + lines.length * 22} rx="16" fill="#fff" opacity=".8" />
      {lines.map((l, i) => <text key={l} x={CARD_W / 2} y={y + 30 + i * 22} fontSize="16" fontWeight="600" textAnchor="middle" fill={INK}>{l}</text>)}
    </g>
  );
}
