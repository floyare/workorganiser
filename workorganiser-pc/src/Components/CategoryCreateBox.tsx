import { Icon } from "@iconify/react";
import { Dispatch, SetStateAction, useContext, useState } from "react";
import { createCategory, getUser } from "../Auth/supabase";
import { NotificationType } from "../Interfaces/INotificationBox";
import { executeNotification } from "../Modules/NotificationHandler";
import { TodosListContext } from "../App";

const CategoryCreateBox = ({showCategoryCreateSet}: {showCategoryCreateSet: Dispatch<SetStateAction<boolean>>}) => {
  const [categoryName, categoryNameSet] = useState("")
  const todosListContext = useContext(TodosListContext);
  return ( 
    <div className="panel__container">
      <div className="side__panel">
        <h1>Create new category</h1>
        
        <div className="panel__content">
        <div className="todo__create_section">
            <p><Icon icon="dashicons:welcome-write-blog" /> Name: </p>
            <input defaultValue={categoryName} onChange={(e) => {categoryNameSet(e.target.value)}}></input>
          </div>
          <div className="todo__create_section">
            <button className="confirm" onClick={async() => {
              if(!categoryName)
                return;

              if(todosListContext.categoriesList?.length! >= 10){
                executeNotification(todosListContext, "You've reached the maximum amount of created categories.", NotificationType.ERROR);
                return
              }

              if(!categoryName.match('^[a-zA-Z0-9_.-].*$')){
                executeNotification(todosListContext, "Category name can contain only letters and numbers.", NotificationType.ERROR);
                return
              }

              const userData = await getUser();
              if(userData.error){
                executeNotification(todosListContext, userData.error.message, NotificationType.ERROR);
                return
              }

              if(!userData.user){
                executeNotification(todosListContext, "Not logged in", NotificationType.ERROR);
                return;
              }

              const {error} = await createCategory(categoryName, userData.user?.id);
              if(error){
                executeNotification(todosListContext, error.message, NotificationType.ERROR);
              }else{
                executeNotification(todosListContext, "Created successfully!", NotificationType.SUCCESS);

                typeof todosListContext.getTodos === "function" && await todosListContext.getTodos(
                  true
                );
              }
              
              showCategoryCreateSet(false)
            }}><Icon icon="gridicons:create" /> Create!</button>
            <button className="cancel" onClick={() => {showCategoryCreateSet(false)}}><Icon icon="bi:arrow-return-left" /> Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default CategoryCreateBox;