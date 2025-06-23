import { useQuery, gql } from "@apollo/client";
import "./ProblemsList.css";

// GraphQL query to fetch problems
const GET_PROBLEMS = gql`
  query GetProblems {
    problems {
      id
      title
      description
      timeLimit
      memoryLimit
    }
  }
`;

const ProblemsList = () => {
  const { loading, error, data } = useQuery(GET_PROBLEMS);

  if (loading) return <div className="loading">Loading problems...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div className="problems-container">
      <h2>Problems</h2>
      {data?.problems?.length === 0 ? (
        <p>No problems available</p>
      ) : (
        <div className="problems-list">
          {data?.problems?.map((problem) => (
            <div key={problem.id} className="problem-card">
              <h3>{problem.title}</h3>
              <p className="problem-description">{problem.description}</p>
              <div className="problem-limits">
                <span className="time-limit">Time: {problem.timeLimit}ms</span>
                <span className="memory-limit">
                  Memory: {problem.memoryLimit}MB
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProblemsList;
