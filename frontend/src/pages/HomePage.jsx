import { UserButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useStreamChat } from "../hooks/useStreamChat";
import PageLoader from "../components/PageLoader";
import "../styles/home-page.css";

import {
  Chat,
  Channel,
  ChannelList,
  MessageList,
  MessageInput,
  Thread,
  Window,
} from "stream-chat-react";

import { HashIcon, PlusIcon, UsersIcon, MessageCircleIcon, Hash } from "lucide-react";
import CreateChannelModal from "../components/CreateChannelModal";
import CustomChannelPreview from "../components/CustomChannelPreview";
import UsersList from "../components/UsersList";
import CustomChannelHeader from "../components/CustomChannelHeader";
import ThreeBackground from "../components/ThreeBackground";

const HomePage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileActiveTab, setMobileActiveTab] = useState("channels"); // 'channels' or 'chat'

  const { chatClient, error, isLoading } = useStreamChat();

  // Set active channel from URL params
  useEffect(() => {
    if (chatClient) {
      const channelId = searchParams.get("channel");
      if (channelId) {
        const channel = chatClient.channel("messaging", channelId);
        setActiveChannel(channel);
        // Switch to chat view on mobile when channel is selected
        if (window.innerWidth < 768) {
          setMobileActiveTab('chat');
        }
      }
    }
  }, [chatClient, searchParams]);

  // Handle channel selection
  const handleChannelSelect = (channel) => {
    setActiveChannel(channel);
    setSearchParams({ channel: channel.id });
    // Switch to chat view on mobile when channel is selected
    if (window.innerWidth < 768) {
      setMobileActiveTab('chat');
    }
  };

  if (error) return <p>Something went wrong...</p>;
  if (isLoading || !chatClient) return <PageLoader />;

  // Welcome screen when no channel is selected
  const WelcomeScreen = () => (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-icon">
          <Hash className="size-20 text-blue-500" />
        </div>
        <h2 className="welcome-title">Welcome to Byte Syntax</h2>
        <p className="welcome-subtitle">
          Select a channel to start chatting or create a new one to get the conversation started.
        </p>
        <button 
          onClick={() => setIsCreateModalOpen(true)} 
          className="welcome-action-btn"
        >
          <PlusIcon className="size-5" />
          Create New Channel
        </button>
      </div>
    </div>
  );

  return (
    <div className="home-page">
      {/* Three.js Background Animation */}
      <ThreeBackground />

      <Chat client={chatClient}>
        {/* Desktop Layout */}
        <div className="desktop-layout">
          {/* Left Sidebar */}
          <div className="sidebar">
            <div className="sidebar-header">
              <div className="brand-container">
                <div className="brand-logo">
                  <span className="logo-symbol"></span>
                </div>
                <span className="brand-name">Byte Syntax</span>
              </div>
              <div className="user-button-wrapper">
                <UserButton />
              </div>
            </div>

            <div className="sidebar-content">
              {/* Create Channel Button */}
              <div className="create-channel-section">
                <button 
                  onClick={() => setIsCreateModalOpen(true)} 
                  className="create-channel-btn"
                >
                  <PlusIcon className="size-4" />
                  <span>Create Channel</span>
                </button>
              </div>

              {/* Channels Section */}
              <div className="channels-section">
                <div className="section-header">
                  <HashIcon className="size-4" />
                  <span>Channels</span>
                </div>
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
                />
              </div>

              {/* Direct Messages Section */}
              <div className="dm-section">
                <div className="section-header">
                  <UsersIcon className="size-4" />
                  <span>Direct Messages</span>
                </div>
                <UsersList activeChannel={activeChannel} />
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="main-chat">
            <ThreeBackground className="threejs-background--chat" />
            <div className="main-chat__content">
              {activeChannel ? (
                <Channel channel={activeChannel}>
                  <Window>
                    <CustomChannelHeader />
                    <MessageList />
                    <MessageInput />
                  </Window>
                  <Thread />
                </Channel>
              ) : (
                <WelcomeScreen />
              )}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="mobile-layout">
          <div className="mobile-content">
            {mobileActiveTab === 'channels' ? (
              // Channels Screen
              <div className="channels-screen">
                <div className="mobile-header">
                  <div className="brand-container">
                    <div className="brand-logo-mobile">
                      <span className="logo-symbol"></span>
                    </div>
                    <span className="brand-name">Byte Syntax</span>
                  </div>
                  <div className="header-actions">
                    <button 
                      onClick={() => setIsCreateModalOpen(true)} 
                      className="mobile-create-btn"
                    >
                      <PlusIcon className="size-5" />
                    </button>
                    <UserButton />
                  </div>
                </div>

                <div className="channels-content">
                  <div className="channels-list-mobile">
                    <div className="section-title">
                      <HashIcon className="size-5" />
                      <span>Channels</span>
                    </div>
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
                    />
                  </div>

                  <div className="dm-list-mobile">
                    <div className="section-title">
                      <UsersIcon className="size-5" />
                      <span>Direct Messages</span>
                    </div>
                    <UsersList activeChannel={activeChannel} />
                  </div>
                </div>
              </div>
            ) : (
              // Chat Screen
              <div className="chat-screen">
                <ThreeBackground className="threejs-background--chat" />
                <div className="chat-screen__content">
                  {activeChannel ? (
                    <Channel channel={activeChannel}>
                      <Window>
                        <CustomChannelHeader />
                        <MessageList />
                        <MessageInput />
                      </Window>
                      <Thread />
                    </Channel>
                  ) : (
                    <WelcomeScreen />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="bottom-nav">
            <button 
              className={`nav-btn ${mobileActiveTab === 'channels' ? 'active' : ''}`}
              onClick={() => setMobileActiveTab('channels')}
            >
              <div className="nav-icon">
                <HashIcon className="size-5" />
              </div>
              <span>Channels</span>
            </button>
            <button 
              className={`nav-btn ${mobileActiveTab === 'chat' ? 'active' : ''}`}
              onClick={() => setMobileActiveTab('chat')}
            >
              <div className="nav-icon">
                <MessageCircleIcon className="size-5" />
              </div>
              <span>Chat</span>
            </button>
          </div>
        </div>

        {/* Create Channel Modal */}
        {isCreateModalOpen && (
          <CreateChannelModal onClose={() => setIsCreateModalOpen(false)} />
        )}
      </Chat>
    </div>
  );
};

export default HomePage;
