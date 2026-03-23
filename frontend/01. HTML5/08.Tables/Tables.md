# 08. Tables

## Basic Table Structure

```html
<table>
  <tr>
    <th>Name</th>
    <th>Age</th>
    <th>City</th>
  </tr>
  <tr>
    <td>Alice</td>
    <td>25</td>
    <td>New York</td>
  </tr>
  <tr>
    <td>Bob</td>
    <td>30</td>
    <td>London</td>
  </tr>
</table>
```

### Table Tags

| Tag | Purpose |
|-----|---------|
| `<table>` | Table container |
| `<tr>` | Table **row** |
| `<th>` | Table **header** cell (bold, centered by default) |
| `<td>` | Table **data** cell |

---

## Semantic Table Structure

```html
<table>
  <caption>Employee Directory</caption>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Department</th>
      <th scope="col">Salary</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Alice</td>
      <td>Engineering</td>
      <td>$90,000</td>
    </tr>
    <tr>
      <td>Bob</td>
      <td>Marketing</td>
      <td>$75,000</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td colspan="2">Total</td>
      <td>$165,000</td>
    </tr>
  </tfoot>
</table>
```

| Tag | Purpose |
|-----|---------|
| `<caption>` | Table title/description (visible, helps screen readers) |
| `<thead>` | Header row(s) group |
| `<tbody>` | Body rows group |
| `<tfoot>` | Footer row(s) group |

### Why Use `<thead>`, `<tbody>`, `<tfoot>`?

- **Accessibility:** Screen readers identify header/body/footer sections
- **Printing:** `<thead>` and `<tfoot>` repeat on every printed page
- **Styling:** Target sections independently with CSS
- **Scrolling:** Some implementations allow scrolling `<tbody>` while keeping header fixed

---

## Spanning Rows and Columns

### `colspan` — Merge Columns

```html
<table>
  <tr>
    <th colspan="3">Full Width Header</th>
  </tr>
  <tr>
    <td>Col 1</td>
    <td>Col 2</td>
    <td>Col 3</td>
  </tr>
</table>
```

### `rowspan` — Merge Rows

```html
<table>
  <tr>
    <td rowspan="2">Spans 2 rows</td>
    <td>Row 1, Col 2</td>
  </tr>
  <tr>
    <td>Row 2, Col 2</td>
  </tr>
</table>
```

### Combined Example

```html
<table border="1">
  <tr>
    <th rowspan="2">Name</th>
    <th colspan="2">Scores</th>
  </tr>
  <tr>
    <th>Math</th>
    <th>Science</th>
  </tr>
  <tr>
    <td>Alice</td>
    <td>95</td>
    <td>88</td>
  </tr>
</table>
```

---

## `scope` Attribute (Accessibility)

Tells screen readers which cells a header relates to:

```html
<thead>
  <tr>
    <th scope="col">Product</th>
    <th scope="col">Price</th>
    <th scope="col">Quantity</th>
  </tr>
</thead>
<tbody>
  <tr>
    <th scope="row">Apples</th>
    <td>$1.50</td>
    <td>10</td>
  </tr>
  <tr>
    <th scope="row">Bananas</th>
    <td>$0.75</td>
    <td>25</td>
  </tr>
</tbody>
```

| Value | Meaning |
|-------|---------|
| `col` | Header for a column |
| `row` | Header for a row |
| `colgroup` | Header for a group of columns |
| `rowgroup` | Header for a group of rows |

---

## Column Groups

```html
<table>
  <colgroup>
    <col style="background-color: #f0f0f0">
    <col span="2" style="background-color: #e0e0ff">
  </colgroup>
  <tr>
    <th>Name</th>
    <th>Math</th>
    <th>Science</th>
  </tr>
  <tr>
    <td>Alice</td>
    <td>95</td>
    <td>88</td>
  </tr>
</table>
```

- `<colgroup>` groups columns for styling
- `<col>` targets individual columns or groups (`span` attribute)

---

## Table Styling with CSS

```css
/* Basic table styling */
table {
  border-collapse: collapse;       /* Shared borders (vs separate) */
  width: 100%;
  font-family: system-ui;
}

th, td {
  border: 1px solid #ddd;
  padding: 12px 16px;
  text-align: left;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
}

/* Zebra stripes */
tbody tr:nth-child(even) {
  background-color: #f5f5f5;
}

/* Hover effect */
tbody tr:hover {
  background-color: #e8f0fe;
}

/* Caption styling */
caption {
  caption-side: top;               /* or bottom */
  font-weight: bold;
  padding: 10px;
}
```

### `border-collapse`

| Value | Effect |
|-------|--------|
| `collapse` | Borders merge into single lines |
| `separate` | Each cell has its own border (default) |

With `separate`, you can use:
```css
table {
  border-collapse: separate;
  border-spacing: 8px;            /* Gap between cells */
}
```

---

## Responsive Tables

### Horizontal Scroll

```css
.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

```html
<div class="table-wrapper">
  <table>
    <!-- Wide table content -->
  </table>
</div>
```

### Stacked Layout (Mobile)

```css
@media (max-width: 768px) {
  table, thead, tbody, th, td, tr {
    display: block;
  }
  thead {
    display: none;                /* Hide header on mobile */
  }
  td {
    padding-left: 50%;
    position: relative;
  }
  td::before {
    content: attr(data-label);    /* Show label from data attribute */
    position: absolute;
    left: 12px;
    font-weight: bold;
  }
}
```

```html
<tr>
  <td data-label="Name">Alice</td>
  <td data-label="Age">25</td>
  <td data-label="City">New York</td>
</tr>
```

---

## When NOT to Use Tables

- **Never use tables for page layout** — use CSS Grid or Flexbox
- Tables are for **tabular data only** (spreadsheets, statistics, comparison charts)
- Screen readers navigate tables differently — misuse confuses assistive technology
