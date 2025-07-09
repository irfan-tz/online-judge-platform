import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Editor } from '@monaco-editor/react';
import "./ProblemDetails.css";

// GraphQL queries and mutations
const GET_PROBLEM = gql`
  query GetProblem($id: ID!) {
    problem(id: $id) {
      id
      title
      description
      difficulty
      tags
      timeLimit
      memoryLimit
      examples {
        input
        output
        explanation
      }
      constraints
      hints
      defaultCode {
        language
        code
      }
    }
  }
`;

const SUBMIT_SOLUTION = gql`
  mutation SubmitSolution($problemId: ID!, $code: String!, $language: String!) {
    submitSolution(problemId: $problemId, code: $code, language: $language) {
      id
      status
      runtime
      memory
      output
      error
      testCases {
        input
        expectedOutput
        actualOutput
        passed
        runtime
        memory
      }
    }
  }
`;

const RUN_CODE = gql`
  mutation RunCode($problemId: ID!, $code: String!, $language: String!, $input: String!) {
    runCode(problemId: $problemId, code: $code, language: $language, input: $input) {
      output
      error
      runtime
      memory
    }
  }
`;

const ProblemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  
  // State management
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [runResults, setRunResults] = useState(null);
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState('vs-dark');

  // Available programming languages
  const languages = [
    { id: 'python', name: 'Python', extension: 'py' },
    { id: 'javascript', name: 'JavaScript', extension: 'js' },
    { id: 'java', name: 'Java', extension: 'java' },
    { id: 'cpp', name: 'C++', extension: 'cpp' },
    { id: 'c', name: 'C', extension: 'c' },
    { id: 'go', name: 'Go', extension: 'go' },
    { id: 'rust', name: 'Rust', extension: 'rs' },
  ];

  // Default code templates
  const defaultCodeTemplates = {
    python: `def solution():
    # Your code here
    pass

# Example usage
# result = solution()
# print(result)`,
    javascript: `function solution() {
    // Your code here
    return null;
}

// Example usage
// console.log(solution());`,
    java: `public class Solution {
    public static void main(String[] args) {
        // Your code here
    }
}`,
    cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    // Your code here
    return 0;
}`,
    c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Your code here
    return 0;
}`,
    go: `package main

import "fmt"

func main() {
    // Your code here
}`,
    rust: `fn main() {
    // Your code here
}`
  };

  // Fetch problem data
  const { loading, error, data } = useQuery(GET_PROBLEM, {
    variables: { id },
    onCompleted: (data) => {
      if (data?.problem?.defaultCode) {
        const defaultCode = data.problem.defaultCode.find(dc => dc.language === selectedLanguage);
        if (defaultCode) {
          setCode(defaultCode.code);
        } else {
          setCode(defaultCodeTemplates[selectedLanguage] || '');
        }
      } else {
        setCode(defaultCodeTemplates[selectedLanguage] || '');
      }
    }
  });

  // GraphQL mutations
  const [submitSolution] = useMutation(SUBMIT_SOLUTION);
  const [runCode] = useMutation(RUN_CODE);

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setSelectedLanguage(newLanguage);
    if (data?.problem?.defaultCode) {
      const defaultCode = data.problem.defaultCode.find(dc => dc.language === newLanguage);
      if (defaultCode) {
        setCode(defaultCode.code);
      } else {
        setCode(defaultCodeTemplates[newLanguage] || '');
      }
    } else {
      setCode(defaultCodeTemplates[newLanguage] || '');
    }
  };

  // Handle code submission
  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Please write some code before submitting!');
      return;
    }

    setIsSubmitting(true);
    setResults(null);
    
    try {
      const result = await submitSolution({
        variables: {
          problemId: id,
          code: code,
          language: selectedLanguage
        }
      });
      
      setResults(result.data.submitSolution);
      setActiveTab('results');
    } catch (error) {
      console.error('Submission error:', error);
      setResults({
        status: 'ERROR',
        error: error.message || 'Failed to submit solution'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle code running with custom input
  const handleRun = async () => {
    if (!code.trim()) {
      alert('Please write some code before running!');
      return;
    }

    setIsRunning(true);
    setRunResults(null);
    
    try {
      const result = await runCode({
        variables: {
          problemId: id,
          code: code,
          language: selectedLanguage,
          input: customInput
        }
      });
      
      setRunResults(result.data.runCode);
    } catch (error) {
      console.error('Run error:', error);
      setRunResults({
        error: error.message || 'Failed to run code'
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSubmit();
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRun();
    });
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return '#10b981';
      case 'wrong_answer': return '#ef4444';
      case 'time_limit_exceeded': return '#f59e0b';
      case 'memory_limit_exceeded': return '#f59e0b';
      case 'runtime_error': return '#ef4444';
      case 'compile_error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) return <div className="loading">Loading problem...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;
  if (!data?.problem) return <div className="error">Problem not found</div>;

  const problem = data.problem;

  return (
    <div className="problem-details">
      {/* Header */}
      <div className="problem-header">
        <button 
          className="back-button"
          onClick={() => navigate('/')}
          aria-label="Back to problems list"
        >
          ← Back to Problems
        </button>
        <div className="problem-title-section">
          <h1>{problem.id}. {problem.title}</h1>
          <div className="problem-meta">
            <span 
              className="difficulty-badge"
              style={{ 
                color: getDifficultyColor(problem.difficulty),
                backgroundColor: `${getDifficultyColor(problem.difficulty)}20`
              }}
            >
              {problem.difficulty}
            </span>
            {problem.tags?.map(tag => (
              <span key={tag} className="tag-badge">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="problem-content">
        {/* Left Panel - Problem Description */}
        <div className="left-panel">
          <div className="panel-tabs">
            <button 
              className={`tab ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={`tab ${activeTab === 'examples' ? 'active' : ''}`}
              onClick={() => setActiveTab('examples')}
            >
              Examples
            </button>
            <button 
              className={`tab ${activeTab === 'constraints' ? 'active' : ''}`}
              onClick={() => setActiveTab('constraints')}
            >
              Constraints
            </button>
            {problem.hints && (
              <button 
                className={`tab ${activeTab === 'hints' ? 'active' : ''}`}
                onClick={() => setActiveTab('hints')}
              >
                Hints
              </button>
            )}
          </div>

          <div className="panel-content">
            {activeTab === 'description' && (
              <div className="description-content">
                <div 
                  className="description-text"
                  dangerouslySetInnerHTML={{ __html: problem.description }}
                />
                <div className="problem-limits">
                  <div className="limit-item">
                    <strong>Time Limit:</strong> {problem.timeLimit}ms
                  </div>
                  <div className="limit-item">
                    <strong>Memory Limit:</strong> {problem.memoryLimit}MB
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'examples' && (
              <div className="examples-content">
                {problem.examples?.map((example, index) => (
                  <div key={index} className="example-item">
                    <h4>Example {index + 1}</h4>
                    <div className="example-io">
                      <div className="example-input">
                        <strong>Input:</strong>
                        <pre>{example.input}</pre>
                      </div>
                      <div className="example-output">
                        <strong>Output:</strong>
                        <pre>{example.output}</pre>
                      </div>
                      {example.explanation && (
                        <div className="example-explanation">
                          <strong>Explanation:</strong>
                          <p>{example.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'constraints' && (
              <div className="constraints-content">
                <div 
                  className="constraints-text"
                  dangerouslySetInnerHTML={{ __html: problem.constraints }}
                />
              </div>
            )}

            {activeTab === 'hints' && problem.hints && (
              <div className="hints-content">
                <div 
                  className="hints-text"
                  dangerouslySetInnerHTML={{ __html: problem.hints }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor and Results */}
        <div className="right-panel">
          {/* Code Editor Section */}
          <div className="editor-section">
            <div className="editor-header">
              <div className="editor-controls">
                <select 
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="language-select"
                >
                  {languages.map(lang => (
                    <option key={lang.id} value={lang.id}>{lang.name}</option>
                  ))}
                </select>
                
                <div className="editor-settings">
                  <label>
                    Font Size:
                    <input
                      type="range"
                      min="10"
                      max="24"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="font-size-slider"
                    />
                    <span>{fontSize}px</span>
                  </label>
                  
                  <select 
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="theme-select"
                  >
                    <option value="vs-dark">Dark</option>
                    <option value="vs-light">Light</option>
                    <option value="hc-black">High Contrast</option>
                  </select>
                </div>
              </div>
              
              <div className="editor-actions">
                <button 
                  onClick={handleRun}
                  disabled={isRunning}
                  className="run-button"
                >
                  {isRunning ? 'Running...' : 'Run Code (Ctrl+Enter)'}
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="submit-button"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit (Ctrl+S)'}
                </button>
              </div>
            </div>

            <div className="editor-container">
              <Editor
                height="400px"
                language={selectedLanguage}
                value={code}
                onChange={(value) => setCode(value || '')}
                onMount={handleEditorDidMount}
                theme={theme}
                options={{
                  fontSize: fontSize,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  roundedSelection: false,
                  selectOnLineNumbers: true,
                  tabSize: 2,
                  insertSpaces: true,
                }}
              />
            </div>
          </div>

          {/* Results Section */}
          <div className="results-section">
            <div className="results-tabs">
              <button 
                className={`tab ${activeTab === 'testinput' ? 'active' : ''}`}
                onClick={() => setActiveTab('testinput')}
              >
                Test Input
              </button>
              <button 
                className={`tab ${activeTab === 'results' ? 'active' : ''}`}
                onClick={() => setActiveTab('results')}
              >
                Results
              </button>
            </div>

            <div className="results-content">
              {activeTab === 'testinput' && (
                <div className="test-input-section">
                  <label htmlFor="custom-input">Custom Input:</label>
                  <textarea
                    id="custom-input"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter your test input here..."
                    rows="4"
                    className="custom-input"
                  />
                  
                  {runResults && (
                    <div className="run-results">
                      <h4>Output:</h4>
                      {runResults.error ? (
                        <div className="error-output">
                          <pre>{runResults.error}</pre>
                        </div>
                      ) : (
                        <div className="success-output">
                          <pre>{runResults.output}</pre>
                          {runResults.runtime && (
                            <div className="execution-stats">
                              <span>Runtime: {runResults.runtime}ms</span>
                              {runResults.memory && (
                                <span>Memory: {runResults.memory}MB</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'results' && (
                <div className="submission-results">
                  {results ? (
                    <div className="results-display">
                      <div className="result-header">
                        <h4 
                          className="result-status"
                          style={{ color: getStatusColor(results.status) }}
                        >
                          {results.status.replace(/_/g, ' ')}
                        </h4>
                        {results.runtime && (
                          <div className="result-stats">
                            <span>Runtime: {results.runtime}ms</span>
                            {results.memory && (
                              <span>Memory: {results.memory}MB</span>
                            )}
                          </div>
                        )}
                      </div>

                      {results.error && (
                        <div className="result-error">
                          <h5>Error:</h5>
                          <pre>{results.error}</pre>
                        </div>
                      )}

                      {results.output && (
                        <div className="result-output">
                          <h5>Output:</h5>
                          <pre>{results.output}</pre>
                        </div>
                      )}

                      {results.testCases && (
                        <div className="test-cases">
                          <h5>Test Cases:</h5>
                          {results.testCases.map((testCase, index) => (
                            <div 
                              key={index}
                              className={`test-case ${testCase.passed ? 'passed' : 'failed'}`}
                            >
                              <div className="test-case-header">
                                <span className="test-case-number">Test Case {index + 1}</span>
                                <span className={`test-case-status ${testCase.passed ? 'passed' : 'failed'}`}>
                                  {testCase.passed ? '✓ Passed' : '✗ Failed'}
                                </span>
                              </div>
                              
                              <div className="test-case-details">
                                <div className="test-case-input">
                                  <strong>Input:</strong>
                                  <pre>{testCase.input}</pre>
                                </div>
                                <div className="test-case-expected">
                                  <strong>Expected:</strong>
                                  <pre>{testCase.expectedOutput}</pre>
                                </div>
                                <div className="test-case-actual">
                                  <strong>Actual:</strong>
                                  <pre>{testCase.actualOutput}</pre>
                                </div>
                                {testCase.runtime && (
                                  <div className="test-case-stats">
                                    <span>Runtime: {testCase.runtime}ms</span>
                                    {testCase.memory && (
                                      <span>Memory: {testCase.memory}MB</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="no-results">
                      <p>No submission results yet. Submit your code to see results here.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetails;