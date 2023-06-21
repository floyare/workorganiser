import { StyleSheet, Text, View, TextInput, Switch, TouchableOpacity } from "react-native";
import { CategoriesTable, CategoryRow, RegionCode, TodoRow, fetchCategories, fetchTodosCategory, modifyTodo, supabase } from "../../Auth/supabase";
import { FetchOptions } from "../../Interfaces/FetchOptions";
import { COLOR_BACKGROUND, COLOR_BACKGROUND_A1, COLOR_BACKGROUND_A2, COLOR_FAILED, COLOR_MAIN, COLOR_SUBTEXT, COLOR_SUCCESS, COLOR_TEXT, executeErrorAction } from "../../Modules/InternalModule";
import Icon from "react-native-vector-icons/AntDesign";
import { useContext, useEffect, useState } from "react";
import moment, { Moment } from "moment";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import SelectDropdown from "react-native-select-dropdown";
import IconMI from "react-native-vector-icons/MaterialIcons";
import { AppContext } from "../../Interfaces/AppContext";
import { AppContextProvider, ModalType } from "../../App";
import Toast from "react-native-toast-message";
import SharedPanel from "../SharedPanel";
import { SharedPanelStyling } from "../../Styles/SharedPanelStyling";

const TodoEditPanel = ({todo, getTodos}: {todo: TodoRow | null, getTodos: (options?: FetchOptions) => Promise<string | null>}) => {
  const [newContent, newContentSet] = useState<string>(todo?.content!)
  const [newImportant, newImportantSet] = useState<boolean>(todo?.is_important!)
  const [newDeadline, newDeadlineSet] = useState<Moment | null | undefined>(todo?.deadline ? moment(todo?.deadline) : null)
  const [showDatePanel, showDatePanelSet] = useState<boolean>(false)
  const [newCategory, newCategorySet] = useState<CategoryRow | null>(null)
  const [currentCategory, currentCategorySet] = useState<CategoryRow | null>(null)

  const [categoriesList, categoriesListSet] = useState<CategoriesTable | null>(null)
  const appContext = useContext<AppContext | null>(AppContextProvider);

  const handleDeadlineChange = () => {
    showDatePanelSet(true)
  }

  const handleDateConfirm = (date: Date) => {
    newDeadlineSet(moment(date))
    showDatePanelSet(false)
  }

  const handleDropdownChange = async (item: string, index: number) => {
    if(newCategory?.name === item) return;

    const category = categoriesList?.filter(c => c?.name === item)
    if(!category) return;

    newCategorySet(category[0])
  }

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

  const getTodosCategory = async (todo: TodoRow) => {
    const {data, error} = await fetchTodosCategory(todo)
    if(!appContext)
      throw new Error("AppContext is null. This is likely an app bug. Please restart and contact developer.")

    if(error){
      executeErrorAction(appContext, {content: "Error while fetching todo's category: \n" + error.message, code: 500, initiator: 'getTodosCategory'})
      return
    }

    newCategorySet(data!.length > 0 ? data![0] : null)
    currentCategorySet(data!.length > 0 ? data![0] : null)
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

  async function updateCategory(){
    if(!appContext)
      throw new Error("AppContext is null. This is likely an app bug. Please restart and contact developer.")

    if(newCategory === currentCategory){
      return
    }

    if(newCategory === null){
      const oldCategoryId = currentCategory?.id;

      const oldCategoryContained = categoriesList?.filter(
        (x => x.id === oldCategoryId)
      )[0].contained 

      const modifiedOldCategoryContained = oldCategoryContained?.filter(x => x !== todo?.id);
      let updatedCategory = categoriesList?.filter(
        (x => x.id === oldCategoryId)
      )[0]
      updatedCategory!.contained = modifiedOldCategoryContained!;

      await updateDatabaseCategory({contained: modifiedOldCategoryContained}, oldCategoryId!)
    }

    const currentTodoId = todo?.id;
    const categoryId = newCategory?.id;

    const currentCategoryContained = categoriesList?.filter(
      (x => x.id === categoryId)
    )[0].contained 

    if(!currentCategory){
      currentCategoryContained?.push(currentTodoId!)
      await updateDatabaseCategory({contained: currentCategoryContained}, categoryId!)

      return;
    }

    const oldCategoryId = currentCategory.id;

    const oldCategoryContained = categoriesList?.filter(
      (x => x.id === oldCategoryId)
    )[0].contained 

    if(oldCategoryId !== categoryId) {
      const modifiedOldCategoryContained = oldCategoryContained?.filter(x => x !== todo?.id);
      let updatedCategory = categoriesList?.filter(
        (x => x.id === oldCategoryId)
      )[0]
      updatedCategory!.contained = modifiedOldCategoryContained!;

      await updateDatabaseCategory({contained: modifiedOldCategoryContained}, oldCategoryId!)

      currentCategoryContained?.push(todo?.id!)

      await updateDatabaseCategory({contained: currentCategoryContained}, categoryId!)
      return updatedCategory;
    }
  }

  const handleEditConfirm = async () => {
    const newTodo: TodoRow = {
      completed: todo?.completed!,
      content: newContent,
      deadline: newDeadline ? newDeadline.format("YYYY-MM-DD HH:mm:ss") : null,
      edit_date: new Date().toLocaleString(RegionCode),
      created_at: todo?.created_at!,
      id: todo?.id!,
      is_important: newImportant,
      uploader: todo?.uploader!
    }

    const {error} = await modifyTodo(todo?.id!, newTodo)
    if(!appContext)
      throw new Error("AppContext is null. This is likely an app bug. Please restart and contact developer.")

    if(error){
      executeErrorAction(appContext, {content: "Error while updating todo: \n" + error.message, code: 500, initiator: 'handleEditConfirm'})
      return
    }

    await updateCategory().then(async() => {
      await getTodos(appContext.fetchingOptions).then(() => appContext?.showModalSet(ModalType.NONE)).then(() => {
        Toast.show({
          type: 'success',
          text1: 'Successfully edited!',
        });
      })
    })
  }

  useEffect(() => {
    getCategories()
    getTodosCategory(todo!)
  },[])

  const style = SharedPanelStyling(COLOR_MAIN)
  return (
    <SharedPanel title={"Edit todo"} buttons={
      <>
        <TouchableOpacity style={[style.item, {borderColor: COLOR_SUCCESS}]} onPress={handleEditConfirm}>
          <Text style={{color: COLOR_SUCCESS, textAlign: 'center'}}><Icon name="checkcircle" size={18}/> Confirm edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[style.item, {borderColor: COLOR_FAILED}]} onPress={() => {appContext?.showModalSet(ModalType.NONE)}}>
          <Text style={{color: COLOR_FAILED, textAlign: 'center'}}><IconMI name="cancel" size={18}/> Cancel</Text>
        </TouchableOpacity>
      </>
    }>
        <Text style={[style.smallText, {marginVertical: 5}]}><Icon name="calendar" /> {new Date(todo?.created_at!).toLocaleDateString(RegionCode, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>

        <TextInput multiline={true} value={newContent} onChangeText={(e) => {newContentSet(e)}} numberOfLines={6} style={style.input}/>

        <View style={style.switchContainer}><Switch value={newImportant} onValueChange={() => newImportantSet(p => !p)} thumbColor={COLOR_TEXT} 
        trackColor={{false: COLOR_BACKGROUND_A2, true: COLOR_MAIN}}/><Text style={[style.text, {marginHorizontal: 10, fontWeight: "300"}]}>Is Important?</Text></View>

        <DateTimePickerModal isVisible={showDatePanel} mode={"datetime"} onConfirm={handleDateConfirm} onCancel={() => {showDatePanelSet(false)}}/>

        <View style={style.deadlineContainer}>
          <Text style={style.smallText}><IconMI name="category"></IconMI> Category: </Text>
          {categoriesList && <SelectDropdown data={categoriesList ? categoriesList!.map(p => {return p.name}) : []} defaultValue={currentCategory ? currentCategory.name : "None"} onSelect={handleDropdownChange} buttonStyle={style.dropdown} buttonTextStyle={style.dropdownText} rowTextStyle={style.dropdownContextText} rowStyle={style.dropdownContextRow} selectedRowStyle={style.dropdownContextSelected} dropdownStyle={style.dropdownContext}/>}
        </View>

        <View style={style.deadlineContainer}>
          <Text style={style.smallText}><Icon name="clockcircle"></Icon> Deadline: </Text>
          <TouchableOpacity onPress={handleDeadlineChange} style={style.input}><Text style={style.text}>{newDeadline ? newDeadline.format("DD.MM.YYYY HH:mm:ss") : "No deadline"}</Text></TouchableOpacity>
        </View>
    </SharedPanel>
  );
}
 
export default TodoEditPanel;