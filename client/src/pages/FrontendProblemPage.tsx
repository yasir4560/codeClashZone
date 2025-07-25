import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import MonacoEditor from "@monaco-editor/react";
import Loader from "@/components/ui/Loader";
import SubmissionModal from "@/components/SubmissionModal";

interface Problem {
  testScript: string;
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  ExpectedTimeInMinutes: number;
  htmlStarter?: string;
  cssStarter?: string;
  jsStarter?: string;
}

export default function FrontendProblemPage() {
  const { id } = useParams();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [htmlCode, setHtmlCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [jsCode, setJsCode] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [consoleLogs, setConsoleLogs] = useState<{ type: string; args: any[] }[]>(
    []
  );

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    axios
      .get(`https://codeclashzone-2.onrender.com/api/frontend/${id}`, {
        withCredentials: true,
      })
      .then((res) => {
        const data = res.data;
        setProblem(data);
        setHtmlCode(data.htmlStarter || "");
        setCssCode(data.cssStarter || "");
        setJsCode(data.jsStarter || "");
        setConsoleLogs([]); // Clear logs on new problem load
      })
      .catch((err) => console.error("Error fetching problem:", err));
  }, [id]);

  useEffect(() => {
    if (!isTimerRunning || timeLeft === null) return;
    if (timeLeft <= 0) {
      submitSolution(false, "auto");
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isTimerRunning]);

  
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "console") {
        setConsoleLogs((logs) => [
          ...logs,
          { type: event.data.logType, args: event.data.args },
        ]);
      } else if (event.data?.type === "test-result") {
        const passed = event.data.passed;
        if (passed) {
          if (isSubmitting) {
            alert("✅ Test passed! Submitting...");
            submitSolution(true, "manual");
          } else {
            alert("✅ Test passed!");
          }
        } else {
          alert("❌ Test failed. Fix your code and try again.");
          setIsSubmitting(false); 
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isSubmitting, htmlCode, cssCode, jsCode, timeLeft, problem]);

  const startTimer = () => {
    if (problem) {
      setTimeLeft(problem.ExpectedTimeInMinutes * 60);
      setIsTimerRunning(true);
    }
  };

  const runTests = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: "run-tests" }, "*");
  };

  const submitSolution = async (
    isSuccess: boolean,
    type: "manual" | "auto"
  ) => {
    if (!problem) return;
    try {
      await axios.post(
        `https://codeclashzone-2.onrender.com/api/submit/${problem._id}`,
        {
          problemType: "Frontend",
          codeHtml: htmlCode,
          codeCss: cssCode,
          codeJs: jsCode,
          isSuccess,
          timeTakenInSeconds:
            ((problem.ExpectedTimeInMinutes ?? 0) * 60 - (timeLeft ?? 0)),
          submissionType: type,
        },
        { withCredentials: true }
      );
      setIsTimerRunning(false);
      setShowModal(true);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  
  const onSubmitClick = () => {
    setConsoleLogs([]);
    setIsSubmitting(true);
    runTests();
  };

  if (!problem) return <Loader />;

  const formattedTime =
    timeLeft !== null
      ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`
      : `${problem.ExpectedTimeInMinutes}:00`;

  const fullCode = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Live Preview</title>
      <style>
        body {
          background-color: #f9fafb;
          color: #222;
          font-family: Arial, sans-serif;
          padding: 10px;
          margin: 0;
        }
        ${cssCode}
      </style>
    </head>
    <body>
      ${htmlCode}
      <script>
        (function() {
          ['log', 'error', 'warn', 'info'].forEach(fn => {
            const original = console[fn];
            console[fn] = function(...args) {
              window.parent.postMessage({ type: 'console', logType: fn, args }, '*');
              original.apply(console, args);
            }
          });
        })();
      </script>
      <script>
        try {
          ${jsCode}
        } catch(e) {
          console.error(e);
        }
      </script>
      <script>
        ${problem.testScript || ""}
      </script>
    </body>
    </html>
  `;

  return (
    <div className="min-h-screen bg-[#0b1120] text-white pt-20 px-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Left Panel */}
        <div className="col-span-3 bg-[#111827] p-4 rounded shadow space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">{problem.title}</h1>
            <button
              onClick={startTimer}
              className="text-sm bg-purple-700 hover:bg-purple-600 px-3 py-1 rounded"
              disabled={isTimerRunning}
              title={isTimerRunning ? "Timer running" : "Start Timer"}
            >
              ⏱ {formattedTime}
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-yellow-400 font-medium">
              {problem.difficulty}
            </span>
            <button
              onClick={onSubmitClick}
              className="text-xs bg-green-600 hover:bg-green-500 px-3 py-1 rounded"
              disabled={isSubmitting}
            >
              Submit
            </button>
          </div>
          <p className="text-gray-300 text-sm whitespace-pre-wrap">
            {problem.description}
          </p>
        </div>

        {/* Right */}
        <div className="col-span-9 flex flex-col space-y-4">
          <div className="grid grid-cols-3 gap-2 h-[250px]">
            <MonacoEditor
              language="html"
              value={htmlCode}
              onChange={(val) => setHtmlCode(val || "")}
              theme="vs-dark"
              options={{ minimap: { enabled: false } }}
            />
            <MonacoEditor
              language="css"
              value={cssCode}
              onChange={(val) => setCssCode(val || "")}
              theme="vs-dark"
              options={{ minimap: { enabled: false } }}
            />
            <MonacoEditor
              language="javascript"
              value={jsCode}
              onChange={(val) => setJsCode(val || "")}
              theme="vs-dark"
              options={{ minimap: { enabled: false } }}
            />
          </div>

          <iframe
            ref={iframeRef}
            className="w-full h-[400px] border border-gray-700 rounded"
            srcDoc={fullCode}
            title="Live Preview"
            sandbox="allow-scripts"
          />

          <div className="bg-black text-white text-sm p-3 h-48 overflow-y-auto font-mono rounded shadow-inner">
            <strong className="text-green-400">Console Output:</strong>
            <div className="mt-2 space-y-1 max-h-36 overflow-auto">
              {consoleLogs.length === 0 ? (
                <div className="text-gray-500">No logs yet...</div>
              ) : (
                consoleLogs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-yellow-400">{log.type}:</span>
                    <span>{log.args.map((a) => JSON.stringify(a)).join(" ")}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {showModal && <SubmissionModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
