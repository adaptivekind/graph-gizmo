# Knowledge Graph Project

A D3.js-based knowledge graph visualization library built with TypeScript.

## Universal Directives

1. you MUST write code that is clear and explains meaning - prefer readability
   over condensed code.
2. you MUST test, lint and build before declaring done.
3. you MUST handle errors explicitly.
4. you MUST code in a way that matches the style of the existing code.
5. you MUST code in a way that makes it easier for future coders.
6. you MUST focus on the task at hand, do not make changes that do not help
   towards this goal.
7. you SHOULD ensure a test exists that describes the intended behaviour, before
   writing the code that delivers that behaviour. Once the test is passes you
   should refactor the implementation to ensure the universal directives are met.
8. you SHOULD from time to time review the code base holistically to check
   whether it satisfies the universal directives. If you have recommendation you
   MUST explain what you feel should be done. Only proceed with the fixes when
   explicitly asked to.

### Code Strategy

- Codebase > Documentation as source of truth.
- you MUST not use the `any` type.
- Sort typescript imports by putting multiple imports first. After that single
  imports should be sorted starting with a imports starting with a capital letter,
  after which single imports starting with a lower case letter should be sorted.
- Prefer feature tests which test the public interfaces for this package as opposed
  to unit tests based on internal functions. This asserts the desired behaviour of
  the package.
- Markdown should have a `textwidth` of 80 characters

## Engineering guidance

- NEVER assume, always question
- be BRUTALLY HONEST in assessments
- NO NONSENSE, NO HYPE, NO MARKETING SPEAK - prefer hard facts and stay
  objective
- Use slash commands for consistent workflows

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

## Notes

- The project uses ES modules (`"type": "module"`)
- Main library exports are in `src/index.ts`
- Development uses direct TypeScript imports via Vite
- Production builds are bundled with Rollup
- Graph schema types come from `@adaptivekind/graph-schema`
