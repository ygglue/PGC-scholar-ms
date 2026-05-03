# Scholar Directory Update - Implementation Plan

## Overview

Refactor the Scholars Directory view to support toggle between List View and Card View, with pagination, detail panel, and on-demand document fetching.

## Requirements

| # | Requirement | Value |
|---|-------------|-------|
| 1 | Document grouping | By Submission Bin (Academic year + Semester) |
| 2 | Detail panel location | Right panel |
| 3 | Document fetch timing | On-demand (when clicking scholar) |
| 4 | List sort | Name (A-Z) |
| 5 | Card click action | Opens detail panel on right |
| 6 | Card avatar | Image if available, initials with color if not |
| 7 | List pagination | 50 per page |
| 8 | Card pagination | 20 per page |
| 9 | Default view | Card view |

## New Helper Functions

### get_initials(first: str, last: str) -> str
```python
def get_initials(first: str, last: str) -> str:
    """Generate initials: Juan + Dela Cruz -> "JDC" """
    parts = []
    if first:
        parts.append(first[0].upper())
    if last:
        # Handle last names (could be multiple)
        last_parts = last.split()
        for lp in last_parts:
            if lp:
                parts.append(lp[0].upper())
    return "".join(parts) if parts else "?"
```

### get_avatar_color(name: str) -> QColor
```python
AVATAR_COLORS = [
    "#fee2e2", "#ffedd5", "#fef3c7", "#dcfce7",
    "#d1fae5", "#ccfbf1", "#cffafe", "#e0f2fe",
    "#dbeafe", "#e0e7ff", "#ede9fe", "#fae8ff"
]

def get_avatar_color(name: str) -> QColor:
    """Generate consistent color from name hash"""
    if not name:
        return QColor("#d1fae5")  # Default green
    
    hash_val = 0
    for char in name:
        hash_val = ord(char) + ((hash_val << 5) - hash_val)
    
    index = abs(hash_val) % len(AVATAR_COLORS)
    return QColor(AVATAR_COLORS[index])
```

## New Components

### ScholarCard
- 48x48 avatar circle (image or initials with color)
- Name (bold)
- School name
- Year level
- Status badge (color-coded)

### ScholarCardGrid
- Scrollable grid of ScholarCard widgets
- 20 cards per page
- Pagination controls below

### ScholarListItem
- Table row widget for list view
- Click to open detail panel
- 50 items per page

### ScholarDetailPanel
- Right-side panel (350px width, collapsible)
- Sections:
  - Header: Avatar + Name + Status
  - Personal Information
  - Academic Information
  - Submitted Documents (grouped by bin)

### ViewToggleButton
- Toggle between list and card views
- Position: Top right, next to filters

### PaginationControl
- Prev | Page X of Y | Next
- Per-page: 50 (list), 20 (card)

### FetchScholarDocsThread
- QThread for on-demand document fetching
- Fetches documents + academic records

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Filters...]             [Search...]           [List] [⚓Card]        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌───────────────────────────────────────────┬──────────────────┐  │
│   │                                           │                  │  │
│   │         CONTENT AREA                      │   DETAIL PANEL    │  │
│   │         (List OR Cards + Pagination)        │   (350px,        │  │
│   │                                       │    collapsible)  │  │
│   │                                           │                  │  │
│   └───────────────────────────────────────────┴──────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Card Design (Small)

```
┌────────────┐
│   [IMG]   │  ← 48x48 avatar circle
│   or [JM] │  ← Initials in color circle
├────────────┤
│ Juan M.   │  ← Name (bold)
│ Dela Cruz │
│ UST      │  ← School
│ 3rd Year │  ← Year level
│ ● Active │  ← Status badge
└────────────┘
```

## Detail Panel Structure

```
┌─────────────────────────────────────────────────────────────┐
│ [Avatar]  Name                       [Status Badge]      │
├──────────────────────────────────────────────────────┤
│ ▼ PERSONAL INFORMATION                               │
│   DOB: · Place of Birth: · Sex: · Civil Status:      │
│   Religion: · Address: · Contact:                   │
├──────────────────────────────────────────────────────┤
│ ▼ ACADEMIC INFORMATION                          │
│   School: · Course: · Year: · Batch:          │
│   Type: Regular/Irregular · Date Enrolled:         │
├──────────────────────────────────────────────────────┤
│ ▼ SUBMITTED DOCUMENTS                          │
│   ▼ AY 2024-2025 — 1st Semester (2 docs)        │
│     ☑ COR - Verified    │ 📄 ROG - Pending      │
│   ▼ AY 2023-2024 — 2nd Semester (1 doc)       │
│     ☑ COR - Verified                            │
└──────────────────────────────────────────────────────┘
```

## API Endpoints

| Endpoint | When Called | Purpose |
|----------|------------|---------|
| GET /scholars/ | Initial load | List all scholars (sorted A-Z) |
| GET /documents/scholar/{scholar_id} | On-demand | Fetch documents |
| GET /academic-records/scholar/{scholar_id} | On-demand | Group documents by bin |

## Color Palette

### Avatar Colors
```python
AVATAR_COLORS = [
    "#fee2e2", "#ffedd5", "#fef3c7", "#dcfce7",
    "#d1fae5", "#ccfbf1", "#cffafe", "#e0f2fe",
    "#dbeafe", "#e0e7ff", "#ede9fe", "#fae8ff"
]
```

### Status Badge Colors
| Status | Background | Text Color |
|--------|-----------|----------|
| Active | #dcfce7 | #166534 |
| Graduate | #dbeafe | #1d4ed8 |
| Inactive | #f3f4f6 | #4b5563 |

## Implementation Steps

1. Add helper functions (`get_initials()`, `get_avatar_color()`)
2. Add ViewToggleButton widget
3. Add PaginationControl widget
4. Add ScholarCard widget
5. Add ScholarCardGrid widget
6. Add ScholarListItem widget
7. Add ScholarDetailPanel widget
8. Add FetchScholarDocsThread class
9. Refactor ScholarsDirectoryView layout
   - Add view toggle
   - Add conditional rendering (list vs card)
   - Add pagination
   - Add detail panel (hidden by default)
10. Handle sorting (Name A-Z)
11. Connect click handlers (list items + cards → detail panel)
12. Add on-demand document fetching

## Existing Dependencies

- CacheService for caching
- NetworkStatus for offline detection
- API_BASE from config
- CACHE_KEY for scholars list

## Notes

- Cache existing scholars list for offline access
- Documents fetched only when detail panel opens
- Group documents by bin (school_year + semester)
- Sort alphabetically by name on initial load