# Working with Time

When working with time in What on Earth?, using consistent time representations is essential for reliable results.

## Why Use `utcDate`

The `utcDate` function creates dates in Coordinated Universal Time (UTC), ensuring consistent behavior across all environments. This is the primary benefit - all calculations will work the same way regardless of where your code runs.

JavaScript's built-in `Date` constructor has several issues that make it problematic for simulation work:

```javascript
// ❌ Problematic: Uses local time zone and zero-indexed months (January = 0)
const localDate = new Date(2025, 0, 1); 

// ❌ Ambiguous: Browser-dependent interpretation
const stringDate = new Date('2025-01-01T12:00:00');

// ✅ Clear and consistent: Always January 1, 2025 at 12:00:00 UTC
const utcDate1 = utcDate(2025, 1, 1, 12, 0, 0);
```

With `utcDate`:
- Months are 1-indexed (January = 1, December = 12)
- Time is always in UTC
- Parameter order is intuitive (year, month, day, hours, minutes, seconds)
- Optional time components default to 0

## Example Usage

```javascript
// Set simulation time to noon UTC on January 1, 2025
setTime(utcDate(2025, 1, 1, 12, 0, 0));

// Calculate satellite position at a specific time
await mov2sat("sat", "60562", utcDate(2025, 1, 1, 12, 0, 0));
```

## Related

- [`utcDate`](/dsl/commands/utcDate) - Creates a UTC date object
- [`setTime`](/dsl/commands/setTime) - Sets the simulation time
- [`mov2sat`](/dsl/commands/mov2sat) - Moves a point to a satellite's position at a given timestamp
