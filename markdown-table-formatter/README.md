# Markdown Table Formatter

A modern, responsive, client-side web application built with pure HTML5, CSS3, and JavaScript that instantly transforms CSV, TSV (tab-separated), semicolon, and pipe-delimited data into clean, properly aligned Markdown tables.

---

## ✨ Features

- **Multi-Format Delimiter Detection**:
  - Automatically identifies whether your data is **CSV (comma)**, **TSV (tab)**, **Semicolon (;)**, or **Pipe (|)**.
  - Option to manually lock any delimiter.
- **Smart Column Width Calculation**:
  - Automatically calculates maximum character width for every column across all rows.
  - Aligns columns with padding so plain-text monospace Markdown files look neat and readable.
  - Option to switch to compact Markdown mode.
- **Configurable Alignments**:
  - **Auto**: Right-aligns numeric, financial ($), and percentage columns; left-aligns text.
  - **All Left** (`:---`)
  - **All Center** (`:---:`)
  - **All Right** (`---:`)
- **Interactive Output Views**:
  - **Markdown Code**: Raw, ready-to-copy Markdown syntax.
  - **HTML Table Preview**: Live rendered table with clean borders, zebra striping, and column alignment.
- **Clipboard & File Operations**:
  - **One-Click Copy**: Copies Markdown directly to your clipboard with visual checkmark feedback and toast notification.
  - **Download `.md`**: Saves the formatted Markdown directly as a `.md` file.
  - **File Import / Drag & Drop**: Drag and drop any `.csv`, `.tsv`, or `.txt` file onto the input area, or click "Import File".
- **Instant Preset Samples**:
  - *Financial CSV*: Includes prices, quantities, and quotes.
  - *Employees TSV*: Tab-separated data with ratings and status.
  - *Tech Matrix*: Multi-column comparison data.
- **Robust Error & Edge Case Handling**:
  - Handles empty and invalid inputs with helpful banners.
  - RFC 4180 compliant: respects double quotes (`"..."`) with internal commas and escaped double quotes (`""`).
  - Automatically escapes raw pipe characters (`|` &rarr; `\|`) to prevent Markdown syntax breakage.
  - Auto-normalizes jagged rows (different number of columns per row).
- **Modern Responsive Design & Themes**:
  - Polished dark mode (default) and clean light mode with persistent theme preference.
  - Responsive 2-column layout that gracefully stacks on mobile and tablet screens.
  - Keyboard shortcut: <kbd>Ctrl</kbd> + <kbd>Enter</kbd> (or <kbd>Cmd</kbd> + <kbd>Enter</kbd>) to instantly format.

---

## 🚀 Getting Started

No build tools or package managers required. Simply open `index.html` in any modern web browser:

### Option 1: Open directly
Double-click `index.html` or right-click and choose **Open with > Chrome / Edge / Firefox / Safari**.

### Option 2: Run a lightweight local server (Optional)
Using Python (available on Windows/macOS/Linux):
```powershell
py -m http.server 8000
```
Then navigate to:
```
http://localhost:8000
```

---

## 📁 File Structure

```
markdown-table-formatter/
├── index.html        # Semantic HTML5 layout and controls
├── style.css         # Modern styling, responsive breakpoints, dark/light themes
├── script.js         # Core RFC 4180 parsing, Markdown formatter, clipboard logic
└── README.md         # Documentation and usage guide
```

---

## ⌨️ Keyboard Shortcuts
- **Format Table**: <kbd>Ctrl</kbd> + <kbd>Enter</kbd> (Windows/Linux) or <kbd>Cmd</kbd> + <kbd>Enter</kbd> (macOS)
