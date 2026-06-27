import { useState, useEffect } from "react";
import ActivityBar, { type TabId } from "./components/ActivityBar";
import Sidebar from "./components/Sidebar";
import MainPanel from "./components/MainPanel";
import StatusBar from "./components/StatusBar";
import type { SerialConfig, AppSettings } from "./types";
import { DEFAULT_CONFIG, DEFAULT_SETTINGS } from "./types";
import "./App.css";

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem("settings");
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("serial");
  const [showSend, setShowSend] = useState(false);
  const [config, setConfig] = useState<SerialConfig>(DEFAULT_CONFIG);
  const [connected, setConnected] = useState(false);
  const [txCount, setTxCount] = useState(0);
  const [rxCount, setRxCount] = useState(0);
  const [dtrEnabled, setDtrEnabled] = useState(false);
  const [rtsEnabled, setRtsEnabled] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    document.documentElement.classList.toggle("light", settings.theme === "light");
  }, [settings.theme]);

  return (
    <div className="flex h-screen flex-col bg-editor">
      <div className="flex flex-1 flex-row overflow-hidden">
        <ActivityBar activeTab={activeTab} onTabChange={setActiveTab} />
        <Sidebar
          key={activeTab}
          activeTab={activeTab}
          config={config}
          onConfigChange={setConfig}
          connected={connected}
          onConnectChange={setConnected}
          dtrEnabled={dtrEnabled}
          onDtrChange={setDtrEnabled}
          rtsEnabled={rtsEnabled}
          onRtsChange={setRtsEnabled}
          settings={settings}
          onSettingsChange={setSettings}
        />
        <MainPanel
          showSend={showSend}
          onTxBytes={(n) => setTxCount((c) => c + n)}
          onRxBytes={(n) => setRxCount((c) => c + n)}
          maxLines={settings.maxLines}
          logFontSize={settings.logFontSize}
          onFontSizeChange={(size) => setSettings((s) => ({ ...s, logFontSize: size }))}
        />
      </div>
      <StatusBar
        showSend={showSend}
        onToggleSend={() => setShowSend(!showSend)}
        connected={connected}
        portName={config.port_name}
        baudRate={config.baud_rate}
        txCount={txCount}
        rxCount={rxCount}
        flowControl={config.flow_control}
        dtrEnabled={dtrEnabled}
        rtsEnabled={rtsEnabled}
      />
    </div>
  );
}

export default App;
