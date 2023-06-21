import { Dimensions, StyleSheet } from "react-native";
import { COLOR_BACKGROUND, COLOR_BACKGROUND_A2, COLOR_BACKGROUND_A1, COLOR_TEXT, COLOR_MAIN, COLOR_SUBTEXT } from "../Modules/InternalModule";

export const AppSettingsStyling  = (color: string) => StyleSheet.create({
  userDetailsContainer: {

  },
  smallText: {
    color: COLOR_SUBTEXT,
    fontSize: 14,
  },
  text: {
    color: COLOR_TEXT,
    fontSize: 16,
  },
  uniqueText: {
    color: color,
    fontWeight: "700"
  },
  innerContainer: {
    marginVertical: 10,
    marginHorizontal: 10,
    display: "flex",
    flexDirection: "column",
    flexWrap: "nowrap",
  },
  item: {
    //color: COLOR_TEXT
    borderWidth: 1,
    borderRadius: 10,
    margin: 5,
    backgroundColor: COLOR_BACKGROUND_A1,
    padding: 20,
    textAlign: "center",
    fontWeight: "300",
    fontSize: 16
  },
  optionsContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
    flexDirection: "row"
  },
})