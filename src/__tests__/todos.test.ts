import { test, expect, describe, beforeEach } from "vitest";
import { Todos } from "../models/Todos";
import { IStorage } from "../types/todo.types";

// Mock storage implementation for testing
class MockStorage implements IStorage<string> {
  private data: string = "";

  read(): string {
    return this.data;
  }

  write(data: string): void {
    this.data = data;
  }
}

describe("Todos CRUD Operations", () => {
  let todos: Todos;
  let storage: MockStorage;

  beforeEach(() => {
    storage = new MockStorage();
    todos = new Todos(storage);
  });

  test("creates a new todo with correct properties", () => {
    const description = "Test todo";
    const due = new Date("2024-12-31");

    const todo = todos.create(description, due);

    expect(todo.id).toBe(1);
    expect(todo.description).toBe(description);
    expect(todo.status).toBe("pending");
    expect(todo.due).toEqual(due);
    expect(todo.modified).toBeInstanceOf(Date);
  });

  test("creates multiple todos with sequential IDs", () => {
    const todo1 = todos.create("First todo");
    const todo2 = todos.create("Second todo");
    const todo3 = todos.create("Third todo");

    expect(todo1.id).toBe(1);
    expect(todo2.id).toBe(2);
    expect(todo3.id).toBe(3);
  });

  test("finds a todo by ID", () => {
    const created = todos.create("Test todo");
    const found = todos.find(created.id);

    expect(found).toBeDefined();
    expect(found.id).toBe(created.id);
    expect(found.description).toBe(created.description);
  });

  test("throws error when finding non-existent todo", () => {
    expect(() => todos.find(999)).toThrow("Cannot find a todo item with id");
  });

  test("updates todo description and due date", () => {
    const todo = todos.create("Original description", new Date("2024-01-01"));
    const newDue = new Date("2024-12-31");

    const updated = todos.update(todo.id, {
      description: "Updated description",
      due: newDue,
    });

    expect(updated.description).toBe("Updated description");
    expect(updated.due).toEqual(newDue);
    expect(updated.modified).toBeInstanceOf(Date);
  });

  test("updates todo with partial data", () => {
    const todo = todos.create("Original description", new Date("2024-01-01"));
    const originalDue = todo.due;

    const updated = todos.update(todo.id, {
      description: "Updated description",
    });

    expect(updated.description).toBe("Updated description");
    expect(updated.due).toEqual(originalDue);
  });

  test("removes due date when explicitly set to null", () => {
    const todo = todos.create("Test todo", new Date("2024-01-01"));

    const updated = todos.update(todo.id, { due: null });

    expect(updated.due).toBeUndefined();
  });

  test("destroys a todo", () => {
    const todo = todos.create("Test todo");

    todos.destroy(todo.id);

    expect(() => todos.find(todo.id)).toThrow(
      "Cannot find a todo item with id"
    );
    expect(todos.list()).toHaveLength(0);
  });

  test("throws error when destroying non-existent todo", () => {
    expect(() => todos.destroy(999)).toThrow("Cannot find a todo item with id");
  });
});

describe("Date-based Filtering", () => {
  let todos: Todos;
  let storage: MockStorage;

  beforeEach(() => {
    storage = new MockStorage();
    todos = new Todos(storage);
  });

  test("completed todos don't appear in date filters", () => {
    // Create todos due this week
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const completedTodo = todos.create("Completed todo", today);
    const pendingTodo = todos.create("Pending todo", tomorrow);

    // Mark one todo as complete
    todos.markDone(completedTodo.id);

    // Check listDueBy
    const dueTodos = todos.listDueBy(tomorrow);
    expect(dueTodos).toHaveLength(1);
    expect(dueTodos[0].id).toBe(pendingTodo.id);

    // Check listDueThisWeek
    const dueThisWeek = todos.listDueThisWeek();
    expect(dueThisWeek).toHaveLength(1);
    expect(dueThisWeek[0].id).toBe(pendingTodo.id);
  });
});
