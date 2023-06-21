import 'react-native-url-polyfill/auto'
import * as SecureStore from 'expo-secure-store'
import { createClient } from '@supabase/supabase-js'
import { Database } from './schema'
import { FetchOptions } from '../Interfaces/FetchOptions'
import type { PostgrestQueryBuilder } from "@supabase/postgrest-js";
import { UserData } from '../Interfaces/UserData'
import { IUser } from '../Interfaces/IUser'

export const supabaseUrl = 'https://lpcxbgbdyayqxmjvitkb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwY3hiZ2JkeWF5cXhtanZpdGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzc0MDc3MjYsImV4cCI6MTk5Mjk4MzcyNn0.1SQ2pHKryvxd7ll2BYUYuYuMDkWbN6oTIxSTgaBojuI'

export type TodosTable = Database['public']['Tables']['todos']['Row'][]
export type TodoRow = Database['public']['Tables']['todos']['Row'];
export type TodoRowUpdate = Database['public']['Tables']['todos']['Update'];
export type CategoriesTable = Database['public']['Tables']['categories']['Row'][]
export type CategoryRow = Database['public']['Tables']['categories']['Row'] | null;
export type DatabaseType = Database['public']
export const RegionCode = "en-US"; //undefined => actual //en-US
export enum ActionType {
  COMPLETE,
  EDIT,
  DELETE
}

export enum StatusType {
  ERROR,
  WARNING,
  SUCCESS,
  INFO
}

export const REQUEST_RATE_LIMIT = 10;

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key)
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value)
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key)
  },
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// await fetchTodos(
//   {
//     orderType: {
//       column: 'id',
//       options: {
//         ascending: true
//       }
//     },
//     limit: 2,
//     specificValue: {
//       column: 'content',
//       value: 'TEST_CONTENT'
//     }
//   }
// ).then((res) => {
//   appContext?.todosListSet(res.data)
// })
export const fetchTodos = async (options?: FetchOptions) => {
  let query = supabase.from('todos').select("*");
  
  if(options?.limit) query.limit(options.limit);

  if(options?.orderType) query.order(options.orderType.column, options.orderType.options);

  if(options?.category && options?.category.contained) query.in('id', options?.category.contained)

  if(options?.specificValue) query.eq(options?.specificValue.column, options?.specificValue.value);


  const {data,error} = await query;
  return {data,error}
}

export async function deleteTodo(todoId: number){
  const {data, error} = await supabase.from('todos').delete().eq('id', todoId)
  return {error}
}

export async function modifyTodo(todoId: number, updatedTodo: TodoRow){
  const {data, error} = await supabase.from('todos').update(updatedTodo).eq('id', todoId)
  return {error}
}

// (await fetchTodos2()).select("*").eq('id', 160).then(res => {
//   appContext?.todosListSet(res.data)
// }) 
export async function fetchTodos2(): Promise<PostgrestQueryBuilder<DatabaseType, Database['public']['Tables']['todos']>>{
  let query = supabase.from('todos')
  return query
}

export const fetchCategories = async () => {
  const {data, error} = await supabase.from("categories").select("*")
  return {data, error}
}

export const fetchTodosCategory = async (todo: TodoRow) => {
  const todoId = todo.id;
  const {data, error} = await supabase.from('categories').select('*').contains('contained', [todoId])
  return {data, error};
}

export async function createCategory (category: {}) {
  const {data, error} = await supabase.from('categories').insert(category!)
  return {data, error};
}

export const getUser = async () => {
  const session = await supabase.auth.getSession()
  if(!session.data) {return {user: null, error: "User not logged in"}}
  return {user: session.data.session?.user, error: null}
}

export const isLoggedIn = async () => {
  const {data, error} = await supabase.auth.getSession();
  if(error)
    return false;
  
  if(data.session)
    return true;

  return false;
}

export const getUserData = async () => {
  const {user, error} = await getUser();
  const identity = user?.identities![0].identity_data as IUser;
  const profile = await supabase.from("profiles").select("*").eq("id", user?.id)
  if(!identity) return {user: null, error: "No identity found"}
  if(!profile.data) return {user: null, error: "Profile not found"}
  const data: UserData = {
    id: user?.id!, 
    provider: user?.identities![0].provider!,
    nickname: identity.preferred_username!,
    avatarUrl: identity.avatar_url!,
    color_accent: profile.data[0].selected_accent ? profile.data[0].selected_accent : "rgb(155, 109, 241)"
  }
  
  return {user: data, error: error};
}

export async function updateUsersColor(color: string){
  const {user, error} = await getUser();
  if(error) return {error: error}
  if(!user) return {error: "User not logged in"}


  const profile = await supabase.from("profiles").update({selected_accent: color}).eq("id", user?.id)
  if(profile.error) return {error: profile.error}
  return {error: null}
}