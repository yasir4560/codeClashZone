import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/background-beams";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Comment {
  _id: string;
  text: string;
  createdBy: User;
  createdAt: string;
}

interface Doubt {
  _id: string;
  title: string;
  description: string;
  createdBy: User;
  createdAt: string;
  commentCount: number;
  tags?: string[];
  imageUrl?: string;
}

const API_BASE = "http://localhost:8000/api/community";

const colors = [
  "#39B5E0",
  "#A31ACB",
  "#E8A0BF",
  "#A459D1",
  "#F900BF",
  "#400D51",
  "#323EDD",
  "#7A2E7A"
];

function getColorForInitial(char: string) {
  if (!char) return colors[0];
  const index = char.toUpperCase().charCodeAt(0) - 65;
  return colors[index % colors.length];
}

export default function CommunityPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState<"all" | "new" | "resolved">("all");
  const [expandedDoubtId, setExpandedDoubtId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newDoubtTitle, setNewDoubtTitle] = useState("");
  const [newDoubtDescription, setNewDoubtDescription] = useState("");
  const [showCreateDoubt, setShowCreateDoubt] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [newDoubtImage, setNewDoubtImage] = useState<File | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/allusers`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    async function fetchDoubtsWithCommentCounts() {
      try {
        const res = await fetch(`${API_BASE}/alldoubts`, { credentials: "include" });
        const data = await res.json();

        if (data.alldoubts) {
          const enrichedDoubts = await Promise.all(
            data.alldoubts.map(async (d: Doubt) => {
              try {
                const commentRes = await fetch(`${API_BASE}/allcomments/${d._id}`, {
                  credentials: "include",
                });
                const commentData = await commentRes.json();

                return {
                  ...d,
                  commentCount: commentData?.allComments?.length || 0,
                  tags: [],
                };
              } catch {
                return { ...d, commentCount: 0, tags: [] };
              }
            })
          );

          setDoubts(enrichedDoubts);
        }
      } catch {}
    }

    fetchDoubtsWithCommentCounts();
  }, []);

  const filteredDoubts = doubts.filter((d) => {
    if (filterTag !== "all") {
      if (filterTag === "new") {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        if (new Date(d.createdAt) < threeDaysAgo) return false;
      }
      if (filterTag === "resolved") {
        if (
          !d.title.toLowerCase().includes("resolved") &&
          !d.description.toLowerCase().includes("resolved")
        )
          return false;
      }
    }
    if (
      searchTerm.trim() !== "" &&
      !d.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !d.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    if (!expandedDoubtId) {
      setComments([]);
      return;
    }
    setLoadingComments(true);
    fetch(`${API_BASE}/allcomments/${expandedDoubtId}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setComments(data.allComments || []))
      .catch(() => setComments([]))
      .finally(() => setLoadingComments(false));
  }, [expandedDoubtId]);

  const handleCreateDoubt = async () => {
    if (!newDoubtTitle.trim() || !newDoubtDescription.trim()) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", newDoubtTitle);
      formData.append("description", newDoubtDescription);
      if (newDoubtImage) {
        formData.append("image", newDoubtImage);
      }

      const res = await fetch(`${API_BASE}/createdoubt`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newDoubtTitle, description: newDoubtDescription }),
});


      const data = await res.json();

      if (res.ok) {
        setDoubts((prev) => [{ ...data, commentCount: 0, tags: [] }, ...prev]);
        setNewDoubtTitle("");
        setNewDoubtDescription("");
        setNewDoubtImage(null);
        setShowCreateDoubt(false);
      } else {
        alert(data.message || "Failed to create doubt");
      }
    } catch {
      alert("Failed to create doubt");
    }
    setLoading(false);
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !expandedDoubtId) return;
    try {
      const res = await fetch(`${API_BASE}/comment`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText, doubtId: expandedDoubtId }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [data, ...prev]);
        setCommentText("");
        setDoubts((prev) =>
          prev.map((d) => (d._id === expandedDoubtId ? { ...d, commentCount: d.commentCount + 1 } : d))
        );
      } else {
        alert(data.message || "Failed to add comment");
      }
    } catch {
      alert("Failed to add comment");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedDoubtId((prev) => (prev === id ? null : id));
  };

  function formatTimeAgo(dateString: string): string {
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 604800)}w ago`;
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <BackgroundBeams className="pointer-events-none"/>
        <div className="flex h-[calc(100vh-64px)] mt-20">
          <section className="flex flex-col w-3/4 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <input
                type="text"
                placeholder="Search doubts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-1/2 p-3 rounded-lg bg-gray-800 border border-purple-600 placeholder-[#F5F7F8] focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value as any)}
                className="p-3 bg-gray-800 border border-purple-600 rounded-lg text-[#F5F7F8] focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All</option>
                <option value="new">New (Last 3 days)</option>
                <option value="resolved">Resolved</option>
              </select>

              <button
                onClick={() => setShowCreateDoubt(true)}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl font-semibold transition hover:cursor-pointer"
              >
                + Create Doubt
              </button>
            </div>

            <div className="space-y-4">
              {filteredDoubts.length === 0 && (
                <>
                <img src="/noData.png" alt="No Data" className="mx-auto w-32 h-32 object-contain" />
                <p className="text-center text-purple-300  text-lg">No doubts found.</p>
                </>
              )}

              {filteredDoubts.map((doubt) => {
                const isExpanded = doubt._id === expandedDoubtId;

                const tags = [];
                const threeDaysAgo = new Date();
                threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                if (new Date(doubt.createdAt) >= threeDaysAgo) tags.push("new");
                if (
                  doubt.title.toLowerCase().includes("resolved") ||
                  doubt.description.toLowerCase().includes("resolved")
                )
                  tags.push("resolved");

                return (
                  <motion.div
                    key={doubt._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-800 rounded-xl p-5 cursor-pointer shadow-lg hover:shadow-purple-700/50 border border-purple-700"
                    onClick={() => toggleExpand(doubt._id)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold flex items-center space-x-3">
                        <span>{doubt.title}</span>
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold uppercase
                          ${
                            tag === "new"
                              ? "bg-green-600 text-green-100"
                              : tag === "resolved"
                              ? "bg-blue-600 text-blue-100"
                              : ""
                          }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </h3>
                    </div>

                    {!isExpanded && (
                      <div className="mt-2 text-purple-300">
                        <p className="truncate">
                          {doubt.createdBy.name}: {doubt.description}
                        </p>
                        {doubt.imageUrl && (
                          <img
                            src={doubt.imageUrl}
                            alt="Doubt"
                            className="mt-2 max-h-64 rounded-lg border border-purple-600"
                          />
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-2 text-sm text-purple-400">
                      <p>💬 {doubt.commentCount}</p>
                      <p>{formatTimeAgo(doubt.createdAt)}</p>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          key="expanded"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4 }}
                          className="mt-4 pt-4 border-t border-purple-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="mb-4 whitespace-pre-wrap text-purple-100">{doubt.description}</p>

                          <h4 className="font-semibold mb-2 text-purple-300">Comments</h4>

                          {loadingComments ? (
                            <p className="text-purple-500">Loading comments...</p>
                          ) : comments.length === 0 ? (
                            <p className="text-purple-500">No comments yet.</p>
                          ) : (
                            <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                              {comments.map((comment) => (
                                <div
                                  key={comment._id}
                                  className="bg-gray-700 p-3 rounded-lg text-purple-200"
                                >
                                  <p>{comment.text}</p>
                                  <small className="text-purple-400">
                                    — {comment.createdBy.name},{" "}
                                    {new Date(comment.createdAt).toLocaleString()}
                                  </small>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex space-x-2">
                            <input
                              type="text"
                              placeholder="Add a comment..."
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              className="flex-grow rounded-lg bg-gray-700 border border-purple-600 px-3 py-2 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                              onClick={handleAddComment}
                              className="bg-purple-600 hover:bg-purple-700 px-5 rounded-lg font-semibold transition hover:cursor-pointer"
                            >
                              Post
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            <AnimatePresence>
              {showCreateDoubt && (
                <motion.div
                  className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="bg-gray-900 rounded-xl p-8 max-w-lg w-full shadow-lg border border-purple-700"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                  >
                    <h3 className="text-2xl font-bold mb-4 text-purple-400">Create New Doubt</h3>
                    <input
                      type="text"
                      placeholder="Title"
                      value={newDoubtTitle}
                      onChange={(e) => setNewDoubtTitle(e.target.value)}
                      className="w-full mb-4 p-3 rounded-lg bg-gray-800 border border-purple-600 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <textarea
                      placeholder="Description"
                      value={newDoubtDescription}
                      onChange={(e) => setNewDoubtDescription(e.target.value)}
                      className="w-full mb-6 p-3 rounded-lg bg-gray-800 border border-purple-600 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 h-32 resize-none"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewDoubtImage(e.target.files?.[0] || null)}
                      className="mb-6 text-purple-300"
                    />
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => setShowCreateDoubt(false)}
                        className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateDoubt}
                        disabled={loading}
                        className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700  cursor-pointer disabled:opacity-50"
                      >
                        {loading ? "Creating..." : "Create"}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <aside className="w-1/4 border-l border-purple-700 p-6 overflow-y-auto bg-gray-900 text-purple-200">
            <h2 className="text-xl font-semibold mb-6">Registered Users</h2>
            <ul className="space-y-4">
              {users.map((user) => {
                const initial = user.name?.[0]?.toUpperCase() || "?";
                const bgColor = getColorForInitial(initial);
                return (
                  <li
                    key={user._id}
                    className="flex items-center space-x-3 border-b border-purple-700 pb-3"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                      style={{ backgroundColor: bgColor }}
                    >
                      {initial}
                    </div>
                    <p className="font-medium">{user.name}</p>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </div>
  );
}
