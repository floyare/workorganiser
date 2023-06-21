import { TodosTable, getProviderUserInfo, getActiveTodos, fetchTodos } from "../Auth/supabase";
import { useContext, useEffect, useState } from "react";
import "../Styles/SDashboardPage.scss"
import TodoBox from "../Components/TodoBox";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import NoTodosFound from "../Components/NoTodosFound";
import Skeleton, {SkeletonTheme} from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import {useTranslation} from "react-i18next"
import { debug, reRunFunction } from "../Modules/InternalModuleHandler";
import { TodosListContext } from "../App";

const DashboardPage = () => {
  const TodosListContextProvider = useContext(TodosListContext);
  const [nickname, nicknameSet] = useState<string | null>(null);
  const [todos, todosSet] = useState<TodosTable | null>(null);
  const [todosActive, todosActiveSet] = useState<TodosTable | null>(null);
  const [todosOutdated, todosOutdatedSet] = useState<TodosTable | null>(null);
  const [t, i18n] = useTranslation("global")

  async function setDashboardNickname(){
    if(!TodosListContextProvider.userData || TodosListContextProvider.userData.error){
      const FetchData = await getProviderUserInfo();
      if(FetchData.error){
        TodosListContextProvider.userDataSet(undefined)
        reRunFunction(setDashboardNickname)
        return;
      }

      if(!FetchData.user) {
        TodosListContextProvider.userDataSet(undefined)
        reRunFunction(setDashboardNickname)
        return;
      };

      TodosListContextProvider.userDataSet(FetchData)
      nicknameSet(FetchData.user.user_name);
    }else{
      nicknameSet(TodosListContextProvider.userData.user.user_name);
    }
  }

  async function setFirstTodos(){
    if(!TodosListContextProvider.todosList){
      debug("setFirstTodos", "Fetching todos");
      const result = await fetchTodos(TodosListContextProvider.selectedCategory);
      if(result.error){
        TodosListContextProvider.todosListSet(null);
        reRunFunction(setFirstTodos)
        return;
      }

      debug("setFirstTodos", "Slicing todosList");
      const firstodos = result.data?.slice(0, 3);
      
      TodosListContextProvider.todosListSet(result.data);
      todosSet(firstodos!);
    }else{
      const firstodos = TodosListContextProvider.todosList?.slice(0, 3);
      todosSet(firstodos!);
    }
  }

  async function setTodosData(){
    debug("setTodosData", "Getting active todos");

    async function fetchActiveTodos(){
      const active = await getActiveTodos();
      if(active.error){
        reRunFunction(setTodosData)
        return null;
      }

      return active.data;
    }

    const activeTodos = TodosListContextProvider.todosList && TodosListContextProvider.todosList?.length !== 0 ? 
    TodosListContextProvider.todosList.filter(item => {return item.completed === false})
    :
      await fetchActiveTodos();

    todosActiveSet(activeTodos)

    debug("setTodosData", "Getting outdated todos");
    const outdated = getOutdatedTodosCount(activeTodos!);
    todosOutdatedSet(outdated);
  }

  const getOutdatedTodosCount = (currentTodos: TodosTable) => {
    const filteredTodos = currentTodos?.filter(todo => {return (new Date(todo.deadline as string).getTime() <= new Date().getTime())});
    return filteredTodos;
  }

  useEffect(() => {
    setTodosData();
    setDashboardNickname();
    setFirstTodos();
  },[]);

  return (  
    <>
      <div className="dashboard__container">
        <div className="info__container">
          <h1 className="welcome__message" style={{color: 'white'}}><Icon icon="mdi:human-hello-variant" />{t("dashboard.greet")}, 
            {nickname && <span className="nickname__text">{nickname}</span>}
            {nickname === null && <SkeletonTheme baseColor="#202020" highlightColor="#444"><Skeleton count={1} width={200}/></SkeletonTheme>}
          </h1>
          <div className="info__details">
            {todosActive !== null && <p>
                It looks like you have 
                {todosActive.length !== 0 ? 
                  <>
                    <b> {todosActive.length}</b> todos active 
                        {todosOutdated?.length !== 0  ? 
                        (<span> and <b>{todosOutdated?.length}</b> of them {todosOutdated?.length === 1 ? "is" : "are"} outdated! 😣 </span>)
                        : 
                        <span> and <b>none</b> of them are outdated 😃🎉 </span>} 
                      Make sure to complete all the tasks before creating a new one 😉
                  </> 
                  : " no todos active :("}
              </p>}
              {/* {todosActive !== null && <p>
                {t("dashboard.todoSummary.Summary1")} 
                {todosActive.length !== 0 ? 
                  <>
                      {
                        <Trans i18nKey="dashboard.todoSummary.Summary2" components={{b: <b></b>}}></Trans>
                        //t("dashboard.todoSummary.Summary2", {length: todosActive.length})
                      } 

                      {todosOutdated?.length !== 0  ? 
                      (t("dashboard.todoSummary.Summary3", {length: todosActive.length, verb: todosOutdated?.length === 1 ? 'is' : 'are'}))
                      : 
                      <span> and <b>none</b> of them are outdated 😃🎉 </span>} 
                      
                      Make sure to complete all the tasks before creating a new one 😉
                  </> 
                  : " no todos active :("}
              </p>} */}
              {todosActive === null && <SkeletonTheme baseColor="#202020" highlightColor="#444"><Skeleton count={4} width={400}/></SkeletonTheme>}
            <p></p>
          </div>
        </div>
        <div className="todos__dashboard">
          <h2>{t("dashboard.closestTodosTitle")}</h2>
          <div className="todos__dashboard_container">
            {todos?.length === 0 ? <NoTodosFound showCreateSet={undefined}/> : null}
            {todos && todos
            .sort((a,b)=>{
              return (new Date(a.deadline as string).valueOf() - new Date(b.deadline as string).valueOf())
            })
            .sort(function(a,b){
              return Number(b.is_important) - Number(a.is_important);
            })
            .sort(function(a,b){
              return Number(a.completed) - Number(b.completed);
            })
            .map(obj => {
              return(
                <TodoBox todo={obj} key={obj.id} deletionModalSet={undefined} deletionSelectedIdSet={undefined}/>
              )
            })}
            {todos === null && 
              <>
                <SkeletonTheme baseColor="#202020" highlightColor="#444">
                  <Skeleton  width={420} height={220}/>
                  <Skeleton  width={420} height={250}/>
                  <Skeleton  width={420} height={200}/>
                </SkeletonTheme>
              </>
            }
          </div>
          <Link to="/todos"><h1 className="page__move next__page">{t("dashboard.todosPageLink")} <Icon icon="material-symbols:arrow-forward-rounded" /></h1></Link>
        </div>
      </div>
    </>
  );
}
 
export default DashboardPage;