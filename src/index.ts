#!/usr/bin/env node
import { FastMCP } from "fastmcp";
import { z } from "zod";
import { Todos } from "./models/Todos";
import { FileStorage } from "./storage/FileStorage";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as os from "os";
import * as path from "path";

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .options({
    baseDir: {
      type: "string",
      description: "Base directory for storing todo files",
      default: path.join(os.homedir(), ".claude", "filesystem", "todos"),
    },
  })
  .parseSync();

const server = new FastMCP({
  name: "Todo List",
  version: "1.0.0",
});

const todos = new Todos(new FileStorage(argv.baseDir, "todos.yaml"));

server.addTool({
  name: "Get-Todo",
  description: "Get a specific todo by ID",
  parameters: z.object({
    id: z.number().int().positive(),
  }),
  execute: async (args) => {
    const todo = todos.find(args.id);
    return todo.toYAML();
  },
});

server.addTool({
  name: "List-All-Todos",
  description: "List all todos",
  parameters: z.object({}),
  execute: async () => {
    return todos
      .list()
      .map((todo) => todo.toYAML())
      .join("\n");
  },
});

server.addTool({
  name: "List-Completed-Todos",
  description: "List all completed todos",
  parameters: z.object({}),
  execute: async () => {
    return todos
      .list("done")
      .map((todo) => todo.toYAML())
      .join("\n");
  },
});

server.addTool({
  name: "List-Pending-Todos",
  description: "List all pending todos",
  parameters: z.object({}),
  execute: async () => {
    return todos
      .list("pending")
      .map((todo) => todo.toYAML())
      .join("\n");
  },
});

server.addTool({
  name: "Add-Todo",
  description: "Add a todo",
  parameters: z.object({
    description: z.string(),
    due: z.date().optional(),
  }),
  execute: async (args) => {
    todos.create(args.description, args.due);
    return "Successfully added todo";
  },
});

server.addTool({
  name: "Mark-Todo-Done",
  description: "Mark a todo item as completed",
  parameters: z.object({
    id: z.number().int().positive(),
  }),
  execute: async (args) => {
    todos.markDone(args.id);
    return `Successfully marked todo ${args.id} as done`;
  },
});

server.addTool({
  name: "List-Due-Today",
  description: "List all pending todos that are due today or overdue",
  parameters: z.object({}),
  execute: async () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return todos
      .listDueBy(today)
      .map((todo) => todo.toYAML())
      .join("\n");
  },
});

server.addTool({
  name: "List-Due-This-Week",
  description: "List all pending todos that are due this week or earlier",
  parameters: z.object({}),
  execute: async () => {
    return todos
      .listDueThisWeek()
      .map((todo) => todo.toYAML())
      .join("\n");
  },
});

server.addTool({
  name: "List-Overdue",
  description: "List all pending todos that are past their due date",
  parameters: z.object({}),
  execute: async () => {
    const now = new Date();
    return todos
      .list("pending")
      .filter((todo) => todo.due && todo.due < now)
      .map((todo) => todo.toYAML())
      .join("\n");
  },
});

server.addTool({
  name: "Update-Todo",
  description: "Update a todo's description and/or due date",
  parameters: z.object({
    id: z.number().int().positive(),
    description: z.string().optional(),
    due: z.string().date().optional(),
  }),
  execute: async (args) => {
    const updates: { description?: string; due?: Date | null } = {};
    if (args.description !== undefined) updates.description = args.description;
    if (args.due !== undefined) updates.due = new Date(args.due);

    if (Object.keys(updates).length === 0) {
      return "No updates provided. Please specify either description or due date.";
    }

    const todo = todos.update(args.id, updates);
    return `Successfully updated todo ${args.id}:\n${todo.toYAML()}`;
  },
});

server.addTool({
  name: "Get-Most-Recently-Modified-Todo",
  description: "Get the todo that was modified most recently",
  parameters: z.object({}),
  execute: async () => {
    const allTodos = todos.list();
    if (allTodos.length === 0) {
      return "No todos found";
    }

    const mostRecent = allTodos.reduce((latest, current) =>
      current.modified > latest.modified ? current : latest
    );

    return `Most recently modified todo:\n${mostRecent.toYAML()}`;
  },
});

server.start({
  transportType: "stdio",
});
