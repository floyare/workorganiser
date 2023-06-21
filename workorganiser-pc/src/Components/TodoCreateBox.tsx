import "../Styles/STodoCreateBox.scss"
import Switch from "./Switch";
import { useState, useContext, ChangeEvent } from "react";
import { CategoryRow, getUser, isLoggedIn, supabase } from "../Auth/supabase";
import { executeNotification } from "../Modules/NotificationHandler";
import { NotificationType } from "../Interfaces/INotificationBox";
import { Icon } from '@iconify/react';
import SmallErrorBox from "./SmallErrorBox";
import ConfirmationModal from "./ConfirmationModal";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import SelectBox from "./CategorySelectBox";
import { TodosListContext } from "../App";

const TodoCreateBox = ({showCreateSet} : {showCreateSet: React.Dispatch<React.SetStateAction<boolean>>}) => {
  const todosListContext = useContext(TodosListContext);
  const [todoImportant, todoImportantSet] = useState(false)
  const [todoDeadline, todoDeadlineSet] = useState("")
  const [todoContent, todoContentSet] = useState("")
  const [error, errorSet] = useState<string>("");
  const [selectedCategory, selectedCategorySet] = useState<CategoryRow | null>(null);

  const [warnNoDeadline, warnNoDeadlineSet] = useState(false)
  const [animationParent] = useAutoAnimate();

  const refreshTodos = async () => {
    (typeof todosListContext.getTodos === 'function') && await todosListContext.getTodos(true);
  }

  const handleCreate = async () => {
    if(todoContent === ""){
      errorSet("Fill up the content first!");
      return;
    }
    
    const isLogged = await isLoggedIn();
    if(!isLogged){
      errorSet("User not logged in");
      return;
    }
    
    const user = await getUser();
    if(user.user === null){
      errorSet("User session not available");
      return;
    }

    if(user.error){
      errorSet(user.error.message);
      return;
    }

    await supabase.from('todos').insert({content: todoContent, deadline: todoDeadline.length > 0 ? new Date(todoDeadline).toISOString() : null, is_important: todoImportant, uploader: user.user?.id}).select()
    .then(async(res) => {
      if(res.error){
        errorSet(res.error.message);
        return;
      }

      if(!todosListContext.categoriesList){
        return;
      }

      if(selectedCategory){
        const currentTodoId = res.data[0].id;
        const currentCategoryContained = todosListContext.categoriesList.filter(x => x.id === selectedCategory?.id)[0].contained;
        currentCategoryContained?.push(currentTodoId)
  
        await supabase.from('categories').update({contained: currentCategoryContained}).eq('id', selectedCategory.id)
          .then(async (res) => {
            if(res.error){
              errorSet("Failed to update categories: " + res.error.message);
              return;
            }
          })
          
      }

      await refreshTodos();

      //BUG:2
      executeNotification(todosListContext, "Successfully created!", NotificationType.SUCCESS);

      showCreateSet(false);
    })
  }

  const handleCategoryChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    if(!todosListContext.categoriesList)
      return;
    
    const target = todosListContext.categoriesList.filter(r => {return r.id === Number(e.target.value)})[0]
    selectedCategorySet(target)
  }

  return (
    <div className="panel__container">
      <div className="side__panel">
        <div className="modal__container" ref={animationParent}>
          {warnNoDeadline && 
            <ConfirmationModal 
              title={"Are your sure?"} 
              content={"You have not specified a deadline. Are you sure you want to continue?"} 
              confirmButton={"Create!"} 
              confirmCallback={async () => {warnNoDeadlineSet(false); await handleCreate()}} 
              confirmButtonClass={"create"} 
              backCallback={() => {warnNoDeadlineSet(false)}}
            />
          }
        </div>
        <h1>Create new todo!</h1>
        <div className="todo__create_section">
          <p><Icon icon="dashicons:welcome-write-blog" /> Content: </p>
          <textarea value={todoContent} onChange={(e) => {todoContentSet(e.target.value)}}></textarea>
        </div>

        <div className="todo__create_section">
          <p><Icon icon="material-symbols:calendar-month" /> Deadline: </p>
          <input type="datetime-local" value={todoDeadline.toLocaleString()} onChange={(e) => {todoDeadlineSet(e.target.value)}}></input>
        </div>

        <div className="todo__create_section">
          <SelectBox title={"Category:"} selected={selectedCategory} options={todosListContext.categoriesList} onChange={handleCategoryChange} showActions={false}/>
        </div>

        <div className="todo__create_section">
          <Switch variable={todoImportant} text="Is important?" onChange={(e) => (typeof  todoImportantSet === 'function') &&  todoImportantSet(e.target.checked)}/>
        </div>

        {error && <SmallErrorBox error={error}/>}

        <div className="todo__create_section">
          <button className="confirm" onClick={todoDeadline.length <= 0 ? () => {warnNoDeadlineSet(true)} : handleCreate}><Icon icon="gridicons:create" /> Create</button>
          <button className="cancel" onClick={() => {showCreateSet(false)}}><Icon icon="bi:arrow-return-left" /> Cancel</button>
        </div>
      </div>
    </div>
  );
}
 
export default TodoCreateBox;