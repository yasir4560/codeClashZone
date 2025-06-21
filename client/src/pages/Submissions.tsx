import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Loader from "../components/ui/Loader";
import { BackgroundBeams } from "@/components/ui/background-beams";

interface Problem {
  _id: string;
  title: string;
}

interface Submission {
  _id: string;
  problemId: Problem;
  problemType: string;
  isSuccess: boolean;
  timeTakenInSeconds: number;
  language?: string;
  submittedAt: string;
  codeHtml?: string;
  codeCss?: string;
  codeJs?: string;
  code?: string;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/auth/me", {
          withCredentials: true,
        });
       
        const userId = res?.data?.userId;

        const submissionRes = await axios.get(
          `http://localhost:8000/api/users/${userId}/submissions`,
          { withCredentials: true }
        );
       
        setSubmissions(submissionRes.data);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const handleViewCode = (submission: Submission) => {
    if (submission.problemType === "Frontend") {
      const combined = `
<!-- HTML -->
${submission.codeHtml || ""}

/* CSS */
<style>
${submission.codeCss || ""}
</style>

<script>
${submission.codeJs || ""}
</script>
`;
      setSelectedCode(combined.trim());
    } else {
      setSelectedCode(submission.code || "// No code available");
    }
  };

  const closeModal = () => setSelectedCode(null);

  if (loading) return <Loader />;

  return (
    <div className="relative min-h-screen bg-black text-white">
      <BackgroundBeams />
      <div className="relative z-10 pt-20 px-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">📜 Your Submissions</h1>
        {submissions.length === 0 ? (
          <p className="text-center text-gray-400">No submissions yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {submissions.map((submission) => (
              <Card key={submission._id} className="bg-[#111827] border border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-purple-400">
                    {submission.problemId?.title || "Untitled Problem"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-white">
                  <p><strong>Type:</strong> {submission.problemType}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={submission.isSuccess ? "text-green-400" : "text-red-400"}>
                      {submission.isSuccess ? "Success" : "Failed"}
                    </span>
                  </p>
                  <p><strong>Time:</strong> {submission.timeTakenInSeconds}s</p>
                  {submission.language && <p><strong>Language:</strong> {submission.language}</p>}
                  <p className="text-sm text-gray-400">
                    Submitted: {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                  <button
                    className="mt-2 px-4 py-1 text-sm bg-purple-600 hover:bg-purple-700 rounded"
                    onClick={() => handleViewCode(submission)}
                  >
                    View Code
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedCode && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="bg-[#1f2937] max-w-4xl w-full mx-4 p-6 rounded-lg relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-4 text-white text-xl hover:text-red-500"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4 text-purple-400">Submitted Code</h2>
            <pre className="text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap max-h-[70vh] bg-[#111827] p-4 rounded-md">
              {selectedCode}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
