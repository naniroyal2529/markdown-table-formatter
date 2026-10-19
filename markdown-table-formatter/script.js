/**
 * Markdown Table Formatter
 * Complete responsive web app logic for converting CSV / TSV to Markdown tables
 */

(function () {
  'use strict';

  // DOM Elements
  const inputText = document.getElementById('inputText');
  const outputText = document.getElementById('outputText');
  const formatBtn = document.getElementById('formatBtn');
  const copyBtn = document.getElementById('copyBtn');
  const copyBtnText = document.getElementById('copyBtnText');
  const clearBtn = document.getElementById('clearBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const delimiterSelect = document.getElementById('delimiterSelect');
  const alignSelect = document.getElementById('alignSelect');
  const headerCheckbox = document.getElementById('headerCheckbox');
  const paddedCheckbox = document.getElementById('paddedCheckbox');
  const inputStats = document.getElementById('inputStats');
  const detectedDelimiterBadge = document.getElementById('detectedDelimiterBadge');
  const outputStats = document.getElementById('outputStats');
  const dimensionBadge = document.getElementById('dimensionBadge');
  const alertBanner = document.getElementById('alertBanner');
  const alertMessage = document.getElementById('alertMessage');
  const alertCloseBtn = document.getElementById('alertCloseBtn');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const tablePreviewContainer = document.getElementById('tablePreviewContainer');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabViews = document.querySelectorAll('.tab-view');
  const sampleBtns = document.querySelectorAll('.sample-btn');

  // Sample Datasets
  const SAMPLES = {
    sales: `Product,Category,Price,Quantity,Status,Total
MacBook Pro 16",Hardware,"$2,499.00",15,In Stock,"$37,485.00"
Dell UltraSharp 32",Monitors,"$799.50",28,In Stock,"$22,386.00"
Sony WH-1000XM5,Audio,"$398.00",42,Low Stock,"$16,716.00"
Keychron Q1 Pro,Peripherals,"$199.99",65,In Stock,"$12,999.35"
Logitech MX Master 3S,Peripherals,"$99.99",110,In Stock,"$10,998.90"
Ergonomic Chair,Furniture,"$549.00",8,Backordered,"$4,392.00"`,

    employees: `ID\tFull Name\tDepartment\tRole\tRating\tActive
101\tSarah Connor\tEngineering\tPrincipal Architect\t4.95\tYes
102\tMarcus Vance\tProduct Design\tLead UX Designer\t4.80\tYes
103\tElena Rostova\tData Science\tSenior ML Engineer\t4.90\tYes
104\tDavid Kim\tDevOps\tCloud Infrastructure Lead\t4.75\tYes
105\tAmara Okafor\tMarketing\tGrowth Strategist\t4.65\tNo
106\tThomas Wayne\tSecurity\tCybersecurity Director\t5.00\tYes`,

    tech: `Technology,Language,Paradigm,Primary Use Case,Rating
React,TypeScript/JS,Component-Based,Front-end Web UI,4.8
FastAPI,Python,Async ASGI,REST APIs & Microservices,4.9
PostgreSQL,SQL,Relational DBMS,Enterprise Data Store,4.9
Docker,Go,Container Engine,Application Containerization,4.8
Redis,C,In-Memory Key-Value,Caching & Fast Message Queue,4.7`
  };

  // State
  let currentParsedData = null;
  let toastTimeout = null;

  // Initialize App
  function init() {
    initTheme();
    bindEvents();
    updateInputStats();

    // Load initial sample so user immediately sees a working table
    loadSample('sales');
  }

  // Theme Management
  function initTheme() {
    const savedTheme = localStorage.getItem('md_table_theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  function setTheme(theme) {
    if (theme === 'light') {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      localStorage.setItem('md_table_theme', 'light');
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      localStorage.setItem('md_table_theme', 'dark');
    }
  }

  function toggleTheme() {
    const isDark = document.body.classList.contains('theme-dark');
    setTheme(isDark ? 'light' : 'dark');
  }

  // Event Listeners
  function bindEvents() {
    // Buttons
    formatBtn.addEventListener('click', handleFormat);
    copyBtn.addEventListener('click', handleCopy);
    clearBtn.addEventListener('click', handleClear);
    downloadBtn.addEventListener('click', handleDownload);
    themeToggleBtn.addEventListener('click', toggleTheme);
    alertCloseBtn.addEventListener('click', hideAlert);

    // Inputs & Shortcuts
    inputText.addEventListener('input', () => {
      updateInputStats();
      hideAlert();
    });

    inputText.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleFormat();
      }
    });

    // Delimiter & Option changes re-format if content exists
    delimiterSelect.addEventListener('change', () => {
      if (inputText.value.trim()) handleFormat();
    });
    alignSelect.addEventListener('change', () => {
      if (inputText.value.trim()) handleFormat();
    });
    headerCheckbox.addEventListener('change', () => {
      if (inputText.value.trim()) handleFormat();
    });
    paddedCheckbox.addEventListener('change', () => {
      if (inputText.value.trim()) handleFormat();
    });

    // Sample buttons
    sampleBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const sampleKey = btn.dataset.sample;
        loadSample(sampleKey);
      });
    });

    // Tabs
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        switchTab(targetTab);
      });
    });

    // Drag and Drop
    setupDragAndDrop();

    // File Upload
    fileInput.addEventListener('change', handleFileUpload);
  }

  // Load Sample
  function loadSample(key) {
    if (!SAMPLES[key]) return;
    inputText.value = SAMPLES[key];
    hideAlert();
    updateInputStats();
    handleFormat();
    showToast(`Loaded sample: ${key.toUpperCase()}`);
  }

  // Tab Switching
  function switchTab(tabName) {
    tabBtns.forEach((b) => {
      b.classList.toggle('active', b.dataset.tab === tabName);
    });

    tabViews.forEach((view) => {
      if (tabName === 'markdown') {
        view.classList.toggle('active', view.id === 'markdownTabView');
      } else if (tabName === 'preview') {
        view.classList.toggle('active', view.id === 'previewTabView');
      }
    });
  }

  // Input Stats Counter
  function updateInputStats() {
    const text = inputText.value;
    if (!text.trim()) {
      inputStats.textContent = '0 lines';
      detectedDelimiterBadge.textContent = 'Auto Detect';
      return;
    }

    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    inputStats.textContent = `${lines.length} ${lines.length === 1 ? 'line' : 'lines'}`;

    const detected = detectDelimiter(text);
    const names = { ',': 'Comma (,)', '\t': 'Tab (\\t)', ';': 'Semicolon (;)', '|': 'Pipe (|)' };
    detectedDelimiterBadge.textContent = `Detected: ${names[detected] || 'Unknown'}`;
  }

  // Detect Delimiter
  function detectDelimiter(text) {
    const selected = delimiterSelect.value;
    if (selected === 'comma') return ',';
    if (selected === 'tab') return '\t';
    if (selected === 'semicolon') return ';';
    if (selected === 'pipe') return '|';

    // Auto-detect among comma, tab, semicolon, pipe
    const candidates = [',', '\t', ';', '|'];
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0).slice(0, 5);

    if (lines.length === 0) return ',';

    const scores = { ',': 0, '\t': 0, ';': 0, '|': 0 };

    candidates.forEach((delim) => {
      const counts = lines.map((line) => countDelimitersOutsideQuotes(line, delim));
      const firstCount = counts[0];
      if (firstCount > 0) {
        // Higher score if counts are consistent across lines
        const isConsistent = counts.every((c) => c === firstCount);
        scores[delim] = firstCount * (isConsistent ? 3 : 1);
      }
    });

    let bestDelim = ',';
    let maxScore = 0;
    for (const [delim, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        bestDelim = delim;
      }
    }

    return bestDelim;
  }

  function countDelimitersOutsideQuotes(line, delim) {
    let count = 0;
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delim && !inQuotes) {
        count++;
      }
    }
    return count;
  }

  // Robust RFC 4180 Delimited Parser
  function parseData(text, delim) {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;
    let i = 0;
    const len = text.length;

    while (i < len) {
      const char = text[i];
      const nextChar = i + 1 < len ? text[i + 1] : '';

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped double quote "" -> "
          currentCell += '"';
          i += 2;
          continue;
        } else {
          inQuotes = !inQuotes;
          i++;
          continue;
        }
      }

      if (!inQuotes && char === delim) {
        currentRow.push(currentCell.trim());
        currentCell = '';
        i++;
        continue;
      }

      if (!inQuotes && (char === '\r' || char === '\n')) {
        currentRow.push(currentCell.trim());
        // Only push non-empty rows or rows with actual content
        if (currentRow.some((cell) => cell.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';

        if (char === '\r' && nextChar === '\n') {
          i += 2;
        } else {
          i++;
        }
        continue;
      }

      currentCell += char;
      i++;
    }

    // Push trailing cell & row if exists
    if (currentCell.length > 0 || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
    }

    return rows;
  }

  // Check if string represents a number / financial currency / percentage
  function isNumeric(val) {
    if (!val || val.trim() === '') return false;
    const clean = val.replace(/[\$,€,£,¥,%]/g, '').replace(/,/g, '').trim();
    if (clean === '' || isNaN(clean)) return false;
    return !isNaN(parseFloat(clean));
  }

  // Escape pipe character for Markdown safety
  function escapeMarkdownCell(cell) {
    if (!cell) return '';
    return cell.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
  }

  // Main Formatting Function
  function handleFormat() {
    const rawInput = inputText.value;

    if (!rawInput.trim()) {
      showError('Input is empty. Please enter CSV or tab-separated data, or click a Sample button.');
      outputText.value = '';
      tablePreviewContainer.innerHTML = `
        <div class="empty-preview-message">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="9" x2="9" y2="21"></line>
          </svg>
          <p>Please enter data to view rendered table preview</p>
        </div>
      `;
      outputStats.textContent = 'Empty input';
      dimensionBadge.style.display = 'none';
      return;
    }

    const delim = detectDelimiter(rawInput);
    const parsedRows = parseData(rawInput, delim);

    if (!parsedRows || parsedRows.length === 0) {
      showError('Unable to parse data. Please check your data format.');
      return;
    }

    // Determine max columns across all rows to handle jagged data
    let maxCols = 0;
    parsedRows.forEach((row) => {
      if (row.length > maxCols) maxCols = row.length;
    });

    if (maxCols === 0) {
      showError('No valid columns found in the data.');
      return;
    }

    // Normalize rows so every row has maxCols columns
    const normalizedRows = parsedRows.map((row) => {
      const copy = [...row];
      while (copy.length < maxCols) {
        copy.push('');
      }
      return copy.map(escapeMarkdownCell);
    });

    const isFirstRowHeader = headerCheckbox.checked;
    let headerRow = [];
    let dataRows = [];

    if (isFirstRowHeader) {
      headerRow = normalizedRows[0];
      dataRows = normalizedRows.slice(1);
      // If there is only 1 row and header is checked, provide at least one empty data row or notice
      if (dataRows.length === 0) {
        dataRows = [new Array(maxCols).fill('')];
      }
    } else {
      // Generate synthetic headers: Column 1, Column 2, ...
      headerRow = Array.from({ length: maxCols }, (_, idx) => `Column ${idx + 1}`);
      dataRows = normalizedRows;
    }

    // Determine Column Alignments
    const alignSetting = alignSelect.value;
    const alignments = []; // 'left', 'center', 'right'

    for (let c = 0; c < maxCols; c++) {
      if (alignSetting === 'left') {
        alignments.push('left');
      } else if (alignSetting === 'center') {
        alignments.push('center');
      } else if (alignSetting === 'right') {
        alignments.push('right');
      } else {
        // Auto-detect based on column data
        let numericCount = 0;
        let totalCount = 0;
        dataRows.forEach((row) => {
          const val = row[c];
          if (val && val.trim().length > 0) {
            totalCount++;
            if (isNumeric(val)) numericCount++;
          }
        });

        if (totalCount > 0 && numericCount / totalCount >= 0.6) {
          alignments.push('right');
        } else {
          alignments.push('left');
        }
      }
    }

    // Calculate maximum width for each column (minimum width 3 for separator ':---' or '---')
    const colWidths = new Array(maxCols).fill(3);

    for (let c = 0; c < maxCols; c++) {
      colWidths[c] = Math.max(colWidths[c], headerRow[c] ? headerRow[c].length : 0);
      dataRows.forEach((row) => {
        colWidths[c] = Math.max(colWidths[c], row[c] ? row[c].length : 0);
      });
      // Align indicator length
      const alignIndicatorLength = alignments[c] === 'center' ? 5 : alignments[c] === 'right' ? 4 : 4;
      colWidths[c] = Math.max(colWidths[c], alignIndicatorLength);
    }

    const isPrettyPadded = paddedCheckbox.checked;

    // Helper to format a cell with alignment padding
    function formatCell(content, width, align) {
      if (!isPrettyPadded) {
        return content;
      }
      const padLen = Math.max(0, width - content.length);
      if (align === 'right') {
        return ' '.repeat(padLen) + content;
      } else if (align === 'center') {
        const leftPad = Math.floor(padLen / 2);
        const rightPad = padLen - leftPad;
        return ' '.repeat(leftPad) + content + ' '.repeat(rightPad);
      } else {
        return content + ' '.repeat(padLen);
      }
    }

    // Helper for separator cell
    function formatSeparator(width, align) {
      if (!isPrettyPadded) {
        if (align === 'center') return ':---:';
        if (align === 'right') return '---:';
        return ':---';
      }

      if (align === 'center') {
        const dashes = Math.max(1, width - 2);
        return ':' + '-'.repeat(dashes) + ':';
      } else if (align === 'right') {
        const dashes = Math.max(2, width - 1);
        return '-'.repeat(dashes) + ':';
      } else {
        const dashes = Math.max(2, width - 1);
        return ':' + '-'.repeat(dashes);
      }
    }

    // Build Markdown Lines
    const markdownLines = [];

    // Header Line
    const formattedHeaders = headerRow.map((cell, idx) =>
      formatCell(cell, colWidths[idx], alignments[idx])
    );
    markdownLines.push(`| ${formattedHeaders.join(' | ')} |`);

    // Separator Line
    const formattedSeparators = alignments.map((align, idx) =>
      formatSeparator(colWidths[idx], align)
    );
    markdownLines.push(`| ${formattedSeparators.join(' | ')} |`);

    // Data Lines
    dataRows.forEach((row) => {
      const formattedCells = row.map((cell, idx) =>
        formatCell(cell, colWidths[idx], alignments[idx])
      );
      markdownLines.push(`| ${formattedCells.join(' | ')} |`);
    });

    const markdownResult = markdownLines.join('\n');
    outputText.value = markdownResult;

    // Update stats and dimensions
    hideAlert();
    const totalRowsCount = dataRows.length + 1; // including header
    outputStats.textContent = 'Formatted successfully';
    outputStats.classList.add('badge-success');
    dimensionBadge.style.display = 'inline-block';
    dimensionBadge.textContent = `${maxCols} cols × ${totalRowsCount} rows`;

    // Render HTML Preview
    renderHtmlTablePreview(headerRow, dataRows, alignments);

    // Save parsed data
    currentParsedData = {
      headerRow,
      dataRows,
      alignments,
      maxCols,
      markdown: markdownResult
    };
  }

  // Render HTML Table Preview with full styling and alignment
  function renderHtmlTablePreview(headers, rows, alignments) {
    const table = document.createElement('table');
    table.className = 'rendered-table';

    // Thead
    const thead = document.createElement('thead');
    const headerTr = document.createElement('tr');
    headers.forEach((h, idx) => {
      const th = document.createElement('th');
      th.textContent = h;
      th.className = `align-${alignments[idx] || 'left'}`;
      headerTr.appendChild(th);
    });
    thead.appendChild(headerTr);
    table.appendChild(thead);

    // Tbody
    const tbody = document.createElement('tbody');
    rows.forEach((row) => {
      const tr = document.createElement('tr');
      row.forEach((cell, idx) => {
        const td = document.createElement('td');
        td.textContent = cell;
        td.className = `align-${alignments[idx] || 'left'}`;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    tablePreviewContainer.innerHTML = '';
    tablePreviewContainer.appendChild(table);
  }

  // Copy Markdown to Clipboard
  function handleCopy() {
    const textToCopy = outputText.value;
    if (!textToCopy.trim()) {
      showError('Nothing to copy. Please format a table first.');
      return;
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(textToCopy).then(
        () => triggerCopySuccess(),
        () => fallbackCopy(textToCopy)
      );
    } else {
      fallbackCopy(textToCopy);
    }
  }

  function fallbackCopy(text) {
    try {
      const tempTextArea = document.createElement('textarea');
      tempTextArea.value = text;
      tempTextArea.style.position = 'fixed';
      tempTextArea.style.left = '-9999px';
      tempTextArea.style.top = '0';
      document.body.appendChild(tempTextArea);
      tempTextArea.focus();
      tempTextArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(tempTextArea);
      if (success) {
        triggerCopySuccess();
      } else {
        showError('Could not automatically copy to clipboard. Please select and copy manually.');
      }
    } catch (err) {
      showError('Copy failed: ' + err.message);
    }
  }

  function triggerCopySuccess() {
    const copyIcon = copyBtn.querySelector('.copy-icon');
    const checkIcon = copyBtn.querySelector('.check-icon');

    if (copyIcon && checkIcon) {
      copyIcon.style.display = 'none';
      checkIcon.style.display = 'block';
    }
    copyBtnText.textContent = 'Copied!';

    showToast('Markdown table copied to clipboard!');

    setTimeout(() => {
      if (copyIcon && checkIcon) {
        copyIcon.style.display = 'block';
        checkIcon.style.display = 'none';
      }
      copyBtnText.textContent = 'Copy Markdown';
    }, 2000);
  }

  // Clear All
  function handleClear() {
    inputText.value = '';
    outputText.value = '';
    currentParsedData = null;
    updateInputStats();
    hideAlert();
    outputStats.textContent = 'Ready';
    outputStats.classList.remove('badge-success');
    dimensionBadge.style.display = 'none';

    tablePreviewContainer.innerHTML = `
      <div class="empty-preview-message">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="9" x2="9" y2="21"></line>
        </svg>
        <p>Format a table to view rendered HTML preview</p>
      </div>
    `;

    showToast('Input and output cleared');
  }

  // Download .md File
  function handleDownload() {
    const content = outputText.value;
    if (!content.trim()) {
      showError('Please format a table before downloading.');
      return;
    }

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'markdown-table.md';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

    showToast('Downloaded markdown-table.md');
  }

  // File Upload Handling
  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    readFile(file);
    e.target.value = ''; // reset for re-selecting same file
  }

  function readFile(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      inputText.value = event.target.result;
      updateInputStats();
      handleFormat();
      showToast(`Imported ${file.name}`);
    };
    reader.onerror = function () {
      showError('Error reading file. Please check file permissions or try another file.');
    };
    reader.readAsText(file);
  }

  // Drag and Drop
  function setupDragAndDrop() {
    ['dragenter', 'dragover'].forEach((eventName) => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
      });
    });

    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        readFile(files[0]);
      } else {
        const textData = dt.getData('text');
        if (textData) {
          inputText.value = textData;
          updateInputStats();
          handleFormat();
        }
      }
    });
  }

  // Alert Banner
  function showError(msg) {
    alertMessage.textContent = msg;
    alertBanner.style.display = 'flex';
  }

  function hideAlert() {
    alertBanner.style.display = 'none';
  }

  // Toast Notification
  function showToast(msg, isError = false) {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    toastMessage.textContent = msg;
    toast.classList.toggle('toast-error', isError);
    toast.classList.add('show');

    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
