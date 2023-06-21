import { StyleSheet, Text, TouchableNativeFeedback, TouchableOpacity, View } from "react-native";
import { TodoRow, deleteTodo, modifyTodo } from "../../Auth/supabase";
import { COLOR_BACKGROUND, COLOR_BACKGROUND_40, COLOR_BACKGROUND_A1, COLOR_FAILED, COLOR_INFO, COLOR_SUCCESS, COLOR_TEXT, COLOR_WARNING, executeErrorAction, } from "../../Modules/InternalModule";
import Icon from "react-native-vector-icons/AntDesign";
import IconFA from "react-native-vector-icons/FontAwesome";
import TodoBox from "./TodoBox";
import { useContext } from "react";
import { AppContext } from "../../Interfaces/AppContext";
import { AppContextProvider, ModalType } from "../../App";
import { FetchOptions } from "../../Interfaces/FetchOptions";
import Toast from "react-native-toast-message";
import * as Notifications from 'expo-notifications';

const TodoPanel = ({todo, getTodos}: {todo: TodoRow | null, getTodos: (options?: FetchOptions) => Promise<string | null>}) => {
  const appContext = useContext<AppContext | null>(AppContextProvider);

  async function refreshTodos(){
    appContext?.appStateSet({state: 'LOADING'})
    await getTodos(appContext?.fetchingOptions).then((error) => {
      if(!error){
        appContext?.appStateSet({state: 'IDLE'})
      }
    })
  }

  const handleComplete = async () => {
    const {error} = await modifyTodo(todo?.id!, {...todo!, completed: !todo?.completed});
    if(!appContext)
      throw new Error("AppContext is null. This is likely an app bug. Please restart and contact developer.")

    if(error){
      executeErrorAction(appContext, {content: "Error while completing todo: \n" + error.message, code: 500, initiator: 'handleComplete'})
      return
    }

    if(!todo?.completed)
      Notifications.dismissNotificationAsync(todo!.id.toString())

    await refreshTodos()

    Toast.show({
      type: 'success',
      text1: `Successfully ${todo?.completed ? 'reverted!' : 'completed!'}`,
    });

    appContext?.showModalSet(ModalType.NONE)
  }

  const handleEdit = async () => {
    appContext?.showModalSet(ModalType.TODO_EDIT_PANEL)
  }

  const handleDelete = async () => {
    if(!todo) return;

    const {error} = await deleteTodo(todo?.id)
    if(!appContext)
      throw new Error("AppContext is null. This is likely an app bug. Please restart and contact developer.")

    if(error){
      executeErrorAction(appContext, {content: "Error while deleting todo: \n" + error.message, code: 500, initiator: 'handleDelete'})
      return
    }

    await refreshTodos()

    Toast.show({
      type: 'success',
      text1: 'Successfully deleted!',
    });

    appContext?.showModalSet(ModalType.NONE)
  }

  return (
    <View style={[style.container, {flex: 0}]}>
      <TodoBox todo={todo!} styles={{maxHeight: 450, height: 'auto', flex: 0}} onStartShouldSetResponder={() => true}></TodoBox>
      <View style={style.itemsContainer}>
        <TouchableOpacity style={[style.item, {borderColor: !todo?.completed ? COLOR_SUCCESS : COLOR_WARNING}]} onPress={handleComplete}>
          <Text style={{color: !todo?.completed ? COLOR_SUCCESS : COLOR_WARNING, textAlign: 'center'}}>{todo?.completed ? <IconFA name="undo" size={18}/> : <Icon name="checkcircle" size={18}/>}{todo?.completed ? " Undo todo" : " Complete todo"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[style.item, {borderColor: COLOR_WARNING}]} onPress={handleEdit}>
          <Text style={{color: COLOR_WARNING, textAlign: 'center'}}><Icon name="edit" size={18}/> Edit todo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[style.item, {borderColor: COLOR_FAILED}]} onPress={handleDelete}>
          <Text style={{color: COLOR_FAILED, textAlign: 'center'}}><Icon name="delete" size={18}/> Delete todo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    position: "absolute", 
    width: "100%", 
    height: "100%",
    backgroundColor: "rgba(15,15,15,.9)", 
    zIndex: 100,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  itemsContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingHorizontal: 25,
  },
  item: {
    //color: COLOR_TEXT
    borderWidth: 1,
    borderRadius: 10,
    margin: 5,
    backgroundColor: COLOR_BACKGROUND_A1,
    padding: 20,
    minWidth: "100%",
    textAlign: "center",
    fontWeight: "300",
    fontSize: 16
  }
});
 
export default TodoPanel;