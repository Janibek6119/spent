// TODO plugin with Date prototype augmentation for such modifications
export const getDateButMidnight = (date: Date, setTimezone: "current" | "utc" = "utc"): Date => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return setTimezone === "current" ? new Date(year, month, day) : new Date(Date.UTC(year, month, day));
};
export const getTodayButMidnight = (): Date => getDateButMidnight(new Date());
export const getYesterdayButMidnight = (): Date => getDateButMidnight(new Date(Date.now() - 24 * 60 * 60 * 1000));

export type DateRange = [Date, Date] | [Date, null];
export const getMonthRange = (year: number, month: number): DateRange => [
  new Date(Date.UTC(year, month, 1)),
  new Date(Date.UTC(year, month + 1, 0)),
];
export const getYearRange = (year: number): DateRange => [
  new Date(Date.UTC(year, 0, 1)),
  new Date(Date.UTC(year, 11, 31)),
];
