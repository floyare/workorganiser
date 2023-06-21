import { StatusType } from "../Auth/supabase";

export interface StatusInterface {
  statusMessage?: string,
  statusType: StatusType
}