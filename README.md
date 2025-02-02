# PythOWO 🌸

A kawaii Python interpreter and code generation service that transforms regular Python into an uwu-fied programming language! Built during AISOC Chronos v1.0 to make coding more adorable.

## What is PythOWO? ✨

PythOWO consists of two main components:

1. **PythOWO Interpreter**: A custom Python interpreter that executes code written in PythOWO syntax. It features:
   - Custom lexer and parser for uwu-style syntax
   - Variable scope management
   - Support for basic control structures (IF/EWIF/EWSE) 
   - Function definitions with FWUNCTION
   - Interactive shell with kawaii prompts

2. **Code Generation Service**: An Express.js server that:
   - Uses Hugging Face's Qwen2.5-72B-Instruct model for code generation
   - Transforms regular Python into PythOWO syntax in real-time
   - Provides streaming responses for code generation
   - Executes PythOWO code and returns results
   - Code sharing functionality with 24-hour expiration
   - Multiple theme options for customization

## Features 🌟

### Core Features
- Real-time code generation with AI
- PythOWO syntax transformation
- Code execution and output display
- Interactive chat interface

### New Additions
1. **Code Sharing**:
   - Generate shareable links for your code
   - Easy-to-use copy functionality
   - Links expire after 24 hours for security
   - Clean, modal-based sharing interface

2. **Theme Customization**:
   - Multiple theme options (Blue, Pink, Purple)
   - Persistent theme preferences
   - Smooth theme transitions
   - Mobile-responsive design

3. **Code Management**:
   - Edit code in-place
   - Copy code with one click
   - Run code and see output
   - Share code instantly

## How It Works 🔧

### Interpreter Implementation
The interpreter (`pythowo.py`) uses:
- Regular expressions for syntax parsing
- Python's eval() for expression evaluation
- Custom variable scope management
- Error handling with cute emoticons

### Code Generation Service
The service transforms code using:
```javascript
function pythOWOify(code) {
    // Transforms function definitions
    .replace(/def\s+(\w+)\s*\((.*?)\):/g, 'FWUNCTION $1($2) ->')
    // Transforms if statements
    .replace(/if\s+(.*?):/g, 'IF $1 THWEN')
    // ... more transformations
}
```

### PythOWO Syntax Examples
```python
# Regular Python
def calculate(x):
    if x > 0:
        print("Positive!")
    else:
        print("Non-positive!")

# PythOWO Version
FWUNCTION calculate(x) -> 
    IF x > 0 THWEN
        pwint("Positive!")
    EWSE
        pwint("Non-positive!")
    END
```

## Tech Stack 🛠️

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Express.js, Node.js
- **AI Model**: Hugging Face's Qwen2.5-72B-Instruct
- **Interpreter**: Python
- **Text Processing**: Regular Expressions
- **API**: Server-Sent Events for streaming responses
- **Styling**: FontAwesome icons, CSS animations
- **Storage**: File-based code sharing system

## Technical Highlights 💫

1. **Real-time Code Transformation**:
   - Regex-based syntax transformation
   - Streaming responses using Server-Sent Events
   - Error handling with kawaii messages

2. **Custom Language Features**:
   - Variable scope management
   - Control flow structures
   - Function definitions
   - Expression evaluation

3. **AI Integration**:
   - Prompt engineering for code generation
   - Stream processing of model outputs
   - Real-time syntax transformation

4. **User Experience**:
   - Responsive modal dialogs
   - Toast notifications for actions
   - Theme persistence
   - Loading states and animations
   - Mobile-friendly design

## Security Considerations 🔒

- File-based sharing with random identifiers
- 24-hour expiration for shared code
- Path traversal protection
- Input validation and sanitization
- Secure file handling

Built with 💝 for AISOC Chronos v1.0
