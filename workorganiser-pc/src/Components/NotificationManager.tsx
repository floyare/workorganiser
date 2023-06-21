import { INotificationManager } from "../Interfaces/INotificationManager";
import "../Styles/SNotifications.scss"
import NotificationBox from "./NotificationBox";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const NotificationManager = ({notifications}: {notifications: INotificationManager}) => {
  const [animationParent] = useAutoAnimate({});
  return (  
    <div className="notification__container" ref={animationParent}>
      {notifications && notifications.map((notification) => {
        return <NotificationBox key={notification.key} content={notification.content} type={notification.type} duration={notification.duration}/>
      })} 
    </div>
  );
}
 
export default NotificationManager;