"use client";
import { useAppStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppStore();
  return (
    <div className="p-4 lg:p-6 max-w-[700px] mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button variant="secondary" size="sm" onClick={markAllNotificationsRead}>Mark all read</Button>
      </div>
      <div className="space-y-3">
        {notifications.map(n=>(
          <Card key={n.id} className={`${!n.read ? "border-violet-500/30 bg-violet-500/5" : ""}`}>
            <CardContent className="p-4 flex gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${n.type==="booking" ? "bg-blue-500/20 text-blue-300" : n.type==="payment" ? "bg-emerald-500/20 text-emerald-300" : n.type==="offer" ? "bg-amber-500/20 text-amber-300" : "bg-white/10 text-white/60"}`}>
                {n.type==="booking" ? "📅" : n.type==="payment" ? "💰" : n.type==="horoscope" ? "🔮" : n.type==="chat" ? "💬" : "🔔"}
              </div>
              <div className="flex-1">
                <div className="text-white font-medium text-sm">{n.title}</div>
                <div className="text-white/60 text-sm mt-1">{n.message}</div>
                <div className="text-white/30 text-xs mt-2">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              {!n.read && <button onClick={()=>markNotificationRead(n.id)} className="text-violet-300 text-xs hover:text-white">Mark read</button>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
