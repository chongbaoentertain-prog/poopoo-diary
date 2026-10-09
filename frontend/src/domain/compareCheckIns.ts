import type { CheckIn } from '../types/diary';

/** 排序用:按签到发生的时间从早到晚 */
export const compareByTime = (first: CheckIn, second: CheckIn) => first.at.localeCompare(second.at);

/** 排序用:按签到所属的日期从早到晚 */
export const compareByDate = (first: CheckIn, second: CheckIn) => first.date.localeCompare(second.date);
