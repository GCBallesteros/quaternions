// We are not using lit-html here for performance and simplicity
import { STYLES, CHUNK_SIZE } from './styles.js';
import type { ExpandableElement, LogValue } from './types.js';

export function createExpandableElement(
  obj: LogValue,
  start = 0,
  end = Array.isArray(obj) ? obj.length : 0,
): ExpandableElement {
  if (typeof obj !== 'object' || obj === null) {
    return createLeafNode(obj);
  }

  const container = document.createElement('div');
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  const content = document.createElement('div');

  const isArray = Array.isArray(obj);
  summary.textContent = isArray ? `[Array (${end - start})]` : `{Object}`;
  content.style.cssText = STYLES.nestedContent;

  details.appendChild(summary);
  details.appendChild(content);
  container.appendChild(details);

  if (isArray) {
    handleArrayContent(obj, start, end, content);
  } else {
    handleObjectContent(obj, content);
  }

  return container;
}

function createLeafNode(value: LogValue): ExpandableElement {
  const leaf = document.createElement('span');
  leaf.textContent = String(value);
  leaf.style.color = STYLES.colors.leaf;
  return leaf;
}

function handleArrayContent(
  arr: any[],
  start: number,
  end: number,
  content: HTMLElement,
): void {
  if (arr.length > CHUNK_SIZE) {
    createArrayChunks(arr, start, end, content);
  } else {
    createSimpleArrayView(arr, start, end, content);
  }
}

function createArrayChunks(
  arr: any[],
  start: number,
  end: number,
  parent: HTMLElement,
): void {
  const chunkCount = Math.ceil((end - start) / CHUNK_SIZE);

  for (let i = 0; i < chunkCount; i++) {
    const chunkStart = start + i * CHUNK_SIZE;
    const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, end);

    const chunkDetails = document.createElement('details');
    const chunkSummary = document.createElement('summary');
    const chunkContent = document.createElement('div');

    chunkSummary.textContent = `array[${chunkStart},${chunkEnd - 1}]`;
    chunkContent.style.cssText = STYLES.nestedContent;

    chunkDetails.appendChild(chunkSummary);
    chunkDetails.appendChild(chunkContent);
    parent.appendChild(chunkDetails);

    createSimpleArrayView(arr, chunkStart, chunkEnd, chunkContent);
  }
}

function createSimpleArrayView(
  arr: any[],
  start: number,
  end: number,
  parent: HTMLElement,
): void {
  arr.slice(start, end).forEach((item, index) => {
    const itemEntry = document.createElement('div');
    const itemNumber = document.createElement('span');

    itemNumber.textContent = `${start + index}: `;
    itemNumber.style.color = STYLES.colors.intermediate;

    itemEntry.appendChild(itemNumber);
    itemEntry.appendChild(createExpandableElement(item));
    parent.appendChild(itemEntry);
  });
}

/**
 * Handles rendering of object contents using Breadth-First Search (BFS).
 * BFS is used to avoid stack overflow with deeply nested objects and to detect
 * circular references.
 *
 * The algorithm works by:
 * 1. Maintaining a queue of {parent DOM element, object to process} pairs
 * 2. Processing one object at a time, level by level
 * 3. Tracking seen objects to detect circular references
 */
function handleObjectContent(obj: object, parent: HTMLElement): void {
  // Track objects we've seen to detect circular references
  const seen = new WeakSet();
  // Initialize queue with the root object and its parent DOM element
  const queue = [{ parent, obj }];

  while (queue.length > 0) {
    // Process next item in queue (BFS order)
    const current = queue.shift()!;

    // Check for circular references
    if (seen.has(current.obj)) {
      const circularNotice = document.createElement('span');
      circularNotice.style.color = STYLES.colors.circular;
      circularNotice.textContent = ' (circular reference)';
      current.parent.appendChild(circularNotice);
      continue;
    }

    // Mark this object as seen
    seen.add(current.obj);
    // Process all properties of the current object
    processObjectEntries(current.obj, current.parent, queue);
  }
}

/**
 * Processes all entries in an object, creating DOM elements for each property
 * and queueing nested objects for BFS processing.
 */
function processObjectEntries(
  obj: object,
  parent: HTMLElement,
  queue: Array<{ parent: HTMLElement; obj: object }>,
): void {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const entry = createObjectEntry(key, obj[key], queue);
      parent.appendChild(entry);
    }
  }
}

/**
 * Creates a DOM element for a single object property.
 *
 * If the value is an object, it creates a nested structure and queues it for
 * BFS processing. If the value is a primitive, it creates a leaf node.
 */
function createObjectEntry(
  key: string,
  value: any,
  queue: Array<{ parent: HTMLElement; obj: object }>,
): HTMLElement {
  const entry = document.createElement('div');
  const keySpan = document.createElement('strong');

  keySpan.textContent = `${key}: `;
  keySpan.style.color = STYLES.colors.key;
  entry.appendChild(keySpan);

  if (typeof value === 'object' && value !== null) {
    // For nested objects, create expandable content and queue for BFS processing
    const nestedContent = createNestedObjectContent(value);
    entry.appendChild(nestedContent.details);
    // Add to queue for later processing (BFS)
    queue.push({ parent: nestedContent.content, obj: value });
  } else {
    // For primitive values, create a leaf node
    const leafValue = createLeafNode(value);
    entry.appendChild(leafValue);
  }

  return entry;
}

function createNestedObjectContent(value: object): {
  details: HTMLDetailsElement;
  content: HTMLDivElement;
} {
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  const content = document.createElement('div');

  summary.textContent = Array.isArray(value)
    ? `[Array (${value.length})]`
    : `{Object}`;

  content.style.cssText = STYLES.nestedContent;

  details.appendChild(summary);
  details.appendChild(content);

  return { details, content };
}
