

## Plan: Improve Dissatisfaction Report with Non-Tabular Comments Display

### Overview
This plan addresses three key changes:
1. Replace the tabular format for "All Comments/Suggestions" with a more readable card-based layout
2. Improve the overall Dissatisfaction Report with better ARTA metrics display and visual enhancements
3. Move the "Dissatisfaction" button from the main Index page to inside the Generate Report page only

---

### Changes Summary

#### File 1: `src/pages/Index.tsx`
**What changes:** Remove the Dissatisfaction Report button from the header

**Current code to remove (lines 163-166):**
```jsx
<Button onClick={handleDissatisfactionReport} variant="outline" className="gap-2 h-9 text-sm bg-yellow-100 text-[#800000] hover:bg-yellow-200 border-yellow-300">
  <AlertTriangle className="w-4 h-4" />
  <span className="hidden sm:inline">Dissatisfaction</span>
</Button>
```

**Also remove:**
- The `handleDissatisfactionReport` function (lines 84-94)
- The `AlertTriangle` import (line 6)

---

#### File 2: `src/pages/Report.tsx`
**What changes:** The Dissatisfaction button already exists in this file (line 136-139), so no changes needed here. The button is already properly placed in the Generate Report page header.

---

#### File 3: `src/pages/DissatisfactionReport.tsx`
**What changes:** Major improvements to the comments section and overall report quality

**1. Replace Comments Table (lines 550-607) with Card-Based Layout:**

The new Comments section will display each comment as an individual card with:
- Visual indicator for dissatisfied vs satisfied feedback (left border color)
- Client information header (office, campus, client type, date)
- Full comment text (no truncation)
- Issue badges if there are problematic dimensions
- Document number reference
- Better visual hierarchy and readability

**New design structure:**
```
Comments & Suggestions Section
├── Filter toggle: "Show Only Dissatisfied" / "Show All"
├── Comment Cards (scrollable list)
│   ├── Card Header: Office | Campus | Client Type | Date
│   ├── Comment Text (full, no truncation)
│   ├── Issue Badges (SQD0, SQD3, etc.) if any
│   └── Document Number
```

**2. Add ARTA Interpretation Badges to Summary Cards:**

Update the summary cards to show interpretation levels (Very High, High, Moderate, Low, Very Low) alongside the scores.

**3. Improve SQD Table with Favorable Scores:**

Add columns for:
- Favorable % (A + SA percentage) 
- ARTA Interpretation badge for each dimension

**4. Add Section for Key Findings:**

Add a summary section before the comments that highlights:
- Dimensions needing attention (below 70% favorable)
- Offices requiring improvement
- Overall interpretation level

---

### Technical Implementation Details

#### New Comments Section Component Structure

```jsx
{/* Comments & Suggestions - Card Layout */}
<Card className="mb-8">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <MessageSquare className="w-5 h-5 text-blue-500" />
      Comments & Suggestions ({comments.length})
    </CardTitle>
    <CardDescription>
      Client feedback sorted by importance (dissatisfied first)
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Filter Toggle */}
    <div className="flex gap-2 mb-4 print:hidden">
      <Button variant="outline" size="sm">Show All</Button>
      <Button variant="outline" size="sm">Dissatisfied Only</Button>
    </div>
    
    {/* Comments Grid */}
    <div className="space-y-4 max-h-[600px] overflow-y-auto print:max-h-none">
      {comments.map((comment, index) => (
        <div 
          key={index}
          className={`p-4 rounded-lg border-l-4 ${
            comment.hasDissatisfaction 
              ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10' 
              : 'border-l-green-500 bg-green-50 dark:bg-green-900/10'
          }`}
        >
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{comment.office}</span>
            <span>•</span>
            <span>{comment.campus}</span>
            <span>•</span>
            <span>Client: {comment.clientType}</span>
            <span>•</span>
            <span>{comment.timestamp}</span>
            {comment.documentNumber && (
              <>
                <span>•</span>
                <span>Doc #{comment.documentNumber}</span>
              </>
            )}
          </div>
          
          {/* Comment Text */}
          <p className="text-foreground mb-3">{comment.comment}</p>
          
          {/* Issue Badges */}
          {comment.hasDissatisfaction && (
            <div className="flex gap-1 flex-wrap">
              <span className="text-xs text-muted-foreground mr-1">Issues:</span>
              {comment.problematicDimensions.map((dim, i) => (
                <span 
                  key={i} 
                  className="px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded text-xs font-medium"
                >
                  {dim}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

#### Enhanced SQD Table Columns

Current columns:
- Dimension, Description, SD, D, ND, Negative (SD+D), Negative %, Neutral+Negative %

New columns (adding):
- **Favorable %** (A + SA percentage)
- **Interpretation** (ARTA level badge)

#### State for Comment Filtering

```typescript
const [showOnlyDissatisfied, setShowOnlyDissatisfied] = useState(false);

// Filter comments based on toggle
const displayedComments = showOnlyDissatisfied 
  ? comments.filter(c => c.hasDissatisfaction)
  : comments;
```

---

### Visual Improvements Summary

| Section | Current | Improved |
|---------|---------|----------|
| Comments | Table with truncated text | Card layout with full text, color-coded borders |
| SQD Table | Only negative metrics | Added Favorable % and ARTA interpretation badges |
| Summary Cards | Basic stats | Added interpretation levels with colored badges |
| Overall | Functional | More comprehensive with ARTA alignment |

---

### Files to Modify

1. **`src/pages/Index.tsx`**
   - Remove the `handleDissatisfactionReport` function
   - Remove the Dissatisfaction button from header
   - Remove unused `AlertTriangle` import

2. **`src/pages/DissatisfactionReport.tsx`**
   - Add state for comment filtering toggle
   - Replace Table 6 (comments table) with card-based layout
   - Add Favorable % column to SQD table
   - Add interpretation badges to SQD table rows
   - Add Key Findings summary section
   - Improve print styling for comments section

---

### Benefits

- **Better Readability**: Comments are now displayed in full with clear visual hierarchy
- **Quick Identification**: Color-coded borders instantly show dissatisfied vs satisfied feedback
- **ARTA Compliance**: Favorable scores and interpretation levels align with official methodology
- **Cleaner Navigation**: Dissatisfaction report is accessed from within the reporting context, not the main encoding form
- **Print-Friendly**: Card layout renders well for PDF/print output

