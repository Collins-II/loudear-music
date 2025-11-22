"use client";

import { useState } from "react";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";

type ReleaseStatus = "scheduled" | "released" | "canceled";

interface ReleaseItem {
  id: string;
  title: string;
  type: "single" | "album" | "video";
  date: Date;
  status: ReleaseStatus;
}

const DUMMY_RELEASES: ReleaseItem[] = [
  { id: "1", title: "New Single: Sunrise", type: "single", date: new Date(), status: "scheduled" },
  { id: "2", title: "Album: Moonlight", type: "album", date: new Date(), status: "scheduled" },
  { id: "3", title: "Music Video: Horizon", type: "video", date: new Date(), status: "released" },
  { id: "4", title: "Single: Stardust", type: "single", date: new Date(), status: "canceled" },
  { id: "5", title: "Album: Eclipse", type: "album", date: new Date(), status: "scheduled" },
];

const TodoList = () => {
  const [releases, setReleases] = useState<ReleaseItem[]>(DUMMY_RELEASES);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);

  const toggleStatus = (id: string) => {
    setReleases((prev) =>
      prev.map((release) => {
        if (release.id === id) {
          const nextStatus: ReleaseStatus =
            release.status === "scheduled"
              ? "released"
              : release.status === "released"
              ? "canceled"
              : "scheduled";
          return { ...release, status: nextStatus };
        }
        return release;
      })
    );
  };

  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6">Scheduled Release Calendar</h1>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button className="w-full mb-4 justify-start">
            <CalendarIcon className="mr-2" />
            {date ? format(date, "PPP") : <span>Pick a release date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => {
              setDate(date);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      <ScrollArea className="max-h-[500px] mt-4 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {releases.map((release) => (
            <Card key={release.id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Checkbox
                    id={release.id}
                    checked={release.status === "released"}
                    onCheckedChange={() => toggleStatus(release.id)}
                  />
                  <div>
                    <p className="text-sm font-medium">{release.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {release.type.toUpperCase()} | {format(release.date, "PPP")}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    release.status === "scheduled"
                      ? "bg-blue-100 text-blue-800"
                      : release.status === "released"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {release.status.toUpperCase()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TodoList;
