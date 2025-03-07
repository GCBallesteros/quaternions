# Working with Time

When working with satellite positions, astronomical calculations, and time-dependent simulations in What on Earth?, using consistent and unambiguous time representations is critical.

## Why Use `utcDate`

The What on Earth? application provides the `utcDate` function specifically designed to create dates in a consistent and reliable way. Here's why you should always use `utcDate` instead of JavaScript's native `Date` constructor:

### Problems with JavaScript's `new Date()`

1. **Local Time Zone Confusion**: `new Date()` uses the local time zone of the user's computer, which can lead to inconsistent results when:
   - Your code runs on different machines in different time zones
   - Users share scripts across different geographic locations
   - Deployments happen on servers with different time zone settings

2. **Ambiguous String Parsing**: When creating dates from strings like `new Date('2025-01-01')`, JavaScript's behavior is inconsistent across browsers and can interpret the string as UTC or local time depending on the format.

3. **Month Indexing Confusion**: JavaScript's `Date` uses zero-indexed months (0-11), which is counterintuitive and error-prone (January is 0, December is 11).

### Benefits of Using `utcDate`

1. **Consistent UTC Time**: `utcDate` always creates dates in Coordinated Universal Time (UTC), ensuring consistent time representation regardless of where the code runs.

2. **Clear Parameter Order**: The function uses a clear parameter order (year, month, day, hours, minutes, seconds) with proper 1-indexed months (January is 1, December is 12).

3. **Default Time Components**: Time components (hours, minutes, seconds) default to 0 if not specified, making it easy to create dates at midnight UTC.

4. **Error Handling**: The implementation includes validation and error handling for invalid date components.

## Example Comparison

```javascript
// ❌ Problematic: Depends on local time zone, uses zero-indexed months
const localDate = new Date(2025, 0, 1); // January 1, 2025 in local time zone

// ❌ Ambiguous: Different browsers might interpret differently
const stringDate = new Date('2025-01-01T12:00:00');

// ✅ Clear and consistent: Always January 1, 2025 at 12:00:00 UTC
const utcDate1 = utcDate(2025, 1, 1, 12, 0, 0);
```

## When Working with Satellites

For satellite position calculations, using UTC time is especially important because:

1. TLE (Two-Line Element) data uses UTC time references
2. Orbital mechanics calculations expect standardized time inputs
3. International space operations coordinate using UTC

## Best Practices

- Always use `utcDate` for creating dates in your scripts
- When displaying times to users, explicitly convert to their local time zone if needed
- Document all time-related functions with clear timezone expectations
- Use ISO string format (`date.toISOString()`) when logging dates for debugging

By consistently using `utcDate`, you ensure that your simulations and calculations will produce the same results regardless of where they run, making your scripts more reliable and shareable.

## Related

- [`utcDate`](/dsl/commands/utcDate) - Creates a UTC date object
- [`setTime`](/dsl/commands/setTime) - Sets the simulation time
- [`mov2sat`](/dsl/commands/mov2sat) - Moves a point to a satellite's position at a given timestamp
