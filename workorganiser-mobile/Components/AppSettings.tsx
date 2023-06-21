import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SharedPanel from "./SharedPanel";
import Icon from "react-native-vector-icons/AntDesign";
import IconMI from "react-native-vector-icons/MaterialIcons";
import IconIO from "react-native-vector-icons/Ionicons"
import { ButtonStyling } from "../Styles/ButtonStyling";
import { supabase, updateUsersColor } from "../Auth/supabase";
import { COLOR_BACKGROUND_A1, COLOR_FAILED, COLOR_MAIN, COLOR_SUBTEXT, COLOR_SUCCESS, COLOR_TEXT, changeLocalAccentColor } from "../Modules/InternalModule";
import { AppContextProvider, ModalType } from "../App";
import { useContext, useState } from "react";
import { AppSettingsStyling } from "../Styles/AppSettingsStyling";
import ColorPickerWheel from 'react-native-wheel-color-picker';
import Toast from "react-native-toast-message";

const AppSettings = () => {
  const [selectedColor, selectedColorSet] = useState<string>("")
  const appContext = useContext(AppContextProvider)
  const handleLogOut = async () => {
    await supabase.auth.signOut()
    appContext?.showModalSet(ModalType.NONE)
    appContext?.userDataSet(null)
  }

  const handleSave = async () => {
    await updateUsersColor(selectedColor).then((result) => {
      if(result.error){
        Toast.show({
          type: 'error',
          text1: result.error.toString(),
        });
        return
      }

      Toast.show({
        type: 'success',
        text1: 'Successfully updated profile settings',
      });
      appContext?.showModalSet(ModalType.NONE)
    })
  }

  const ButtonStylingReference = ButtonStyling(COLOR_MAIN)
  const style = AppSettingsStyling(COLOR_MAIN)
  return (  
    <SharedPanel title={"App settings"} buttons={
      <>
        <TouchableOpacity style={[style.item, {borderColor: COLOR_SUCCESS}]} onPress={handleSave}>
          <Text style={{color: COLOR_SUCCESS, textAlign: 'center'}}><Icon name="save" size={18}/> Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[style.item, {borderColor: COLOR_FAILED}]} onPress={() => {appContext?.showModalSet(ModalType.NONE)}}>
          <Text style={{color: COLOR_FAILED, textAlign: 'center'}}><Icon name="back" size={18}/> Back</Text>
        </TouchableOpacity>
      </>
    }>
      <Text style={style.smallText}><IconMI name="account-circle"/> Account settings: </Text>
      <View style={style.innerContainer}>
        <View style={{display: "flex", flexDirection: "row", marginVertical: 10, alignItems: "center"}}>
          <Image source={{uri: appContext?.userData?.avatarUrl}} style={{width: 50, height: 50, borderRadius: 100, borderWidth: 1, borderColor: COLOR_MAIN, marginHorizontal: 10}}/>
          <View style={style.userDetailsContainer}>
            <Text style={style.text}>Logged as: <Text style={style.uniqueText}>{appContext?.userData?.nickname}</Text></Text>
            <Text style={style.text}>Provider: <Text style={style.uniqueText}>{appContext?.userData?.provider}</Text></Text> 
          </View>
        </View>
        <TouchableOpacity onPress={handleLogOut} style={[ButtonStylingReference.button, {marginVertical: 10}]}>
            <Icon name="logout" style={ButtonStylingReference.icon}></Icon><Text style={ButtonStylingReference.text}> Logout</Text>
        </TouchableOpacity>
      </View>
      <Text style={style.smallText}><IconIO name="color-palette"/> App color accent: </Text>
      <View style={style.innerContainer}>
        <View style={{maxHeight: 300}}>
          <ColorPickerWheel 
            color={COLOR_MAIN}
            onColorChangeComplete={(color) => {selectedColorSet(color); changeLocalAccentColor(color);}}
            thumbSize={30}
            sliderSize={30}
            noSnap={true}
            row={false}
          />
        </View>
      </View>
    </SharedPanel>
  );
}

export default AppSettings;