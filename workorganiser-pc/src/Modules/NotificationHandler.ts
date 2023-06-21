import { NotificationType } from './../Interfaces/INotificationBox';
import { INotificationManager } from './../Interfaces/INotificationManager';
import { INotificationBox } from "../Interfaces/INotificationBox";
import {sendNotification} from '@tauri-apps/api/notification';
import { RegionCode, TodoRow, TodosTable } from '../Auth/supabase';
import { debug } from './InternalModuleHandler';
import moment from 'moment';
import { getTimeLeft, isOutdated } from '../Components/TodoBox';
import { ITodosListContext } from '../Interfaces/ITodosListContext';

let notificationKey = 0;

export function createNotification(notify: INotificationBox, notificationsSet: React.Dispatch<React.SetStateAction<INotificationManager>>){
  notify.key = notificationKey;
  notificationKey++;
  // BUG:2 notificationsSet is not a function
  notificationsSet(prev => {return [...prev, notify]});
  setTimeout(() => {
    notificationsSet(prev => {return prev.filter(notification => {return notification.key !== notify.key})});
  }, notify.duration)
}


// Sprawdzanie czy juz zarejestrowano
const isExistingInTimeouts = (todo: TodoRow) => {
  debug('isExistingInTimeouts', 'Checking existence for: ' + todo.id);

  if(!sessionStorage.getItem("timeouts")){
    debug('isExistingInTimeouts', 'Timeouts not found. Creating...', 'red');
    sessionStorage.setItem("timeouts", JSON.stringify([] as TodosTable));
  }

  let tempItems: TodosTable = JSON.parse(sessionStorage.getItem("timeouts")!);

  if(!tempItems.find(item => {return(item.id === todo.id)})){
    tempItems!.push(todo);
    sessionStorage.setItem("timeouts", JSON.stringify(tempItems as TodosTable));
    return false;
  }else{
    const selected = tempItems.filter(item => {return item.id === todo.id});
    if(selected[0].deadline !== todo.deadline){
      debug('isExistingInTimeouts', 'Deadline not synced at: ' + todo.id);
      let itemIndex = tempItems.findIndex(item => item.id === todo.id);
      tempItems[itemIndex].deadline = todo.deadline;
      sessionStorage.setItem("timeouts", JSON.stringify(tempItems as TodosTable));
      return false;
    }else{
      return true;
    }
  }
}

export function registerExternalNotification(todo: TodoRow){
  (function loop(){
    if(isExistingInTimeouts(todo))
      return;

    var target = moment(todo.deadline)
    target.subtract(3, 'd')

    const timeout = Math.max(target.valueOf() - new Date().valueOf(), 0)
    const outdated = isOutdated(new Date(todo.deadline as string))

    if( timeout > 2147483647 ){
        window.setTimeout(loop, 2147483647)
    } else {
        //BUG:6
        const IntlFormatDeadline = new Intl.RelativeTimeFormat(RegionCode, { style: "long", numeric: "auto" });
        const stringDuration = getTimeLeft(moment(todo.deadline).unix())
        const timedOutMessage = window.setTimeout(function() {
          debug('registerExternalNotification', 'Sending notification for: ' + todo.id);

          sendNotification(
          {
            title: 
            !outdated ? ("This todo is about to expire " + 
              stringDuration)
              :
              "This todo is expired since " + 
              stringDuration
              , 
            body: todo.content!.replace(/<\/?[^>]+(>|$)/g, "")
          });
        }, timeout)
    }
    debug('Timeout Calculation', 'Calculated: ' + JSON.stringify(getDuration(timeout)) + " for " + todo.id)
    debug("NotificationHandler", "Registered timeout at:"  + [target, todo.id]);
  })()
}

function getDuration(milli: any){
  let minutes = Math.floor(milli / 60000);
  let hours = Math.round(minutes / 60);
  let days = Math.round(hours / 24);

  return (
    (days && {value: days, unit: 'days'}) ||
    (hours && {value: hours, unit: 'hours'}) ||
    {value: minutes, unit: 'minutes'}
  )
};

export function executeNotification(todosListContext: ITodosListContext, message: string, NotificationType: NotificationType, duration: number = 5000){
  (typeof todosListContext.notificationsSet === 'function') && createNotification(
    {content: message, type: NotificationType, duration: duration}, 
    todosListContext.notificationsSet
  )
}