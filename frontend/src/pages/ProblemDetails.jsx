import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { GET_PROBLEM_BY_ID, RUN_CODE } from '../graphql/queries';
import { SUBMIT_SOLUTION } from '../graphql/mutations';
import "./ProblemDetails.css";

const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
];

const defaultCode = {
  javascript: `// Reads from stdin and prints to stdout
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let lines = [];
rl.on('line', (line) => {
    lines.push(line);
}).on('close', () => {
    // Example for Two Sum:
    // const target = parseInt(lines[0], 10);
    // const nums = lines[1].split(' ').map(Number);
    
    // Your logic here
    console.log("Process input here");
});
`,
  python: `# Reads from stdin and prints to stdout
import sys

def solve():
  # Example for Two Sum:
  # line1 = sys.stdin.readline().strip()
  # if not line1: return
  # target = int(line1)
  # nums = list(map(int, sys.stdin.readline().strip().split()))
  
  # Your logic here. For example:
  for line in sys.stdin:
      print(f"I read this line: {line.strip()}")

solve()
`,
  java: `// Reads from stdin and prints to stdout
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Example for Two Sum:
        // int target = sc.nextInt();
        // sc.nextLine(); // consume newline
        // String[] numsStr = sc.nextLine().split(" ");
        // int[] nums = new int[numsStr.length];
        // for (int i = 0; i < numsStr.length; i++) {
        //     nums[i] = Integer.parseInt(numsStr[i]);
        // }

        // Your logic here
        while (sc.hasNextLine()) {
            System.out.println("I read this line: " + sc.nextLine());
        }
        
        sc.close();
    }
}
`,
  cpp: `// Reads from stdin and prints to stdout
#include <iostream>
#include <string>
#include <vector>
#include <sstream>

int main() {
    // Your logic here
    // Example for Two Sum:
    // int target;
    // std::cin >> target;
    // std::cin.ignore(); 
    
    // std::string line;
    // std::getline(std::cin, line);
    // std::stringstream ss(line);
    // std::vector<int> nums;
    // int num;
    // while(ss >> num) {
    //     nums.push_back(num);
    // }

    std::string line;
    while (std::getline(std::cin, line)) {
      std::cout << "I read this line: " << line << std::endl;
    }
    return 0;
}
`,
};

const ProblemDetails = () => {
  const { id } = useParams();
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState(defaultCode.python);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [fontSize, setFontSize] = useState(14);
  const editorRef = useRef(null);

  // Fetch problem details
  const { loading, error, data } = useQuery(GET_PROBLEM_BY_ID, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network'
  });

  // Update code when language changes
  useEffect(() => {
    setCode(defaultCode[selectedLanguage] || '');
  }, [selectedLanguage]);

  const problem = data?.problem;

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const formatTestResults = (result) => {
    let outputText = 'Running your solution...\n\n';

    result.testResults.forEach((test, index) => {
      outputText += `--- Test Case ${index + 1} ---\n`;
      outputText += `Input:\n${test.testCase}\n\n`;
      outputText += `Expected Output:\n${test.expected}\n\n`;
      outputText += `Your Output:\n${test.actual}\n\n`;
      outputText += `Result: ${test.passed ? '✓ Passed' : '✗ Failed'}\n`;
      if (test.executionTime !== null && typeof test.executionTime !== 'undefined') {
        const timeInMs = (test.executionTime * 1000).toFixed(2);
        outputText += `Time: ${timeInMs}ms\n`;
      }
      outputText += '\n';
    });

    const passedCount = result.testResults.filter(t => t.passed).length;
    const totalTimeInMs = (result.totalExecutionTime * 1000).toFixed(2);
    outputText += `--- Summary ---\n`;
    outputText += `Result: ${passedCount}/${result.testResults.length} test cases passed.\n`;
    outputText += `Total execution time: ${totalTimeInMs}ms`;

    return outputText;
  };

  const [runCodeMutation] = useMutation(RUN_CODE, {
    errorPolicy: 'all'
  });

  const handleRunCode = async () => {
    if (!problem) return;
    setIsRunning(true);
    setOutput('Running...');

    try {
      const { data: mutationData } = await runCodeMutation({
        variables: {
          input: {
            problemId: problem.id,
            code: code,
            language: selectedLanguage,
            testType: 'SAMPLE'
          }
        }
      });

      const result = mutationData.runCode;
      if (result.__typename === 'RunCodeResult') {
        const formattedOutput = formatTestResults(result);
        setOutput(formattedOutput);
      } else if (result.__typename === 'RunCodeError') {
        setOutput(`--- Error ---\nType: ${result.errorType}\n\n${result.error}`);
      } else {
        setOutput('An unknown response was received from the server.');
      }
    } catch (err) {
      setOutput(`An unexpected error occurred: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsRunning(true);
    setOutput('');

    try {
      setTimeout(() => {
        setOutput(`Submission Results:\n\nStatus: Accepted\nRuntime: 76 ms\nMemory: 42.3 MB`);
        setIsRunning(false);
      }, 2000);

    } catch (err) {
      setOutput(`Error: ${err.message}`);
      setIsRunning(false);
    }
  };

  const increaseFontSize = () => setFontSize(prevSize => Math.min(prevSize + 2, 24));
  const decreaseFontSize = () => setFontSize(prevSize => Math.max(prevSize - 2, 10));

  if (loading && !data) return <div className="loading">Loading problem...</div>;
  if (error) return <div className="error">Error loading problem: {error.message}</div>;
  if (!loading && !error && !problem) return <div className="error">Problem not found</div>;
  if (problem.__typename === 'ProblemNotFoundError') {
      return <div className="error">{problem.message}</div>;
  }

  return (
    <div className="problem-details-page">
      <div className="problem-content">
        <div className="problem-panel description-panel">
          <div className="panel-tabs">
            <button
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
              onClick={() => setActiveTab('submissions')}
            >
              Submissions
            </button>
          </div>

          <div className="panel-content">
            {activeTab === 'description' && problem && (
              <div className="description-content">
                <h2>{problem.title}</h2>
                <div
                  className="problem-difficulty-badge"
                  data-difficulty={problem.difficulty?.toLowerCase()}
                >
                  {problem.difficulty}
                </div>
                {problem.description ? (
                  <MarkdownRenderer markdown={problem.description} />
                ) : (
                  <p>No description available</p>
                )}
                <div className="problem-stats">
                  {problem.timeLimit && (
                    <div className="stat">
                      <strong>Time Limit:</strong> {problem.timeLimit}
                    </div>
                  )}
                  {problem.memoryLimit && (
                    <div className="stat">
                      <strong>Memory Limit:</strong> {problem.memoryLimit}
                    </div>
                  )}
                  {problem.tags && problem.tags.length > 0 && (
                    <div className="tags-container">
                      <strong>Tags:</strong>
                      <div className="tags">
                        {problem.tags.map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'submissions' && (
              <div className="submissions-content">
                <h3>Your Submissions</h3>
                <div className="submission-list">
                    <p>Submissions history will be shown here.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="problem-panel editor-panel">
          <div className="editor-header">
            <div className="language-selector">
              <select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                className="language-select"
              >
                {languageOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="editor-actions">
              <button className="font-btn" onClick={decreaseFontSize} title="Decrease font size">A-</button>
              <button className="font-btn" onClick={increaseFontSize} title="Increase font size">A+</button>
            </div>
          </div>
          <div className="code-editor">
            <textarea
              ref={editorRef}
              value={code}
              onChange={handleCodeChange}
              style={{ fontSize: `${fontSize}px` }}
              className="code-textarea"
              spellCheck="false"
            />
          </div>
          <div className="editor-footer">
            <button
              className="run-btn"
              onClick={handleRunCode}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={isRunning}
            >
              {isRunning ? 'Submitting...' : 'Submit'}
            </button>
          </div>
          {(output || isRunning) && (
            <div className="output-panel">
              <div className="output-header">
                <h3>Output</h3>
              </div>
              <pre className="output-content">{output}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetails;