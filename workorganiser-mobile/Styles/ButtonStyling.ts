import { StyleSheet } from "react-native";
import { COLOR_BACKGROUND, COLOR_BACKGROUND_A2, COLOR_BACKGROUND_A1, COLOR_TEXT, COLOR_MAIN } from "../Modules/InternalModule";

export const ButtonStyling = (color: string) => StyleSheet.create({
  button: {
    backgroundColor: color,
    paddingHorizontal: 30,
    paddingVertical: 5,
    borderRadius: 25,
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  text: {
    color: COLOR_TEXT,
    fontSize: 18,
    fontWeight: '300',
    textAlign: "center",
  },
  icon: {
    fontSize: 18,
    marginHorizontal: 5,
    verticalAlign: "middle",
    color: COLOR_TEXT
  }
});