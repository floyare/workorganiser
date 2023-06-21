import { Dimensions, StyleSheet } from "react-native";
import { COLOR_BACKGROUND, COLOR_BACKGROUND_A2, COLOR_BACKGROUND_A1, COLOR_TEXT, COLOR_MAIN } from "../Modules/InternalModule";

export const HomePageStyle = (color: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 100,
    width: "100%",
    position: 'relative',
    //paddingTop: 50
  },
  text: {
    color: COLOR_TEXT
  },
  modal: {
    display: 'flex',
    backgroundColor:  COLOR_BACKGROUND_A1,
    paddingVertical: 20,
    borderRadius: 25,
    height: 'auto', 
    flex: 0,
    shadowColor: "#000",
    borderColor: COLOR_BACKGROUND_A2,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.33,
    shadowRadius: 5.62,
    elevation: 12,
  },
  modalText: {
    fontSize: 24,
    fontWeight: '200',
    margin: 25,
    textAlign: "center"
  },
  create:{
    backgroundColor: color,
    position: "absolute",
    bottom: 30,
    right: 30,
    borderRadius: 100,
    zIndex: 90,
    textAlign: "center",
    paddingHorizontal: 17,
    paddingVertical: 15
    //width: 50,
    //height: 50,
  },
  icon: {
    color: COLOR_TEXT
  }
});