export type CharacterId = string;

export interface Profile {
  nickname: string; // 空字符串 = 匿名
  avatarId: string; // 角色 id:头像取自已拥有的噗
  anonymous?: boolean;
}

export interface CheckIn {
  id: string;
  date: string; // 本地日期 YYYY-MM-DD,日历以此分组
  at: string; // ISO 时间戳
  characterId: CharacterId;
  stampId: string;
  counted: boolean; // 是否为当天第一条(只有它计经验/连续)
  xpGained: number; // 未计入时为 0
  streak: number; // 计入时的连续天数,未计入为当天的连续值
  multiplier: number;
}

export interface CharacterProgress {
  characterId: CharacterId;
  xp: number;
  stage: number; // 1..STAGE_THRESHOLDS.length
  maxed: boolean; // 已达最高形态
  graduated: boolean; // 已毕业收入图鉴
}
