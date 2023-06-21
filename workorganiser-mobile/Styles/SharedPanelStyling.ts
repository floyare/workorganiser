import { StyleSheet } from "react-native";
import { COLOR_BACKGROUND, COLOR_BACKGROUND_A2, COLOR_BACKGROUND_A1, COLOR_TEXT, COLOR_MAIN, COLOR_SUBTEXT, COLOR_MAIN_40 } from "../Modules/InternalModule";

export const SharedPanelStyling = (color: string) => StyleSheet.create({
  container: {
    position: "absolute", 
    width: "100%", 
    height: "100%",
    backgroundColor: "rgba(15,15,15,.9)", 
    zIndex: Number.MAX_SAFE_INTEGER,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  deadlineContainer: {
    marginVertical: 10
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
  switchContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
  },
  editableContainer: {
    borderColor: COLOR_BACKGROUND_A2,
    backgroundColor: COLOR_BACKGROUND_A1,
    borderWidth: 1,
    borderRadius: 10,
    margin: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    minWidth: 350,
    position: 'relative',
    overflow: 'hidden',
  },
  input: {
    backgroundColor: COLOR_BACKGROUND_A2,
    borderRadius: 10,
    marginVertical: 10,
    padding: 10,
    color: COLOR_TEXT,
    maxHeight: 300
  },
  smallText: {
    color: COLOR_SUBTEXT,
    fontSize: 14,
  },
  text: {
    color: COLOR_TEXT,
    fontSize: 18,
  },
  dropdown:{
    backgroundColor: COLOR_BACKGROUND,
    borderColor: color,
    borderWidth: 1,
    //paddingHorizontal: 15,
    //paddingVertical: 5,
    borderRadius: 25,
    maxWidth: 180,
    maxHeight: 40,
    marginVertical: 5,
  },
  dropdownText: {
    color: COLOR_TEXT,
    fontWeight: "300",
  },
  descriptionItem: {
    display: "flex",
    flexDirection: "column",
  },
  descriptionItemText: {
    color: COLOR_SUBTEXT,
    fontWeight: "300",
    marginVertical: 5
  },
  dropdownContext: {
    backgroundColor: COLOR_BACKGROUND,
    borderColor: color,
    borderWidth: 1,
    //paddingHorizontal: 15,
    //paddingVertical: 5,
    borderRadius: 25,
    maxWidth: 180,
  },
  dropdownContextText: {
    color: COLOR_TEXT
  },
  dropdownContextRow: {
    borderBottomColor: color,
    borderBottomWidth: 1,
  },
  dropdownContextSelected: {
    backgroundColor: color,
  },
});