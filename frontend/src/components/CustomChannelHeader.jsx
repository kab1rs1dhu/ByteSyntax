import { useEffect, useState } from "react";
import { useChannelStateContext } from "stream-chat-react";
import { useUser } from "@clerk/clerk-react";
import { HashIcon, LockIcon, PinIcon, UsersIcon, VideoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MembersModal from "@/components/MembersModal";
import InviteModal from "@/components/InviteModal";
import PinnedMessagesModal from "@/components/PinnedMessagesModal";

const CustomChannelHeader = () => {
  const { channel } = useChannelStateContext();
  const { user } = useUser();

  const [showMembers, setShowMembers] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showPinned, setShowPinned] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [loadingPinned, setLoadingPinned] = useState(false);

  const members = Object.values(channel.state.members);
  const memberCount = members.length;

  const otherUser = members.find((member) => member.user.id !== user.id);
  const isDM = channel.data?.member_count === 2 && channel.data?.id.includes("user_");

  const loadPinnedMessages = async () => {
    setLoadingPinned(true);
    try {
      const channelState = await channel.query();
      setPinnedMessages(channelState.pinned_messages);
      setShowPinned(true);
    } finally {
      setLoadingPinned(false);
    }
  };

  const handleVideoCall = async () => {
    if (!channel) return;
    const callUrl = `${window.location.origin}/call/${channel.id}`;
    await channel.sendMessage({
      text: `I've started a video call. Join me here: ${callUrl}`,
    });
  };

  useEffect(() => {
    setShowMembers(false);
    setShowInvite(false);
    setShowPinned(false);
  }, [channel?.id]);

  return (
    <>
      <div className="flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/70 px-4 backdrop-blur-md md:px-6">
        <div className="flex items-center gap-3 md:gap-4">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            {channel.data?.private ? <LockIcon className="size-4" /> : <HashIcon className="size-4" />}
          </span>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              {isDM && otherUser?.user?.image ? (
                <img
                  src={otherUser.user.image}
                  alt={otherUser.user.name || otherUser.user.id}
                  className="size-8 rounded-full object-cover"
                />
              ) : null}
              <p className="text-lg font-semibold text-foreground">
                {isDM ? otherUser?.user?.name || otherUser?.user?.id : channel.data?.name || channel.data?.id}
              </p>
              <Badge variant="secondary" className="hidden text-xs font-medium capitalize sm:inline-flex">
                {isDM ? "Direct message" : `${memberCount} members`}
              </Badge>
            </div>
            {channel.data?.description ? (
              <p className="text-xs text-muted-foreground">{channel.data.description}</p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowMembers(true)}
          >
            <UsersIcon className="size-4" />
            <span className="hidden text-sm md:inline-flex">{memberCount}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-primary hover:bg-primary/15 hover:text-primary"
            onClick={handleVideoCall}
            title="Start a video call"
          >
            <VideoIcon className="size-4" />
          </Button>
          {channel.data?.private ? (
            <Button
              type="button"
              size="sm"
              className="gap-2 bg-primary/80 shadow-lg hover:bg-primary"
              onClick={() => setShowInvite(true)}
            >
              Invite
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={loadingPinned}
            className="text-muted-foreground hover:text-primary"
            onClick={loadPinnedMessages}
          >
            <PinIcon className="size-4" />
          </Button>
        </div>
      </div>

      <MembersModal
        open={showMembers}
        onOpenChange={setShowMembers}
        members={members}
      />

      <InviteModal open={showInvite} onOpenChange={setShowInvite} channel={channel} />

      <PinnedMessagesModal
        open={showPinned}
        onOpenChange={setShowPinned}
        pinnedMessages={pinnedMessages}
      />
    </>
  );
};

export default CustomChannelHeader;
