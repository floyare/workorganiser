import { ModalType } from "../App";
import { TodoRow, TodosTable } from "../Auth/supabase";
import { SortingItem } from "../Components/NavigationBar";
import { AppError } from "./AppError";
import { AppState } from "./AppState";
import { FetchOptions } from "./FetchOptions";
import { UserData } from "./UserData";

export interface AppContext {
  todosList: TodosTable | null,
  todosListSet: React.Dispatch<React.SetStateAction<TodosTable | null>>,
  appState: AppState | null,
  appStateSet: React.Dispatch<React.SetStateAction<AppState | null>>,
  selectedTodo: TodoRow | null,
  selectedTodoSet: React.Dispatch<React.SetStateAction<TodoRow | null>>,
  fetchingOptions: FetchOptions,
  fetchingOptionsSet: React.Dispatch<React.SetStateAction<FetchOptions>>,
  showModal: ModalType,
  showModalSet: React.Dispatch<React.SetStateAction<ModalType>>,
  sortingOption: SortingItem,
  sortingOptionSet: React.Dispatch<React.SetStateAction<SortingItem>>,
  userData: UserData | null,
  userDataSet: React.Dispatch<React.SetStateAction<UserData | null>>
  // appError: AppError | null,
  // appErrorSet: React.Dispatch<React.SetStateAction<AppError | null>>,
  // appRefreshing: boolean,
  // appRefreshingSet: React.Dispatch<React.SetStateAction<boolean>>
}