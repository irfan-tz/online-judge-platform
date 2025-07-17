import React, { useState } from 'react';

const CreateProblemAI = ({ problemDescription }) => {
  const [generating, setGenerating] = useState(false);
  const [aiOptions, setAiOptions] = useState({
    generateTestCases: true,
    generateBoilerplate: true,
    generateSolution: false,
    generateHints: false
  });
  const [aiOutput, setAiOutput] = useState(null);

  const handleOptionChange = (e) => {
    const { name, checked } = e.target;
    setAiOptions({
      ...aiOptions,
      [name]: checked
    });
  };

  const generateContent = () => {
    // This function will be implemented later with actual AI integration
    setGenerating(true);

    // Simulate AI processing
    setTimeout(() => {
      setAiOutput({
        message: "AI content generation will be implemented in a future update.",
        suggestions: [
          "Consider adding more test cases that cover edge conditions.",
          "The problem description could benefit from clearer examples.",
          "Add constraints for input size to guide users."
        ]
      });
      setGenerating(false);
    }, 2000);
  };

  return (
    <div className="ai-panel">
      <div className="ai-options">
        <h4>Generate with AI</h4>
        <p>
          Select what you'd like the AI to generate based on your problem description:
        </p>
        <div className="ai-option-group">
          <label className="ai-option">
            <input 
              type="checkbox" 
              name="generateTestCases" 
              checked={aiOptions.generateTestCases}
              onChange={handleOptionChange}
            />
            <span>Test Cases</span>
          </label>
          <label className="ai-option">
            <input 
              type="checkbox" 
              name="generateBoilerplate" 
              checked={aiOptions.generateBoilerplate}
              onChange={handleOptionChange}
            />
            <span>Boilerplate Code</span>
          </label>
          <label className="ai-option">
            <input 
              type="checkbox" 
              name="generateSolution" 
              checked={aiOptions.generateSolution}
              onChange={handleOptionChange}
            />
            <span>Solution</span>
          </label>
          <label className="ai-option">
            <input 
              type="checkbox" 
              name="generateHints" 
              checked={aiOptions.generateHints}
              onChange={handleOptionChange}
            />
            <span>Hints</span>
          </label>
        </div>
        <button 
          className="admin-btn ai-btn" 
          onClick={generateContent}
          disabled={generating || !problemDescription.trim()}
        >
          {generating ? <span className="loading-spinner">⏳</span> : 'Generate Selected Content'}
        </button>
        <p className="ai-note">
          <span className="note-icon">ℹ️</span> This feature will be implemented soon. The AI will analyze your problem description and generate appropriate test cases and code templates.
        </p>
      </div>
      <div className="ai-feedback">
        <h4>AI Feedback</h4>
        <div className="ai-feedback-content">
          {aiOutput ? (
            <div>
              <p>{aiOutput.message}</p>
              {aiOutput.suggestions && aiOutput.suggestions.length > 0 && (
                <div className="ai-suggestions">
                  <h5>Suggestions:</h5>
                  <ul>
                    {aiOutput.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p>The AI will provide feedback on your problem here...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProblemAI;
