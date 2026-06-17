import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Moon, Trash2, Volume2, Wand2, WifiOff } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Switch } from "../components/ui/switch";

export function Settings() {
  const settings = useAppStore((state) => state.settings);
  const setSettings = useAppStore((state) => state.setSettings);
  const exportData = useAppStore((state) => state.exportData);
  const resetLocalData = useAppStore((state) => state.resetLocalData);
  const [exported, setExported] = useState(false);

  async function downloadExport() {
    const json = await exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `azure-quest-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setExported(true);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Button asChild variant="ghost" size="sm"><Link to="/"><ArrowLeft className="h-4 w-4" /> Home</Link></Button>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-3xl">Settings</CardTitle>
            <p className="font-bold text-slate-500 dark:text-slate-400">Make it comfy. Keep it fast.</p>
          </div>
          <Wand2 className="h-8 w-8 text-violet-500" />
        </CardHeader>
        <CardContent>
          <SettingRow icon={<Moon />} title="Dark mode" hint="Cozy cyber cave" checked={settings.darkMode} onChange={(v) => void setSettings({ darkMode: v })} />
          <SettingRow icon={<Wand2 />} title="Reduce animations" hint="Less motion, same readiness" checked={settings.reduceAnimations} onChange={(v) => void setSettings({ reduceAnimations: v })} />
          <SettingRow icon={<WifiOff />} title="Low-bandwidth mode" hint="Simpler backgrounds and fewer effects" checked={settings.lowBandwidth} onChange={(v) => void setSettings({ lowBandwidth: v })} />
          <SettingRow icon={<Volume2 />} title="Sound effects" hint="Ready for optional future sounds" checked={settings.sound} onChange={(v) => void setSettings({ sound: v })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button onClick={() => void downloadExport()} variant="hero" size="lg"><Download className="h-5 w-5" /> Export progress</Button>
          <Button onClick={() => void resetLocalData()} variant="danger" size="lg"><Trash2 className="h-5 w-5" /> Reset local data</Button>
        </div>
        {exported ? <p className="mt-3 rounded-2xl bg-emerald-100 p-3 font-black text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100">Export downloaded</p> : null}
      </Card>
    </motion.div>
  );
}

function SettingRow({ icon, title, hint, checked, onChange }: { icon: ReactNode; title: string; hint: string; checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.5rem] bg-slate-100 p-4 dark:bg-white/10">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-950 dark:bg-slate-950 dark:text-white">{icon}</div>
        <div>
          <p className="font-black">{title}</p>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{hint}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} label={title} />
    </div>
  );
}
