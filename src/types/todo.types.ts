/**
 * Represents the status of a todo item
 */
export type TodoStatus = "pending" | "done";

/**
 * Interface for a todo item
 */
export interface ITodo {
  id: number;
  description: string;
  status: TodoStatus;
  modified: Date;
  due?: Date;
}

/**
 * Interface for the storage mechanism
 */
export interface IStorage<T> {
  /**
   * Read data from storage
   * @returns The stored data as a string for YAML or the generic type T
   */
  read(): T;

  /**
   * Write data to storage
   * @param data - The data to write as a string for YAML or the generic type T
   */
  write(data: T): void;
}

/**
 * Type for filtering todos by status
 */
export type TodoStatusFilter = TodoStatus | "all";
