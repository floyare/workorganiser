import { AuthError, PostgrestError, User, createClient } from "@supabase/supabase-js";
import { Database } from "../schema";
import { IUser } from "../Interfaces/IUser";
import { IAuthResponse } from "../Interfaces/IAuthResponse";
import { debug } from "../Modules/InternalModuleHandler";

//https://youtu.be/7CqlTU9aOR4
export type TodosTable = Database['public']['Tables']['todos']['Row'][]
export type TodoRow = Database['public']['Tables']['todos']['Row'];
export type TodoRowUpdate = Database['public']['Tables']['todos']['Update'];
export type CategoriesTable = Database['public']['Tables']['categories']['Row'][]
export type CategoryRow = Database['public']['Tables']['categories']['Row'] | null;
export const supabase = createClient<Database>('https://lpcxbgbdyayqxmjvitkb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwY3hiZ2JkeWF5cXhtanZpdGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzc0MDc3MjYsImV4cCI6MTk5Mjk4MzcyNn0.1SQ2pHKryvxd7ll2BYUYuYuMDkWbN6oTIxSTgaBojuI');
export const RegionCode = "en-US"; //undefined => actual //en-US
export enum ActionType {
  COMPLETE,
  EDIT,
  DELETE
}
export const REQUEST_RATE_LIMIT = 10;

export type TodosSupabaseResponse = {
  data: TodosTable | null,
  error: PostgrestError | null
}

export type CategoriesSupabaseResponse = {
  data: CategoriesTable | null,
  error: PostgrestError | null
}

export const fetchTodos = async (category?: CategoryRow, completed?: boolean) => {
  let query = supabase.from('todos').select('*');
  debug('fetchTodos', `fetching todos... [category: ${category?.name}]`, 'yellow')

  //BUG:7
  if(category !== undefined) {query = query.in('id', category?.contained ? category?.contained : []);}
  query = query.eq("completed", completed ? completed : false );
  const {data, error} = await query;
  return {data, error}; 
}

export const modifyAction = async (todo: TodoRow, action: ActionType, newTodo?: TodoRowUpdate) => {
  let request;
  switch(action){
    case ActionType.COMPLETE:
      request = await supabase.from('todos').update({completed: !todo.completed}).eq('id', todo.id);
      break;
    case ActionType.EDIT:
      request = await supabase.from('todos').update(newTodo!).eq('id', todo.id);
      break;
    case ActionType.DELETE:
      request = await supabase.from('todos').delete().eq('id', todo.id);
      break;
  }

  return {data: request?.data, error: request?.error};
}

export const getUser = async () => {
  const {data, error} = await supabase.auth.getUser();
  return {user: data.user, error: error};
}

export const isLoggedIn = async () => {
  const {data, error} = await supabase.auth.getSession();
  if(error)
    return false;
  
  if(data.session)
    return true;

  return false;
}

export const getProviderUserInfo = async () => {
  const {user, error} = await getUser();
  if(!user) return {user: null, provider: null, color_accent: null, error: "User not found"}

  const profile = await supabase.from("profiles").select("*").eq("id", user?.id)
  if(profile.error) return {user: null, provider: null, color_accent: null, error: profile.error}

  return {"user": user?.identities![0].identity_data as IUser, "provider": user?.identities![0].provider, color_accent: profile.data[0].selected_accent, error: error} as IAuthResponse;
}

export const getFirstTodos: () => Promise<TodosTable> = async () => {
  const {data, error} = await supabase.from('todos').select('*').eq("completed", false).limit(3);

  if(error)
    throw new Error("Error while fetching todos: \n" + error.message);

  return data;
}

export const getActiveTodos: (completed?: boolean) => Promise</*TodosTable*/TodosSupabaseResponse> = async (completed?: boolean) => {
  const {data, error} = await supabase.from('todos').select('*').eq("completed", completed ? completed : false);
  return {data, error};
}

export const getCategories: () => Promise<CategoriesSupabaseResponse> = async () => {
  const {data, error} = await supabase.from('categories').select('*');
  return {data, error};
}

export const getTodosCategory: (todo: TodoRow) => Promise<CategoriesSupabaseResponse> = async (todo: TodoRow) => {
  const todoId = todo.id;
  const {data, error} = await supabase.from('categories').select('*').contains('contained', [todoId])
  return {data, error};
}

export const createCategory: (name: string, owner: string) => Promise<CategoriesSupabaseResponse> = async (name: string, owner: string) => {
  const {data, error} = await supabase.from('categories').insert({name, owner})
  return {data, error}
}

export async function logOut(){
  await supabase.auth.signOut();
}

export async function updateUsersColor(color: string){
  const {user, error} = await getUser();
  if(error) return {error: error}
  if(!user) return {error: "User not logged in"}


  const profile = await supabase.from("profiles").update({selected_accent: color}).eq("id", user?.id)
  if(profile.error) return {error: profile.error}
  return {error: null}
}