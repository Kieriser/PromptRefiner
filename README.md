# PromptRefiner 🚀

A modern, space-themed web application that helps users craft better AI prompts with real-time suggestions and clarity scoring. Built with Next.js, TypeScript, and powered by OpenAI's GPT-3.5-turbo.

![PromptRefiner Demo](https://img.shields.io/badge/Status-Production%20Ready-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white) ![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)

## ✨ Features

### 🎨 **Modern Space-Themed UI**
- **Glass Morphism Design**: Translucent cards with backdrop blur effects
- **Animated Star Field**: CSS-generated stars with gradient overlays
- **Gradient Typography**: Multi-color gradient text with glow effects
- **Responsive Layout**: Mobile-first design that works on all devices
- **Smooth Animations**: Hover effects, loading states, and transitions

### 🔐 **User API Key Management**
- **Initial Setup Flow**: Users must provide their own OpenAI API key
- **Secure Storage**: API keys stored in browser session storage only
- **Privacy-First**: No server-side data persistence or logging
- **Easy Key Management**: Change API key button for flexibility
- **Cost Protection**: Prevents unauthorized use of developer's API credits

### 🤖 **Real-Time Prompt Refinement**
- **Debounced Input**: 500ms delay prevents excessive API calls
- **1-3 Suggestions**: AI-powered prompt improvements with explanations
- **Clarity Scoring**: Visual progress bars showing prompt clarity (1-10 scale)
- **Copy Functionality**: One-click copy to clipboard with icons
- **Error Handling**: Graceful error states with user-friendly messages

### 🧪 **Comprehensive Testing**
- **17 Passing Tests**: Complete test coverage for components and API
- **Jest Integration**: Modern testing setup with Next.js support
- **API Route Tests**: Validation, error handling, and data sanitization
- **Component Tests**: UI interactions, accessibility, and state management
- **Mocking**: Axios and OpenAI API mocking for reliable tests

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4.1 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom configurations
- **HTTP Client**: Axios for API requests
- **Testing**: Jest + React Testing Library
- **Fonts**: Inter (main) + JetBrains Mono (monospace)
- **AI Integration**: OpenAI GPT-3.5-turbo API
- **State Management**: React hooks with session storage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/promptrefiner.git
cd promptrefiner

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` and enter your OpenAI API key to begin!

### Environment Variables (Optional)
Create a `.env.local` file for fallback API key:
```env
OPENAI_API_KEY=your_fallback_api_key_here
```

## 📁 Project Structure

```
promptrefiner/
├── src/app/
│   ├── api/refine/
│   │   ├── route.ts          # OpenAI API integration
│   │   └── route.test.ts     # API endpoint tests
│   ├── components/
│   │   ├── ApiKeySetup.tsx       # Initial API key setup page
│   │   ├── PromptRefiner.tsx     # Main refiner component
│   │   ├── PromptRefinerApp.tsx  # App state management
│   │   └── PromptRefiner.test.tsx # Component tests
│   ├── layout.tsx            # Root layout with fonts
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── jest.config.js            # Jest configuration
├── jest.setup.js             # Jest setup file
├── tailwind.config.ts        # Tailwind customizations
└── package.json
```

## 🎯 Key Components

### `ApiKeySetup.tsx`
Initial setup page requiring users to enter their OpenAI API key:
- **Form Validation**: Checks for valid API key format
- **Security Icons**: Visual indicators for privacy and security
- **Help Links**: Direct link to OpenAI platform for key creation
- **Error Handling**: Clear error messages for invalid inputs

### `PromptRefiner.tsx`
Main application interface with prompt refinement functionality:
- **Debounced Input**: 500ms delay using lodash.debounce
- **Real-time Suggestions**: Live API calls with loading states
- **Clarity Visualization**: Progress bars with gradient colors
- **Copy to Clipboard**: Symbol-based copy buttons
- **Responsive Design**: Mobile-optimized layout

### `PromptRefinerApp.tsx`
State management wrapper controlling the application flow:
- **Session Storage**: Manages API key persistence
- **Component Routing**: Switches between setup and main app
- **Loading States**: Handles initial app loading
- **Key Reset**: Functionality to change API keys

## 🔧 API Implementation

### `/api/refine` Endpoint
- **Method**: POST
- **Input**: `{ prompt: string, apiKey: string }`
- **Output**: `{ suggestions: RefinedPrompt[] }`
- **Features**:
  - User API key priority over environment variable
  - Input validation and sanitization
  - Error handling with specific status codes
  - Fallback responses for malformed AI output

### OpenAI Integration
```typescript
// System prompt for consistent AI responses
const systemPrompt = `You are an AI prompt refinement expert. 
Given a user's prompt, provide 1-3 refined versions that are 
more clear, specific, and effective.`;

// Response format
interface RefinedPrompt {
  id: string;
  refined: string;
  clarity: number;      // 1-10 scale
  explanation: string;  // Why this improvement is better
}
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage
- **API Route Tests**: 8 tests covering validation, error handling, and data processing
- **Component Tests**: 9 tests covering rendering, interactions, and accessibility
- **Mocking**: Complete mocking of external dependencies (axios, OpenAI API)
- **Edge Cases**: Error states, empty inputs, and malformed responses

## 🎨 Design System

### Color Palette
```css
/* Primary Gradients */
--gradient-primary: from-cyan-400 via-blue-500 to-purple-600;
--gradient-secondary: from-purple-600 via-pink-500 to-cyan-400;

/* Glass Morphism */
--glass-bg: bg-white/5;
--glass-border: border-white/10;
--glass-hover: hover:bg-white/10;

/* Typography */
--font-primary: Inter (system-ui fallback);
--font-mono: JetBrains Mono (monospace fallback);
```

### Responsive Breakpoints
- **Mobile**: Default styles (320px+)
- **Tablet**: sm: (640px+)
- **Desktop**: lg: (1024px+)
- **Large Desktop**: xl: (1280px+)

## 🔒 Security & Privacy

### Data Handling
- **No Server Storage**: API keys never stored on server
- **Session-Only**: Keys stored in browser session storage
- **HTTPS Only**: All API communications encrypted
- **No Logging**: Prompts and responses not logged server-side

### API Key Security
- **Client-Side Storage**: Keys remain in user's browser
- **Format Validation**: Ensures proper OpenAI key format
- **Reset Functionality**: Easy key management and changes
- **Fallback Protection**: Optional environment fallback

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
# OPENAI_API_KEY (optional fallback)
```

### Environment Variables for Production
Set these in your deployment platform:
- `OPENAI_API_KEY` (optional): Fallback API key

### Build Commands
```bash
# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📈 Performance Optimizations

- **Debounced API Calls**: Prevents excessive requests
- **Lazy Loading**: Components load only when needed
- **Optimized Fonts**: Font display swap for better loading
- **Efficient Re-renders**: Proper React optimization patterns
- **Compressed Assets**: Automatic Next.js optimizations

## 🛣️ Future Enhancements

### Planned Features
- [ ] Dark/Light mode toggle
- [ ] Prompt history and favorites
- [ ] Multiple AI model support (GPT-4, Claude)
- [ ] Batch prompt processing
- [ ] Export functionality (PDF, text)
- [ ] Collaborative prompt editing

### Technical Improvements
- [ ] Progressive Web App (PWA) support
- [ ] Advanced caching strategies
- [ ] Real-time collaboration features
- [ ] Analytics and usage tracking
- [ ] A/B testing framework

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Maintain test coverage above 90%
- Use conventional commit messages
- Ensure accessibility compliance
- Test on multiple devices and browsers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI**: For providing the GPT-3.5-turbo API
- **Vercel**: For excellent Next.js hosting and development experience
- **Tailwind CSS**: For the utility-first CSS framework
- **Next.js Team**: For the incredible React framework
- **Testing Library**: For excellent React testing utilities

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/promptrefiner/issues)
- **Documentation**: This README and inline code comments
- **Community**: [Discussions](https://github.com/yourusername/promptrefiner/discussions)

---

**Built with ❤️ for better AI conversations • Privacy-first • No data stored**

*Generated with [Claude Code](https://claude.ai/code)*