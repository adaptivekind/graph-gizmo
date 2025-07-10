# Knowledge Graph Project

A D3.js-based knowledge graph visualization library built with TypeScript.

## Project Structure

```
src/
├── index.ts                 # Main entry point
├── render.ts               # Core rendering logic
├── types.ts                # TypeScript type definitions
├── default-configuration.ts # Default configuration
├── presentation-graph.ts   # Graph presentation logic
├── collide-rectangle.ts    # Collision detection
└── item-name.ts           # Item naming utilities

dev/
└── index.html             # Development server page

test/
├── index.html             # Test page
└── *.test.ts              # Test files
```

## Development Commands

- `npm start` - Start development server with hot reload (uses Vite)
- `npm run build` - Build production bundle
- `npm run build:watch` - Build in watch mode
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run clean` - Clean build artifacts

## Development Workflow

1. **Development Server**: Use `npm start` to run the development server

   - Serves from `dev/index.html`
   - Hot reloads on TypeScript changes
   - Runs on http://localhost:3000

2. **Testing**: Tests are in the `test/` directory using Jest

   - Run with `npm test`
   - Watch mode: `npm run test:watch`

3. **Building**: Production builds use Rollup
   - Output: `dist/bundle.js`
   - Watch mode: `npm run build:watch`

## Code Quality

- **Husky**: Pre-commit hooks configured
- **Lint-staged**: Runs on staged files before commit
- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting (configured in lint-staged)

## Key Dependencies

- **D3.js**: Data visualization library
- **TypeScript**: Type-safe JavaScript
- **Rollup**: Module bundler for production
- **Vite**: Development server with HMR
- **Jest**: Testing framework

## Notes

- The project uses ES modules (`"type": "module"`)
- Main library exports are in `src/index.ts`
- Development uses direct TypeScript imports via Vite
- Production builds are bundled with Rollup
- Graph schema types come from `@adaptivekind/graph-schema`

## Coding Guidelines

### Prefer `const` over `let`

Always use `const` for variables that don't need reassignment. Avoid reassigning configuration objects when the underlying system already manages state.

**Example**: In `render.ts`, `fullConfig` should remain `const` because:

- It represents the initial configuration (immutable)
- D3 simulation object maintains the actual runtime state
- Updates are applied directly to the simulation via methods like `simulation.alphaDecay(value)`
- Reassigning the config object creates duplicate state tracking

```typescript
// ✅ Good: Keep config as const, update simulation directly
const fullConfig = defaultConfiguration(config);
const updateConfig = (updates) => {
  const updatedConfig = { ...fullConfig, ...updates };
  simulation.alphaDecay(updatedConfig.alphaDecay);
};

// ❌ Avoid: Reassigning const or making it let unnecessarily
let fullConfig = defaultConfiguration(config);
const updateConfig = (updates) => {
  fullConfig = { ...fullConfig, ...updates }; // Creates duplicate state
};
```
