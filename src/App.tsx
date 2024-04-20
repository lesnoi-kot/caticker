import Help from "./Help";
import Toolbar from "./Toolbar/Toolbar";
import Workspace from "./Workspace/Workspace";

import "./App.css";

function App() {
  return (
    <>
      <header className="my-6 text-5xl font-bold uppercase select-none">
        <p className="w-fit rotate-[3deg]">сделай</p>
        <p className="w-fit rotate-[-2deg]">стикер</p>
        <p className="w-fit rotate-[1deg]">с&nbsp;котами</p>
      </header>

      <div className="flex flex-col gap-8">
        <Workspace />
        <Toolbar />
      </div>

      <div className="mt-16">
        <Help />
      </div>
    </>
  );
}

export default App;
