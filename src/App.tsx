import "./App.css";
import Toolbar from "./Toolbar/Toolbar";
import Workspace from "./Workspace/Workspace";

function App() {
  return (
    <>
      <span id="titles1">сделай</span>
      <span id="titles2">стикер</span>
      <span id="titles3">с&nbsp;котами</span>
      <div className="workspace-wrapper">
        <Workspace />
        <Toolbar />
      </div>
    </>
  );
}

export default App;
