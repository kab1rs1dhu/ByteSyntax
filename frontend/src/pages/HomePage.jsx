import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { UserButton } from "@clerk/clerk-react";
import {
  Chat,
  Channel,
  ChannelList,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { HashIcon, MessageSquareIcon, PlusIcon, UsersIcon } from "lucide-react";

import { useStreamChat } from "@/hooks/useStreamChat";
import PageLoader from "@/components/PageLoader";
import CreateChannelModal from "@/components/CreateChannelModal";
import CustomChannelPreview from "@/components/CustomChannelPreview";
import UsersList from "@/components/UsersList";
import CustomChannelHeader from "@/components/CustomChannelHeader";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const HomePage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);
  const [activeMobileTab, setActiveMobileTab] = useState("messages");
  const [searchParams, setSearchParams] = useSearchParams();

  const { chatClient, error, isLoading } = useStreamChat();

  useEffect(() => {
    if (!chatClient) return;
    const channelId = searchParams.get("channel");
    if (channelId) {
      const channel = chatClient.channel("messaging", channelId);
      setActiveChannel(channel);
    }
  }, [chatClient, searchParams]);

  const handleChannelSelect = (channel) => {
    if (!channel) return;
    setActiveChannel(channel);
    setSearchParams({ channel: channel.id });
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches) {
      setActiveMobileTab("messages");
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <div className="flex size-20 items-center justify-center rounded-full border border-border/60 bg-muted/20">
          <HashIcon className="size-8 text-destructive" />
        </div>
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          We couldn’t connect to the chat service. Please refresh or try again in a moment.
        </p>
        <Button onClick={() => window.location.reload()}>Try again</Button>
      </div>
    );
  }

  if (isLoading || !chatClient) return <PageLoader />;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-[10%] top-[-20%] h-[520px] w-[520px] rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-[20%] bottom-[-30%] h-[520px] w-[520px] rounded-full bg-violet-700/20 blur-3xl" />

      <Chat client={chatClient} theme="messaging dark">
        <div className="relative mx-auto flex h-[100dvh] max-w-[1600px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-10">
          <header className="flex items-center justify-between rounded-3xl border border-border/60 bg-background/60 px-5 py-4 shadow-floating backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-inner shadow-primary/20">
                <HashIcon className="size-5" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight text-foreground">Byte Syntax</p>
                <p className="text-sm text-muted-foreground">Collaborate with your team in real time.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                className="hidden items-center gap-2 bg-primary shadow-lg shadow-primary/30 hover:bg-primary/90 md:flex"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <PlusIcon className="size-4" />
                New channel
              </Button>
              <div className="rounded-full border border-border/60 bg-muted/20 p-1">
                <UserButton appearance={{ elements: { avatarBox: "size-10" } }} />
              </div>
            </div>
          </header>

          <div className="flex h-[calc(100dvh-7.25rem)] flex-1 overflow-hidden rounded-[2.25rem] border border-border/60 bg-background/70 shadow-floating backdrop-blur-2xl">
            <aside
              className={cn(
                "flex w-full flex-col gap-4 border-b border-border/60 p-4 transition md:w-[26rem] md:border-b-0 md:border-r",
                activeMobileTab === "channels" ? "flex" : "hidden md:flex"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                    Channels
                  </p>
                  <p className="text-xs text-muted-foreground/80">Stay on top of every thread</p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground hover:text-primary md:hidden"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <PlusIcon className="size-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-hidden rounded-2xl border border-border/50 bg-muted/10 p-2">
                <ChannelList
                  filters={{ members: { $in: [chatClient?.user?.id] } }}
                  options={{ state: true, watch: true }}
                  Preview={({ channel }) => (
                    <CustomChannelPreview
                      channel={channel}
                      activeChannel={activeChannel}
                      setActiveChannel={handleChannelSelect}
                    />
                  )}
                  List={({ children, loading, error }) => (
                    <ScrollArea className="h-full pr-2">
                      <div className="space-y-6">
                        <section className="space-y-3">
                          <header className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <HashIcon className="size-4" />
                            <span>Team channels</span>
                          </header>
                          {loading ? (
                            <div className="rounded-2xl border border-border/40 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
                              Loading channels…
                            </div>
                          ) : error ? (
                            <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                              We couldn’t load channels. Please refresh.
                            </div>
                          ) : (
                            <div className="space-y-2">{children}</div>
                          )}
                        </section>

                        <section className="space-y-3">
                          <header className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <UsersIcon className="size-4" />
                            <span>Direct messages</span>
                          </header>
                          <UsersList
                            activeChannel={activeChannel}
                            onSelectChannel={handleChannelSelect}
                          />
                        </section>
                      </div>
                    </ScrollArea>
                  )}
                />
              </div>
            </aside>

            <main
              className={cn(
                "flex flex-1 flex-col overflow-hidden",
                activeMobileTab === "messages" ? "flex" : "hidden md:flex"
              )}
            >
              {activeChannel ? (
                <Channel channel={activeChannel}>
                  <Window>
                    <CustomChannelHeader />
                    <div className="flex-1 overflow-hidden">
                      <MessageList
                        disableReactions
                        messageActions={["edit", "delete", "quote", "pin"]}
                      />
                    </div>
                    <div className="border-t border-border/60 bg-background/60 px-4 py-3 backdrop-blur-md">
                      <MessageInput grow />
                    </div>
                  </Window>
                  <Thread />
                </Channel>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                  <div className="flex size-16 items-center justify-center rounded-3xl border border-border/60 bg-muted/10">
                    <MessageSquareIcon className="size-6 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Choose a channel to start</h2>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Pick a conversation from the left column or create a brand-new space for your team.
                  </p>
                  <Button onClick={() => setActiveMobileTab("channels")} className="md:hidden">
                    Browse channels
                  </Button>
                </div>
              )}
            </main>
          </div>

          <nav className="fixed bottom-5 left-1/2 z-40 flex w-[90%] max-w-md -translate-x-1/2 items-center justify-between rounded-full border border-border/60 bg-background/90 px-4 py-2 shadow-2xl shadow-black/30 backdrop-blur-lg md:hidden">
            <button
              type="button"
              onClick={() => setActiveMobileTab("channels")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition",
                activeMobileTab === "channels"
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground"
              )}
            >
              <HashIcon className="size-4" />
              Channels
            </button>
            <button
              type="button"
              onClick={() => setActiveMobileTab("messages")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition",
                activeMobileTab === "messages"
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground"
              )}
            >
              <MessageSquareIcon className="size-4" />
              Messages
            </button>
          </nav>
        </div>

        <CreateChannelModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
      </Chat>
    </div>
  );
};

export default HomePage;
