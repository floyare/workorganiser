import { ISwitch } from "../Interfaces/ISwitch";
const Switch = (props: ISwitch) => {
  return (
    <div className="switch__container">
      <p>{props.text}</p>
      <label className="switch">
        <input type="checkbox" checked={props.variable} onChange={props.onChange} />
        <span className="slider round"></span>
      </label>
    </div>
  );
}

export default Switch;