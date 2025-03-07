# utcDate

Creates a UTC date object for a specified date and time.

The `utcDate` function creates a JavaScript Date object set to the specified UTC date and time. This is particularly useful for setting simulation times and calculating satellite positions at specific times.

::: info
For a detailed explanation of why you should always use `utcDate` instead of JavaScript's native `Date` constructor, see the [Working with Time](/getting-started/working-with-time) guide.
:::

## Syntax

```typescript
utcDate(
  year: number,
  month: number,
  day: number,
  hours: number = 0,
  minutes: number = 0,
  seconds: number = 0,
): Date
```

## Parameters

| Parameter | Description                                                    |
|-----------|----------------------------------------------------------------|
| `year`    | The year (e.g., 2025)                                          |
| `month`   | The month (1-12)                                               |
| `day`     | The day of the month (1-31)                                    |
| `hours`   | (Optional) The hours (0-23). Default is 0.                     |
| `minutes` | (Optional) The minutes (0-59). Default is 0.                   |
| `seconds` | (Optional) The seconds (0-59). Default is 0.                   |

## Returns

`Date` - A JavaScript Date object set to the specified UTC date and time.

## Examples

### Creating a date with just year, month, and day

```javascript
// Create a date for January 1, 2025 at 00:00:00 UTC
const date = utcDate(2025, 1, 1);
log(`Date: ${date.toISOString()}`);
// Output: Date: 2025-01-01T00:00:00.000Z
```

### Creating a date with time components

```javascript
// Create a date for July 4, 2025 at 12:30:45 UTC
const date = utcDate(2025, 7, 4, 12, 30, 45);
log(`Date: ${date.toISOString()}`);
// Output: Date: 2025-07-04T12:30:45.000Z
```

### Using with setTime

```javascript
// Set the simulation time to a specific date and time
const date = utcDate(2025, 1, 1, 12, 0, 0);
setTime(date);
```

### Using with mov2sat

```javascript
// Move a point to a satellite's position at a specific time
const date = utcDate(2025, 1, 1, 12, 0, 0);
await mov2sat("sat", "60562", date);
```

## Related

- [`setTime`](/dsl/commands/setTime) - Sets the simulation time
- [`mov2sat`](/dsl/commands/mov2sat) - Moves a point to a satellite's position at a given timestamp
