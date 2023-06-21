import { Modal, StyleSheet, Text, View } from "react-native";
import { COLOR_BACKGROUND_A1, COLOR_BACKGROUND_A2, COLOR_TEXT } from "../Modules/InternalModule";
import { AppContextProvider, ModalType } from "../App";
import { useContext } from "react";

const SharedPanel = ({children, buttons, title}: {children: any | undefined, buttons?: any | undefined, title: string}) => {
  const appContext = useContext(AppContextProvider)
  return (
    <Modal visible={true} animationType="fade" onRequestClose={() => {appContext?.showModalSet(ModalType.NONE)}} transparent>
      <View style={[style.container, {position: "relative"}]}>
        <View style={[style.editableContainer, {position: "relative",  overflow: "visible"}]}>
        <Text style={{fontSize: 28, color: COLOR_TEXT, fontWeight: "100", position: "absolute", top: -45}}>{title}</Text>
          {children}
        </View>
        <View style={style.optionsContainer}>
          {buttons}
        </View>
      </View>
    </Modal>
  );
}
 

const style = StyleSheet.create({
  container: {
    position: "relative", 
    width: "100%", 
    height: "100%",
    backgroundColor: "rgba(15,15,15,.9)", 
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
  optionsContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
    flexDirection: "row"
  },
});

export default SharedPanel