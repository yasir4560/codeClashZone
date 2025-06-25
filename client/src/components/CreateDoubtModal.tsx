import { motion, AnimatePresence } from "framer-motion";

interface CreateDoubtModalProps {
  visible: boolean;
  title: string;
  description: string;
  image: File | null;
  loading: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onImageChange: (file: File | null) => void;
  onCancel: () => void;
  onCreate: () => void;
}

export default function CreateDoubtModal({
  visible,
  title,
  description,
  image,
  loading,
  onTitleChange,
  onDescriptionChange,
  onImageChange,
  onCancel,
  onCreate,
}: CreateDoubtModalProps) {
  return (
    <AnimatePresence>
      {visible && (
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
            <h3 className="text-2xl font-bold mb-4 text-purple-400">
              Create New Doubt
            </h3>

            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full mb-4 p-3 rounded-lg bg-gray-800 border border-purple-600 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="w-full mb-6 p-3 rounded-lg bg-gray-800 border border-purple-600 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 h-32 resize-none"
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => onImageChange(e.target.files?.[0] || null)}
              className="mb-6 text-purple-300"
            />

            <div className="flex justify-end space-x-4">
              <button
                onClick={onCancel}
                className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={onCreate}
                disabled={loading}
                className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
