import { XIcon } from "lucide-react";

function PinnedMessagesModal({ pinnedMessages, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Pinned Messages</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close pinned messages"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* MESSAGES LIST */}
        <div className="max-h-[60vh] space-y-4 overflow-y-auto px-5 py-4">
          {pinnedMessages.map((msg) => {
            const timestamp = msg?.created_at
              ? new Date(msg.created_at).toLocaleString()
              : "Recently";
            const author = msg?.user;

            return (
              <div key={msg.id} className="flex gap-3 rounded-xl border border-gray-100 p-3">
                {author?.image ? (
                  <img
                    src={author.image}
                    alt={author.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold uppercase text-indigo-600">
                    {(author?.name || author?.id || "?").charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex flex-1 flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-gray-900">
                      {author?.name || author?.id || "Unknown"}
                    </div>
                    <span className="text-xs uppercase tracking-wide text-gray-400">{timestamp}</span>
                  </div>
                  <div className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          {pinnedMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center">
              <p className="text-sm font-medium text-gray-700">No pinned messages</p>
              <span className="mt-1 text-xs text-gray-500">
                Pin important updates to bring them back quickly.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PinnedMessagesModal;
