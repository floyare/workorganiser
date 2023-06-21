import {Text, View, Pressable, ToastAndroid } from 'react-native';
import { TodoRow, TodosTable, getUserData, supabase } from './Auth/supabase';
import { HomePageStyle } from './Styles/HomePage';
import {useContext, createContext, useState, useEffect} from "react"
import { COLOR_MAIN, executeErrorAction, fetchColor } from './Modules/InternalModule';
import Version from './Components/Version';
import { AppContext } from './Interfaces/AppContext';
import HomePage from './Pages/HomePage';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Modal from 'react-native-modal/dist/modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ButtonStyling } from './Styles/ButtonStyling';
import { SortingItem, sortingOptions } from './Components/NavigationBar';
import { AppState } from './Interfaces/AppState';
import { FetchOptions } from './Interfaces/FetchOptions';
import Toast from 'react-native-toast-message';
import { UserData } from './Interfaces/UserData';
import LoginPage from './Pages/LoginPage';
import * as Notifications from 'expo-notifications';
import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: 'https://2963274cb9ac4cbd9b500bd226611110@o4505341613899776.ingest.sentry.io/4505341615931392',
  enableInExpoDevelopment: true,
  debug: false, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
});

export const Stack = createNativeStackNavigator();

export enum ModalType {
  NONE,
  TODO_PANEL,
  TODO_EDIT_PANEL,
  TODO_CREATE_PANEL,
  CATEGORY_CREATE_PANEL,
  APP_SETTINGS
}

export const AppContextProvider = createContext<AppContext | null>({
  todosList: null,
  todosListSet: (() => {}),
  appState: {state: "IDLE"},
  appStateSet: (() => {}),
  selectedTodo: null, 
  selectedTodoSet: (() => {}),
  fetchingOptions: {specificValue: {column: "completed", value: false}}, 
  fetchingOptionsSet: (() => {}),
  showModal: ModalType.NONE, 
  showModalSet: (() => {}),
  sortingOption: sortingOptions[2], 
  sortingOptionSet: (() => {}),
  userData: null,
  userDataSet: (() => {})
});

export default function App() {
  const [todosList, todosListSet] = useState<TodosTable | null>(null)
  const [appState, appStateSet] = useState<AppState | null>(null)
  const [selectedTodo, selectedTodoSet] = useState<TodoRow | null>(null)
  const [fetchingOptions, fetchingOptionsSet] = useState<FetchOptions>({specificValue: {column: "completed", value: false}});
  const [showModal, showModalSet] = useState<ModalType>(ModalType.NONE);
  const [sortingOption, sortingOptionSet] = useState<SortingItem>(sortingOptions[2])
  const [userData, userDataSet] = useState<UserData | null>(null)
  const appContext = useContext(AppContextProvider)

  useEffect(() => {
    fetchColor()
  }, [userData])

  async function fetchUserData(){
    if(!appContext)
      throw new Error("AppContext is null. This is likely an app bug. Please restart and contact developer.")

    const {user, error} = await getUserData()
    if(error) {
      executeErrorAction(appContext, {content: "Error while creating category: \n" + error, code: 500, initiator: 'fetchUserData'})
      return
    }

    userDataSet(user)
  }

  async function checkpermission(){
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      ToastAndroid.show("Failed to get push token for push notification!", ToastAndroid.LONG)
      return;
    }
  }

  useEffect(() => {
    checkpermission()
    
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    Notifications.addNotificationResponseReceivedListener(response => {
      selectedTodoSet(response.notification.request.content.data.todo as TodoRow)
      showModalSet(ModalType.TODO_PANEL)
    });

    //fetchUserData()
    supabase.auth.onAuthStateChange((event, session) => {
      if(session){
        fetchUserData()
      }
    })
  },[])

  const HomePageStyleReference = HomePageStyle(COLOR_MAIN)
  const ButtonStylingReference = ButtonStyling(COLOR_MAIN)
  return (
    <AppContextProvider.Provider value={{todosList, todosListSet, appState, appStateSet, selectedTodo, selectedTodoSet, fetchingOptions, fetchingOptionsSet, showModal, showModalSet, sortingOption, sortingOptionSet, userData, userDataSet}}>
        <Modal isVisible={appState?.state === "ERROR" ? true : false} animationIn={"fadeInDown"} animationOut={'fadeOutDown'} animationInTiming={200} animationOutTiming={200}>
          <View style={[{justifyContent: 'center', alignItems: 'center'}, HomePageStyleReference.modal]}>
            <Icon name="error-outline" color={COLOR_MAIN} size={48}></Icon>
            <Text style={[{color: 'white'}, HomePageStyleReference.modalText]}>{appState?.error?.content}</Text>
            <Pressable onPress={() => {appStateSet({state: "IDLE"})}} style={ButtonStylingReference.button}><Text style={ButtonStylingReference.text}>Close</Text></Pressable>
          </View>
        </Modal>
        <NavigationContainer>
          <Stack.Navigator>
            {userData && userData.color_accent && <Stack.Screen
                name="HomePage"
                component={HomePage}
                options={{title: "", headerShown: false}}
              />}
            {!userData &&<Stack.Screen
                name="LoginPage"
                component={LoginPage}
                options={{title: "", headerShown: false}}
              /> }
          </Stack.Navigator>
          <Version />
        </NavigationContainer>
      <Toast />
    </AppContextProvider.Provider>
  );
}