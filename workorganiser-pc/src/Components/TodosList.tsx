import { ActionType, modifyAction, TodoRow, TodosTable } from "../Auth/supabase";
import DOMPurify from 'dompurify';
import TodoBox from "./TodoBox";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useContext, useState, SetStateAction, Dispatch } from "react";
import ConfirmationModal from "./ConfirmationModal";
import { executeNotification } from "../Modules/NotificationHandler";
import { NotificationType } from "../Interfaces/INotificationBox";
import Masonry from "react-responsive-masonry"
//import { DragDropContext, Droppable, DroppableProps, DroppableProvided, Draggable } from 'react-beautiful-dnd';
import { TodosListContext } from "../App";

DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  if ('target' in node) { node.setAttribute('target', '_blank'); }
  if (!node.hasAttribute('target') && (node.hasAttribute('xlink:href') || node.hasAttribute('href'))) {
    node.setAttribute('xlink:show', 'new');
  }
});

const TodosList = ({todosList, todosListSet, editMode}: {todosList: TodosTable, todosListSet: Dispatch<SetStateAction<TodosTable | null>>, editMode: boolean}) => {
  const [animationParent] = useAutoAnimate();
  const [deletionModal, deletionModalSet] = useState(false)
  const [deletionSelectedId, deletionSelectedIdSet] = useState<number | null>(null);
  const todosListContext = useContext(TodosListContext);

  const refreshTodos = async () => {
    (typeof todosListContext.getTodos === 'function') && await todosListContext.getTodos(true);
  }

  async function handleDelete(todo: TodoRow){
    const {data, error} = await modifyAction(todo, ActionType.DELETE);
    await refreshTodos();

    //BUG:2
    executeNotification(todosListContext, "Successfully deleted!", NotificationType.SUCCESS);
    deletionModalSet(false)
  }

  const reorder = (list: TodosTable, startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    console.warn(result);
    const [removed] = result.splice(startIndex, 1);
    console.warn(removed)
    result.splice(endIndex, 0, removed);
    console.warn(result)
  
    return result;
  };

  function returnSort(){
    return (a: TodoRow, b: TodoRow) => 
      todosListContext.selectedSorting.by === "deadline" ? 
        ((todosListContext.selectedSorting.type === "ASC" ?
            (a.deadline != null ? new Date(a.deadline).valueOf() : Infinity) - (b.deadline != null ? new Date(b.deadline).valueOf() : Infinity)
            :
            (b.deadline != null ? new Date(b.deadline).valueOf() : -Infinity) - (a.deadline != null ? new Date(a.deadline).valueOf() : -Infinity))) 
    :
      todosListContext.selectedSorting.by === "important" ? ((a.is_important === b.is_important)? 0 : a.is_important? -1 : 1 )
    :
      todosListContext.selectedSorting.by === "date" ? ( (a.created_at && b.created_at) ?
      todosListContext.selectedSorting.type === "ASC" ? new Date(a.created_at).valueOf() - new Date(b.created_at).valueOf() : new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf() : 0) 
    :
      0
  }

  // useEffect(() => {
  //   //todosListSet(todosList.sort(returnSort()))
  // }, [todosListContext.selectedSorting])

  return (
    <div className="todos__wrapper">
      <div ref={animationParent}>
        {deletionModal && 
          <ConfirmationModal 
            title={"Post deletion"} 
            content={"Are you sure you want to delete this todo?"} 
            confirmButton={"Delete"} 
            confirmCallback={() => {handleDelete(todosList.filter(x => {return x.id === deletionSelectedId})[0])}} 
            confirmButtonClass={"delete"} 
            backCallback={() => {deletionModalSet(false)}}
          />
        }
      </div>
      <center>
        <div className={`todos__container ${editMode ? "editMode" : ""}`}>
          {/* BUG:13 */}
          <Masonry columnsCount={3}>
            {todosList && todosList
              //BUG:12
              .sort(returnSort())
              .map((obj, index) => {
                return(
                  <TodoBox 
                    todo={obj} 
                    deletionModalSet={deletionModalSet} 
                    deletionSelectedIdSet={deletionSelectedIdSet} 
                  />
                )
            })}
          </Masonry>
        </div>
      </center>
    </div>
  );
}
 
export default TodosList;