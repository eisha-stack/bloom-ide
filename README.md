# Bloom IDE

A modern React application built with Vite and TypeScript.

## Features

- ⚛️ React 18
- 🦾 TypeScript
- ⚡ Vite for fast development
- 🎨 Modern styling with CSS

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building

Build for production:

```bash
npm run build
```

### Preview

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
bloom-ide/
├── src/
│   ├── App.tsx          # Main application component
│   ├── App.css          # Application styles
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── index.html           # HTML entry point
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies
```

## Dependencies

### Production
- **react** (^18.0.0) - UI library
- **react-dom** (^18.0.0) - React DOM rendering

### Development
- **typescript** (~6.0.2) - Language support
- **vite** (^8.0.12) - Build tool
- **@vitejs/plugin-react** - React support for Vite
- **@types/react** - React type definitions
- **@types/react-dom** - React DOM type definitions

## License

MIT
