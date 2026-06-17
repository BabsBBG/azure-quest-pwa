import { ExternalLink, PlayCircle } from "lucide-react";
import type { VideoResource } from "../data/videos";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export function VideoCard({ video }: { video: VideoResource }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge className="bg-slate-950 text-white dark:bg-white dark:text-slate-950">{video.exam}</Badge>
            <Badge className="bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-100">{video.duration}</Badge>
          </div>
          <CardTitle>{video.title}</CardTitle>
          <p className="mt-1 text-sm font-black text-slate-500 dark:text-slate-400">{video.source}</p>
        </div>
        <PlayCircle className="h-8 w-8 text-sky-500" />
      </CardHeader>
      <CardContent>
        <p className="font-bold text-slate-600 dark:text-slate-300">{video.description}</p>
        <p className="text-sm font-black text-slate-500 dark:text-slate-400">Domain: {video.domain}</p>
        <Button asChild variant="hero" size="lg" className="w-full">
          <a href={video.url} target="_blank" rel="noreferrer">Open official resource <ExternalLink className="h-5 w-5" /></a>
        </Button>
      </CardContent>
    </Card>
  );
}
