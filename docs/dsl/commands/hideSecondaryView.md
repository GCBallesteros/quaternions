# hideSecondaryView

Hides the secondary viewport.

The `hideSecondaryView` function hides the secondary viewport, returning the display to a single, main viewport.

## Syntax

```typescript
hideSecondaryView(): void
```

## Parameters

None.

## Returns

`void`

## Description

The `hideSecondaryView` function is used to close the secondary viewport that is displayed by `showSecondaryView`.  It removes the smaller viewport, leaving only the main camera view visible.

## Examples

```javascript
// Hide the secondary view
hideSecondaryView();
```

## Related

- [showSecondaryView](/dsl/commands/showSecondaryView) - Displays the secondary viewport.
