let output: HTMLElement | null = null;

export function initLogger(): void {
  output = document.getElementById('output');
}

function logToDiv(logDivId, ...args) {
  const logContainer = document.getElementById(logDivId);
  if (!logContainer) {
    console.warn(`Log container with ID '${logDivId}' not found.`);
    return;
  }

  logContainer.style.cssText =
    'white-space: pre-wrap; font-family: monospace; border: 1px solid #ccc; padding: 10px; max-height: 300px; overflow-y: auto; background-color: #121212; color: #e0e0e0;';

  const CHUNK_SIZE = 100; // Number of elements to show per chunk in large arrays

  // Helper function to create an interactive expandable object viewer
  function createExpandableElement(obj, start = 0, end = obj.length) {
    if (typeof obj !== 'object' || obj === null) {
      // Simple value (leaf node) style
      const leaf = document.createElement('span');
      leaf.textContent = String(obj);
      leaf.style.color = '#00bcd4'; // Light cyan/blue for leaf nodes
      return leaf;
    }

    // Intermediate node (object or array) style
    const container = document.createElement('div');
    const details = document.createElement('details');
    const summary = document.createElement('summary');

    const isArray = Array.isArray(obj);
    summary.textContent = isArray ? `[Array (${end - start})]` : `{Object}`;
    details.appendChild(summary);

    const content = document.createElement('div');
    content.style.cssText =
      'margin-left: 16px; border-left: 1px dashed #8a8a8a; padding-left: 8px; color: #b0b0b0;'; // Light grey for intermediate nodes

    details.appendChild(content);
    container.appendChild(details);

    // If it's an array and the array length is larger than CHUNK_SIZE, show chunks
    if (isArray && obj.length > CHUNK_SIZE) {
      const chunkCount = Math.ceil((end - start) / CHUNK_SIZE);

      // Create chunks for the array
      for (let i = 0; i < chunkCount; i++) {
        const chunkStart = start + i * CHUNK_SIZE;
        const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, end);
        const chunkDetails = document.createElement('details');
        const chunkSummary = document.createElement('summary');
        chunkSummary.textContent = `array[${chunkStart},${chunkEnd - 1}]`;
        chunkDetails.appendChild(chunkSummary);

        const chunkContent = document.createElement('div');
        chunkContent.style.cssText =
          'margin-left: 16px; border-left: 1px dashed #8a8a8a; padding-left: 8px;';
        chunkDetails.appendChild(chunkContent);
        content.appendChild(chunkDetails);

        // Add the chunk of items to the chunk content
        const chunk = obj.slice(chunkStart, chunkEnd);
        chunk.forEach((item, index) => {
          const itemEntry = document.createElement('div');

          // Gray for "Item <number>"
          const itemNumber = document.createElement('span');
          itemNumber.textContent = `Item ${chunkStart + index}: `;
          itemNumber.style.color = '#b0b0b0'; // Gray for the "Item <number>"
          itemEntry.appendChild(itemNumber);

          // Light cyan/blue for actual item value
          itemEntry.appendChild(createExpandableElement(item)); // Recursively create the expandable element
          chunkContent.appendChild(itemEntry);
        });
      }

      return container; // Return here after adding chunks
    } else if (isArray && obj.length > 0) {
      // If the array is small enough (less than CHUNK_SIZE), show it all at once
      obj.slice(start, end).forEach((item, index) => {
        const itemEntry = document.createElement('div');

        // Gray for "Item <number>"
        const itemNumber = document.createElement('span');
        itemNumber.textContent = `${start + index}: `;
        itemNumber.style.color = '#b0b0b0'; // Gray for the "Item <number>"
        itemEntry.appendChild(itemNumber);

        // Light cyan/blue for actual item value
        itemEntry.appendChild(createExpandableElement(item)); // Recursively create the expandable element
        content.appendChild(itemEntry);
      });

      return container; // Return here after adding the items for small arrays
    }

    // Handle non-array objects (simple objects or objects within arrays)
    if (!Array.isArray(obj)) {
      // BFS setup to avoid deep recursion
      const queue = [{ parent: content, obj }];
      const seen = new WeakSet(); // Prevent circular references

      while (queue.length > 0) {
        const { parent, obj } = queue.shift();

        if (seen.has(obj)) {
          const circularNotice = document.createElement('span');
          circularNotice.style.color = '#ff4081'; // Bright pink for circular reference notice
          circularNotice.textContent = ' (circular reference)';
          parent.appendChild(circularNotice);
          continue;
        }

        seen.add(obj);

        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const subEntry = document.createElement('div');

            const keySpan = document.createElement('strong');
            keySpan.textContent = `${key}: `;
            keySpan.style.color = '#8a8a8a'; // Grey for the keys
            subEntry.appendChild(keySpan);

            const value = obj[key];

            if (typeof value === 'object' && value !== null) {
              // If the value is an object or array, create a new expandable section for it
              const nestedDetails = document.createElement('details');
              const nestedSummary = document.createElement('summary');

              const nestedIsArray = Array.isArray(value);
              nestedSummary.textContent = nestedIsArray
                ? `[Array (${value.length})]`
                : `{Object}`;
              nestedDetails.appendChild(nestedSummary);

              const nestedContent = document.createElement('div');
              nestedContent.style.cssText =
                'margin-left: 16px; border-left: 1px dashed #8a8a8a; padding-left: 8px;';
              nestedDetails.appendChild(nestedContent);
              subEntry.appendChild(nestedDetails);

              // Push the nested object to the queue to process its contents
              queue.push({ parent: nestedContent, obj: value });
            } else {
              // Leaf value styling (simple values)
              const leafValue = document.createElement('span');
              leafValue.textContent = String(value);
              leafValue.style.color = '#00bcd4'; // Light cyan for leaf nodes
              subEntry.appendChild(leafValue);
            }

            parent.appendChild(subEntry);
          }
        }
      }
    }

    return container;
  }

  // Create and append log entry
  const logEntry = document.createElement('div');
  args.forEach((arg) => {
    logEntry.appendChild(createExpandableElement(arg));
    logEntry.appendChild(document.createElement('br')); // Line break
  });

  logContainer.appendChild(logEntry);
}

export function log(message: string): void {
  if (!output) {
    console.warn('Logger not initialized');
    return;
  }
  logToDiv('output', message);
}
