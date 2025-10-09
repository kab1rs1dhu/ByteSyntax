import { UserButton } from "@clerk/clerk-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useStreamChat } from "../hooks/useStreamChat";
import PageLoader from "../components/PageLoader";

import {
  Chat,
  Channel,
  ChannelList,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";

import "../styles/stream-chat-theme.css";
import { ArrowLeft, Hash, Menu, MessageSquare, UserCircle2, UsersRound } from "lucide-react";
import UsersList from "../components/UsersList";
import CustomChannelHeader from "../components/CustomChannelHeader";

const MOBILE_TABS = [
  { key: "channels", label: "Channels", icon: Hash },
  { key: "chat", label: "Chat", icon: MessageSquare },
];

const HomePage = () => {
  const [activeChannel, setActiveChannel] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileView, setMobileView] = useState("channels");
  const [isMobile, setIsMobile] = useState(false);

  const { chatClient, error, isLoading } = useStreamChat();

  // Determine mobile layout
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth <= 768);

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Sync active channel from URL
  useEffect(() => {
    if (!chatClient) return;

    const channelId = searchParams.get("channel");
    let isMounted = true;

    const setChannelFromParams = async () => {
      if (!channelId) return;
      try {
        const channel = chatClient.channel("messaging", channelId);
        await channel.watch();

        if (isMounted) {
          setActiveChannel(channel);
          if (isMobile) setMobileView("chat");
        }
      } catch (channelError) {
        console.error("Failed to load channel", channelError);
      }
    };

    setChannelFromParams();

    return () => {
      isMounted = false;
    };
  }, [chatClient, searchParams, isMobile]);

  // Preload most recent channel
  useEffect(() => {
    if (!chatClient || activeChannel) return;
    let isMounted = true;

    const loadInitialChannel = async () => {
      try {
        const channels = await chatClient.queryChannels(
          { members: { $in: [chatClient?.user?.id] }, type: "messaging" },
          { last_message_at: -1 },
          { limit: 1 }
        );

        if (isMounted && channels?.length) {
          const firstChannel = channels[0];
          await firstChannel.watch();
          setActiveChannel(firstChannel);
          setSearchParams({ channel: firstChannel.id }, { replace: true });
        }
      } catch (channelError) {
        console.error("Failed to fetch initial channel", channelError);
      }
    };

    loadInitialChannel();

    return () => {
      isMounted = false;
    };
  }, [chatClient, activeChannel, setSearchParams]);

  useEffect(() => {
    if (!isMobile) {
      setMobileView("channels");
    }
  }, [isMobile]);

  const channelFilters = useMemo(
    () => ({
      members: { $in: [chatClient?.user?.id] },
      type: "messaging",
    }),
    [chatClient?.user?.id]
  );

  const channelOptions = useMemo(
    () => ({
      state: true,
      watch: true,
      limit: 50,
    }),
    []
  );

  const getChannelMeta = useCallback(
    (channel) => {
      const members = Object.values(channel?.state?.members || {});
      const isDM =
        channel?.data?.member_count === 2 ||
        channel?.id?.includes("user_") ||
        channel?.data?.type === "direct";

      let badge = isDM ? "Direct Message" : "Team Channel";
      let title = channel?.data?.name || channel?.data?.id || "Untitled";
      let initials = title
        .split(/[\s_-]+/)
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join("");
      let avatar = null;

      if (isDM) {
        const otherMember = members.find((member) => member.user?.id !== chatClient?.user?.id);
        if (otherMember?.user) {
          title = otherMember.user.name || otherMember.user.id || title;
          badge = "Direct Message";
          avatar = otherMember.user.image || null;
          initials = (otherMember.user.name || otherMember.user.id || "?").charAt(0).toUpperCase();
        }
      }

      const lastMessage =
        channel?.state?.messages?.length > 0
          ? channel.state.messages[channel.state.messages.length - 1]
          : null;

      return {
        isDM,
        title,
        badge,
        avatar,
        initials,
        lastMessage,
      };
    },
    [chatClient?.user?.id]
  );

  const handleChannelSelect = useCallback(
    async (channel) => {
      if (!channel) return;
      try {
        await channel.watch();
      } catch (watchError) {
        console.error("Unable to watch channel", watchError);
      }

      setActiveChannel(channel);
      setSearchParams({ channel: channel.id });
      if (isMobile) setMobileView("chat");
    },
    [isMobile, setSearchParams]
  );

  const mobileChannelLabel = activeChannel?.data?.name || activeChannel?.data?.id || "Channel";

  const renderChannelPreview = useCallback(
    ({ channel }) => {
      const unreadCount = channel.countUnread();
      const isActive = activeChannel?.id === channel.id;
      const { isDM, title, badge, avatar, initials, lastMessage } = getChannelMeta(channel);

      const lastMessagePreview = lastMessage?.text || lastMessage?.attachments?.[0]?.title || "";

      return (
        <button
          onClick={() => handleChannelSelect(channel)}
          className={`w-full rounded-2xl border px-4 py-3 text-left shadow-sm transition-all ${
            isActive
              ? "border-blue-500/60 bg-slate-900 text-slate-50 shadow-lg shadow-blue-900/30"
              : "border-slate-900 bg-slate-950/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/90 text-sm font-semibold uppercase text-slate-200">
              {avatar ? (
                <img src={avatar} alt={title} className="h-10 w-10 rounded-xl object-cover" />
              ) : isDM ? (
                initials
              ) : (
                "#"
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-base font-semibold">{title}</span>
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-blue-500 px-2 text-xs font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                <span>{badge}</span>
                {!isDM && channel.data?.topic && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-slate-700" />
                    <span className="truncate text-[0.65rem] uppercase">{channel.data.topic}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {lastMessagePreview && (
            <p className="mt-2 line-clamp-2 text-sm text-slate-400">{lastMessagePreview}</p>
          )}
        </button>
      );
    },
    [activeChannel?.id, getChannelMeta, handleChannelSelect]
  );

  const renderChannelList = useCallback(
    ({ children, loading, error: listError }) => (
      <div className="space-y-2">
        {loading && (
          <div className="rounded-xl border border-slate-900 bg-slate-950/70 px-3 py-2 text-sm text-slate-400">
            Loading…
          </div>
        )}
        {listError && (
          <div className="rounded-xl border border-red-900/40 bg-red-900/20 px-3 py-2 text-sm text-red-300">
            Error loading channels
          </div>
        )}
        {children}
      </div>
    ),
    []
  );

  if (error) return <p className="p-6 text-center text-red-300">Something went wrong…</p>;
  if (isLoading || !chatClient) return <PageLoader />;

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      <Chat client={chatClient}>
        <div className="relative flex h-full w-full">
          {/* Desktop sidebar */}
          <aside
            className={`flex h-full flex-col border-r border-slate-900 bg-slate-950/95 backdrop-blur ${
              isMobile
                ? `absolute inset-0 z-20 flex flex-col ${
                    mobileView === "channels" ? "translate-x-0" : "-translate-x-full"
                  } transition-transform duration-200`
                : "w-80 flex-shrink-0"
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-900 px-4 py-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Logo" className="h-9 w-9 rounded-xl object-cover" />
                <div>
                  <p className="text-sm uppercase tracking-wide text-slate-500">Workspace</p>
                  <p className="text-lg font-semibold text-white">Byte Syntax</p>
                </div>
              </div>
              <UserButton appearance={{ elements: { userButtonOuterIdentifier: "hidden" } }} />
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 pb-28">
              <div className="space-y-6">
                <section className="space-y-3">
                  <div className="flex items-center justify-between text-slate-400">
                    <div className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-widest text-slate-500">
                      <Hash className="h-4 w-4" />
                      Channels
                    </div>
                    <Menu className="h-4 w-4" />
                  </div>
                  <ChannelList
                    filters={channelFilters}
                    options={channelOptions}
                    Preview={renderChannelPreview}
                    List={renderChannelList}
                  />
                </section>

                <section className="space-y-3 border-t border-slate-900 pt-5">
                  <div className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-widest text-slate-500">
                    <UsersRound className="h-4 w-4" />
                    Direct messages
                  </div>
                  <UsersList activeChannel={activeChannel} onChannelSelected={handleChannelSelect} />
                </section>
              </div>
            </div>
          </aside>

          {/* Chat area */}
          <main
            className={`flex h-full flex-1 flex-col bg-slate-950 ${
              isMobile && mobileView !== "chat" ? "hidden" : "flex"
            } ${isMobile ? "pb-20" : ""}`}
          >
            {isMobile && (
              <div className="flex items-center justify-between border-b border-slate-900 bg-slate-950/95 px-4 py-3">
                <button
                  onClick={() => setMobileView("channels")}
                  className="flex items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Channels
                </button>
                <div className="flex items-center gap-2">
                  <UserCircle2 className="h-4 w-4 text-slate-500" />
                  <span className="max-w-[160px] truncate text-sm font-semibold text-white">
                    {mobileChannelLabel}
                  </span>
                </div>
              </div>
            )}

            {activeChannel ? (
              <Channel channel={activeChannel}>
                <div className="flex h-full flex-1 flex-col lg:flex-row">
                  <Window>
                    <div className="flex h-full flex-col bg-slate-950">
                      <CustomChannelHeader
                        isMobile={isMobile}
                        onNavigateBack={isMobile ? () => setMobileView("channels") : undefined}
                      />
                      <div className="flex-1 overflow-hidden">
                        <MessageList />
                      </div>
                      <div className="border-t border-slate-900 bg-slate-950/95">
                        <MessageInput focus />
                      </div>
                    </div>
                  </Window>

                  {/* Desktop thread rail */}
                  <div className="hidden w-80 flex-col border-l border-slate-900 bg-slate-950/90 lg:flex">
                    <div className="border-b border-slate-900 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Thread
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <Thread />
                    </div>
                  </div>
                </div>
              </Channel>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center text-slate-400">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-slate-700">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-white">Select a conversation</p>
                  <p className="text-sm">Choose a channel or DM to start chatting.</p>
                </div>
              </div>
            )}
          </main>

          {/* Mobile tab bar */}
          {isMobile && (
            <div className="mobile-tabbar">
              {MOBILE_TABS.map(({ key, label, icon: Icon }) => {
                const isActive = mobileView === key;
                const disabled = key === "chat" && !activeChannel;

                return (
                  <button
                    key={key}
                    onClick={() => !disabled && setMobileView(key)}
                    disabled={disabled}
                    className={`mobile-tabbar__button ${isActive ? "mobile-tabbar__button--active" : ""} ${
                      disabled ? "mobile-tabbar__button--disabled" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Chat>
    </div>
  );
};

export default HomePage;
