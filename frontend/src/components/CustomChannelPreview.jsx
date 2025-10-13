import { HashIcon } from "lucide-react";

const CustomChannelPreview = ({ channel, setActiveChannel, activeChannel }) => {
  const isActive = activeChannel && activeChannel.id === channel.id;
  const isDM = channel?.data?.member_count === 2 && channel?.data?.id?.includes("user_");

  if (isDM) return null;

  const unreadCount = channel.countUnread();
  const channelLabel = channel?.data?.name || channel?.data?.id || "Channel";
  const memberCount = channel?.data?.member_count;
  const subtitle = channel?.data?.description || (memberCount ? `${memberCount} member${memberCount === 1 ? "" : "s"}` : null);

  const buttonClassName = [
    "str-chat__channel-preview-messenger",
    "channel-preview",
    isActive ? "channel-preview--active" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      onClick={() => setActiveChannel(channel)}
      className={buttonClassName}
    >
      <span className="channel-preview__icon" aria-hidden="true">
        <HashIcon className="channel-preview__icon-svg" />
      </span>

      <div className="channel-preview__info">
        <span className="channel-preview__name">{channelLabel}</span>
        {subtitle && <span className="channel-preview__subtext">{subtitle}</span>}
      </div>

      {unreadCount > 0 && (
        <span className="channel-preview__badge" aria-label={`${unreadCount} unread messages`}>
          {unreadCount}
        </span>
      )}
    </button>
  );
};

export default CustomChannelPreview;
