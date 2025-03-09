# log

Logs a message to the integrated console.

The `log` function prints a message to the integrated console in the application interface. 
It can accept any type of value, which will be converted to a string representation for display.

This function is useful for debugging, displaying calculation results, or providing status 
updates during script execution.

## Syntax

```typescript
log(message: any): void
```

## Parameters

| Parameter | Description                                                |
|-----------|------------------------------------------------------------|
| `message` | The message or value to be displayed in the console output |

## Returns

`void`

## Examples

### Logging a simple message

```javascript
log("Hello World");
```

### Logging calculation results

```javascript
const angle = angle("sat->Moon", "sat->Earth");
log(`Angle between Moon and Earth: ${angle} degrees`);
```

### Logging complex objects

```javascript
const sat = point("sat");
log(sat.position);
log(sat.frame);
```

### Logging in a loop

```javascript
for (let i = 0; i < 5; i++) {
  log(`Iteration ${i}: Processing...`);
  // Do some work
}
log("Processing complete!");
```
