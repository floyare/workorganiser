const SmallErrorBox = ({error}: {error: string}) => {
  return (
    <div className="small__error_box">
      <p>{error}</p>
    </div>
  );
}
 
export default SmallErrorBox;