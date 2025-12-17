import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { notifications } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export function Notifications() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent/80"></span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle>Thông báo</CardTitle>
            <CardDescription>
              Bạn có {notifications.length} thông báo mới.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col gap-2">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border"
                >
                  <Bell className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
