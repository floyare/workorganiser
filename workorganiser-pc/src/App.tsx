import TodosPage from "./Pages/TodosPage";
import { createContext, useEffect, useState } from "react"; "./Auth/OAuthHandler";
import {HashRouter, Route, useLocation, Routes} from 'react-router-dom';
import LoginPage from "./Pages/LoginPage";
import Version from "./Components/Version";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import ErrorBox from "./Components/ErrorBox";
import DashboardPage from "./Pages/DashboardPage";
import DragBar from "./Components/DragBar";
import i18next from "i18next"

import global_en from "./translations/en/global.json";
import global_pl from "./translations/pl/global.json";
import { I18nextProvider } from "react-i18next";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ITodosListContext } from "./Interfaces/ITodosListContext";
import { ITodoRequestStatus } from "./Interfaces/ITodoRequestStatus";
import { CategoriesTable, CategoryRow, TodosTable, fetchTodos, getActiveTodos, getCategories, getProviderUserInfo } from "./Auth/supabase";
import { INotificationManager } from "./Interfaces/INotificationManager";
import { assignHue, debug } from "./Modules/InternalModuleHandler";
import { registerExternalNotification } from "./Modules/NotificationHandler";
import { SortingObject, sortingOptions } from "./Components/TodosManager";
import { IAuthResponse } from "./Interfaces/IAuthResponse";
import { enable, isEnabled, disable } from "tauri-plugin-autostart-api";

i18next.init({
  interpolation: {escapeValue: false},
  lng: "en",
  resources: {
    en: {
      global: global_en,
    },
    pl: {
      global: global_pl
    }
  }
})

export const TodosListContext = createContext<ITodosListContext>({getTodos: null, notifications: [], notificationsSet: null, categoriesList: null, categoriesListSet: () => {}, todosList: null, todosListSet: () => {}, internalSelectedCategory: null, internalSelectedCategorySet: () => {}, todoRequestStatus:{status: "none", error: null}, todoRequestStatusSet: () => {}, selectedSorting: sortingOptions[3], selectedSortingSet: () => {}, userData: undefined, userDataSet: () => {}});

function Content(){
  const locationRouter = useLocation();
  const [displayLocation, setDisplayLocation] = useState(locationRouter);
  const [transitionStage, setTransistionStage] = useState("fadeIn");

  useEffect(() => {
    if (locationRouter !== displayLocation) setTransistionStage("fadeOut");
  }, [locationRouter, displayLocation]);

  return (
    <I18nextProvider i18n={i18next}>
      <div 
        className={`container ${transitionStage}`}
        onAnimationEnd={() => {
          if (transitionStage === "fadeOut") {
            setTransistionStage("fadeIn");
            setDisplayLocation(locationRouter);
          }
        }}
      >
        <Routes location={displayLocation}>
          <Route path="/todos" element={<TodosPage/>}></Route>
          <Route path="/login" element={<LoginPage/>}></Route>
          <Route path="/" element={<DashboardPage/>}></Route>
        </Routes>
      </div>
    </I18nextProvider>
  );
}

function App() {
  function fallbackRender({error, resetErrorBoundary}: FallbackProps) {
    return (
      <div className="error__wrapper">
        <div className="error__container">
          <ErrorBox error={error.message} callback={() => {
            resetErrorBoundary(error)
            location.reload()
          }}/>
        </div>
      </div>
    );
  }

  const [todoRequestStatus, todoRequestStatusSet] = useState<ITodoRequestStatus>({status: "none", error: null});
  const [categoriesList, categoriesListSet] = useState<CategoriesTable | null>(null);
  const [editMode, editModeSet] = useState(false);
  const [notifications, notificationsSet] = useState<INotificationManager>([/*{key: numb, content: 'test' + numb, type: NotificationType.SUCCESS,duration: 3000}*/]);

  const [todosList, todosListSet] = useState<TodosTable | null>(null)
  const [selectedCategory, selectedCategorySet] = useState<CategoryRow | null>()
  const [internalSelectedCategory, internalSelectedCategorySet] = useState<CategoryRow | null>(null)
  const [selectedSorting, selectedSortingSet] = useState<SortingObject>(sortingOptions[3])
  const [userData, userDataSet] = useState<IAuthResponse | undefined>();

  enum requestStatus{
    LOADING="loading",
    ERROR="error",
    NONE="none"
  }

  async function fetchUsersColor() {
    const FetchData = await getProviderUserInfo();
    const root = document.documentElement;
    root.style.setProperty('--CL_FOREGROUND', FetchData.color_accent);
    if(FetchData.color_accent)
      assignHue(FetchData.color_accent)
  }

  useEffect(() => {
    fetchUsersColor()
  }, [])

  const fetchCategories = async () => {
    debug('fetchCategories', 'fetching categories...', 'orange');

    const result = await getCategories();
    if(result.error){
      todosListSet(null);
      todoRequestStatusSet({status: requestStatus.ERROR, error: result.error.message})
      return;
    }

    const data = result.data;
    const archivizedObject: CategoryRow = {
      id: Number.MAX_SAFE_INTEGER, 
      contained: [], 
      created_at: new Date().toDateString(), 
      name: "🗑️ Archivized", 
      owner: "GLOBAL"
    }

    data?.push(archivizedObject)

    categoriesListSet(data);
  }

  const getTodos = async(force?: boolean, category?: CategoryRow | null | undefined, onlyCompleted?: boolean) => {
    //BUG:9
    const currentCategory = category?.id === 0 ? undefined : category === undefined || null ? selectedCategory : category;
    
    internalSelectedCategorySet(currentCategory!)
    todosList?.map(todo => {
      if(todo.completed)
        return;
      
      if(!todo.deadline)
        return;
        
      debug("TodosList", "Calling registerExternalNotification for: " + todo.id, "green")
      registerExternalNotification(todo);
    })

    //todosListSet(null)
    if(!force){
      if(todosList)
        return;
    }
    
    await fetchCategories()
    debug("getTodos", "Fetching todos");
    todoRequestStatusSet({status: requestStatus.LOADING, error: null})

    const result = onlyCompleted ? await getActiveTodos(true) : await fetchTodos(currentCategory!, false);
    if(result.error !== null){
      todosListSet(null);
      todoRequestStatusSet({status: requestStatus.ERROR, error: result.error.message})
      return;
    }

    todosListSet(result.data);

    todoRequestStatusSet({status: requestStatus.NONE, error: null})
  }

  return (
    <>
      <DragBar showControls={true} windowTitle={"workorganiser"}/>
      <ErrorBoundary fallbackRender={fallbackRender} onReset={(details) => {window.location.reload()}}>
        <TodosListContext.Provider value={{getTodos, editMode, editModeSet, notifications, notificationsSet, categoriesList, categoriesListSet, selectedCategory, selectedCategorySet, todosList, todosListSet, internalSelectedCategory, internalSelectedCategorySet, todoRequestStatus, todoRequestStatusSet, selectedSorting, selectedSortingSet, userData, userDataSet}}>
          <HashRouter>
            <Content />
          </HashRouter>
          <Version />
        </TodosListContext.Provider>
      </ErrorBoundary>
    </>
  );
}

export default App;
