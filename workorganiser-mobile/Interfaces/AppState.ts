import { AppError } from "./AppError";

export interface AppState {
  state: "ERROR" | "IDLE" | "LOADING" | "SUCCESS",
  error?: AppError
}