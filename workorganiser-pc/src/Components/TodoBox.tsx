import { ActionType, CategoryRow, getTodosCategory, modifyAction, supabase, TodoRow } from "../Auth/supabase";
import { RegionCode } from "../Auth/supabase";
import DOMPurify from "dompurify";
import { ChangeEvent, LegacyRef, useContext, useState } from "react";
import moment from 'moment';
import { Icon } from '@iconify/react';
import Switch from "./Switch";
import { executeNotification } from "../Modules/NotificationHandler";
import { NotificationType } from "../Interfaces/INotificationBox";
import SelectBox from "./CategorySelectBox";
import { debug, limitRates } from "../Modules/InternalModuleHandler";
import { DraggableProvidedDraggableProps, DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { TodosListContext } from "../App";

const convertTimestamp = (unix: number) => {
  return moment.unix(unix).format('YYYY-MM-DD HH:mm:ss');
}

export const getTimeLeft = (unix: number) => {
  return moment(convertTimestamp(unix)).fromNow();
}

export const is3DayDifference = (start: Date) => {
  const date = start;
  const now = (new Date())
  const diffTime = date.valueOf() - now.valueOf();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays <= 3 ? true : false;
}

export const isOutdated = (start: Date) => {
  const date = start;
  const now = (new Date())
  const diffTime = date.valueOf() - now.valueOf();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return (diffDays <= 0 && diffTime < 0) ? true : false;
}

const convertLinks = (content: string) => {
  var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
  var newStr = content.replace(urlRegex, (url) => {
    var hyperlink = url;

    if(hyperlink.endsWith("\">")){
      return url;
    }

    if (!hyperlink.match('^https?:\/\/')) {
      hyperlink = 'http://' + hyperlink;
    }
    return `<a href="${hyperlink}" target="_blank" class='redirect'>${hyperlink}</a>`
  });
  return newStr;
}

const TodoBox = ({todo, deletionModalSet, deletionSelectedIdSet, innerRef, dragHandleProps, draggableProps}: 
  {
    todo: TodoRow, 
    deletionModalSet: React.Dispatch<React.SetStateAction<boolean>> | undefined, 
    deletionSelectedIdSet: React.Dispatch<React.SetStateAction<number | null>> | undefined, 
    innerRef?: LegacyRef<HTMLDivElement>, 
    dragHandleProps?: DraggableProvidedDragHandleProps | null | undefined, 
    draggableProps?: DraggableProvidedDraggableProps
  }) => {
  const todosListContext = useContext(TodosListContext);
  const [editingEnabled, editingEnabledSet] = useState(false);
  const [editingContent, editingContentSet] = useState('');
  const [editingDeadline, editingDeadlineSet] = useState<Date | number | string | null>(null);
  const [editingImportant, editingImportantSet] = useState<boolean>(false);
  const [editingCategory, editingCategorySet] = useState<CategoryRow | null>(null);

  const formatDate: Date = new Date(todo.created_at as string);
  const formatDeadline: Date = new Date(todo.deadline!)

  const convertedContent = convertLinks(todo.content as string);
  const sanitizedContent = DOMPurify.sanitize(convertedContent);

  const nearDeadline = todo.deadline ? is3DayDifference(formatDeadline) : false;
  const outdated = todo.deadline ? isOutdated(formatDeadline) : false;

  //BUG:9
  const refreshTodos = async (category?: CategoryRow) => {
    debug('refreshTodos', ' REFRESHING TODOS ', "pink");
    console.log('refreshed, ', category);
    (typeof todosListContext.getTodos === 'function') && await todosListContext.getTodos(true, category, category?.id === Number.MAX_SAFE_INTEGER);
  }

  const setEditMode = (b: boolean) => {
    (typeof todosListContext.editModeSet === 'function') && todosListContext.editModeSet(b);
  }

  async function handleComplete(){
    const limit = limitRates(async() => {
      const {data, error} = await modifyAction(todo, ActionType.COMPLETE);
      if(error){
        executeNotification(todosListContext, "Failed to complete todo", NotificationType.ERROR);
        return;
      }

      await refreshTodos(todosListContext.selectedCategory);
    })

    if(limit.error) {
      executeNotification(todosListContext, limit.error, NotificationType.ERROR);
      return;
    }
  }

  function handleCancel(){
    editingEnabledSet(false);
  }

  async function updateDatabaseCategory(items: any, id: number){
    await supabase.from('categories').update(items).eq(
      'id', id
    )
      .then(async (res) => {
        if(res.error){
          executeNotification(todosListContext, "Failed to update categories: " + res.error.message, NotificationType.ERROR);
          return;
        }
    })
  }

  async function updateCategory(){
    if(!todosListContext.categoriesList)
      return;

    const oldCategory = await getTodosCategory(todo)
    if(oldCategory.error){
      executeNotification(todosListContext, "Failed to fetch todo's old category", NotificationType.ERROR);
      return;
    }

    if(editingCategory === (oldCategory.data?.length === 0 ? null : oldCategory?.data![0])){
      return
    }

    if(editingCategory === null){
      const oldCategoryId = oldCategory.data![0]?.id;

      const oldCategoryContained = todosListContext.categoriesList?.filter(
        (x => x.id === oldCategoryId)
      )[0].contained 

      const modifiedOldCategoryContained = oldCategoryContained?.filter(x => x !== todo?.id);
      let updatedCategory = todosListContext.categoriesList?.filter(
        (x => x.id === oldCategoryId)
      )[0]
      updatedCategory!.contained = modifiedOldCategoryContained!;

      await updateDatabaseCategory({contained: modifiedOldCategoryContained}, oldCategoryId!)
    }

    const currentTodoId = todo.id;
    const categoryId = editingCategory?.id;

    const currentCategoryContained = todosListContext.categoriesList.filter(
      (x => x.id === categoryId)
    )[0].contained 

    if(oldCategory.data?.length === 0){
      currentCategoryContained?.push(currentTodoId)
      await updateDatabaseCategory({contained: currentCategoryContained}, categoryId!)

      return;
    }

    const oldCategoryId = oldCategory.data![0].id;

    const oldCategoryContained = todosListContext.categoriesList.filter(
      (x => x.id === oldCategoryId)
    )[0].contained 

    if(oldCategoryId !== categoryId) {
      const modifiedOldCategoryContained = oldCategoryContained?.filter(x => x !== todo.id);
      let updatedCategory = todosListContext.categoriesList.filter(
        (x => x.id === oldCategoryId)
      )[0]
      updatedCategory.contained = modifiedOldCategoryContained!;
      //BUG:10
      todosListContext.selectedCategorySet!(updatedCategory)

      await updateDatabaseCategory({contained: modifiedOldCategoryContained}, oldCategoryId!)

      currentCategoryContained?.push(todo.id)

      await updateDatabaseCategory({contained: currentCategoryContained}, categoryId!)
      return updatedCategory;
    }
  }

  async function handleEdit(){
    setEditMode(false);

    let newTodo: TodoRow = todo;
    newTodo.content = editingContent;
    newTodo.deadline = editingDeadline ? (editingDeadline as string) : null;

    newTodo.is_important = editingImportant;
    newTodo.edit_date = new Date().toLocaleString(RegionCode);

    editingEnabledSet(false);

    const {data, error} = await modifyAction(todo, ActionType.EDIT, newTodo);
    if(error){
      executeNotification(todosListContext, "Failed to update todo", NotificationType.ERROR);
      return;
    }

    await updateCategory().then(async (res) => {
      await refreshTodos(res);
    })
  }

  const handleCategoryChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    if(!todosListContext.categoriesList)
      return;
    
    const target = todosListContext.categoriesList.filter(r => {return r.id === Number(e.target.value)})[0]
    editingCategorySet(target)
  }

  return (
    <>
      <div className={
        `todos__box 
          ${todo.completed ? "completed" 
            : outdated ? "outdated" 
              : nearDeadline ? "near_end" 
                : ""} 
          ${!todo.completed ? todo.is_important ? "important" : "" : ""}
        `} key={todo.id} ref={innerRef} {...dragHandleProps} {...draggableProps}>
        <div className="options">
          <table className="options__table">
            <thead>
              <tr>
                <td colSpan={2} className={!todo.completed ? "complete" : "revert"} onClick={handleComplete}><p><Icon icon={!todo.completed ? "material-symbols:check" : "grommet-icons:revert"} /></p></td>
              </tr>
              <tr>
                <td className="edit" onClick={async() => {
                  const currentCategory = await getTodosCategory(todo)
                  if(currentCategory.error){
                    executeNotification(todosListContext, "Failed to fetch todo's category", NotificationType.ERROR);
                    return;
                  }

                  if(currentCategory.data){
                    editingCategorySet(currentCategory.data[0])
                  }

                  editingDeadlineSet(todo.deadline ? moment(todo.deadline).format("yyyy-MM-DDTHH:mm") : null)
                  editingContentSet(todo.content as string);
                  editingImportantSet(todo.is_important as boolean);
                  setEditMode(false);
                  editingEnabledSet(true);
                }}><Icon icon="material-symbols:edit" /></td>
                <td className="delete" onClick={() => {deletionModalSet!(true); deletionSelectedIdSet!(todo.id)}}><Icon icon="material-symbols:delete-outline" /></td>
              </tr>
            </thead>
          </table>
        </div>
        <div className="content">
          <p className="creation__date">
            <Icon icon="material-symbols:date-range-outline" /> {
            formatDate.toLocaleDateString(RegionCode, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {
            editingEnabled ? 
              <textarea value={editingContent} onChange={(e) => {editingContentSet(e.target.value)}}></textarea>
            :
              <>
                <p className="todoContent" dangerouslySetInnerHTML={
                  {
                    __html: `${sanitizedContent + (todo.edit_date ? " <span>(edited)</span>" : "")} 
                      ${(todo.edit_date ? `<div class="tooltip" id="editTooltip">${moment(todo.edit_date).format("DD.MM.YYYY HH:mm:SS")}</div>` : "")}`
                  }
                }></p>
              </>
          }

          {editingEnabled && 
              <SelectBox title={"Category:"} selected={editingCategory} options={todosListContext.categoriesList} onChange={handleCategoryChange} showActions={false}/>
            }

          {editingEnabled &&
            <div style={{margin: "5px 0px"}}><Switch variable={editingImportant} text="Is Important?" onChange={(e) => {editingImportantSet(e.target.checked)}}></Switch></div>
          }

          {editingEnabled ? 
            <div className="deadline">
              {/* BUG:4 */}
              <input type="datetime-local" value={editingDeadline?.toLocaleString(RegionCode)} onChange={(e) => {editingDeadlineSet(e.target.value)}}></input>
            </div>

          :
            (todo.deadline ? (<div className="deadline">
              {getTimeLeft(moment(formatDeadline).unix())}
              <div className="tooltip" id="deadlineTooltip">
                {moment(todo.deadline).format("DD.MM.YYYY HH:mm:ss")}
              </div>
            </div>) : null)
          }

          {
            editingEnabled ?
              <div className="buttons">
                <button className="save" onClick={handleEdit}>Save</button>
                <button className="cancel" onClick={handleCancel}>Cancel</button>
              </div>
            :
              null
          }
        </div>
      </div>
    </>
  );
}

export default TodoBox;