import { Icon } from "@iconify/react";
import { IErrorBox } from "../Interfaces/IErrorBox";

const ErrorBox = ({error, callback}: IErrorBox) => {
  return (
    <div className="error__container">
      <Icon icon="material-symbols:chat-error" />
      <h1>Error occurred!</h1>
      <p>{error}</p>
      <button onClick={callback}>Refresh</button>
    </div>
  );
}
 
export default ErrorBox;