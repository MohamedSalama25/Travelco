"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, Check, ExternalLink, MoreVertical, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { clientAxios } from "@/lib/api/axios";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useRouter } from "@/routing";
import { toast } from "sonner";
import { showSuccessToast } from "@/lib/utils/toast";

interface Notification {
    _id: string;
    title: string;
    message: string;
    isRead: boolean;
    link: string;
    createdAt: string;
}

export function NotificationCenter() {
    const t = useTranslations("common");
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const latestIdRef = useRef<string | null>(null);

    const fetchNotifications = useCallback(async (pageNum = 1, silent = false) => {
        try {
            if (!silent) setIsLoading(true);
            const response = await clientAxios.get(`/notifications?page=${pageNum}&limit=10`);
            
            if (response.data.success) {
                const newNotifications = response.data.data;
                
                if (pageNum === 1) {
                    // Check for new notifications to show toasts
                    if (newNotifications.length > 0) {
                        const currentLatestId = newNotifications[0]._id;
                        
                        // Show toasts if we have a previous latestId and the new one is newer
                        if (latestIdRef.current && currentLatestId > latestIdRef.current) {
                            const trulyNew = newNotifications.filter((n: Notification) => n._id > latestIdRef.current!);
                            
                            trulyNew.forEach((n: Notification) => {
                                toast(n.title, {
                                    description: n.message,
                                    position: "top-center",
                                    action: {
                                        label: t("viewMore"),
                                        onClick: () => handleNotificationClick(n)
                                    },
                                });
                            });
                        }
                        
                        // Update the latest seen ID
                        latestIdRef.current = currentLatestId;
                    }
                    setNotifications(newNotifications);
                } else {
                    setNotifications(prev => [...prev, ...newNotifications]);
                }
                setUnreadCount(response.data.unreadCount);
                setHasMore(response.data.pagination.page < response.data.pagination.pages);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, [t, router]);

    useEffect(() => {
        fetchNotifications(1);
        // Polling every 1 minute to match backend cron
        const interval = setInterval(() => fetchNotifications(1, true), 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = async (id: string) => {
        try {
            await clientAxios.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark read:", error);
        }
    };

    const markAllRead = async () => {
        try {
            await clientAxios.post(`/notifications/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all read:", error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }
        if (notification.link) {
            router.push(notification.link);
        }
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNotifications(nextPage);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" alignOffset={10} sideOffset={8} className="w-[380px] p-0 shadow-2xl border-primary/10">
                <DropdownMenuLabel className="flex items-center justify-between p-4 border-b bg-muted/30">
                    <div className="flex items-center gap-2 text-base">
                        <h4 className="font-semibold">{t("notifications")}</h4>
                        {unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 px-1.5 text-[10px] min-w-[20px] justify-center">
                                {unreadCount}
                            </Badge>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs h-7 gap-1 px-2 hover:bg-primary/5 hover:text-primary transition-colors font-normal"
                            onClick={markAllRead}
                        >
                            <Check className="h-3 w-3" />
                            {t("markAllRead")}
                        </Button>
                    )}
                </DropdownMenuLabel>
                <div className="h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-2">
                            <Bell className="h-10 w-10 opacity-20" />
                            <p className="text-sm">{t("noNotifications")}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((n) => (
                                <div
                                    key={n._id}
                                    className={`p-4 border-b last:border-0 cursor-pointer transition-all hover:bg-accent/50 relative overflow-hidden group ${!n.isRead ? 'bg-primary/5 border-r-4 border-r-primary' : ''}`}
                                    onClick={() => handleNotificationClick(n)}
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex flex-col gap-0.5 flex-1">
                                                <span className={`text-sm font-semibold leading-tight ${!n.isRead ? 'text-primary' : ''}`}>
                                                    {n.title}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                {!n.isRead && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:bg-primary/10"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(n._id);
                                                        }}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {!n.isRead && (
                                                    <div className="h-2 w-2 rounded-full bg-primary mt-1 shrink-0" />
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {n.message}
                                        </p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ar })}
                                            </span>
                                            {n.link && (
                                                <ExternalLink className="h-3 w-3 text-primary/40 group-hover:text-primary transition-colors" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {hasMore && (
                                <Button
                                    variant="ghost"
                                    className="w-full text-xs text-muted-foreground hover:bg-accent py-4 rounded-none h-auto border-t"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        loadMore();
                                    }}
                                    disabled={isLoading}
                                >
                                    {isLoading ? t("loading") : t("viewMore")}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
                <div className="p-2 border-t text-center bg-muted/10">
                    <Button variant="link" className="text-xs text-muted-foreground h-auto p-0 hover:text-primary">
                        {t("viewAllNotifications")}
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
