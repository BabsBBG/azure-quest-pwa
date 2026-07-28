import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Moon, Trash2, Volume2, Wand2, WifiOff } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { useAuth } from "../hooks/useAuth";
import { deleteCloudLearningData, exportCloudData } from "../lib/cloudSync";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { PRODUCT_NAME } from "../lib/brand";

export function Settings() {
  const auth = useAuth();
  const settings = useAppStore((state) => state.settings);
  const setSettings = useAppStore((state) => state.setSettings);
  const exportData = useAppStore((state) => state.exportData);
  const resetLocalData = useAppStore((state) => state.resetLocalData);
  const [exported, setExported] = useState(false);
  const [cloudMessage, setCloudMessage] = useState<string | null>(null);
  const [cloudBusy, setCloudBusy] = useState(false);

  async function downloadExport() {
    const json = await exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `praxisgrid-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setExported(true);
  }

  async function downloadCloudExport() {
    setCloudBusy(true);
    setCloudMessage(null);
    const result = await exportCloudData();
    if (!result.ok || !result.data) {
      setCloudMessage(typeof result.error === "string" ? result.error : "Cloud export is unavailable right now.");
      setCloudBusy(false);
      return;
    }
    const json = JSON.stringify(result.data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `praxisgrid-cloud-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setCloudMessage("Cloud export downloaded.");
    setCloudBusy(false);
  }

  async function deleteCloudData() {
    const confirmed = window.confirm("Delete cloud learning data, repository imports, Project Intelligence analyses, assessment recovery, and interview recovery for this signed-in account? Your sign-in profile stays active.");
    if (!confirmed) return;
    setCloudBusy(true);
    setCloudMessage(null);
    const result = await deleteCloudLearningData();
    setCloudMessage(result.ok ? "Cloud learning and repository analysis data deleted. Local data on this device was not reset." : typeof result.error === "string" ? result.error : "Cloud delete is unavailable right now.");
    setCloudBusy(false);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Button asChild variant="ghost" size="sm"><Link to="/"><ArrowLeft className="h-4 w-4" /> Home</Link></Button>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-3xl">Settings</CardTitle>
            <p className="font-semibold text-[var(--aq-muted)]">Control {PRODUCT_NAME} preferences, accessibility, and local data.</p>
          </div>
          <Wand2 className="h-8 w-8 text-[var(--aq-blue-600)]" />
        </CardHeader>
        <CardContent>
          <SettingRow icon={<Moon />} title="Dark mode" hint="Reduce glare for long study sessions" checked={settings.darkMode} onChange={(v) => void setSettings({ darkMode: v })} />
          <SettingRow icon={<Wand2 />} title="Reduce animations" hint="Less motion, same progress tracking" checked={settings.reduceAnimations} onChange={(v) => void setSettings({ reduceAnimations: v })} />
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
        {exported ? <p className="aq-subtle-panel mt-3 p-3 font-semibold">Export downloaded</p> : null}
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Cloud Privacy</CardTitle>
            <p className="font-semibold text-[var(--aq-muted)]">Export or delete account-owned cloud learning data and repository analysis. This does not delete your Supabase sign-in account.</p>
          </div>
        </CardHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button onClick={() => void downloadCloudExport()} variant="soft" size="lg" disabled={!auth.user || cloudBusy}><Download className="h-5 w-5" /> Export cloud data</Button>
          <Button onClick={() => void deleteCloudData()} variant="danger" size="lg" disabled={!auth.user || cloudBusy}><Trash2 className="h-5 w-5" /> Delete cloud learning data</Button>
        </div>
        {!auth.user ? <p className="aq-subtle-panel mt-3 p-3 text-sm font-semibold">Sign in to manage cloud data tied to your account.</p> : null}
        {cloudMessage ? <p className="aq-subtle-panel mt-3 p-3 text-sm font-semibold">{cloudMessage}</p> : null}
      </Card>
    </motion.div>
  );
}

function SettingRow({ icon, title, hint, checked, onChange }: { icon: ReactNode; title: string; hint: string; checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <div className="aq-row-card flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-md border border-[var(--aq-border)] bg-[var(--aq-blue-50)] text-[var(--aq-blue-700)] dark:bg-[#081d38] dark:text-[var(--aq-ink)]">{icon}</div>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm font-semibold text-[var(--aq-muted)]">{hint}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} label={title} />
    </div>
  );
}
