import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLOR_BACKGROUND, COLOR_BACKGROUND_A1, COLOR_BACKGROUND_A2, COLOR_FAILED, COLOR_MAIN, COLOR_SUBTEXT, COLOR_SUCCESS, COLOR_TEXT, executeErrorAction, isEmptyOrSpaces } from "../../Modules/InternalModule";
import { FetchOptions } from "../../Interfaces/FetchOptions";
import Icon from "react-native-vector-icons/AntDesign";
import { useContext, useEffect, useState } from "react";
import moment, { Moment } from "moment";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import SelectDropdown from "react-native-select-dropdown";
import IconMI from "react-native-vector-icons/MaterialIcons";
import { CategoriesTable, CategoryRow, TodoRow, fetchCategories, getUser, supabase } from "../../Auth/supabase";
import { AppContextProvider, ModalType } from "../../App";
import { AppContext } from "../../Interfaces/AppContext";
import Toast from "react-native-toast-message";
import SharedPanel from "../SharedPanel";
import { SkeletonContainer } from "react-native-dynamic-skeletons";
import { SharedPanelStyling } from "../../Styles/SharedPanelStyling";

const TodoCreatePanel = ({getTodos}: {getTodos: (options?: FetchOptions) => Promise<string | null>}) => {
  const [content, contentSet] = useState<string>()
  const [important, importantSet] = useState<boolean>(false)
  const [showDatePanel, showDatePanelSet] = useState<boolean>(false)
  const [categoriesList, categoriesListSet] = useState<CategoriesTable | null>()
  const [deadline, deadlineSet] = useState<Moment | null | undefined>(null)
  const [selectedCategory, selectedCategorySet] = useState<CategoryRow | null>()
  const appContext = useContext<AppContext | null>(AppContextProvider);

  async function getCategories(){
    if(!appContext)
      throw new Error("AppContext is null. This is likely an app bug. Please restart and contact developer.")
    
    await fetchCategories().then(res => {
      if(res.error){
        executeErrorAction(appContext, {content: "Error while fetching categories: \n" + res.error.message, code: 500, initiator: 'fetchCategories'})
        return;
      }

      let resultCategories: CategoriesTable = [];
      resultCategories.push({contained: null, created_at: new Date().toDateString(), id: Number.MAX_SAFE_INTEGER, name: "None", owner: "GLOBAL"})
      res.data?.forEach(r => resultCategories.push(r));
  
      categoriesListSet(resultCategories!)
    })
  }

  async function updateDatabaseCategory(items: any, id: number){
    if(!appContext)
      throw new Error("AppContext is null. This is likely an app bug. Please restart and contact developer.")

    await supabase.from('categories').update(items).eq(
      'id', id
    )
      .then(async(res) => {
        if(res.error){
          executeErrorAction(appContext, {content: "Error while updating categories: \n" + res.error.message, code: 500, initiator: 'updateDatabaseCategory'})
          return;
        }
    })
  }

  useEffect(() => {
    getCategories()
  },[])

  const handleDateConfirm = (date: Date) => {
    deadlineSet(moment(date))
    showDatePanelSet(false)
  }

  const handleDropdownChange = (item: string, index: number) => {
    const category = categoriesList?.filter(c => c?.name === item)
    if(!category) return;

    selectedCategorySet(category[0])
  }

  const handleDeadlineChange = () => {
    showDatePanelSet(true)
  }

  const handleCreateConfirm = async () => {
    if(!appContext)
      throw new Error("AppContext is null. This is likely an app bug. Please restart and contact developer.")

    const user = await getUser();
    if(user.error){
      console.error("Error while creating todo: \n" + user.error)
      executeErrorAction(appContext, {content: "Error while creating todo: \n" + user.error, code: 500, initiator: 'handleCreateConfirm'})
      return
    }

    if(isEmptyOrSpaces(content)){
      Toast.show({
        type: 'error',
        text1: 'Content is empty or spaces',
      });
      return
    }

    await supabase.from('todos').insert({
      content: content,
      is_important: important,
      deadline: deadline ? deadline.format("YYYY-MM-DD HH:mm:ss") : null,
      uploader: user.user?.id
    }).select().then(async ({data, error}) => {
      if(!data) return

      if(error) {
        executeErrorAction(appContext, {content: "Error while creating todo: \n" + user.error, code: 500, initiator: 'handleCreateConfirm'})
        return
      }

      if(selectedCategory){
        const currentTodoId = data[0].id;
        const currentCategoryContained = categoriesList?.filter(x => x.id === selectedCategory?.id)[0].contained;
        currentCategoryContained?.push(currentTodoId)

        await updateDatabaseCategory({contained: currentCategoryContained}, selectedCategory?.id)
      }

      Toast.show({
        type: 'success',
        text1: 'Successfully created new todo!',
      });

      await getTodos(appContext.fetchingOptions)
      appContext?.showModalSet(ModalType.NONE)
    })
  }

  const style = SharedPanelStyling(COLOR_MAIN)
  return (
    <SharedPanel title={"Create new todo!"} buttons={
      <>
        <TouchableOpacity style={[style.item, {borderColor: COLOR_SUCCESS}]} onPress={handleCreateConfirm}>
          <Text style={{color: COLOR_SUCCESS, textAlign: 'center'}}><Icon name="checkcircle" size={18}/> Create</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[style.item, {borderColor: COLOR_FAILED}]} onPress={() => {appContext?.showModalSet(ModalType.NONE)}}>
          <Text style={{color: COLOR_FAILED, textAlign: 'center'}}><IconMI name="cancel" size={18}/> Cancel</Text>
        </TouchableOpacity>
      </>
    }>
        <Text style={[style.smallText, {marginVertical: 5}]}><Icon name="filetext1" /> Content</Text>

        <TextInput multiline={true} value={content} onChangeText={(e) => {contentSet(e)}} numberOfLines={6} style={style.input}/>

        <View style={style.switchContainer}><Switch value={important} onValueChange={() => importantSet(p => !p)} thumbColor={COLOR_TEXT} 
        trackColor={{false: COLOR_BACKGROUND_A2, true: COLOR_MAIN}}/><Text style={[style.text, {marginHorizontal: 10, fontWeight: "300"}]}>Is Important?</Text></View>

        <DateTimePickerModal isVisible={showDatePanel} mode={"datetime"} onConfirm={handleDateConfirm} onCancel={() => {showDatePanelSet(false)}}/>

        <View style={style.deadlineContainer}>
          <Text style={style.smallText}><IconMI name="category"></IconMI> Category: </Text>
          {categoriesList ? <SelectDropdown data={categoriesList ? categoriesList!.map(p => {return p.name}) : []} defaultValue={selectedCategory ? selectedCategory.name : "None"} onSelect={handleDropdownChange} buttonStyle={style.dropdown} buttonTextStyle={style.dropdownText} rowTextStyle={style.dropdownContextText} rowStyle={style.dropdownContextRow} selectedRowStyle={style.dropdownContextSelected} dropdownStyle={style.dropdownContext}/>
          :
          <SkeletonContainer isLoading={true} colors={[COLOR_BACKGROUND, COLOR_BACKGROUND_A2, COLOR_BACKGROUND]} style={{backgroundColor: COLOR_BACKGROUND}} duration={2000}>
            <View style={[/*NavigationBarStyling.dropdown,*/ {width: 160, height: 40, borderRadius: 35, borderWidth: 1, borderColor: COLOR_MAIN}]}></View>
          </SkeletonContainer>
        }
        </View>

        <View style={style.deadlineContainer}>
          <Text style={style.smallText}><Icon name="clockcircle"></Icon> Deadline: </Text>
          <TouchableOpacity onPress={handleDeadlineChange} style={style.input}><Text style={style.text}>{deadline ? deadline.format("DD.MM.YYYY HH:mm:ss") : "No deadline"}</Text></TouchableOpacity>
        </View>
    </SharedPanel>
  );
}
 
 
export default TodoCreatePanel;