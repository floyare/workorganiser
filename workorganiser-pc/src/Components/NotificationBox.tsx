import { INotificationBox } from "../Interfaces/INotificationBox";
import "../Styles/SNotifications.scss"
import { Icon } from '@iconify/react';

const NotificationBox = (props: INotificationBox) => {
  return (
    <div className={`notification__box ${props.type}`}>
      <p><Icon icon="material-symbols:notification-important" /> {props.content}</p>
    </div>
  );
}
 
export default NotificationBox;