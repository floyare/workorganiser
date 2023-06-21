import { StyleSheet, Text, View } from "react-native";
import TodoBox from "./TodoBox";
import { TodoRow, TodosTable } from "../../Auth/supabase";
import { useContext, useEffect, useState } from "react";
import { AppContextProvider } from "../../App";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { COLOR_SUBTEXT } from "../../Modules/InternalModule";
import Icon from "react-native-vector-icons/FontAwesome";

const TodosList = ({todosList}: {todosList: TodosTable}) => {
  const appContext = useContext(AppContextProvider)

  function returnSort(){
    return (a: TodoRow, b: TodoRow) => 
      appContext?.sortingOption.sort === "deadline" ? 
        ((appContext?.sortingOption.type === "ASC" ?
            (a.deadline != null ? new Date(a.deadline).valueOf() : Infinity) - (b.deadline != null ? new Date(b.deadline).valueOf() : Infinity)
            :
            (b.deadline != null ? new Date(b.deadline).valueOf() : -Infinity) - (a.deadline != null ? new Date(a.deadline).valueOf() : -Infinity))) 
    :
      appContext?.sortingOption.sort === "important" ? ((a.is_important === b.is_important)? 0 : a.is_important? -1 : 1 )
    :
      appContext?.sortingOption.sort === "date" ? ( (a.created_at && b.created_at) ?
      appContext?.sortingOption.type === "ASC" ? new Date(a.created_at).valueOf() - new Date(b.created_at).valueOf() : new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf() : 0) 
    :
      0
  }

  useEffect(() => {
    appContext?.todosListSet(appContext?.todosList!.sort(returnSort()))
  },[appContext?.sortingOption])
  
  return (   
    <View style={style.todosList}>
        {appContext?.fetchingOptions.category?.owner === "GLOBAL_ARCHIVE" && <Text style={style.smallText}><Icon name="info-circle" /> All archivized todos will be deleted after 7 days of being completed.</Text>}
        {todosList && todosList
          .sort(returnSort())
          .map((todo, index) => {
          return(
            <Animated.View entering={FadeInUp.duration(1000).delay(index * 500)} exiting={FadeOutUp.duration(300)} key={todo.id}>
              <TodoBox todo={todo} />
            </Animated.View>
          )
        })}
    </View>
  );
}

const style = StyleSheet.create({
  todosList: {
    flex: 1,
    justifyContent: 'center'
  },
  smallText: {
    color: COLOR_SUBTEXT,
    marginHorizontal: 20,
    marginVertical: 10
  }
});
 
export default TodosList;