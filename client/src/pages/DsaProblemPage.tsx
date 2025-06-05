import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import MonacoEditor from "@monaco-editor/react";
import Loader from "@/components/ui/Loader";

interface Example {
  input?: string;
  output?: string;
  explanation?: string;
}

interface TestCase {
  input: string;
  expectedOutput: string;
  hidden?: boolean;
}

interface StarterCode {
  python: string;
  cpp: string;
  java: string;
  javascript: string;
  [key: string]: string;
}

interface DsaProblem {
  _id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  examples?: Example[];
  testCases?: TestCase[];
  tags: string[];
  solveTimeLimit?: number;
  starterCode: StarterCode;
}

type Language = "python" | "cpp" | "java" | "javascript" | "typescript" | "go" | "rust";

const languageOptions: { label: string; value: Language }[] = [
  { label: "Python", value: "python" },
  { label: "C++", value: "cpp" },
  { label: "Java", value: "java" },
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Go", value: "go" },
  { label: "Rust", value: "rust" },
];

export default function DsaProblemPage() {
  const { problemId } = useParams();
  const [problem, setProblem] = useState<DsaProblem | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<Language>("python");
  const [timer, setTimer] = useState<number>(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);


  useEffect(() => {
    async function fetchProblem() {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:8000/api/dsa/${problemId}`, {
          withCredentials: true,
        });
        setProblem(res.data);
        if (res.data.starterCode && res.data.starterCode[language]) {
          setCode(res.data.starterCode[language]);
        } else {
          setCode("");
        }
        if (res.data.solveTimeLimit) {
          setTimer(res.data.solveTimeLimit * 60);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    if (!problem) return;
    const savedCode = localStorage.getItem(`code-${problem._id}-${language}`);
    if (savedCode !== null) {
      setCode(savedCode);
    } else if (problem.starterCode && problem.starterCode[language]) {
      setCode(problem.starterCode[language]);
    } else {
      setCode("");
    }
  }, [language, problem]);

  useEffect(() => {
    if (!problem) return;
    localStorage.setItem(`code-${problem._id}-${language}`, code);
  }, [code, language, problem]);

  useEffect(() => {
    if (!timerStarted || timer === 0) return;

    timerRef.current = setTimeout(() => setTimer((prev) => prev - 1), 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer, timerStarted]);

  useEffect(() => {
    if (timerStarted && timer === 0 && problem) {
      handleSubmit();
      setTimerStarted(false);
    }
  }, [timer]);

  useEffect(() => {
    if (problem) {
      if (language in problem.starterCode) {
        setCode(problem.starterCode[language as keyof StarterCode]);
      } else {
        setCode("");
      }
    }
  }, [language, problem]);

  const startTimer = () => {
    if (!timerStarted && problem?.solveTimeLimit) {
      setTimer(problem.solveTimeLimit * 60);
      setTimerStarted(true);
    }
  };

  const runCode = async () => {
    if (!problem) return;
    setTestResult(null);
    try {
      const res = await axios.post(
        `http://localhost:8000/api/dsa/${problem._id}/run`,
        { code, language },
        { withCredentials: true }
      );
      setTestResult(res.data);
    } catch (err) {
      console.error("Run failed", err);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setSubmitting(true);
    setTestResult(null);
    try {
      const res = await axios.post(
        `http://localhost:8000/api/dsa/${problem._id}/submit`,
        { code, language },
        { withCredentials: true }
      );
      setTestResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getDifficultyStyle = (level: string) => {
    switch (level) {
      case "Easy":
        return "text-green-400";
      case "Medium":
        return "text-yellow-400";
      case "Hard":
        return "text-red-500";
      default:
        return "text-gray-300";
    }
  };

  const CheckIcon = () => (
    <svg className="inline w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );

  const CrossIcon = () => (
    <svg className="inline w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  if (loading || !problem) return <Loader />;

  return (
    <div className="min-h-screen bg-black text-white grid grid-cols-1 md:grid-cols-2 gap-6 p-6 pt-20">
      <div className="space-y-6 overflow-y-auto max-h-screen pr-2">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-purple-300">{problem.title}</h2>
          {problem.solveTimeLimit && !timerStarted && (
            <button onClick={startTimer} className="bg-pink-600 px-4 py-2 rounded hover:bg-pink-700 transition">
              Start Challenge
            </button>
          )}
          {timerStarted && (
            <div className="text-lg font-mono bg-gray-800 px-4 py-2 rounded select-none">
              Timer: {formatTime(timer)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${getDifficultyStyle(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          <div className="space-x-2">
            <button
              onClick={runCode}
              className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Run Code
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-purple-600 px-4 py-2 rounded disabled:opacity-50 hover:bg-purple-700 transition"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {problem.tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-700 text-xs px-2 py-1 rounded select-none"
              title={tag}
            >
              {tag}
            </span>
          ))}
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-2">Description</h4>
          <p className="text-gray-300 whitespace-pre-line">{problem.description}</p>
        </div>

        {(problem.examples?.length ?? 0) > 0 && (
          <div>
            <h4 className="font-semibold text-lg mb-2">Examples</h4>
            {problem.examples?.map((ex, i) => (
              <div
                key={i}
                className="text-sm text-gray-300 border-l-4 border-purple-500 pl-4 mb-2"
              >
                <div>
                  <b>Input:</b> {ex.input}
                </div>
                <div>
                  <b>Output:</b> {ex.output}
                </div>
                {ex.explanation && (
                  <div>
                    <b>Explanation:</b> {ex.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {(problem.testCases?.length ?? 0) > 0 && (
          <div>
            <h4 className="font-semibold text-lg mb-2">Test Cases</h4>
            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
              {problem.testCases
                ?.filter((tc) => !tc.hidden)
                .map((tc, i) => (
                  <li key={i}>
                    <b>Input:</b> {tc.input} <b>→</b> <b>Expected:</b> {tc.expectedOutput}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-4 h-full">
        <select
          className="bg-gray-800 text-white px-4 py-2 rounded w-full"
          value={language}
          disabled={timerStarted}
          onChange={(e) => setLanguage(e.target.value as Language)}
        >
          {languageOptions.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>

        <div className="flex-1 border border-gray-700 rounded overflow-hidden">
          <MonacoEditor
            height="400px"
            language={language === "cpp" ? "cpp" : language}
            value={code}
            onChange={(value) => setCode(value ?? "")}
            theme="vs-dark"
            options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: "on" }}
          />
        </div>

        <div className="overflow-auto max-h-48 bg-gray-900 p-4 rounded text-sm">
          <h4 className="font-semibold mb-2">Test Result</h4>
          {testResult ? (
            testResult.results ? (
              <ul className="space-y-1">
                {testResult.results.map((res: any, i: number) => (
                  <li key={i} className="flex items-center space-x-2">
                    {res.passed ? <CheckIcon /> : <CrossIcon />}
                    <span>
                      <b>Input:</b> {res.input} | <b>Output:</b> {res.actual} |{" "}
                      <b>Expected:</b> {res.expected} | <b>Status:</b>{" "}
                      <span
                        className={
                          res.passed ? "text-green-400 font-semibold" : "text-red-500 font-semibold"
                        }
                      >
                        {res.passed ? "Passed" : "Failed"}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div>
                {testResult.isCorrect ? <CheckIcon /> : <CrossIcon />}
                <p>
                  <b>Output:</b> {testResult.output}
                </p>
                <p>
                  <b>Expected:</b> {testResult.expected}
                </p>
                <p>
                  <b>Status:</b>{" "}
                  <span
                    className={
                      testResult.isCorrect ? "text-green-400 font-semibold" : "text-red-500 font-semibold"
                    }
                  >
                    {testResult.isCorrect ? "Passed" : "Failed"}
                  </span>
                </p>
              </div>
            )
          ) : (
            <p className="text-gray-500">No submission yet</p>
          )}
          {testResult && (
            <p className="mt-2 text-xs italic text-gray-400">
              Note: Some hidden test cases were used during submission.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
