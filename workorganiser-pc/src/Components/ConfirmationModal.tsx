import { IConfirmationModal } from "../Interfaces/IConfirmationModal";
import "../Styles/SConfirmationModal.scss"

const ConfirmationModal = (props: IConfirmationModal) => {
  return (
    <div className="modal__wrapper">
      <div className="modal__box">
        <h1>{props.title}</h1>
        <p>{props.content}</p>
        <div className="buttons">
          <button className={`btn ${props.confirmButtonClass}`} onClick={props.confirmCallback}>{props.confirmButton}</button>
          <button className="btn" onClick={props.backCallback}>Back</button>
        </div>
      </div>
    </div>
  );
}
 
export default ConfirmationModal;