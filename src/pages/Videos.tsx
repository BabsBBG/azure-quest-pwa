import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Film } from "lucide-react";
import { videos } from "../data/videos";
import { VideoCard } from "../components/VideoCard";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

type Filter = "all" | "SC-300" | "AZ-500" | "SC-500";

export function Videos() {
  const [filter, setFilter] = useState<Filter>("all");
  const rows = useMemo(() => filter === "all" ? videos : videos.filter((video) => video.exam === filter), [filter]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <Card className="bg-slate-950 text-white dark:bg-white dark:text-slate-950">
        <CardHeader>
          <div>
            <Badge className="mb-3 bg-sky-400 text-slate-950">Video Library</Badge>
            <CardTitle className="text-3xl">Official learning videos</CardTitle>
            <p className="mt-2 font-bold opacity-75">Microsoft Learn and official Microsoft YouTube resources in one focused library.</p>
          </div>
          <Film className="h-10 w-10" />
        </CardHeader>
      </Card>
      <div className="flex flex-wrap gap-2">
        {(["all", "SC-300", "AZ-500", "SC-500"] as const).map((item) => <Button key={item} onClick={() => setFilter(item)} variant={filter === item ? "default" : "soft"} size="sm">{item === "all" ? "All" : item}</Button>)}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{rows.map((video) => <VideoCard key={video.id} video={video} />)}</div>
    </motion.div>
  );
}
