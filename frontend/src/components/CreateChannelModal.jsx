import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useChatContext } from "stream-chat-react";
import * as Sentry from "@sentry/react";
import toast from "react-hot-toast";
import { AlertCircleIcon, HashIcon, LockIcon, UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CHANNEL_TYPES = [
  {
    id: "public",
    title: "Public",
    description: "Everyone in the workspace can discover and join this channel.",
    icon: HashIcon,
  },
  {
    id: "private",
    title: "Private",
    description: "Only invited teammates can find and access this channel.",
    icon: LockIcon,
  },
];

function normalizeChannelId(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 20);
}

const CreateChannelModal = ({ open, onOpenChange }) => {
  const [channelName, setChannelName] = useState("");
  const [channelType, setChannelType] = useState("public");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [, setSearchParams] = useSearchParams();

  const { client, setActiveChannel } = useChatContext();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!client?.user) return;
      setLoadingUsers(true);
      try {
        const response = await client.queryUsers(
          { id: { $ne: client.user.id } },
          { name: 1 },
          { limit: 100 }
        );
        const filtered = response.users.filter((user) => !user.id.startsWith("recording-"));
        setUsers(filtered || []);
      } catch (fetchError) {
        Sentry.captureException(fetchError, {
          tags: { component: "CreateChannelModal" },
          extra: { context: "fetch_users_for_channel" },
        });
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [client, open]);

  useEffect(() => {
    if (channelType === "public") {
      setSelectedMembers(users.map((user) => user.id));
    } else {
      setSelectedMembers([]);
    }
  }, [channelType, users]);

  const channelIdPreview = useMemo(() => {
    if (!channelName) return "";
    return normalizeChannelId(channelName);
  }, [channelName]);

  const validateChannelName = (name) => {
    if (!name.trim()) return "Channel name is required";
    if (name.length < 3) return "Channel name must be at least 3 characters";
    if (name.length > 22) return "Channel name must be less than 22 characters";
    return "";
  };

  const handleMemberToggle = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((memberId) => memberId !== id) : [...prev, id]
    );
  };

  const closeModal = () => {
    onOpenChange?.(false);
    setTimeout(() => {
      setChannelName("");
      setDescription("");
      setChannelType("public");
      setSelectedMembers([]);
      setError("");
    }, 200);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateChannelName(channelName);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (isCreating || !client?.user) return;

    setIsCreating(true);
    setError("");

    try {
      const channelId = normalizeChannelId(channelName);
      const channelData = {
        name: channelName.trim(),
        created_by_id: client.user.id,
        members: [
          client.user.id,
          ...(channelType === "public" ? users.map((user) => user.id) : selectedMembers),
        ],
      };

      if (description) channelData.description = description;
      if (channelType === "private") {
        channelData.private = true;
        channelData.visibility = "private";
      } else {
        channelData.visibility = "public";
        channelData.discoverable = true;
      }

      const channel = client.channel("messaging", channelId, channelData);
      await channel.watch();
      setActiveChannel(channel);
      setSearchParams({ channel: channelId });
      toast.success(`Channel “${channelName}” created successfully`);
      closeModal();
    } catch (creationError) {
      toast.error("Something went wrong while creating the channel");
      Sentry.captureException(creationError, {
        tags: { action: "create_channel" },
        extra: { channelName, channelType },
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card/95">
        <DialogHeader>
          <DialogTitle>Create a channel</DialogTitle>
          <DialogDescription className="text-base">
            Bring the right people together. Channels help you focus conversations by topic, team,
            or project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {error ? (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircleIcon className="size-4" />
              <span>{error}</span>
            </div>
          ) : null}

          <div className="grid gap-3">
            <Label htmlFor="channelName" className="text-foreground">
              Channel name
            </Label>
            <div className="relative">
              <HashIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="channelName"
                value={channelName}
                onChange={(event) => {
                  const value = event.target.value;
                  setChannelName(value);
                  setError(validateChannelName(value));
                }}
                placeholder="e.g. marketing"
                className={cn("pl-9 text-base", error && "border-destructive/80")}
                maxLength={22}
                autoFocus
              />
            </div>
            {channelIdPreview ? (
              <p className="text-sm text-muted-foreground">
                Channel ID will be <Badge variant="secondary">#{channelIdPreview}</Badge>
              </p>
            ) : null}
          </div>

          <div className="grid gap-3">
            <Label className="text-foreground">Channel visibility</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {CHANNEL_TYPES.map(({ id, title, description, icon: Icon }) => {
                const isActive = channelType === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setChannelType(id)}
                    className={cn(
                      "group flex h-full flex-col gap-2 rounded-2xl border border-border/60 bg-muted/20 p-4 text-left transition-all hover:border-primary/60 hover:bg-muted/40",
                      isActive && "border-primary/70 bg-primary/10 shadow-inner shadow-primary/20"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                          <Icon className="size-4" />
                        </span>
                        <p className="font-semibold">{title}</p>
                      </div>
                      {isActive ? (
                        <Badge variant="default" className="bg-primary text-primary-foreground">
                          Selected
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {channelType === "private" ? (
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label className="text-foreground">Add teammates</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMembers(users.map((user) => user.id))}
                  disabled={loadingUsers || !users.length}
                  className="gap-2"
                >
                  <UsersIcon className="size-4" />
                  Select all
                </Button>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/10">
                <ScrollArea className="h-56 rounded-xl">
                  <div className="p-2">
                    {loadingUsers ? (
                      <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                        Loading teammates…
                      </div>
                    ) : !users.length ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                        <UsersIcon className="size-5" />
                        <span>No teammates available to invite yet.</span>
                      </div>
                    ) : (
                      <ul className="space-y-1">
                        {users.map((user) => {
                          const isChecked = selectedMembers.includes(user.id);
                          return (
                            <li key={user.id}>
                              <label
                                className={cn(
                                  "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-all hover:bg-muted/40",
                                  isChecked && "bg-primary/10"
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleMemberToggle(user.id)}
                                  className="size-4 accent-primary"
                                />
                                {user.image ? (
                                  <img
                                    src={user.image}
                                    alt={user.name || user.id}
                                    className="size-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold uppercase text-primary">
                                    {(user.name || user.id).charAt(0)}
                                  </span>
                                )}
                                <div className="flex flex-1 flex-col">
                                  <span className="text-sm font-medium text-foreground">
                                    {user.name || user.id}
                                  </span>
                                  {user.email ? (
                                    <span className="text-xs text-muted-foreground">
                                      {user.email}
                                    </span>
                                  ) : null}
                                </div>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </ScrollArea>
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedMembers.length
                  ? `${selectedMembers.length} teammate${selectedMembers.length > 1 ? "s" : ""} selected`
                  : "No teammates selected yet"}
              </p>
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-foreground">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="What's this channel about?"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={!channelName.trim() || isCreating}>
              {isCreating ? "Creating…" : "Create channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChannelModal;
