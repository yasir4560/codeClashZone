import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/background-beams";
import InitialsAvatar from "@/components/InitialsAvatar";
import CreateDoubtModal from "@/components/CreateDoubtModal";
import toast from 'react-hot-toast';


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

    const fetchDoubtsWithCommentCounts = async () => {
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
  } catch {
    console.error("Failed to fetch doubts");
  }
};

useEffect(() => {
    fetchDoubtsWithCommentCounts();
}, []);

  // console.log("expanded", expandedDoubtId);

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
      toast.error("Title and description are required");
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
      body: formData,
});


      const data = await res.json();

      if (res.ok) {
        // setDoubts((prev) => [{ ...data, commentCount: 0, tags: [] }, ...prev]);
        setNewDoubtTitle("");
        setNewDoubtDescription("");
        setNewDoubtImage(null);
        setShowCreateDoubt(false);
        await fetchDoubtsWithCommentCounts();
        toast.success("Doubt created successfully");
      } else {
        toast.error(data.message || "Failed to create doubt");
      }
    } catch {
      toast.error("Failed to create doubt");
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
        toast.success("Comment added successfully");
        // setComments((prev) => [data, ...prev]);
        setCommentText("");
        setDoubts((prev) =>
          prev.map((d) => (d?._id === expandedDoubtId ? { ...d, commentCount: d?.commentCount + 1 } : d))
        );
       // console.log("expanded", expandedDoubtId);
        // setExpandedDoubtId("");
        const commentRes = await fetch(`${API_BASE}/allcomments/${expandedDoubtId}`, { credentials: "include" });
        const commentData = await commentRes.json();
        setComments(commentData.allComments || []);
      } else {
        toast(data.message || "Failed to add comment");
      }
    } catch {
      toast("Failed to add comment");
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
    <BackgroundBeams className="pointer-events-none" />
    <div className="flex h-[calc(100vh-64px)] mt-20">
      {/* Main Section */}
      <section className="flex flex-col w-3/4 p-6 overflow-y-auto">
        {/* Filters */}
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

        {/* Doubt List */}
        <div className="space-y-4">
          {filteredDoubts.map((doubt) => {
            const isExpanded = expandedDoubtId === doubt._id;
            const tags: string[] = [];

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
                  <h3 className="text-xl font-bold flex items-center gap-3">
                    {doubt.title}
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          tag === "new"
                            ? "bg-green-600 text-green-100"
                            : "bg-blue-600 text-blue-100"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </h3>
                </div>

                <div
                  className={`mt-2 text-purple-300 ${
                    !isExpanded ? "flex items-start gap-4" : ""
                  }`}
                >
                  <p className={isExpanded ? "" : "truncate flex-1"}>
                    {doubt?.createdBy?.name}: {doubt.description}
                  </p>

                  {doubt.imageUrl && (
                    <div
                      className={`${
                        isExpanded
                          ? "mt-4 w-full max-h-[400px]"
                          : "w-24 h-16 border border-purple-600 rounded-lg overflow-hidden"
                      }`}
                    >
                      <img
                        src={`http://localhost:8000${doubt.imageUrl}`}
                        alt="Doubt"
                        className="object-cover w-full h-full rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-2 text-sm text-purple-400">
                  <p>💬 {doubt.commentCount}</p>
                  <p>{formatTimeAgo(doubt.createdAt)}</p>
                </div>

                {/* Expanded Section */}
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
                      <h4 className="font-semibold mb-2 text-purple-300">
                        Comments
                      </h4>
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
                          Comment
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Create Doubt Modal */}
        <CreateDoubtModal
          visible={showCreateDoubt}
          title={newDoubtTitle}
          description={newDoubtDescription}
          image={newDoubtImage}
          loading={loading}
          onTitleChange={setNewDoubtTitle}
          onDescriptionChange={setNewDoubtDescription}
          onImageChange={setNewDoubtImage}
          onCancel={() => setShowCreateDoubt(false)}
          onCreate={handleCreateDoubt}
        />
      </section>

      {/* Sidebar */}
      <aside className="w-1/4 border-l border-purple-700 p-6 overflow-y-auto bg-gray-900 text-purple-200">
        <h2 className="text-xl font-semibold mb-6">Code Clashers</h2>
        <ul className="space-y-4">
          {users.map((user) => (
            <li
              key={user._id}
              className="flex items-center space-x-3 border-b border-purple-700 pb-3"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white">
                <InitialsAvatar name={user.name[0] || "?"} size={32} />
              </div>
              <p className="font-medium">{user.name}</p>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  </div>
);
}