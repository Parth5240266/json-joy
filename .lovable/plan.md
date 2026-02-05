
# Auto-Format on Indentation Change

## Problem
Currently, when clicking on the "2" or "4" indentation buttons in the Formatter page, the selection changes but the JSON output doesn't update automatically. Users have to click the "Format" button again to see the change.

## Solution
Add an effect that automatically re-formats the JSON whenever the indentation setting changes, providing instant feedback.

---

## Technical Implementation

### File: `src/pages/FormatterPage.tsx`

**Add a new `useEffect` hook** that watches the `indentation` value and automatically triggers formatting when it changes:

```text
useEffect(() => {
  // Only auto-format if there's already output (user has formatted before)
  // and the input is valid JSON
  if (output && input.trim()) {
    try {
      const formatted = formatJSON(input, indentation);
      setOutput(formatted);
      const size = calculateSize(input, formatted);
      setSizeInfo(`Original: ${formatBytes(size.original)} → Formatted: ${formatBytes(size.processed)}`);
    } catch (e) {
      // Silently ignore - user will see validation error
    }
  }
}, [indentation]);
```

**Logic:**
1. When `indentation` changes (user clicks "2" or "4")
2. Check if there's existing output (meaning user has already formatted once)
3. If yes, re-format the current input with the new indentation
4. Update the output and size info immediately

This provides instant visual feedback without requiring an extra click.
