import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Bell } from "lucide-react";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setNotifications(data || []);
    };

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleOpen = async () => {
    setOpen(!open);

    // Mark all as read when opened
    if (!open && unreadCount > 0) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-slate-100 transition"
      >
        <span className="text-xl text-slate-600">
          <Bell />
        </span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 z-50">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm">
              Notifications
            </h3>
          </div>
          {notifications.length === 0 ? (
            <p className="text-slate-400 text-sm px-4 py-4">
              No notifications yet.
            </p>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`px-4 py-3 border-b border-slate-50 text-sm ${
                    !n.is_read ? "bg-blue-50" : ""
                  }`}
                >
                  <p className="text-slate-700">{n.message}</p>
                  <p className="text-slate-400 text-xs mt-1">
                    {new Date(n.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
