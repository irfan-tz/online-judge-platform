import { useEffect } from 'react';
import { marked } from 'marked';
import './MarkdownRenderer.css';

/**
 * A reusable component for rendering Markdown content
 * @param {Object} props
 * @param {string} props.markdown - The markdown text to render
 * @param {string} props.className - Additional class names for styling
 */
const MarkdownRenderer = ({ markdown, className = '' }) => {
  // Configure marked options on component mount
  useEffect(() => {
    marked.setOptions({
      breaks: true,        // Convert \n in paragraphs into <br>
      gfm: true,           // GitHub Flavored Markdown
      headerIds: true,     // Include ids for headers
      mangle: false,       // Don't escape HTML
      sanitize: false,     // Don't sanitize HTML (be careful with user input)
    });
  }, []);

  // Parse the markdown content
  const getMarkdownHtml = () => {
    try {
      return { __html: marked.parse(markdown || '') };
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return { __html: '<p>Error rendering markdown</p>' };
    }
  };

  return (
    <div 
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={getMarkdownHtml()}
    />
  );
};

export default MarkdownRenderer;
