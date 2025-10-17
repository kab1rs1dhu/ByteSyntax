import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const MembersModal = ({ open, onOpenChange, members = [] }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card/95">
        <DialogHeader>
          <DialogTitle>Channel members</DialogTitle>
          <DialogDescription>See who has access to this conversation.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-80">
          <ul className="space-y-3 pr-2">
            {members.map((member) => {
              const user = member.user || {};
              return (
                <li
                  key={user.id}
                  className="flex items-center justify-between rounded-2xl border border-border/50 bg-muted/10 px-4 py-3 transition hover:border-primary/50 hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || user.id}
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold uppercase text-primary">
                        {(user.name || user.id || "?").charAt(0)}
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
                  </div>

                  {member.role ? (
                    <Badge variant="secondary" className="capitalize">
                      {member.role}
                    </Badge>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MembersModal;
