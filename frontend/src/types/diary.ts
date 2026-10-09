/** 本地日期,格式 YYYY-MM-DD。日历、连续天数都以它分组,不用 Date 比较,避免时区和夏令时问题 */
export type DateKey = string;

export type CharacterId = string;

export interface Profile {
  nickname: string; // 空字符串 = 匿名
  avatarId: CharacterId; // 头像取自已拥有的噗
  anonymous?: boolean;
}

export interface CheckIn {
  id: string;
  date: DateKey;
  at: string; // ISO 时间戳
  characterId: CharacterId;
  /** 当时的角色、形态、心情,格式见 domain/stamp.ts。日历和图鉴靠它还原当时的样子 */
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

/** 本地存档的完整内容 */
export interface AppState {
  version: 1;
  profile: Profile | null; // null = 还没完成引导页
  activeCharacterId: CharacterId | null;
  checkIns: CheckIn[];
  progress: CharacterProgress[]; // 含已毕业(图鉴)的角色
  profileUpdatedAt?: number; // 资料(昵称/头像/当前角色)最后修改的毫秒时间戳,多设备同步时后写者胜
}
