import { useEffect, useState } from "react";
import { useChatContext } from "stream-chat-react";
import { UsersIcon } from "lucide-react";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const InviteModal = ({ open, onOpenChange, channel }) => {
  const { client } = useChatContext();
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!channel || !client) return;
      setIsLoadingUsers(true);
      try {
        const members = Object.keys(channel.state.members);
        const res = await client.queryUsers({ id: { $nin: members } }, { name: 1 }, { limit: 50 });
        setUsers(res.users || []);
      } catch (error) {
        toast.error("Failed to load teammates");
        setUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (open) {
      fetchUsers();
      setSelectedMembers([]);
      setSearchTerm("");
    }
  }, [channel, client, open]);

  const filteredUsers = users.filter((user) => {
    if (!searchTerm.trim()) return true;
    const haystack = `${user.name ?? ""} ${user.id}`.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleInvite = async () => {
    if (!selectedMembers.length) return;
    setIsInviting(true);
    try {
      await channel.addMembers(selectedMembers);
      toast.success("Invitations sent");
      onOpenChange?.(false);
    } catch (error) {
      toast.error("Failed to invite teammates");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card/95">
        <DialogHeader>
          <DialogTitle>Invite teammates</DialogTitle>
          <DialogDescription>
            Search for teammates who are not already in this channel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="bg-muted/20"
          />

          <div className="rounded-2xl border border-border/60 bg-muted/10">
            <ScrollArea className="h-64 rounded-2xl">
              <div className="space-y-1 p-2">
                {isLoadingUsers ? (
                  <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                    Loading teammates…
                  </div>
                ) : !filteredUsers.length ? (
                  <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                    <UsersIcon className="size-5" />
                    <span>No teammates match that search.</span>
                  </div>
                ) : (
                  filteredUsers.map((user) => {
                    const isChecked = selectedMembers.includes(user.id);
                    return (
                      <label
                        key={user.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-all hover:bg-muted/40",
                          isChecked && "bg-primary/10"
                        )}
                      >
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={isChecked}
                          onChange={() => toggleMember(user.id)}
                        />
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="size-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold uppercase text-primary">
                            {(user.name || user.id).charAt(0)}
                          </span>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {user.name || user.id}
                          </span>
                          {user.email ? (
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          ) : null}
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedMembers.length
              ? `${selectedMembers.length} teammate${selectedMembers.length > 1 ? "s" : ""} selected`
              : "Select at least one teammate to invite"}
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange?.(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleInvite}
            disabled={!selectedMembers.length || isInviting}
          >
            {isInviting ? "Inviting…" : "Send invites"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteModal;
