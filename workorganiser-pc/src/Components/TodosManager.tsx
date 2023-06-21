import { ChangeEvent, Dispatch, SetStateAction, useContext, useState } from "react";
import Switch from "./Switch";
import { Icon } from '@iconify/react';
import { debug, limitRates } from "../Modules/InternalModuleHandler";
import { executeNotification } from "../Modules/NotificationHandler";
import { NotificationType } from "../Interfaces/INotificationBox";
import CategorySelectBox from "./CategorySelectBox";
import { CategoryRow } from "../Auth/supabase";
import SelectBox from "./SelectBox";
import { TodosListContext } from "../App";

export type SortingObject = {
  type: string,
  name: string,
  by: string
}

export const sortingOptions: SortingObject[] = [
  {
    type: "DESC",
    name: "Creation date (New to old)",
    by: "date"
  },
  {
    type: "ASC",
    name: "Creation date (Old to new)",
    by: "date"
  },
  {
    type: "DESC",
    name: "Is important",
    by: "important"
  },
  {
    type: "DESC",
    name: "Deadline (Closest)",
    by: "deadline"
  },
  {
    type: "ASC",
    name: "Deadline (Furthest)",
    by: "deadline"
  },
]

const TodosManager = ({getTodos, showCategoryCreateSet}: {getTodos: ((force?: boolean) => Promise<void>), showCategoryCreateSet: Dispatch<SetStateAction<boolean>>}) => {
  const todosListContext = useContext(TodosListContext);
  const [showArchiveMessage, showArchiveMessageSet] = useState(false)
  const [selectedSorting, selectedSortingSet] = useState("Deadline (Closest)")

  const createNewCategory = (e: ChangeEvent<HTMLSelectElement>) => {
    debug('createNewCategory', 'Clicked category creation option')
    showCategoryCreateSet(true)
  }

  const handleCategoryChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    if(!e.target.value)
      return;

    if(!todosListContext.categoriesList)
      return;

    const target = e.target.value !== "$_ARCHIVIZED_$" ? todosListContext.categoriesList.filter(r => {return r.id === Number(e.target.value)})[0]
    :
    todosListContext.categoriesList.filter(r => {return r.name === "🗑️ Archivized"})[0]

    todosListContext.selectedCategorySet!(target)
    console.log(target)

    debug('handleCategoryChange', 'e.target.value: ' + e.target.value, "purple")
    //BUG:11

    const noneCategory: CategoryRow = {
      id: 0, 
      contained: [], 
      created_at: new Date().toDateString(), 
      name: "None", 
      owner: "GLOBAL"
    }

    e.target.value === "None" ? (todosListContext.selectedCategorySet && todosListContext.selectedCategorySet(undefined)) : null
    e.target.value === "$_ARCHIVIZED_$" ? showArchiveMessageSet(true) : showArchiveMessageSet(false);
    if(e.target.value === "$_NEW_CATEGORY_$") {e.target.value = "None"; createNewCategory(e); return;}
    typeof todosListContext.getTodos === "function" && await todosListContext.getTodos(
      true, target ? target : noneCategory, (e.target.value === "$_ARCHIVIZED_$")
    );
  }

  const handleSortingChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if(!e.target.value)
      return;

    const selectedOption = sortingOptions.filter(option => {return option.name === e.target.value})[0]
    if(!selectedOption) return

    selectedSortingSet(e.target.value)

    todosListContext.selectedSortingSet(selectedOption)
  }
  
  return (
    <>
      <div className="todos__manager">
        <CategorySelectBox title={"Category:"} selected={todosListContext.selectedCategory} options={todosListContext.categoriesList} onChange={handleCategoryChange}/>

        <SelectBox title={"Sorting:"} selected={selectedSorting} options={sortingOptions.map(item => {return item.name})} onChange={handleSortingChange} />

        <Switch variable={todosListContext.editMode} text="Edit mode" onChange={(e) => {(typeof todosListContext.editModeSet === 'function') && todosListContext.editModeSet(e.target.checked)}}/>

        <button className="refresh" onClick={() => {
          const {error} = limitRates(() => {getTodos(true)})
          if(error){
            executeNotification(todosListContext, error, NotificationType.ERROR);
          }
        }}><Icon icon="material-symbols:refresh" /> Refresh</button>
      </div>
    </>
  );
}
 
export default TodosManager;