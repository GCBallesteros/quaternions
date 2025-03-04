/**
 * A simple circular buffer implementation with constant time operations
 * for adding to the end and removing from the front.
 */
import { None, Option, Some } from 'ts-results';

export class CircularBuffer<T> {
  private items: Array<T | undefined>;
  private head: number = 0;
  private tail: number = 0;
  private _size: number = 0;
  private _capacity: number;

  /**
   * Creates a new circular buffer with the specified capacity
   * @param capacity Maximum number of items the buffer can hold
   */
  constructor(capacity: number) {
    if (capacity <= 0) {
      throw new Error('Capacity must be greater than 0');
    }
    this._capacity = capacity;
    this.items = new Array<T | undefined>(capacity);
  }

  /**
   * Adds an item to the end of the buffer.
   * If the buffer is full, the oldest item is automatically removed.
   * @param item The item to add
   * @returns The item that was removed if the buffer was full, None otherwise
   */
  push(item: T): Option<T> {
    let removedItem: Option<T> = None;

    // If buffer is full, we'll need to remove the oldest item
    if (this._size === this._capacity) {
      removedItem = this.shift();
    }

    // Add the new item at the tail position
    this.items[this.tail] = item;

    // Move the tail pointer
    this.tail = (this.tail + 1) % this._capacity;

    // Increase size if we're not at capacity
    if (this._size < this._capacity) {
      this._size++;
    }

    return removedItem;
  }

  /**
   * Removes and returns the oldest item from the buffer
   * @returns The removed item wrapped in Some, or None if the buffer is empty
   */
  shift(): Option<T> {
    if (this._size === 0) {
      return None;
    }

    // Get the item at the head position
    const item = this.items[this.head];

    // Clear the reference to help garbage collection
    this.items[this.head] = undefined;

    // Move the head pointer
    this.head = (this.head + 1) % this._capacity;

    // Decrease size
    this._size--;

    return Some(item as T);
  }

  /**
   * Clears all items from the buffer
   */
  clear(): void {
    this.items.fill(undefined);
    this.head = 0;
    this.tail = 0;
    this._size = 0;
  }

  /**
   * Returns all items in the buffer as an array, in order from oldest to newest
   * @returns Array of items
   */
  toArray(): T[] {
    const result: T[] = [];
    if (this._size === 0) {
      return result;
    }

    let index = this.head;
    for (let i = 0; i < this._size; i++) {
      result.push(this.items[index] as T);
      index = (index + 1) % this._capacity;
    }
    return result;
  }

  /**
   * Current number of items in the buffer
   */
  get size(): number {
    return this._size;
  }

  /**
   * Maximum number of items the buffer can hold
   */
  get capacity(): number {
    return this._capacity;
  }

  /**
   * Whether the buffer is empty
   */
  get isEmpty(): boolean {
    return this._size === 0;
  }

  /**
   * Whether the buffer is full
   */
  get isFull(): boolean {
    return this._size === this._capacity;
  }
}
