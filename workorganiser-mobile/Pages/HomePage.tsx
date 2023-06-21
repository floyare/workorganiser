import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, ScrollView, RefreshControl, Alert, Pressable, SafeAreaView, BackHandler, TouchableNativeFeedback, TouchableOpacity } from 'react-native';
import { CategoryRow, StatusType, TodoRow, TodosTable, fetchCategories, fetchTodos, fetchTodos2, supabase } from '../Auth/supabase';
import { HomePageStyle } from '../Styles/HomePage';
import { Provider } from '@supabase/supabase-js';
import { OAuthSignIn } from '../Auth/OAuthHandler';
import {useContext, createContext, useState, useEffect} from "react"
import { COLOR_BACKGROUND, COLOR_BACKGROUND_A1, COLOR_BACKGROUND_A2, COLOR_MAIN, COLOR_TEXT, debug, executeErrorAction, limitRates, schedulePushNotification } from '../Modules/InternalModule';
import Version from '../Components/Version';
import TodoBox from '../Components/Todos/TodoBox';
import TodosList from '../Components/Todos/TodosList';
import { AppContext } from '../Interfaces/AppContext';
import {Stack, useRouter} from "expo-router"
import { AppContextProvider, ModalType } from '../App';
import { Link } from '@react-navigation/native';
import StatusPanel from '../Components/StatusPanel';
//import Modal from "react-native-modal";
import { Modal } from 'react-native';
import { ButtonStyling } from '../Styles/ButtonStyling';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppError } from '../Interfaces/AppError';
import NavigationBar from '../Components/NavigationBar';
import { SkeletonContainer } from 'react-native-dynamic-skeletons';
import { FetchOptions } from '../Interfaces/FetchOptions';
import NotFound from '../Components/NotFound';
import TodoPanel from '../Components/Todos/TodoPanel';
import TodoEditPanel from '../Components/Todos/TodoEditPanel';
import IconI from "react-native-vector-icons/Ionicons"
import TodoCreatePanel from '../Components/Todos/TodoCreatePanel';
import CategoryCreatePanel from '../Components/CategoryCreatePanel';
import SharedPanel from '../Components/SharedPanel';
import AppSettings from '../Components/AppSettings';
import * as Notifications from 'expo-notifications';
import LoadingIcon from '../Components/LoadingIcon';

const HomePage = () => {
  const [appRefreshing, appRefreshingSet] = useState(false);
  const appContext = useContext<AppContext | null>(AppContextProvider);
  const onRefresh = async () => {
    appRefreshingSet(true);
    
    setTimeout(async() => {
      await getTodos(appContext?.fetchingOptions)
      appRefreshingSet(false)
    }, 3000)
  }

  const handleBackPress = () => {
    appContext?.showModalSet(ModalType.NONE)
    return true
  }

  async function getTodos(options?: FetchOptions){
    if(!appContext)
      throw new Error("AppContext is null. This is likely an app bug. Please restart and contact developer.")

    const {error} = await limitRates(async() => {
      await fetchTodos(options).then((res) => {
        if(res.error){
          executeErrorAction(appContext, {content: "Error while fetching todos: \n" + res.error.message, code: 500, initiator: 'fetchTodos'})
          return;
        }

        appContext?.todosListSet(res.data)
        if(!res.data) return;

        Notifications.cancelAllScheduledNotificationsAsync()
        //Notifications.dismissAllNotificationsAsync()
        
        res.data.map(todo => {
          if(!todo.completed)
            schedulePushNotification(todo)
          else{
            Notifications.dismissNotificationAsync(todo.id.toString())
          }
        })
      })
    })

    if(error){
      executeErrorAction(appContext, {content: error, code: 403, initiator: 'fetchTodos'})
      return error
    }

    return null
  }

  useEffect(() => {
    appContext?.appStateSet({state: 'LOADING'})
    getTodos({specificValue: {column: "completed", value: false}}).then((error) => {
      if(!appContext)
        throw new Error("AppContext is null. This is likely an app bug. Please restart and contact developer.")

      if(error){
        executeErrorAction(appContext, {content: error, code: 500, initiator: 'fetchTodos'})
        return
      }

      appContext?.appStateSet({state: 'IDLE'})
    })

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress)
  }, [])


  const HomePageStyleReference = HomePageStyle(COLOR_MAIN)
  return (  
    <>
      {appContext?.showModal ===  ModalType.TODO_CREATE_PANEL && <TodoCreatePanel getTodos={getTodos}/>}
      
      <Modal visible={appContext?.showModal === ModalType.TODO_PANEL} animationType="fade" onRequestClose={() => {appContext?.showModalSet(ModalType.NONE)}} transparent><TodoPanel todo={appContext?.selectedTodo!} getTodos={getTodos}/></Modal>

      {appContext?.showModal === ModalType.TODO_EDIT_PANEL && <TodoEditPanel todo={appContext?.selectedTodo} getTodos={getTodos}/>}

      {appContext?.showModal === ModalType.CATEGORY_CREATE_PANEL && <CategoryCreatePanel getTodos={getTodos}/>}

      {appContext?.showModal === ModalType.APP_SETTINGS && <AppSettings/>}

      <NavigationBar getTodos={getTodos}/>
      <SafeAreaView style={HomePageStyleReference.container}>
        <TouchableOpacity style={HomePageStyleReference.create} onPress={() => {appContext?.showModalSet(ModalType.TODO_CREATE_PANEL)}}>
          <><IconI name="create" style={HomePageStyleReference.icon} size={45}/></>
        </TouchableOpacity>
      {/* {appError && <StatusPanel statusMessage={appError} statusType={StatusType.ERROR}/>} */}
        <StatusBar style="auto" />
          <ScrollView refreshControl={<RefreshControl refreshing={appContext?.appState?.state === "LOADING"} onRefresh={onRefresh}></RefreshControl>}>
            {appContext?.appState?.state === "LOADING" && <LoadingIcon />}
            {appContext?.todosList ? (appContext?.todosList.length <= 0 && <NotFound />) : null}
            {!appContext?.todosList ? <SkeletonContainer isLoading={true} colors={[COLOR_BACKGROUND_A1, COLOR_BACKGROUND_A2, COLOR_BACKGROUND_A1]} style={{backgroundColor: COLOR_BACKGROUND_A1}}>
              <View style={{width: 350, height: 200, margin: 10, borderRadius: 10}}></View>
              <View style={{width: 350, height: 150, margin: 10, borderRadius: 10}}></View>
              <View style={{width: 350, height: 400, margin: 10, borderRadius: 10}}></View>
            </SkeletonContainer> : null}

            {appContext?.todosList && <TodosList todosList={appContext?.todosList} />}
          </ScrollView>
      </SafeAreaView>
    </>

  );
}

export default HomePage;