
# JSON Table Pagination and Scrolling

## Overview
Enhance the JSON Table component with pagination controls and improved scrolling to handle large datasets efficiently.

## Features to Add

### 1. Pagination
- Show 10 rows per page by default
- Page selector dropdown to change rows per page (10, 25, 50, 100)
- Previous/Next navigation buttons
- Page number display ("Page 1 of 5")
- Jump to first/last page buttons

### 2. Scrolling Improvements
- Horizontal scroll for tables with many columns
- Vertical scroll within the table area (already exists but will be refined)
- Sticky header that stays visible during vertical scroll
- Sticky row numbers column for horizontal scroll

---

## Technical Implementation

### File: `src/components/json/JsonTable.tsx`

**Add State Management:**
- `currentPage` state to track which page is displayed
- `rowsPerPage` state with default of 10
- Calculate `totalPages` from data length

**Pagination Logic:**
```text
const startIndex = (currentPage - 1) * rowsPerPage;
const endIndex = startIndex + rowsPerPage;
const paginatedRows = rows.slice(startIndex, endIndex);
```

**UI Updates:**
1. Wrap table in a container with `overflow-x-auto` for horizontal scroll
2. Add pagination controls bar below the table with:
   - Rows per page dropdown (10, 25, 50, 100)
   - Current page info ("Showing 1-10 of 150")
   - Previous/Next buttons
   - Page number buttons with ellipsis for large page counts

**Imports to Add:**
- `useState` from React
- `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` for rows-per-page dropdown
- `Button` for navigation buttons
- `ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight` icons

### Visual Layout

```text
+----------------------------------------------------------+
|  #  |  Column 1  |  Column 2  |  Column 3  |  ...        | <- Sticky Header
+----------------------------------------------------------+
|  1  |  Data      |  Data      |  Data      |             |
|  2  |  Data      |  Data      |  Data      |             |
| ... |  ...       |  ...       |  ...       |             |
| 10  |  Data      |  Data      |  Data      |             |
+----------------------------------------------------------+
|  Rows per page: [10 v]    Showing 1-10 of 150   [<] [>]  | <- Pagination Bar
+----------------------------------------------------------+
```

### File: `src/pages/TablePage.tsx`

**Update Status Bar:**
- Show pagination info instead of just row count
- Display "Page X of Y (Z total rows)"

---

## Component Structure

The updated JsonTable will have:
1. **Table container** with both horizontal and vertical overflow
2. **Sticky header row** that remains fixed during scroll
3. **Pagination footer** with:
   - Rows per page selector
   - "Showing X-Y of Z" info text
   - First/Previous/Next/Last navigation buttons
   - Optional: Page number buttons for quick jumping
