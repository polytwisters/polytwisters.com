import { Fraction, fractionToString } from "./fraction";

const colors = {
  pink: "#fcc2d7",
  blue: "#339af0",
  white: "#ffffff",
  lightBlue: "#a5d8ff",
  yellow: "#ffec99",
  orange: "#ffd8a8",
  lightGreen: "#d8f5a2",
  green: "#51cf66",
  purple: "#cc5de8",
  red: "#fa5252",
};

const faceTypeColorMap: Map<string, string> = new Map();
faceTypeColorMap.set("2", colors.white);
faceTypeColorMap.set("3", colors.lightBlue);
faceTypeColorMap.set("3/2", colors.blue);
faceTypeColorMap.set("4", colors.lightGreen);
faceTypeColorMap.set("4/3", colors.green);
faceTypeColorMap.set("5", colors.red);
faceTypeColorMap.set("5/2", colors.orange);
faceTypeColorMap.set("5/3", colors.yellow);
faceTypeColorMap.set("5/4", colors.pink);

export function faceSymbolToColor(faceSymbol: Fraction): string {
  return faceTypeColorMap.get(fractionToString(faceSymbol)) ?? "white";
}
