import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { ArrowLeft, LoaderIcon, VideoIcon } from "lucide-react";

import { getStreamToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!user,
  });

  useEffect(() => {
    const initCall = async () => {
      if (!tokenData?.token || !user || !callId) return;

      try {
        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user: {
            id: user.id,
            name: user.fullName,
            image: user.imageUrl,
          },
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", callId);
        await callInstance.join({ create: true });

        setClient(videoClient);
        setCall(callInstance);
      } catch (callError) {
        toast.error("We couldn’t connect you to the call. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();
  }, [tokenData, user, callId]);

  if (isConnecting || !isLoaded) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <div className="flex size-16 items-center justify-center rounded-full border border-border/60 bg-muted/10">
          <LoaderIcon className="size-7 animate-spin text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Connecting you to the room…</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -left-[30%] top-[-15%] h-[520px] w-[520px] rounded-full bg-primary/25 blur-[140px]" />
      <div className="pointer-events-none absolute -right-[15%] bottom-[-30%] h-[520px] w-[620px] rounded-full bg-violet-700/30 blur-[160px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">
        <header className="flex items-center justify-between rounded-3xl border border-border/60 bg-background/70 px-4 py-3 shadow-floating backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <VideoIcon className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Live team call</p>
                <p className="text-xs text-muted-foreground">Room #{callId}</p>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="uppercase tracking-wide">
            Beta
          </Badge>
        </header>

        <div className="flex flex-1 flex-col overflow-hidden rounded-[2.25rem] border border-border/60 bg-background/70 shadow-floating backdrop-blur-2xl">
          {client && call ? (
            <StreamVideo client={client}>
              <StreamCall call={call}>
                <CallContent />
              </StreamCall>
            </StreamVideo>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
              <div className="flex size-16 items-center justify-center rounded-3xl border border-border/60 bg-muted/10">
                <VideoIcon className="size-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">We couldn’t join the call</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Refresh the page or head back to choose a different call room.
              </p>
              <Button onClick={() => navigate("/")}>Return home</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  if (callingState === CallingState.LEFT) {
    navigate("/");
    return null;
  }

  return (
    <StreamTheme>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-hidden">
          <SpeakerLayout />
        </div>
        <div className="border-t border-border/60 bg-background/70 px-4 py-3 backdrop-blur-lg">
          <CallControls />
        </div>
      </div>
    </StreamTheme>
  );
};

export default CallPage;
