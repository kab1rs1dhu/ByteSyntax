import { HashIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const CustomChannelPreview = ({ channel, setActiveChannel, activeChannel }) => {
  const isActive = activeChannel && activeChannel.id === channel.id;
  const isDM = channel.data.member_count === 2 && channel.data.id.includes("user_");

  if (isDM) return null;

  const unreadCount = channel.countUnread();
  const lastMessage =
    channel.state.messages[channel.state.messages.length - 1]?.text ?? "Start the conversation";

  const channelName = channel.data?.name || channel.data?.id;

  return (
    <button
      onClick={() => setActiveChannel(channel)}
      className={cn(
        "w-full rounded-2xl border border-transparent bg-muted/10 p-3 text-left transition-all hover:border-primary/50 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 md:p-4",
        isActive && "border-primary/70 bg-primary/10 shadow-lg shadow-primary/10"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 flex size-8 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <HashIcon className="size-4" />
        </span>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <p className="line-clamp-1 text-sm font-semibold text-foreground">{channelName}</p>
            {unreadCount > 0 ? (
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {unreadCount}
              </span>
            ) : null}
          </div>
          <p className="line-clamp-2 text-xs text-muted-foreground">{lastMessage}</p>
        </div>
      </div>
    </button>
  );
};

export default CustomChannelPreview;
