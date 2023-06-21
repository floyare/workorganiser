export interface AppError {
  content?: string,
  initiator?: string,
  code?: 400 | 401 | 403 | 404 | 500
}