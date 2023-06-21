import { StyleSheet } from "react-native";
import { COLOR_BACKGROUND, COLOR_BACKGROUND_A2, COLOR_BACKGROUND_A1, COLOR_TEXT, COLOR_MAIN, COLOR_SUBTEXT, COLOR_MAIN_40 } from "../Modules/InternalModule";

export const NavigationBarStyling  = (color: string, color_opacity: string) => StyleSheet.create({
  text: {
    color: COLOR_TEXT,
    fontSize: 36,
    fontWeight: '100'
  },
  nav: {
    backgroundColor: color,
    paddingTop:40
  },
  content: {
    backgroundColor: COLOR_BACKGROUND_A1,
    padding: 20,
  },
  description: {
    display: "flex",
    width: "100%",
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    flexDirection: "row",
    alignItems: 'flex-end',
    gap: 5,
  },
  button: {
    marginVertical: 10
  },
  dropdown:{
    backgroundColor: COLOR_BACKGROUND,
    borderColor: color,
    borderWidth: 1,
    //paddingHorizontal: 15,
    //paddingVertical: 5,
    borderRadius: 25,
    maxWidth: 150,
    maxHeight: 40,
    color: COLOR_TEXT
  },
  dropdownText: {
    color: COLOR_TEXT,
    fontWeight: "300",
  },
  descriptionItem: {
    display: "flex",
    flexDirection: "column",
    marginHorizontal: 5
  },
  descriptionItemText: {
    color: COLOR_SUBTEXT,
    fontWeight: "300",
    marginVertical: 5
  },
  dropdownContext: {
    position: "relative",
    zIndex: 101, //? damn
    backgroundColor: COLOR_BACKGROUND,
    borderColor: color,
    borderWidth: 1,
    borderRadius: 25,
    maxWidth: 180,
  },
  dropdownContextText: {
    color: COLOR_TEXT
  },
  dropdownContextRow: {
    borderBottomColor: COLOR_BACKGROUND_A2,
    borderBottomWidth: 1,
    //marginVertical: 5
  },
  dropdownContextSelected: {
    backgroundColor: color_opacity
  },
  specialText: {
    color: color,
    fontWeight: "900"
  }
});