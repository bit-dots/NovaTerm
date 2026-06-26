import { useState } from "react";
import ActivityBar, { type TabId } from "./components/ActivityBar";
import Sidebar from "./components/Sidebar";
import MainPanel from "./components/MainPanel";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("serial");

  return (
    <div className="flex h-screen flex-row bg-editor">
      <ActivityBar activeTab={activeTab} onTabChange={setActiveTab} />
      <Sidebar activeTab={activeTab} />
      <MainPanel />
    </div>
  );
}

export default App;
