import { UserButton } from "@clerk/clerk-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { useStreamChat } from "../hooks/useStreamChat";
import PageLoader from "../components/PageLoader";

import {
  Chat,
  Channel,
  ChannelList,
  MessageList,
  MessageInput,
  Thread,
  Window,
} from "stream-chat-react";

import "../styles/stream-chat-theme.css";
import { 
  HashIcon, 
  PlusIcon, 
  UsersIcon, 
  MessageCircle, 
  ArrowLeft,
  Settings,
  Phone,
  Video,
  Search,
  Bell,
  MoreHorizontal,
  User,
  Sparkles,
  ChevronDown,
  Zap,
  Shield,
  Crown
} from "lucide-react";
import CreateChannelModal from "../components/CreateChannelModal";
import CustomChannelPreview from "../components/CustomChannelPreview";
import UsersList from "../components/UsersList";
import CustomChannelHeader from "../components/CustomChannelHeader";

const HomePage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('channels');
  const [showUsersList, setShowUsersList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { chatClient, error, isLoading } = useStreamChat();

  // Debounced search to avoid excessive API calls
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Set active channel from URL params
  useEffect(() => {
    if (chatClient) {
      const channelId = searchParams.get("channel");
      if (channelId) {
        const channel = chatClient.channel("messaging", channelId);
        setActiveChannel(channel);
        if (window.innerWidth < 768) {
          setActiveTab('chat');
        }
      }
    }
  }, [chatClient, searchParams]);

  // Handle channel selection
  const handleChannelSelect = useCallback((channel) => {
    setActiveChannel(channel);
    setSearchParams({ channel: channel.id });
    if (window.innerWidth < 768) {
      setActiveTab('chat');
    }
  }, [setSearchParams]);

  // Handle back navigation on mobile
  const handleBackToChannels = useCallback(() => {
    setActiveTab('channels');
    setActiveChannel(null);
    setSearchParams({});
  }, [setSearchParams]);

  // Optimized channel filters
  const channelFilters = useMemo(() => ({
    type: 'messaging',
    members: { $in: [chatClient?.userID || ''] },
    ...(debouncedSearchQuery && {
      $or: [
        { name: { $autocomplete: debouncedSearchQuery } },
        { 'member.user.name': { $autocomplete: debouncedSearchQuery } }
      ]
    })
  }), [chatClient?.userID, debouncedSearchQuery]);

  if (error) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center p-8 bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap className="text-red-400 w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Connection Lost</h2>
          <p className="text-slate-400 mb-6 leading-relaxed">
            We're having trouble connecting to the chat service. Check your internet connection and try again.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
          >
            Reconnect
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !chatClient) return <PageLoader />;

  // Enhanced channel preview component
  const EnhancedChannelPreview = (props) => {
    const { channel, latestMessage, unread } = props;
    const isDM = channel.data?.member_count === 2 && channel.data?.id?.includes("user_");
    
    const otherUser = isDM ? Object.values(channel.state.members || {}).find(
      member => member.user.id !== chatClient.userID
    ) : null;

    const isActive = activeChannel?.id === channel.id;

    return (
      <div 
        onClick={() => handleChannelSelect(channel)}
        className={`group relative mx-3 mb-2 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
          isActive 
            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 shadow-lg shadow-blue-500/10' 
            : 'hover:bg-slate-700/40 border border-transparent'
        }`}
      >
        <div className="flex items-center space-x-3">
          {/* Enhanced Avatar */}
          <div className="relative flex-shrink-0">
            {isDM ? (
              <div className="relative">
                {otherUser?.user?.image ? (
                  <img
                    src={otherUser.user.image}
                    alt={otherUser.user.name || otherUser.user.id}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-600/50"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-slate-600/50">
                    <span className="text-white font-bold text-sm">
                      {(otherUser?.user?.name || otherUser?.user?.id || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {/* Enhanced online status */}
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-800 ${
                  otherUser?.user?.online ? 'bg-green-400' : 'bg-slate-500'
                }`} />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center ring-2 ring-slate-600/50">
                {channel.data?.private ? (
                  <Shield className="w-5 h-5 text-slate-300" />
                ) : (
                  <HashIcon className="w-5 h-5 text-slate-300" />
                )}
              </div>
            )}
          </div>

          {/* Channel Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold truncate transition-colors ${
                isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
              }`}>
                {isDM 
                  ? otherUser?.user?.name || otherUser?.user?.id || 'Unknown User'
                  : channel.data?.name || channel.data?.id
                }
              </h3>
              {unread > 0 && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center shadow-lg">
                  {unread > 99 ? '99+' : unread}
                </div>
              )}
            </div>
            {latestMessage && (
              <p className="text-slate-400 text-sm truncate mt-1">
                <span className="font-medium text-slate-300">
                  {latestMessage.user?.name || 'Someone'}:
                </span> {latestMessage.text || 'Message'}
              </p>
            )}
          </div>
        </div>

        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full" />
        )}
      </div>
    );
  };

  const ChannelsSidebar = () => (
    <div className="h-full bg-gradient-to-b from-slate-900 to-slate-900 border-r border-slate-700/50 flex flex-col">
      {/* Premium Header */}
      <div className="p-4 border-b border-slate-700/50">
    
        {/* Enhanced Search */}

      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600">
        {/* Conversations Section */}
        <div className="pt-6">
          <div className="flex items-center justify-between px-6 mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-slate-300 text-sm font-bold uppercase tracking-wider">
                Conversations
              </h3>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 group"
                title="Create Channel"
              >
                <PlusIcon size={16} className="group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>
          </div>
          
          {/* Channel List */}
          <div>
            <ChannelList
              filters={channelFilters}
              sort={{ 
                last_message_at: -1,
                updated_at: -1
              }}
              options={{
                limit: 25,
                presence: true,
                state: true,
                watch: true
              }}
              Preview={EnhancedChannelPreview}
              showChannelSearch={false}
              LoadingIndicator={() => (
                <div className="flex items-center justify-center py-12">
                  <div className="relative">
                    <div className="w-8 h-8 border-4 border-slate-600 rounded-full animate-spin"></div>
                    <div className="absolute top-0 left-0 w-8 h-8 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
                  </div>
                </div>
              )}
              EmptyStateIndicator={() => (
                <div className="text-center py-12 px-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-slate-300 font-semibold mb-2">No conversations yet</h3>
                  <p className="text-slate-500 text-sm mb-6">Start chatting with your team</p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105"
                  >
                    Create Channel
                  </button>
                </div>
              )}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 mt-6 border-t border-slate-700/30">
          <div className="space-y-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full flex items-center px-4 py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 rounded-xl transition-all duration-200 group border border-transparent hover:border-blue-400/20"
            >
              <PlusIcon size={18} className="mr-3 group-hover:rotate-90 transition-transform duration-200" />
              <span className="font-medium">Create Channel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ChatArea = () => (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-800 to-slate-900">
      {activeChannel ? (
        <Channel channel={activeChannel} key={activeChannel.id}>
          <Window>
            <CustomChannelHeader 
              isMobile={window.innerWidth < 768}
              onNavigateBack={handleBackToChannels}
            />
            <MessageList 
              threadList={false}
              hideDeletedMessage={true}
              messageActions={['edit', 'delete', 'flag', 'pin', 'reply']}
            />
            <MessageInput 
              focus={true}
              grow={true}
              maxRows={4}
              publishTypingEvent={true}
            />
          </Window>
          <Thread />
        </Channel>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-lg">
            {/* Enhanced welcome animation */}
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <MessageCircle size={60} className="text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Sparkles size={16} className="text-white" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">
              Welcome to Your Workspace
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Select a conversation from the sidebar to start chatting, or create a new channel to collaborate with your team.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <PlusIcon size={20} className="mx-auto mb-2 group-hover:rotate-90 transition-transform duration-200" />
                Create Channel
              </button>
              <button
                onClick={() => setShowUsersList(true)}
                className="group bg-slate-700/50 hover:bg-slate-600/50 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 border border-slate-600/50 hover:border-slate-500/50"
              >
                <User size={20} className="mx-auto mb-2" />
                Direct Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      <Chat client={chatClient}>
        {/* Desktop Layout */}
        <div className="hidden md:flex h-full">
          <div className="w-80 flex-shrink-0">
            <ChannelsSidebar />
          </div>
          <div className="flex-1">
            <ChatArea />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden h-full flex flex-col">
          <div className="flex-1 overflow-hidden">
            {activeTab === 'channels' ? (
              <ChannelsSidebar />
            ) : (
              <ChatArea />
            )}
          </div>

          {/* Enhanced Mobile Navigation */}
          <div className="bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50 safe-area-padding-bottom">
            <div className="flex h-20 px-4">
              <button
                onClick={() => setActiveTab('channels')}
                className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-all duration-300 rounded-2xl mx-2 ${
                  activeTab === 'channels' 
                    ? 'text-blue-400 bg-slate-800/50 shadow-lg' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="relative">
                  <HashIcon size={24} />
                  {activeTab === 'channels' && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  )}
                </div>
                <span className="text-xs font-semibold">Channels</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-all duration-300 rounded-2xl mx-2 ${
                  activeTab === 'chat' 
                    ? 'text-purple-400 bg-slate-800/50 shadow-lg' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="relative">
                  <MessageCircle size={24} />
                  {activeChannel && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse" />
                  )}
                </div>
                <span className="text-xs font-semibold">Chat</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modals */}
        {isCreateModalOpen && (
          <CreateChannelModal
            onClose={() => setIsCreateModalOpen(false)}
            onChannelCreated={(channel) => {
              handleChannelSelect(channel);
              setIsCreateModalOpen(false);
            }}
          />
        )}

        {showUsersList && (
          <UsersList
            onClose={() => setShowUsersList(false)}
            onUserSelect={(user) => {
              setShowUsersList(false);
            }}
          />
        )}
      </Chat>
    </div>
  );
};

export default HomePage;