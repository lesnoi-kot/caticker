import Help from "./Help";
import Toolbar from "./Toolbar/Toolbar";
import Workspace from "./Workspace/Workspace";

import "./App.css";

function App() {
  return (
    <>
      {/* <span id="titles1">сделай</span>
      <span id="titles2">стикер</span>
      <span id="titles3">с&nbsp;котами</span> */}
      <div className="workspace-wrapper">
        <Workspace />
        <Toolbar />
      </div>
      <Help />
    </>
  );
}

export default App;
