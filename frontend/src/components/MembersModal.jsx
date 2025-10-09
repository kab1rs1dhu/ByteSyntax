import { XIcon } from "lucide-react";

function MembersModal({ members, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Channel Members</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close members modal"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* MEMBERS LIST */}
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          {members.map((member) => {
            const profile = member.user || {};
            const fallback = (profile.name || profile.id || "?").charAt(0).toUpperCase();
            const key = profile.id || member.user_id || member.id;

            return (
              <div
                key={key}
                className="flex items-center gap-3 border-b border-gray-100 py-3 last:border-b-0"
              >
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold uppercase text-white">
                    {fallback}
                  </div>
                )}

                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {profile.name || profile.id}
                  </span>
                  <span className="text-xs text-gray-500">{profile.role || "Member"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MembersModal;
