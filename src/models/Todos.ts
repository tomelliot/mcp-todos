import { IStorage, TodoStatus, TodoStatusFilter } from "../types/todo.types";
import { Todo } from "./Todo";
import * as YAML from "yaml";
import { logger } from "../utils/logger";

/**
 * Manages a collection of todo items
 */
export class Todos {
  private _items: Todo[] | null = null;

  /**
   * Creates a new Todos collection
   * @param storage - Storage implementation for persisting todos
   */
  constructor(private storage: IStorage<string>) {}

  /**
   * Lists all todo items, optionally filtered by status
   * @param status - Status to filter by (optional)
   */
  list(status: TodoStatusFilter = "all"): Todo[] {
    logger.debug(`list() called with status: ${status}`);
    const result = this.items
      .filter((todo) => status === "all" || status === todo.status)
      .sort((a, b) => a.id - b.id);
    logger.debug(`list() returning ${result.length} items`);
    return result;
  }

  /**
   * Lists todos due on or before a specific date
   * @param date - The date to check against
   */
  listDueBy(date: Date): Todo[] {
    logger.debug(`listDueBy() called with date: ${date}`);
    const result = this.items
      .filter((todo) => {
        if (!todo.due || todo.status === "done") return false;
        return todo.due <= date;
      })
      .sort((a, b) => (a.due && b.due ? a.due.getTime() - b.due.getTime() : 0));
    logger.debug(`listDueBy() returning ${result.length} items`);
    return result;
  }

  /**
   * Lists todos due this week or earlier
   */
  listDueThisWeek(): Todo[] {
    logger.debug("listDueThisWeek() called");
    const today = new Date();
    const endOfWeek = new Date();
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    const result = this.items
      .filter((todo) => {
        if (!todo.due || todo.status === "done") return false;
        return todo.due <= endOfWeek;
      })
      .sort((a, b) => (a.due && b.due ? a.due.getTime() - b.due.getTime() : 0));
    logger.debug(`listDueThisWeek() returning ${result.length} items`);
    return result;
  }

  /**
   * Creates a new todo item
   * @param description - Description of the todo
   * @param due - Optional due date for the todo
   */
  create(description: string, due?: Date): Todo {
    logger.debug(
      `create() called with description: ${description}, due: ${due}`
    );
    const todo = new Todo(
      this.nextId(),
      description,
      "pending",
      new Date(),
      due
    );
    this.items.push(todo);
    this.save();
    logger.debug(`create() created todo with id: ${todo.id}`);
    return todo;
  }

  /**
   * Finds a todo by ID
   * @param id - ID of the todo to find
   * @throws Error if todo is not found
   */
  find(id: number): Todo {
    logger.debug(`find() called with id: ${id}`);
    const todo = this.items.find((t) => t.id === id);
    if (!todo) {
      logger.debug(`find() failed to find todo ${id}`);
      throw new Error(`Cannot find a todo item with id "${id}"`);
    }
    logger.debug(`find() found todo ${id}`);
    return todo;
  }

  /**
   * Marks a todo as complete
   * @param id - ID of the todo to complete
   * @throws Error if todo is not found
   */
  markDone(id: number): Todo {
    logger.debug(`markDone() called with id: ${id}`);
    const todo = this.find(id);
    todo.markDone();
    this.save();
    logger.debug(`markDone() completed todo ${id}`);
    return todo;
  }

  /**
   * Marks a todo as pending
   * @param id - ID of the todo to mark as pending
   * @throws Error if todo is not found
   */
  markPending(id: number): Todo {
    logger.debug(`markPending() called with id: ${id}`);
    const todo = this.find(id);
    todo.markPending();
    this.save();
    logger.debug(`markPending() marked todo ${id} as pending`);
    return todo;
  }

  /**
   * Changes the ID of a todo item
   * @param fromId - Current ID of the todo
   * @param toId - New ID for the todo
   * @throws Error if source todo is not found
   */
  move(fromId: number, toId: number): Todo {
    logger.debug(`move() called with fromId: ${fromId}, toId: ${toId}`);
    const todo = this.find(fromId);
    const other = this.items.find((t) => t.id === toId);

    todo.id = toId;
    if (other) other.id = fromId;

    this.save();
    logger.debug(`move() moved todo from ${fromId} to ${toId}`);
    return todo;
  }

  /**
   * Deletes a todo item
   * @param id - ID of the todo to delete
   * @throws Error if todo is not found
   */
  destroy(id: number): Todo {
    logger.debug(`destroy() called with id: ${id}`);
    const todo = this.find(id);
    this.items = this.items.filter((t) => t.id !== id);
    this.save();
    logger.debug(`destroy() deleted todo ${id}`);
    return todo;
  }

  /**
   * Clears todos with the specified status
   * @param status - Status of todos to clear (optional, clears all if not specified)
   */
  clear(status?: TodoStatus): void {
    logger.debug(`clear() called with status: ${status || "all"}`);
    if (!status) {
      this.items = [];
    } else {
      this.items = this.items.filter((todo) => todo.status !== status);
    }
    this.save();
    logger.debug(`clear() completed, remaining items: ${this.items.length}`);
  }

  /**
   * Renumbers all todos sequentially starting from 1
   */
  renumber(): Todo[] {
    logger.debug("renumber() called");
    this.items = this.items.map((todo, index) => {
      todo.id = index + 1;
      return todo;
    });
    this.save();
    logger.debug(`renumber() completed, renumbered ${this.items.length} items`);
    return this.items;
  }

  /**
   * Updates a todo's description and/or due date
   * @param id - ID of the todo to update
   * @param updates - Object containing the fields to update
   * @throws Error if todo is not found
   */
  update(
    id: number,
    updates: { description?: string; due?: Date | null }
  ): Todo {
    logger.debug(`update() called with id: ${id}, updates:`, updates);
    const todo = this.find(id);

    if (updates.description?.trim()) {
      todo.description = updates.description;
    }

    // Allow explicitly setting due to null to remove the due date
    if ("due" in updates) {
      todo.due = updates.due ?? undefined;
    }

    todo.modified = new Date();
    this.save();
    logger.debug(`update() completed for todo ${id}`);
    return todo;
  }

  /**
   * Gets the next available todo ID
   */
  private nextId(): number {
    logger.debug("nextId() called");
    const nextId =
      this.items.length === 0
        ? 1
        : Math.max(...this.items.map((todo) => todo.id)) + 1;
    logger.debug(`nextId() returning: ${nextId}`);
    return nextId;
  }

  /**
   * Saves the current state of todos
   */
  private save(): void {
    logger.debug("save() called");
    const yamlData = YAML.stringify(
      this.items.map((todo) => ({
        id: todo.id,
        description: todo.description,
        status: todo.status,
        modified: todo.modified,
        due: todo.due,
      }))
    );
    this.storage.write(yamlData);
    logger.debug("save() completed");
  }

  /**
   * Gets the list of todos, loading from storage if necessary
   */
  private get items(): Todo[] {
    logger.debug("items getter called");
    if (!this._items) {
      logger.debug("items loading from storage");
      this._items = Todo.fromYAML(this.storage.read());
    }
    logger.debug(`items returning ${this._items.length} items`);
    return this._items;
  }

  /**
   * Sets the list of todos
   */
  private set items(value: Todo[]) {
    logger.debug(`items setter called with ${value.length} items`);
    this._items = value;
  }
}
