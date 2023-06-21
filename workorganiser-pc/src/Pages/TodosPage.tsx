import { useState, useEffect, useContext } from "react";
import { TodosTable, fetchTodos, supabase, getUser, logOut, CategoriesTable, getCategories, CategoryRow, getActiveTodos } from "../Auth/supabase";
import TodosList from "../Components/TodosList";
import TodosManager from "../Components/TodosManager";
import LoadingIcon from "../Components/LoadingIcon";
import TodoCreateBox from "../Components/TodoCreateBox";
import { useAutoAnimate } from '@formkit/auto-animate/react'
import NotificationManager from "../Components/NotificationManager";
import { Icon } from "@iconify/react";
import ErrorBox from "../Components/ErrorBox";
import { Link, useLocation } from "react-router-dom";
import NoTodosFound from "../Components/NoTodosFound";
import UserTab from "../Components/UserTab";
import TodoCreateIcon from "../Components/TodoCreateIcon";
import AppSettings from "../Components/AppSettings";
import { debug } from "../Modules/InternalModuleHandler";
import CategoryCreateBox from "../Components/CategoryCreateBox";
import { TodosListContext } from "../App";

const TodosPage = () => {
  const [animationParent] = useAutoAnimate({});

  const [showCreate, showCreateSet] = useState(false);
  const [showSettings, showSettingsSet] = useState(false);
  const [showCategoryCreate, showCategoryCreateSet] = useState(false);

  const TodosListContextProvider = useContext(TodosListContext)

  const params = useLocation();

  enum requestStatus{
    LOADING="loading",
    ERROR="error",
    NONE="none"
  }

  const fetchCategories = async () => {
    debug('fetchCategories', 'fetching categories...', 'orange');

    const result = await getCategories();
    if(result.error){
      TodosListContextProvider.todosListSet(null);
      TodosListContextProvider.todoRequestStatusSet({status: requestStatus.ERROR, error: result.error.message})
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

    TodosListContextProvider.categoriesListSet(data);
  }

  useEffect(() => {
    debug("TodosPage", "useEffect() called");
    (typeof TodosListContextProvider.getTodos === 'function') && TodosListContextProvider.getTodos(undefined, undefined, false);

    fetchCategories()

    if(params.hash === "#create"){
      setTimeout(() => {
        showCreateSet(true)
      }, 500);
    }
  }, [])

  useEffect(() => {
    debug('selectedCategory', TodosListContextProvider.selectedCategory?.name!, 'cyan');
  }, [TodosListContextProvider.selectedCategory])

  useEffect(() => {
    console.warn(TodosListContextProvider.todoRequestStatus)
  }, [TodosListContextProvider.todoRequestStatus])

  useEffect(() => {
    console.warn('modified todos')
  }, [TodosListContextProvider.todosList])
  
  return (
    <div className="todos__content">
          <div ref={animationParent}>
            {showCreate && <TodoCreateBox showCreateSet={showCreateSet}/>}
            {showSettings && <AppSettings showSettingsSet={showSettingsSet}/>}
            {showCategoryCreate && <CategoryCreateBox showCategoryCreateSet={showCategoryCreateSet}/>}
          </div>

          <UserTab showSettingsSet={showSettingsSet}>
              <Link to="/"><h1 className="page__move prev__page"><Icon icon="material-symbols:arrow-back-rounded" /> Dashboard</h1></Link>
              {TodosListContextProvider.getTodos && <TodosManager getTodos={TodosListContextProvider.getTodos} showCategoryCreateSet={showCategoryCreateSet}/>}
          </UserTab>

          <div className="content__container">
            <NotificationManager notifications={TodosListContextProvider.notifications}/>
            {TodosListContextProvider.internalSelectedCategory?.id === Number.MAX_SAFE_INTEGER && <p className="todo__tab_info"><Icon icon="material-symbols:info" /> All archivized todos will be deleted after 7 days of being completed.</p>}

            <div ref={animationParent}>
              {TodosListContextProvider.todoRequestStatus.status === requestStatus.LOADING && <LoadingIcon styles={{position: "fixed", top: "45%", left: "45%"}}/>}
            </div>

            {TodosListContextProvider.todoRequestStatus.status === requestStatus.ERROR &&
              <ErrorBox error={TodosListContextProvider.todoRequestStatus.error} callback={async() => (typeof TodosListContextProvider.getTodos === 'function') && await TodosListContextProvider.getTodos(true)}/>
            }
            {TodosListContextProvider.todosList && <TodosList todosList={TodosListContextProvider.todosList} todosListSet={TodosListContextProvider.todosListSet} editMode={TodosListContextProvider.editMode ? TodosListContextProvider.editMode : false}></TodosList>}
            {TodosListContextProvider.todosList?.length === 0 && <NoTodosFound showCreateSet={showCreateSet}/>}
          </div>

          <TodoCreateIcon showCreateSet={showCreateSet}/>
    </div>
  );
}
 
export default TodosPage;
  