import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { useChatContext } from "stream-chat-react";
import { CircleIcon, MessageSquareIcon } from "lucide-react";
import * as Sentry from "@sentry/react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const UsersList = ({ activeChannel, onSelectChannel }) => {
  const { client } = useChatContext();
  const [, setSearchParams] = useSearchParams();

  const fetchUsers = useCallback(async () => {
    if (!client?.user) return [];
    const response = await client.queryUsers(
      { id: { $ne: client.user.id } },
      { name: 1 },
      { limit: 40 }
    );
    return response.users.filter((user) => !user.id.startsWith("recording-"));
  }, [client]);

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users-list", client?.user?.id],
    queryFn: fetchUsers,
    enabled: !!client?.user,
    staleTime: 1000 * 60 * 5,
  });

  const startDirectMessage = async (targetUser) => {
    if (!targetUser || !client?.user) return;
    try {
      const channelId = [client.user.id, targetUser.id].sort().join("-").slice(0, 64);
      const channel = client.channel("messaging", channelId, {
        members: [client.user.id, targetUser.id],
      });
      await channel.watch();
      setSearchParams({ channel: channel.id });
      onSelectChannel?.(channel);
    } catch (error) {
      Sentry.captureException(error, {
        tags: { component: "UsersList" },
        extra: { targetUserId: targetUser?.id },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/10 px-3 py-2 text-sm text-muted-foreground">
        <MessageSquareIcon className="size-4 animate-pulse" />
        Loading teammates…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        Failed to load teammates
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/60 bg-muted/10 px-4 py-6 text-sm text-muted-foreground">
        <MessageSquareIcon className="size-5" />
        <span>No teammates available yet.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {users.map((user) => {
        const channelId = [client.user.id, user.id].sort().join("-").slice(0, 64);
        const channel = client.channel("messaging", channelId, {
          members: [client.user.id, user.id],
        });
        const unreadCount = channel.countUnread();
        const isActive = activeChannel && activeChannel.id === channelId;

        return (
          <button
            key={user.id}
            onClick={() => startDirectMessage(user)}
            className={cn(
              "flex w-full items-center justify-between rounded-2xl border border-transparent bg-muted/10 px-3 py-2 text-left transition-all hover:border-primary/40 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 md:px-4 md:py-3",
              isActive && "border-primary/60 bg-primary/10 shadow-lg shadow-primary/10"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || user.id}
                    className="size-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold uppercase text-primary">
                    {(user.name || user.id).charAt(0)}
                  </span>
                )}
                <CircleIcon
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 size-3 rounded-full",
                    user.online ? "text-green-500" : "text-muted-foreground/60"
                  )}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">{user.name || user.id}</span>
                <span className="text-xs text-muted-foreground">Direct message</span>
              </div>
            </div>

            {unreadCount > 0 ? (
              <Badge className="bg-primary text-primary-foreground">{unreadCount}</Badge>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};

export default UsersList;
