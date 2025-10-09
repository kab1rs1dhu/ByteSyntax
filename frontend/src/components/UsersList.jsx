import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { useChatContext } from "stream-chat-react";

import * as Sentry from "@sentry/react";
import { CircleIcon } from "lucide-react";

const UsersList = ({ activeChannel, onChannelSelected = () => {} }) => {
  const { client } = useChatContext();
  const [_, setSearchParams] = useSearchParams();

  const fetchUsers = useCallback(async () => {
    if (!client?.user) return;

    const response = await client.queryUsers(
      { id: { $ne: client.user.id } },
      { name: 1 },
      { limit: 20 }
    );

    const usersOnly = response.users.filter((user) => !user.id.startsWith("recording-"));

    return usersOnly;
  }, [client]);

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users-list", client?.user?.id],
    queryFn: fetchUsers,
    enabled: !!client?.user,
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  // staleTime
  // what it does: tells React Query the data is "fresh" for 5 minutes
  // behavior: during these 5 minutes, React Query WON'T refetch the data automatically

  const startDirectMessage = async (targetUser) => {
    if (!targetUser || !client?.user) return;

    try {
      //  bc stream does not allow channelId to be longer than 64 chars
      const channelId = [client.user.id, targetUser.id].sort().join("-").slice(0, 64);
      const channel = client.channel("messaging", channelId, {
        members: [client.user.id, targetUser.id],
      });
      await channel.watch();
      setSearchParams({ channel: channel.id });
      onChannelSelected(channel);
    } catch (error) {
      console.log("Error creating DM", error),
        Sentry.captureException(error, {
          tags: { component: "UsersList" },
          extra: {
            context: "create_direct_message",
            targetUserId: targetUser?.id,
          },
        });
    }
  };

  if (isLoading)
    return (
      <div className="rounded-xl border border-slate-900 bg-slate-950/75 px-3 py-3 text-[0.7rem] font-semibold uppercase tracking-widest text-slate-500">
        Loading users…
      </div>
    );
  if (isError)
    return (
      <div className="rounded-xl border border-red-900/40 bg-red-900/25 px-3 py-3 text-sm text-red-200">
        Failed to load users
      </div>
    );
  if (!users.length)
    return (
      <div className="rounded-xl border border-slate-900 bg-slate-950/75 px-3 py-3 text-sm text-slate-400">
        No teammates found
      </div>
    );

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
            className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-all ${
              isActive
                ? "border-blue-500/60 bg-slate-900 text-slate-50 shadow-lg shadow-blue-900/30"
                : "border-slate-900 bg-slate-950/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <div className="relative h-11 w-11 flex-shrink-0">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || user.id}
                  className="h-11 w-11 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-base font-semibold uppercase text-white">
                  {(user.name || user.id).charAt(0).toUpperCase()}
                </div>
              )}

              <CircleIcon
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 ${
                  user.online ? "text-emerald-400" : "text-slate-500"
                }`}
                fill="currentColor"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold tracking-tight">
                {user.name || user.id}
              </div>
              <p className="truncate text-xs text-slate-500">
                {user.online ? "Active now" : "Last seen recently"}
              </p>
            </div>

            {unreadCount > 0 && (
              <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-blue-500 px-2 text-xs font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default UsersList;
