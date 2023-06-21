import { CategoryRow, TodoRow } from "../Auth/supabase"

export type TodosColumns = "created_at" | "id" | "completed" | "content" | "deadline" | "edit_date" | "is_important" | "uploader"

export interface FetchOptions {
  orderType?: {
    column: TodosColumns,
    options?: {
      ascending: boolean
    }
  },
  limit?: number,
  category?: CategoryRow,
  specificValue?: {
    column: TodosColumns,
    value: string | number | boolean
  }
  // https://supabase.com/docs/reference/javascript/using-filters
  //  .eq('name', 'Albania') FOR EX
}