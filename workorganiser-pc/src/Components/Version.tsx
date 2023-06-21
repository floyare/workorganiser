import packageJson from '../../package.json';

const Version = () => {
  return (
    <div className="version">
      <p>{packageJson.version}</p>
    </div>
  );
}
 
export default Version;