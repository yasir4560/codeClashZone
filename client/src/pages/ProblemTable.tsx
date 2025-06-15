type Problem = {
  _id: string;
  title: string;
  difficulty: string;
};

interface ProblemTableProps {
  problems: Problem[];
  onJoin: (problem: Problem) => void;
  onCreate: (problem: Problem) => void;
}

export default function ProblemTable({ problems, onJoin, onCreate }: ProblemTableProps) {
  return (
    <table className="min-w-full bg-white shadow rounded overflow-hidden">
      <thead className="bg-gray-200">
        <tr>
          <th className="px-4 py-2 text-left">Title</th>
          <th className="px-4 py-2 text-left">Contest</th>
          <th className="px-4 py-2 text-center">Participants</th>
          <th className="px-4 py-2 text-center">Difficulty</th>
          <th className="px-4 py-2 text-center">Action</th>
        </tr>
      </thead>
      <tbody>
        {problems.map((p) => (
          <tr key={p._id} className="border-t hover:bg-gray-100">
            <td className="px-4 py-2">{p.title}</td>
            <td className="px-4 py-2">DSA Contest</td>
            <td className="px-4 py-2 text-center">{Math.floor(Math.random() * 10 + 1)}</td>
            <td className="px-4 py-2 text-center">{p.difficulty}</td>
            <td className="px-4 py-2 text-center space-x-2">
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                onClick={() => onJoin(p)}
              >
                Join
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                onClick={() => onCreate(p)}
              >
                Create
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}