import { themeColors } from "../constants/color";

export const getThemeColor = (idx: number) => {
  return themeColors[idx % themeColors.length];
};

export const getNameColor = (nickname: string) => {
  const ascii = nickname.charCodeAt(0) + (nickname.charCodeAt(1) || 0);
  return getThemeColor(ascii % themeColors.length);
};
