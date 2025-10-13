import { UserButton } from "@clerk/clerk-react";
import { useEffect, useState, useRef } from "react";
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

const HomePage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileActiveTab, setMobileActiveTab] = useState('channels'); // 'channels' or 'chat'
  
  // Three.js background animation refs
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const rendererRef = useRef(null);
  const cleanupRef = useRef(null);

  const { chatClient, error, isLoading } = useStreamChat();

  // Three.js background animation (same as auth page)
  useEffect(() => {
    let renderer, scene, camera, particles;
    let raycaster, intersects;
    let pointer, INTERSECTED;
    const PARTICLE_SIZE = 20;

    const init = async () => {
      if (!containerRef.current) return;

      try {
        const THREE = await import('three');
        const container = containerRef.current;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 10000);
        camera.position.z = 250;

        let boxGeometry = new THREE.BoxGeometry(200, 200, 200, 16, 16, 16);
        boxGeometry.deleteAttribute('normal');
        boxGeometry.deleteAttribute('uv');

        const positionAttribute = boxGeometry.getAttribute('position');
        const colors = [];
        const sizes = [];
        const color = new THREE.Color();

        for (let i = 0, l = positionAttribute.count; i < l; i++) {
          const hue = 0.63 + 0.07 * (i / l);
          color.setHSL(hue, 0.9, 0.6);
          color.toArray(colors, i * 3);
          sizes[i] = PARTICLE_SIZE * 0.55;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', positionAttribute);
        geometry.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
          uniforms: {
            color: { value: new THREE.Color(0xffffff) },
            pointTexture: { value: createCircleTexture(THREE) },
            alphaTest: { value: 0.9 }
          },
          vertexShader: `
            attribute float size;
            attribute vec3 customColor;
            varying vec3 vColor;
            
            void main() {
              vColor = customColor;
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = size * (300.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            uniform vec3 color;
            uniform sampler2D pointTexture;
            uniform float alphaTest;
            varying vec3 vColor;
            
            void main() {
              gl_FragColor = vec4(color * vColor, 1.0);
              gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
              if (gl_FragColor.a < alphaTest) discard;
            }
          `
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x000000, 1);
        
        const canvas = renderer.domElement;
        canvas.style.pointerEvents = 'none';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';
        
        container.appendChild(canvas);
        rendererRef.current = renderer;

        raycaster = new THREE.Raycaster();
        pointer = new THREE.Vector2();

        const onPointerMove = (event) => {
          const rect = container.getBoundingClientRect();
          pointer.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
          pointer.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
        };

        const onWindowResize = () => {
          if (!camera || !renderer) return;
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };

        container.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('resize', onWindowResize);

        const animate = () => {
          if (!particles || !renderer || !scene || !camera) return;
          
          animationRef.current = requestAnimationFrame(animate);
          
          particles.rotation.x += 0.0005;
          particles.rotation.y += 0.001;

          const geometry = particles.geometry;
          const attributes = geometry.attributes;

          raycaster.setFromCamera(pointer, camera);
          intersects = raycaster.intersectObject(particles);

          if (intersects.length > 0) {
            if (INTERSECTED != intersects[0].index) {
              if (INTERSECTED !== null) {
                attributes.size.array[INTERSECTED] = PARTICLE_SIZE;
              }
              INTERSECTED = intersects[0].index;
              attributes.size.array[INTERSECTED] = PARTICLE_SIZE * 1.25;
              attributes.size.needsUpdate = true;
            }
          } else if (INTERSECTED !== null) {
            attributes.size.array[INTERSECTED] = PARTICLE_SIZE;
            attributes.size.needsUpdate = true;
            INTERSECTED = null;
          }

          renderer.render(scene, camera);
        };

        animate();

        const cleanup = () => {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
          }
          
          container.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('resize', onWindowResize);
          
          if (renderer && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
            renderer.dispose();
            renderer = null;
          }
          
          if (scene) {
            scene.traverse((object) => {
              if (object.geometry) object.geometry.dispose();
              if (object.material) {
                if (Array.isArray(object.material)) {
                  object.material.forEach(material => material.dispose());
                } else {
                  object.material.dispose();
                }
              }
            });
          }
        };

        cleanupRef.current = cleanup;
        return cleanup;

      } catch (error) {
        console.error('Failed to load Three.js:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="
              width: 100%;
              height: 100%;
              background: radial-gradient(circle, #1a1a2e 0%, #000000 100%);
              pointer-events: none;
              position: fixed;
              top: 0;
              left: 0;
              z-index: -1;
            "></div>
          `;
        }
        return () => {};
      }
    };

    const createCircleTexture = (THREE) => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      
      const context = canvas.getContext('2d');
      const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.2, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.4, 'rgba(255,255,255,0.8)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, 64, 64);
      
      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    init();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

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
      <div 
        ref={containerRef} 
        className="threejs-background"
      ></div>

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