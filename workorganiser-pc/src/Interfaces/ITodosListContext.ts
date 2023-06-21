import { Dispatch, SetStateAction } from "react";
import { CategoriesTable, CategoryRow, TodosTable } from "../Auth/supabase";
import { INotificationManager } from "./INotificationManager";
import { ITodoRequestStatus } from "./ITodoRequestStatus";
import { SortingObject } from "../Components/TodosManager";
import { IAuthResponse } from "./IAuthResponse";

export interface ITodosListContext {
  getTodos: {(force?: boolean, category?: CategoryRow, onlyCompleted?: boolean): Promise<void>} | null, //{() : Promise<void>} | null,
  editMode?: boolean,
  editModeSet?: React.Dispatch<React.SetStateAction<boolean>>,
  notifications: INotificationManager,
  notificationsSet: React.Dispatch<React.SetStateAction<INotificationManager>> | null,
  categoriesList: CategoriesTable | null,
  categoriesListSet: Dispatch<SetStateAction<CategoriesTable | null>>,
  selectedCategory?: CategoryRow | null,
  selectedCategorySet?: Dispatch<SetStateAction<CategoryRow | null | undefined>>,//Dispatch<SetStateAction<CategoryRow | null | undefined>>
  todosList: TodosTable | null,
  todosListSet: Dispatch<SetStateAction<TodosTable | null>>,
  internalSelectedCategory: CategoryRow, 
  internalSelectedCategorySet: Dispatch<SetStateAction<CategoryRow>>,
  todoRequestStatus: ITodoRequestStatus,
  todoRequestStatusSet: Dispatch<SetStateAction<ITodoRequestStatus>>,
  selectedSorting: SortingObject,
  selectedSortingSet: Dispatch<SetStateAction<SortingObject>>,
  userData: IAuthResponse | undefined,
  userDataSet: Dispatch<SetStateAction<IAuthResponse | undefined>>
}