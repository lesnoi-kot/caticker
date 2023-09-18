import Help from "./Help";
import Toolbar from "./Toolbar/Toolbar";
import Workspace from "./Workspace/Workspace";

import "./App.css";

function App() {
  return (
    <>
      <header className="my-4">
        <p>сделай</p>
        <p>стикер</p>
        <p>с&nbsp;котами</p>
      </header>

      <div className="flex flex-col gap-8">
        <Workspace />
        <Toolbar />
      </div>

      <Help />
    </>
  );
}

export default App;
