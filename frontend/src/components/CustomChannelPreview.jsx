import { HashIcon } from "lucide-react";

const CustomChannelPreview = ({ channel, setActiveChannel, activeChannel }) => {
  const isActive = activeChannel && activeChannel.id === channel.id;
  const isDM = channel?.data?.member_count === 2 && channel?.data?.id?.includes("user_");

  if (isDM) return null;

  const channelLabel = channel?.data?.name || channel?.data?.id || "Channel";

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
      </div>
    </button>
  );
};

export default CustomChannelPreview;
