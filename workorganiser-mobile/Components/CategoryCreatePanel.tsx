import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLOR_BACKGROUND, COLOR_BACKGROUND_A1, COLOR_BACKGROUND_A2, COLOR_FAILED, COLOR_MAIN, COLOR_SUBTEXT, COLOR_SUCCESS, COLOR_TEXT, executeErrorAction, isEmptyOrSpaces } from "../Modules/InternalModule";
import { FetchOptions } from "../Interfaces/FetchOptions";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useContext, useState } from "react";
import { AppContext } from "../Interfaces/AppContext";
import { AppContextProvider, ModalType } from "../App";
import IconAD from "react-native-vector-icons/AntDesign";
import { CategoryRow, createCategory, getUser } from "../Auth/supabase";
import Toast from "react-native-toast-message";
import SharedPanel from "./SharedPanel";
import { SharedPanelStyling } from "../Styles/SharedPanelStyling";

const CategoryCreatePanel = ({getTodos}: {getTodos: (options?: FetchOptions) => Promise<string | null>}) => {
  const [categoryName, categoryNameSet] = useState<string>()
  const appContext = useContext<AppContext | null>(AppContextProvider);

  const handleCreateConfirm = async () => {
    if(!appContext)
      throw new Error("AppContext is null. This is likely an app bug. Please restart and contact developer.")

    if(!isEmptyOrSpaces(categoryName)){
      const user = await getUser();
      if(user.error){
        console.error("Error while creating todo: \n" + user.error)
        executeErrorAction(appContext, {content: "Error while creating category: \n" + user.error, code: 500, initiator: 'handleCreateConfirm'})
        return
      }

      if(!user) return;
      
      const category = {contained: [], name: categoryName, owner: user.user?.id!}
      const {data, error} = await createCategory(category)
      if(error) {
        executeErrorAction(appContext, {content: "Error while creating category: \n" + error.message, code: 500, initiator: 'handleCreateConfirm'})
        return
      }

      Toast.show({
        type: 'success',
        text1: 'Successfully created new category!',
      });     
      
      await getTodos(appContext.fetchingOptions)
      appContext?.showModalSet(ModalType.NONE)
    }else{
      Toast.show({
        type: 'error',
        text1: 'Name not provided!',
      });
    }
  }

  const style = SharedPanelStyling(COLOR_MAIN)
  return (  
      <SharedPanel title={"Create new category!"} buttons={
        <>
          <TouchableOpacity style={[style.item, {borderColor: COLOR_SUCCESS}]} onPress={handleCreateConfirm}>
            <Text style={{color: COLOR_SUCCESS, textAlign: 'center'}}><IconAD name="checkcircle" size={18}/> Create category</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[style.item, {borderColor: COLOR_FAILED}]} onPress={() => {appContext?.showModalSet(ModalType.NONE)}}>
            <Text style={{color: COLOR_FAILED, textAlign: 'center'}}><Icon name="cancel" size={18}/> Cancel</Text>
          </TouchableOpacity>
        </>
      }>
        <Text style={[style.smallText, {marginVertical: 5}]}><Icon name="category"></Icon> Category name:</Text>
        <TextInput style={style.input} value={categoryName} onChangeText={(t) => {categoryNameSet(t)}}></TextInput>
      </SharedPanel>
  );
  
}

export default CategoryCreatePanel;