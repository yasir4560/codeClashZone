import { useNavigate } from "react-router-dom";

interface SubmissionModalProps {
  onClose: () => void;
}

export default function SubmissionModal({ onClose }: SubmissionModalProps) {
  const navigate = useNavigate();

  const goToProblems = () => {
    onClose();
    navigate("/frontend-problems"); // You can change this route if needed
  };

  const goToSubmissions = () => {
    onClose();
    navigate("/submissions"); // Or "/my-submissions" based on your routing
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white text-black rounded-lg p-6 w-96 shadow-xl text-center space-y-4">
        <h2 className="text-xl font-semibold">✅ Submitted Successfully</h2>
        <p className="text-sm text-gray-700">Your solution has been submitted.</p>
        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={goToSubmissions}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            👁 View Submissions
          </button>
          <button
            onClick={goToProblems}
            className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800"
          >
            🔁 Go to Problems
          </button>
        </div>
      </div>
    </div>
  );
}
