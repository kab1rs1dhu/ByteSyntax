import { useMemo, useState } from "react";
import { useChannelStateContext } from "stream-chat-react";
import { useUser } from "@clerk/clerk-react";
import {
  ArrowLeft,
  HashIcon,
  LockIcon,
  PinIcon,
  UsersIcon,
  VideoIcon,
} from "lucide-react";
import MembersModal from "./MembersModal";
import PinnedMessagesModal from "./PinnedMessagesModal";
import InviteModal from "./InviteModal";

const CustomChannelHeader = ({ isMobile = false, onNavigateBack }) => {
  const { channel } = useChannelStateContext();
  const { user } = useUser();

  const members = Object.values(channel.state.members || {});
  const memberCount = members.length;

  const [showInvite, setShowInvite] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);

  const isDM = useMemo(() => {
    if (!channel?.data) return false;
    return channel.data?.member_count === 2 && channel.data?.id?.includes("user_");
  }, [channel?.data]);

  const otherUser = useMemo(() => {
    if (!user) return null;
    return members.find((member) => member.user.id !== user.id);
  }, [members, user]);

  const channelLabel = isDM
    ? otherUser?.user?.name || otherUser?.user?.id
    : channel?.data?.name || channel?.data?.id;

  const handleShowPinned = async () => {
    const channelState = await channel.query();
    setPinnedMessages(channelState.pinned_messages);
    setShowPinnedMessages(true);
  };

  const handleVideoCall = async () => {
    const callUrl = `${window.location.origin}/call/${channel.id}`;
    await channel.sendMessage({
      text: `I've started a video call. Join me here: ${callUrl}`,
    });
  };

  const handleBack = () => {
    if (onNavigateBack) onNavigateBack();
  };

  return (
    <div
      className={`flex items-center justify-between border-b border-slate-900 px-4 ${
        isMobile ? "bg-slate-950/95 py-3" : "bg-slate-950/80 py-4 backdrop-blur"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        {isMobile && (
          <button
            onClick={handleBack}
            className="rounded-lg border border-slate-800 p-2 text-slate-400"
            aria-label="Back to channels"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="flex min-w-0 items-center gap-2">
          {channel.data?.private ? (
            <LockIcon className="h-4 w-4 text-slate-500" />
          ) : (
            <HashIcon className="h-4 w-4 text-slate-500" />
          )}

          {isDM && otherUser?.user?.image && (
            <img
              src={otherUser.user.image}
              alt={otherUser.user.name || otherUser.user.id}
              className="h-7 w-7 rounded-full object-cover"
            />
          )}

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{channelLabel}</p>
            {!isDM && (
              <span className="text-xs uppercase tracking-wide text-slate-500">
                #{channel?.data?.id}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="inline-flex items-center gap-1 rounded-lg border border-slate-800 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400 hover:border-slate-600"
          onClick={() => setShowMembers(true)}
        >
          <UsersIcon className="h-4 w-4" />
          {memberCount}
        </button>

        <button
          className="rounded-lg border border-slate-800 p-2 text-slate-300 hover:border-slate-600 hover:text-white"
          onClick={handleVideoCall}
          title="Start Video Call"
        >
          <VideoIcon className="h-4 w-4" />
        </button>

        {channel.data?.private && (
          <button
            className="rounded-lg border border-blue-500 bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white hover:bg-blue-500"
            onClick={() => setShowInvite(true)}
          >
            Invite
          </button>
        )}

        <button
          className="rounded-lg border border-slate-800 p-2 text-slate-300 hover:border-slate-600 hover:text-white"
          onClick={handleShowPinned}
        >
          <PinIcon className="h-4 w-4" />
        </button>
      </div>

      {showMembers && (
        <MembersModal members={members} onClose={() => setShowMembers(false)} />
      )}

      {showPinnedMessages && (
        <PinnedMessagesModal
          pinnedMessages={pinnedMessages}
          onClose={() => setShowPinnedMessages(false)}
        />
      )}

      {showInvite && <InviteModal channel={channel} onClose={() => setShowInvite(false)} />}
    </div>
  );
};

export default CustomChannelHeader;
