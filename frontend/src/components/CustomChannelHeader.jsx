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
  MoreVertical,
  Phone
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
    try {
      const channelState = await channel.query();
      setPinnedMessages(channelState.pinned_messages || []);
      setShowPinnedMessages(true);
    } catch (error) {
      console.error("Error fetching pinned messages:", error);
    }
  };

  const handleVideoCall = async () => {
    try {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      await channel.sendMessage({
        text: `🎥 Video call started. Join here: ${callUrl}`,
      });
    } catch (error) {
      console.error("Error starting video call:", error);
    }
  };

  const handleBack = () => {
    if (onNavigateBack) onNavigateBack();
  };

  return (
    <>
      <div className={`flex items-center justify-between border-b border-gray-600 px-4 bg-gray-800 ${
        isMobile ? "h-14" : "h-16"
      }`}>
        {/* Left side - Channel info */}
        <div className="flex min-w-0 items-center gap-3">
          {isMobile && (
            <button
              onClick={handleBack}
              className="rounded-lg p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              aria-label="Back to channels"
              type="button"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          
          <div className="flex min-w-0 items-center gap-2">
            {/* Channel icon */}
            {isDM ? (
              otherUser?.user?.image ? (
                <img
                  src={otherUser.user.image}
                  alt={otherUser.user.name || otherUser.user.id}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-300">
                    {(otherUser?.user?.name || otherUser?.user?.id || "U").charAt(0).toUpperCase()}
                  </span>
                </div>
              )
            ) : channel.data?.private ? (
              <LockIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
            ) : (
              <HashIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
            )}

            {/* Channel name */}
            <div className="min-w-0">
              <h2 className="font-semibold text-white truncate">
                {channelLabel}
              </h2>
              {!isDM && memberCount > 0 && (
                <p className="text-xs text-gray-400">
                  {memberCount} member{memberCount !== 1 ? 's' : ''}
                </p>
              )}
              {isDM && otherUser?.user?.online !== undefined && (
                <p className="text-xs text-gray-400">
                  {otherUser.user.online ? 'Online' : 'Offline'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2">
          {/* Video call button */}
          <button
            onClick={handleVideoCall}
            className="rounded-lg p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            title="Start video call"
          >
            <VideoIcon className="h-5 w-5" />
          </button>

          {/* Phone call button (mobile only) */}
          {isMobile && (
            <button
              onClick={handleVideoCall}
              className="rounded-lg p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="Start call"
            >
              <Phone className="h-5 w-5" />
            </button>
          )}

          {/* Members button (desktop only) */}
          {!isMobile && !isDM && (
            <button
              onClick={() => setShowMembers(true)}
              className="rounded-lg p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="View members"
            >
              <UsersIcon className="h-5 w-5" />
            </button>
          )}

          {/* Pinned messages button (desktop only) */}
          {!isMobile && (
            <button
              onClick={handleShowPinned}
              className="rounded-lg p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="Pinned messages"
            >
              <PinIcon className="h-5 w-5" />
            </button>
          )}

          {/* More options (mobile) or Invite (desktop) */}
          {isMobile ? (
            <button
              className="rounded-lg p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="More options"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          ) : !isDM && (
            <button
              onClick={() => setShowInvite(true)}
              className="rounded-lg p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="Invite members"
            >
              <UsersIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
        />
      )}

      {showMembers && (
        <MembersModal
          onClose={() => setShowMembers(false)}
        />
      )}

      {showPinnedMessages && (
        <PinnedMessagesModal
          messages={pinnedMessages}
          onClose={() => setShowPinnedMessages(false)}
        />
      )}
    </>
  );
};

export default CustomChannelHeader;