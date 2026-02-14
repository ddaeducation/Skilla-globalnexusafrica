/**
 * Utility functions for exporting data to Excel (CSV) and PDF formats.
 */

interface ExportColumn {
  header: string;
  accessor: (row: any) => string | number;
}

/**
 * Export data as a CSV file (opens in Excel).
 */
export function exportToExcel(
  data: any[],
  columns: ExportColumn[],
  filename: string
) {
  const headers = columns.map((c) => `"${c.header}"`).join(",");
  const rows = data.map((row) =>
    columns
      .map((c) => {
        const val = c.accessor(row);
        return `"${String(val ?? "").replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  const csv = [headers, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Export data as a simple PDF table.
 */
export function exportToPDF(
  data: any[],
  columns: ExportColumn[],
  filename: string,
  title: string
) {
  const colCount = columns.length;
  const colWidth = Math.floor(100 / colCount);

  const headerCells = columns
    .map(
      (c) =>
        `<th style="border:1px solid #ddd;padding:8px 6px;background:#f3f4f6;font-size:11px;text-align:left;width:${colWidth}%">${c.header}</th>`
    )
    .join("");

  const bodyRows = data
    .map(
      (row) =>
        `<tr>${columns
          .map(
            (c) =>
              `<td style="border:1px solid #ddd;padding:6px;font-size:10px">${String(c.accessor(row) ?? "")}</td>`
          )
          .join("")}</tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html><head><title>${title}</title>
<style>
  body{font-family:Arial,sans-serif;margin:20px}
  h1{font-size:16px;margin-bottom:4px}
  p{font-size:11px;color:#666;margin-bottom:12px}
  table{width:100%;border-collapse:collapse}
  @media print{body{margin:0}button{display:none}}
</style></head><body>
<h1>${title}</h1>
<p>Exported on ${new Date().toLocaleDateString()} &bull; ${data.length} records</p>
<table>${headerCells}${bodyRows}</table>
<script>window.onload=function(){window.print()}</script>
</body></html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
