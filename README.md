# MCP Todo List App

A todo list application implementing Model Context Protocol (MCP), enabling seamless interaction with AI assistants and chatbots. This application is a practical todo list manager and a demonstration of MCP integration.

## Features

- ✨ Full todo list functionality (create, read, update, delete tasks)
- 🤖 MCP-compliant API for AI assistant integration
- 🏠 Local storage (no SaaS account required)

## What is MCP?

The Model Context Protocol (MCP) is a standardized interface that allows AI models and chatbots to interact with applications in a consistent and predictable way. By implementing MCP, this todo list app can be seamlessly controlled by AI assistants, enabling natural language interactions for task management.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/tomelliot/mcp-todos.git
cd mcp-todo-app
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

## MCP Integration

This todo list app exposes the following MCP tools:

- `Get-Todo`: Get a specific todo by ID
- `List-All-Todos`: List all todos
- `List-Completed-Todos`: List all completed todos
- `List-Pending-Todos`: List all pending todos
- `Add-Todo`: Add a todo
- `Mark-Todo-Done`: Mark a todo item as completed
- `List-Due-Today`: List all pending todos that are due today or overdue
- `List-Due-This-Week`: List all pending todos that are due this week or earlier
- `Update-Todo`: Update a todo's description and/or due date

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the GPL License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with modern web technologies
- Implements MCP specification for AI integration
- Inspired by the need for AI-friendly applications
