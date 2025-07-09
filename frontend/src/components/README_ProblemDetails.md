# ProblemDetails Component

A comprehensive React component for displaying coding problems with an integrated code editor, problem description, and results panel.

## Overview

The ProblemDetails component provides a complete problem-solving interface with:
- **Left Panel**: Problem description, examples, constraints, and hints
- **Right Panel**: Code editor with syntax highlighting and execution results
- **Responsive Design**: Adapts to different screen sizes and orientations

## Features

### Problem Display
- Rich HTML problem descriptions with syntax highlighting
- Interactive examples with input/output display
- Constraints and hints in separate tabs
- Problem metadata (difficulty, tags, time/memory limits)

### Code Editor
- Monaco Editor integration with syntax highlighting
- Multiple language support (Python, JavaScript, Java, C++, C, Go, Rust)
- Customizable themes (Dark, Light, High Contrast)
- Adjustable font size
- Keyboard shortcuts (Ctrl+S to submit, Ctrl+Enter to run)

### Code Execution
- **Run Code**: Test with custom input
- **Submit Solution**: Full test suite evaluation
- Real-time feedback with execution stats
- Detailed test case results

### User Interface
- Clean, modern design with accessibility features
- Responsive layout that works on desktop, tablet, and mobile
- Dark mode support
- High contrast mode for accessibility
- Keyboard navigation support

## Component Structure

```
ProblemDetails/
├── Problem Header (title, difficulty, tags)
├── Left Panel
│   ├── Description Tab
│   ├── Examples Tab
│   ├── Constraints Tab
│   └── Hints Tab
└── Right Panel
    ├── Code Editor
    │   ├── Language Selection
    │   ├── Theme & Font Controls
    │   └── Monaco Editor
    └── Results Section
        ├── Test Input Tab
        └── Results Tab
```

## Props

The component uses React Router's `useParams` to get the problem ID from the URL.

## GraphQL Integration

### Queries
- `GET_PROBLEM`: Fetches problem details, examples, constraints, and default code
- `SUGGEST_TAGS`: Gets tag suggestions for search functionality

### Mutations
- `SUBMIT_SOLUTION`: Submits code for evaluation against all test cases
- `RUN_CODE`: Executes code with custom input for testing

## Usage

```jsx
import ProblemDetails from './pages/ProblemDetails';

// Used in routing
<Route path="/problem/:id" element={<ProblemDetails />} />
```

## State Management

The component manages several pieces of state:
- `selectedLanguage`: Current programming language
- `code`: Editor content
- `customInput`: User-provided test input
- `activeTab`: Currently active tab (description, examples, etc.)
- `results`: Submission results
- `runResults`: Code execution results
- `fontSize`: Editor font size
- `theme`: Editor theme

## Language Support

Supported programming languages with default templates:
- Python
- JavaScript
- Java
- C++
- C
- Go
- Rust

## Responsive Design

The component adapts to different screen sizes:

### Desktop (1200px+)
- Side-by-side layout with problem description on left, editor on right
- Full-featured toolbar with all options

### Tablet (768px - 1199px)
- Stacked layout with problem description above editor
- Condensed toolbar

### Mobile (< 768px)
- Single column layout
- Simplified toolbar
- Touch-friendly controls

## Accessibility Features

- ARIA labels and roles
- Keyboard navigation support
- High contrast mode
- Screen reader compatibility
- Focus management

## Styling

The component uses CSS modules with comprehensive responsive design:
- `ProblemDetails.css`: Main stylesheet
- Supports dark mode via `prefers-color-scheme`
- Uses CSS Grid and Flexbox for layout
- Smooth transitions and hover effects

## Code Editor Features

### Monaco Editor Integration
- Full-featured code editor with IntelliSense
- Syntax highlighting for all supported languages
- Code formatting and error detection
- Vim/Emacs keybindings support

### Customization Options
- Theme selection (Dark, Light, High Contrast)
- Font size adjustment (10px - 24px)
- Language-specific configurations

## Results Display

### Test Input Section
- Custom input textarea
- Run code with user-provided input
- Execution time and memory usage display

### Results Section
- Submission status (Accepted, Wrong Answer, Runtime Error, etc.)
- Overall execution statistics
- Detailed test case results
- Error messages and stack traces

## Performance Considerations

- Lazy loading of Monaco Editor
- Debounced API calls for tag suggestions
- Efficient re-rendering with React hooks
- Optimized CSS for smooth animations

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- React 18+
- React Router 6+
- Apollo Client 3+
- Monaco Editor React
- CSS3 with Grid and Flexbox support

## Future Enhancements

- Code collaboration features
- Version history
- Code sharing
- Performance profiling
- Additional language support
- AI-powered code suggestions

## Testing

The component includes comprehensive test coverage:
- Unit tests for all major functions
- Integration tests for GraphQL operations
- E2E tests for user workflows
- Accessibility testing with axe-core

## Contributing

When contributing to this component:
1. Follow the existing code style and patterns
2. Add tests for new features
3. Update documentation
4. Ensure accessibility compliance
5. Test on multiple screen sizes and devices