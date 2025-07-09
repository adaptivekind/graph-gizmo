# Link Graph

A D3.js-based link graph visualization library built with TypeScript.

![Example Graph](docs/images/example-graph.png)

## Features

- Interactive graph visualization using D3.js
- TypeScript support for type safety
- Configurable layout and styling
- Hot reload development environment
- Collision detection for node positioning

## Installation

```bash
npm install @adaptivekind/knowledge-graph
```

## Quick Start

```html
<!doctype html>
<html>
  <head>
    <title>Graph Gizmo Example</title>

    <script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/d3-quadtree@3.0.1/dist/d3-quadtree.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@adaptivekind/graph-gizmo@0.0.6"></script>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@adaptivekind/graph-gizmo@0.0.6/dist/default.css"
    />
  </head>

  <body>
    <div id="gizmo" />
    <script>
      graphGizmo.render({
        nodes: { a: {}, b: {}, c: {}, d: {}, e: {} },
        links: [
          { source: "a", target: "b" },
          { source: "a", target: "c" },
          { source: "a", target: "d" },
          { source: "b", target: "c" },
          { source: "d", target: "e" },
        ],
      });
    </script>
  </body>
</html>
```

## Development

### Setup

```bash
npm install
```

### Development Server

Start the development server with hot reload:

```bash
npm start
```

This will open http://localhost:3000 with a live preview of the graph.

### Building

```bash
npm run build          # Production build
npm run build:watch    # Watch mode
```

### Testing

```bash
npm test              # Run tests
npm run test:watch    # Watch mode
```

### Linting

```bash
npm run lint          # Check code style
npm run lint:fix      # Fix issues
```

## License

MIT
