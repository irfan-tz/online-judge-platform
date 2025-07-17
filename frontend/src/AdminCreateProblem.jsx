import { useState, useRef } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import CreateProblemAI from "./pages/admin/CreateProblemAI";
import MarkdownRenderer from "./components/MarkdownRenderer";
import { CREATE_PROBLEM_MUTATION } from "./graphql/mutations";
import "./AdminCreateProblem.css";

const AdminCreateProblem = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [createProblem, { loading }] = useMutation(CREATE_PROBLEM_MUTATION);
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timeLimit: "1s",
    memoryLimit: "256MB",
    difficulty: "Medium",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");
  const [aiAssistEnabled, setAiAssistEnabled] = useState(false);
  const [testcaseFile, setTestcaseFile] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter((tag) => tag !== tagToRemove) });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Change validation from zip to json
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        setTestcaseFile(file);
        setError("");
      } else {
        setTestcaseFile(null);
        setError("Please upload a JSON file containing test cases.");
      }
    }
  };

  const toggleAiAssist = () => {
    setAiAssistEnabled(!aiAssistEnabled);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Problem title is required");
      return;
    }
    if (!formData.description.trim()) {
      setError("Problem description is required");
      return;
    }
    if (!testcaseFile) {
        setError("A test case JSON file is required");
        return;
    }

    try {
      const { data } = await createProblem({
        variables: {
          title: formData.title,
          description: formData.description,
          timeLimit: formData.timeLimit,
          memoryLimit: formData.memoryLimit,
          difficulty: formData.difficulty,
          tags: formData.tags,
          testcaseFile: testcaseFile,
        },
      });

      if (data?.createProblem?.id) {
        navigate(`/problem/${data.createProblem.id}`);
      } else {
          const mutationError = data?.errors?.[0]?.message || "Failed to create problem. Unknown error.";
          setError(mutationError);
      }
    } catch (err) {
      console.error("Error creating problem:", err);
      setError(err.message || "An unexpected error occurred.");
    }
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  return (
    <div className="admin-problem-create">
      <div className="admin-problem-header">
        <h1>Create New Problem</h1>
        <div className="action-buttons">
          <button className="admin-btn secondary" onClick={() => navigate("/admin/dashboard")}>Cancel</button>
          <button className="admin-btn primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="loading-spinner">⏳</span> : "Save Problem"}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tabs-container">
        <div className="tabs">
          <button className={`tab ${activeTab === "basic" ? "active" : ""}`} onClick={() => setActiveTab("basic")}>Basic Info</button>
          <button className={`tab ${activeTab === "description" ? "active" : ""}`} onClick={() => setActiveTab("description")}>Description</button>
          <button className={`tab ${activeTab === "testcases" ? "active" : ""}`} onClick={() => setActiveTab("testcases")}>Test Cases</button>
          <button className={`tab ${activeTab === "ai" ? "active" : ""}`} onClick={() => setActiveTab("ai")}>AI Assistant</button>
        </div>

        <div className="tab-content">
          {activeTab === "testcases" && (
            <div className="tab-pane">
              <div className="testcases-container">
                <div className="upload-section">
                  <h3>Upload Test Cases</h3>
                  <p>Upload a single JSON file containing your test cases. See format instructions below.</p>
                  <div className="file-upload-container">
                    <input
                      type="file"
                      id="testcases"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".json,application/json"
                      style={{ display: "none" }}
                    />
                    <button type="button" className="file-upload-button" onClick={() => fileInputRef.current.click()}>
                      Choose JSON File
                    </button>
                    <span className="file-name">
                      {testcaseFile ? testcaseFile.name : "No file chosen"}
                    </span>
                  </div>
                </div>

                <div className="testcase-format">
                  <h3>Expected JSON Format</h3>
                  <p>The file should be a JSON array of objects. Each object must have an "input" and "output" key. You can optionally add `"is_sample": true`.</p>
                  <pre className="format-example">
                    {`[
  {
    "input": "9\\n2 7 11 15",
    "output": "0 1",
    "is_sample": true
  },
  {
    "input": "10\\n3 5 -4 8",
    "output": "3 7"
  }
]`}
                  </pre>
                </div>
              </div>
            </div>
          )}
          
          {/* Other tabs remain the same */}
          {activeTab === "basic" && (
            <div className="tab-pane">
              <div className="form-group"><label htmlFor="title">Problem Title</label><input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Enter a descriptive title" className="form-input" /></div>
              <div className="form-row"><div className="form-group"><label htmlFor="timeLimit">Time Limit</label><input type="text" id="timeLimit" name="timeLimit" value={formData.timeLimit} onChange={handleChange} placeholder="e.g., 1s" className="form-input" /></div><div className="form-group"><label htmlFor="memoryLimit">Memory Limit</label><input type="text" id="memoryLimit" name="memoryLimit" value={formData.memoryLimit} onChange={handleChange} placeholder="e.g., 256MB" className="form-input" /></div><div className="form-group"><label htmlFor="difficulty">Difficulty</label><select id="difficulty" name="difficulty" value={formData.difficulty} onChange={handleChange} className="form-input"><option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option></select></div></div>
              <div className="form-group"><label htmlFor="tags">Tags</label><div className="tags-input-container"><div className="tags-display">{formData.tags.map((tag) => (<div key={tag} className="tag">{tag}<button type="button" className="remove-tag" onClick={() => removeTag(tag)}>×</button></div>))}</div><div className="tag-input-wrapper"><input type="text" id="tagInput" value={tagInput} onChange={handleTagInputChange} onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Add a tag and press Enter" className="form-input tag-input" /><button type="button" className="add-tag" onClick={addTag}>Add</button></div></div></div>
            </div>
          )}
          {activeTab === "description" && (
            <div className="tab-pane">
              <div className="editor-controls"><button type="button" className={`editor-toggle ${!previewMode ? "active" : ""}`} onClick={() => setPreviewMode(false)}>Edit</button><button type="button" className={`editor-toggle ${previewMode ? "active" : ""}`} onClick={() => setPreviewMode(true)}>Preview</button></div>
              {previewMode ? (<div className="markdown-preview"><div className="preview-content"><h2>{formData.title}</h2><div className="problem-metadata"><span>Time Limit: {formData.timeLimit}</span><span>Memory Limit: {formData.memoryLimit}</span><span>Difficulty: {formData.difficulty}</span></div><div className="problem-tags">{formData.tags.map(tag => (<span key={tag} className="problem-tag">{tag}</span>))}</div><div className="problem-description">{formData.description ? <MarkdownRenderer markdown={formData.description} /> : <p className="placeholder-text">No description provided yet.</p>}</div></div></div>) : (<div className="markdown-editor"><textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Write your problem description using Markdown..." className="form-textarea" rows="20" /><div className="markdown-tips"><h3>Markdown Tips</h3><ul><li><code># H1</code>, <code>## H2</code></li><li><code>**bold**</code></li><li><code>*italic*</code></li><li><code>- item</code></li><li><code>```code```</code></li></ul></div></div>)}
            </div>
          )}
          {activeTab === "ai" && (
            <div className="tab-pane">
              <div className="ai-assistant-container">
                <div className="ai-header"><h3>AI Problem Assistant</h3><div className="ai-toggle"><label className="switch"><input type="checkbox" checked={aiAssistEnabled} onChange={toggleAiAssist} /><span className="slider round"></span></label><span>Enable AI assistance</span></div></div>
                {aiAssistEnabled ? <CreateProblemAI problemDescription={formData.description} /> : <div className="ai-disabled"><div className="ai-placeholder"><div className="ai-icon">🤖</div><h3>AI Assistant is Disabled</h3><p>Enable the AI assistant to get help with generating test cases, boilerplate code, and more.</p><button className="admin-btn secondary" onClick={toggleAiAssist}>Enable AI Assistant</button></div></div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCreateProblem;