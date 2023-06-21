import { AuthError } from "@supabase/supabase-js";
import { IUser } from "./IUser";

export interface IAuthResponse {
  user: IUser,
  provider: string | undefined,
  color_accent: string | null
  error: AuthError | null
}