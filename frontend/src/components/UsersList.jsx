import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { useChatContext } from "stream-chat-react";

import * as Sentry from "@sentry/react";

const UsersList = ({ activeChannel }) => {
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

  if (isLoading) return <div className="team-channel-list__message">Loading users...</div>;
  if (isError) return <div className="team-channel-list__message">Failed to load users</div>;
  if (!users.length) return <div className="team-channel-list__message">No other users found</div>;

  return (
    <div className="team-channel-list__users">
      {users.map((user) => {
        const channelId = [client.user.id, user.id].sort().join("-").slice(0, 64);
        const channel = client.channel("messaging", channelId, {
          members: [client.user.id, user.id],
        });
        const unreadCount = channel.countUnread();
        const isActive = activeChannel && activeChannel.id === channelId;

        const displayName = (user.name || user.id || "Unknown User").toString();
        const secondaryText =
          user.id && user.id !== displayName ? `@${user.id}` : user.online ? "Online" : "Offline";
        const buttonClassName = [
          "str-chat__channel-preview-messenger",
          "channel-preview",
          isActive ? "channel-preview--active" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={user.id}
            type="button"
            onClick={() => startDirectMessage(user)}
            className={buttonClassName}
          >
            <div className="channel-preview__avatar">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || user.id}
                  className="channel-preview__avatar-img"
                />
              ) : (
                <span className="channel-preview__avatar-fallback">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
              <span
                className={`channel-preview__status ${user.online
                  ? "channel-preview__status--online"
                  : "channel-preview__status--offline"
                  }`}
              />
            </div>

            <div className="channel-preview__info">
              <span className="channel-preview__name">{displayName}</span>
              {secondaryText && (
                <span className="channel-preview__subtext">{secondaryText}</span>
              )}
            </div>

            {unreadCount > 0 && (
              <span className="channel-preview__badge" aria-label={`${unreadCount} unread messages`}>
                {unreadCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default UsersList;
