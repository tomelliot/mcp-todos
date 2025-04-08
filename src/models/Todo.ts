import { ITodo, TodoStatus } from "../types/todo.types";
import * as YAML from "yaml";

/**
 * Represents a single todo item
 */
export class Todo implements ITodo {
  private _id: number;
  public description: string;
  public status: TodoStatus;
  public modified: Date;
  public due?: Date;

  /**
   * Creates a new Todo instance
   * @param id - Unique identifier for the todo
   * @param description - Description of the todo item
   * @param status - Current status of the todo (optional, defaults to PENDING)
   * @param modified - Last modified date (optional, defaults to current date)
   * @param due - Optional due date for the todo
   * @throws Error if id is not a valid number or description is empty
   */
  constructor(
    id: number,
    description: string,
    status: TodoStatus = "pending",
    modified: Date = new Date(),
    due?: Date
  ) {
    if (!description?.trim()) {
      throw new Error("Todo description is required");
    }

    this._id = this.validateId(id);
    this.description = description;
    this.status = status;
    this.modified = modified;
    this.due = due;
  }

  /**
   * Gets the todo's ID
   */
  get id(): number {
    return this._id;
  }

  /**
   * Sets the todo's ID
   * @throws Error if id is not a valid number
   */
  set id(value: number) {
    this._id = this.validateId(value);
  }

  /**
   * Validates that an ID is a valid number
   * @param id - The ID to validate
   * @throws Error if id is not a valid number
   */
  private validateId(id: number): number {
    if (!Number.isFinite(id) || id < 1) {
      throw new Error("Todo ID must be a positive number");
    }
    return id;
  }

  /**
   * Marks the todo as complete
   */
  markDone(): void {
    this.status = "done";
    this.modified = new Date();
  }

  /**
   * Marks the todo as pending
   */
  markPending(): void {
    this.status = "pending";
    this.modified = new Date();
  }

  /**
   * Creates Todo instances from YAML data
   * @param yamlStr - YAML string containing todo data
   */
  static fromYAML(yamlStr: string): Todo[] {
    const data = YAML.parse(yamlStr) as Array<Partial<ITodo>>;
    if (!data) return [];
    return data.map((item) => {
      if (!item.id || !item.description) {
        throw new Error("Invalid todo data: missing required fields");
      }
      return new Todo(
        item.id,
        item.description,
        item.status ?? "pending",
        item.modified ? new Date(item.modified) : new Date(),
        item.due ? new Date(item.due) : undefined
      );
    });
  }

  /**
   * Converts the todo to a YAML string
   */
  toYAML(): string {
    const data = {
      id: this.id,
      description: this.description,
      status: this.status,
      modified: this.modified,
      due: this.due,
    };
    return YAML.stringify(data);
  }
}
