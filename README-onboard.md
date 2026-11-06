# React-PDF-Report: Visual Table-Report Designer & PDF Generator

Welcome to **React-PDF-Report**! This document is the comprehensive onboarding guide for developers and engineers joining the project. It details the project's purpose, architecture, state management, PDF compilation engine, UI modules, and developer workflows.

---

## 1. Project Overview & Mission

**React-PDF-Report** is an interactive, visual report builder and PDF generation tool focused on tabular business documents such as:
- **Commercial Tax Invoices** (itemized billing, taxes, discounts, grand totals)
- **Warehouse Inventory & Valuation Sheets** (stock counts, unit costs, asset totals)
- **Sales & General Financial Ledgers** (transaction history, VAT reporting)

### The Dual-JSON Model
The system operates on clean separation between **Structure (Template)** and **Data (Payload)**:
1. **Report Template JSON:** Defines document geometry (page size, orientation, margins, accent color), enabled sections, table columns (field bindings, widths, alignment, formatters), metadata grids, and aggregation totals.
2. **Report Data JSON:** An arbitrary JSON payload containing scalar variables (e.g., `invoiceNumber`, `customer.name`) and tabular arrays (e.g., `items`, `inventory`, `records`).

The engine introspects the data payload, compiles both JSON structures into a standard declarative **`pdfmake` Document Definition**, renders an immediate live preview, and generates print-ready downloadable PDFs.

---

## 2. Technology Stack

| Layer | Library / Tool | Version | Purpose |
|-------|----------------|---------|---------|
| **Core Framework** | React / ReactDOM | `^17.0.2` | Component UI and reactive rendering |
| **Routing** | `react-router-dom` | `^5.3.4` | Single-page application routing (`<Switch>`, `<Route>`, `<NavLink>`) |
| **PDF Engine** | `pdfmake` | `^0.2.10` | Client-side declarative PDF compilation & rendering |
| **UI Components** | `react-bootstrap` | `^1.6.8` | Modals, tabs, cards, form controls, responsive grid |
| **CSS Framework** | `bootstrap` | `^4.6.2` | Light Bootstrap Dashboard styling base |
| **Styling Preprocessor**| `sass` (Dart Sass) | `^1.77.8` | SCSS compilation (replaces deprecated `node-sass` for Node 20+ compatibility) |
| **Icons** | `@fortawesome/*` | `^6.5.2` | FontAwesome icons + Nucleo icon set |
| **Global State** | React Context + Reducer | Native | State management for the visual designer with 30-step undo/redo |
| **Legacy Store** | `redux` / `react-redux` | `^4.2.1` / `^7.2.9` | Legacy notes demo store |

---

## 3. Directory & Architecture Map

```
React-PDF-Report/
├── public/                          # CRA HTML template and favicon assets
├── src/
│   ├── index.js                     # Application entry point with BrowserRouter & Redux Provider
│   ├── routes.js                    # Navigation route registry (/admin/pdfmaker, /admin/notes)
│   ├── assets/
│   │   ├── constant/Constant.js     # Original repository benchmark dataset (JSON_PRODUCT_DATA)
│   │   ├── scss/                    # Light Bootstrap Dashboard SCSS sources
│   │   └── css/                     # Compiled CSS stylesheets
│   ├── schemas/
│   │   └── reportTemplateSchema.js  # Template schema constants, defaults & validateTemplate()
│   ├── presets/
│   │   ├── index.js                 # Presets registry (getPresetById, PRESETS array)
│   │   ├── invoicePreset.js         # Commercial Invoice template & sample data
│   │   ├── inventoryPreset.js       # Warehouse Stock Valuation template & sample data
│   │   └── productDataPreset.js     # Sales & VAT Ledger template wired to Constant.js data
│   ├── context/
│   │   └── DesignerContext.js       # Central state store (useDesigner hook, undo/redo, debouncing)
│   ├── utils/
│   │   ├── dataIntrospector.js      # Key discovery, type inference, array inspection & auto-columns
│   │   └── pdfGenerator.js          # Compiler bridging template + data into pdfmake doc definitions
│   ├── components/
│   │   ├── designer/                # 3-Pane Visual Designer modules
│   │   │   ├── DesignerWorkspace.js     # Master 3-pane layout with action toolbar & file I/O
│   │   │   ├── SectionListSidebar.js    # Left Panel: Presets & section visibility stack
│   │   │   ├── DesignerCanvas.js        # Center Panel: Clickable HTML canvas, Live PDF & Split view
│   │   │   ├── PropertyInspector.js     # Right Panel: Context-aware inspector tab router
│   │   │   ├── TableColumnBuilder.js    # Table columns editor, auto-detector, width balancer
│   │   │   ├── HeaderInspector.js       # Header title, subtitle, document meta bindings
│   │   │   ├── MetadataInspector.js     # Multi-column info blocks (Bill To / Ship To)
│   │   │   ├── SummaryInspector.js      # Aggregates (SUM, COUNT, AVG), formulas & grand totals
│   │   │   ├── FooterInspector.js       # Notes, terms & conditions, page numbering
│   │   │   ├── PageInspector.js         # Page size, orientation, margins, accent palette
│   │   │   └── JsonPlaygroundModal.js   # Live JSON data & template structure editor modal
│   │   ├── Navbars/AdminNavbar.js   # Top navigation header
│   │   ├── Sidebar/Sidebar.js       # Left application sidebar
│   │   └── Footer/Footer.js         # Application layout footer
│   ├── layouts/
│   │   └── Admin.js                 # Dashboard layout wrapper with sidebar and main panel
│   └── views/
│       └── PdfMake.js               # Route view mounting DesignerProvider + DesignerWorkspace
├── package.json                     # Modernized dependency definitions
└── README-onboard.md                # This onboarding documentation
```

---

## 4. Core Concepts & Data Flow

```
[ User Input / Data JSON ]       [ Template Definition JSON ]
           │                                 │
           ▼                                 ▼
┌────────────────────────────────────────────────────────┐
│               DesignerContext (State Store)           │
│  - Active Template & Data                              │
│  - Selection State (section, column, row)              │
│  - Undo / Redo History (30 snapshots)                  │
└──────────────────────────┬─────────────────────────────┘
                           │ (Debounced 300ms)
                           ▼
┌────────────────────────────────────────────────────────┐
│             pdfGenerator.js (Compiler Engine)          │
│  - Evaluates Data Bindings (e.g. customer.name)        │
│  - Executes Aggregates (SUM, COUNT, AVG)               │
│  - Formats Cells (currency, number, date, text)        │
│  - Builds Declarative pdfmake Document Definition      │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌─────────────────────────┐ ┌─────────────────────────┐
│  Live PDF Iframe Preview │ │  Direct Browser Download │
│  (Data URL Stream)      │ │  (report_name.pdf)      │
└─────────────────────────┘ └─────────────────────────┘
```

### 1. Template Schema Structure
A report template is structured into clean modular sections:
- **`page`:** Paper size (`A4`, `LETTER`, `LEGAL`), orientation (`portrait`, `landscape`), margins `[L, T, R, B]`, brand accent color, and base font size.
- **`sections.header`:** Document title, subtitle, logo URL, and key-value metadata fields (e.g. `Invoice #`, `Date`, `Status`).
- **`sections.metadata`:** Multi-column information blocks (e.g., *Bill To*, *Ship To*, *Facility Location*).
- **`sections.table`:** The core tabular grid:
  - `dataKey`: Path to the array in the data JSON (or empty string for root array).
  - `columns`: Array of `{ id, header, fieldKey, width, align, format }`.
  - `style`: `headerBg`, `headerColor`, `striped`, `borderStyle` (`lightHorizontalLines`, `headerLineOnly`, `noBorders`).
- **`sections.summary`:** Financial totals and calculations supporting dynamic column aggregation (`SUM`, `COUNT`, `AVG`) or direct JSON binding.
- **`sections.footer`:** Notes, payment instructions, terms of service, and dynamic page numbering (`Page 1 of 2`).

### 2. Introspection Engine (`dataIntrospector.js`)
Instead of forcing users to remember JSON object paths:
- `extractScalarPaths(data)`: Traverses objects to extract dot-paths (e.g. `customer.address`, `taxAmount`) for dropdown menus.
- `discoverArraySources(data)`: Detects all arrays within the payload (e.g. `items`, `inventory`, `records`) and item counts.
- `inferFieldType(value, keyName)`: Distinguishes between currency, numbers, dates, and text (correctly handling quantity keys like `TotalQty` as numbers and pricing keys like `totalamount` as currency).
- `generateSuggestedColumns(fields)`: Automatically generates complete, typed, formatted column definitions from raw JSON arrays.

### 3. PDF Generator (`pdfGenerator.js`)
- `buildPdfDocDefinition(template, data)`: Pure functional transformer converting template rules and data into a standard `pdfmake` structure.
- `getPdfDataUrl(template, data)`: Returns an asynchronous Data URL for instant `<iframe />` previewing.
- `downloadPdf(template, data, filename)`: Triggers clean browser file download.

---

## 5. The 3-Pane Designer Interface

When accessing `/admin/pdfmaker`, users interact with three synchronized panels:

1. **Left Panel: Structure & Presets (`SectionListSidebar.js`)**
   - Quick-load starter presets: *Commercial Invoice*, *Inventory Report*, *Sales & VAT Ledger*.
   - Section stack with instant visibility toggles (eye icons) and item count badges.
   - Validation indicator showing real-time template health.
   - Shortcut to Page & Theme settings.

2. **Center Panel: Interactive Canvas & PDF Preview (`DesignerCanvas.js`)**
   - **Interactive Canvas Mode:** Visual HTML representation of the document. Clicking any section or table column header selects it and highlights it in yellow/blue, instantly opening its editor in the right panel.
   - **Live PDF Mode:** Embedded `pdfmake` viewer with 300ms debounced updates.
   - **Split View:** Side-by-side HTML canvas and live PDF preview.
   - **Action Bar:** Global keyboard shortcuts `Ctrl+Z` (Undo), `Ctrl+Y` (Redo), Reset to Default, and Download PDF.

3. **Right Panel: Context-Aware Property Inspector (`PropertyInspector.js`)**
   - **Table Column Builder:** Add/delete/reorder columns, auto-detect columns from data, auto-balance widths, formatters, and table header/border styling.
   - **Header Inspector:** Titles, subtitles, and metadata fields with data binding dropdowns.
   - **Metadata Inspector:** Manage 1, 2, or 3-column information blocks and field bindings.
   - **Summary Inspector:** Add formulas, aggregate table columns (e.g. `SUM(lineTotal)`), bind tax amounts, and format currency.
   - **Footer Inspector:** Notes, terms, and page numbers.
   - **Page Inspector:** Paper size, orientation, custom accent color picker, base font size slider, and margin controls.

---

## 6. Data Playground & File I/O (`JsonPlaygroundModal.js` & `DesignerWorkspace.js`)

- **JSON Playground Modal:**
  - **Data Payload Tab:** Paste arbitrary JSON data; immediately refreshes introspected fields and preview tables.
  - **Template Definition Tab:** Inspect, copy, or edit the raw template JSON with real-time schema validation.
- **Import Template (`.json`):** Upload an external template file; automatically validates before loading.
- **Export Template (`.json`):** Download the current configuration as `<template_name>_template.json`.
- **Upload Data (`.json`):** Load an external data payload file directly into the workspace.

---

## 7. Developer Quick Start

### Prerequisites
- **Node.js:** v16, v18, or v20+ (`v20.10.0` tested)
- **npm:** v8, v9, or v10+

### Installation & Execution
```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Start the local development server
npm start
# Opens http://localhost:3000 (redirects to http://localhost:3000/admin/pdfmaker)

# 3. Compile production bundle
npm run build

# 4. Compile SCSS stylesheets (using modern Dart Sass)
npm run build:scss
```

---

## 8. Common Extension Scenarios

### Adding a New Built-in Preset
1. Create a new file in `src/presets/` (e.g. `purchaseOrderPreset.js`) defining `id`, `name`, `description`, `template`, and `sampleData`.
2. Register the preset in [`src/presets/index.js`](file:///e:/git/React-PDF-Report/src/presets/index.js).
3. The preset will immediately appear in the preset dropdowns in the sidebar and toolbar.

### Adding a New Column Formatter
1. Add the formatter key (e.g. `'percentage'`) to `COLUMN_FORMATS` in [`src/schemas/reportTemplateSchema.js`](file:///e:/git/React-PDF-Report/src/schemas/reportTemplateSchema.js).
2. Add the formatting logic to `formatValue()` in [`src/utils/pdfGenerator.js`](file:///e:/git/React-PDF-Report/src/utils/pdfGenerator.js).
3. The formatter will automatically become selectable in `TableColumnBuilder.js`.

---

## 9. Verification & Quality Checklist

Before committing changes, verify:
- [ ] `npm run build` completes without errors.
- [ ] Switching presets updates both the interactive canvas and the live PDF preview.
- [ ] Auto-detect columns populates the table based on active array data.
- [ ] Undo (`Ctrl+Z`) and Redo (`Ctrl+Y`) cleanly restore prior states.
- [ ] Export Template produces a valid JSON file that can be re-imported without validation errors.
- [ ] Download PDF produces a clean, correctly formatted PDF file.

