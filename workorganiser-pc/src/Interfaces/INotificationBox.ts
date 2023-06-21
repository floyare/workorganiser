import { Key } from "react";

export enum NotificationType {
  ERROR="error",
  SUCCESS="success",
  INFO="info",
  WARNING="warning"
}

export interface INotificationBox{
  key?: Key,
  content: string,
  type: NotificationType,
  duration: number
}