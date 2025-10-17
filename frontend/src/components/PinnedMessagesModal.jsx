import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const PinnedMessagesModal = ({ open, onOpenChange, pinnedMessages = [] }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card/95">
        <DialogHeader>
          <DialogTitle>Pinned messages</DialogTitle>
          <DialogDescription>
            Important highlights saved by your team for quick reference.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-80 pr-4">
          {pinnedMessages.length ? (
            <ul className="space-y-4">
              {pinnedMessages.map((message) => (
                <li
                  key={message.id}
                  className="rounded-2xl border border-border/50 bg-muted/10 p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={message.user.image}
                      alt={message.user.name}
                      className="size-9 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{message.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Separator className="my-3 opacity-60" />
                  <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                    {message.text}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-60 flex-col items-center justify-center gap-2 text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-10 text-primary/70"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 3.75H7.5A1.5 1.5 0 0 0 6 5.25v14.25l6-3 6 3V5.25a1.5 1.5 0 0 0-1.5-1.5Z"
                />
              </svg>
              <p className="text-sm">Pinned messages you save will appear here.</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PinnedMessagesModal;
