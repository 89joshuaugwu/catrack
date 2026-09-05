export function csvCell(value: unknown): string {
  let text = String(value ?? "");
  if (/^[=+@\-\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
export function csvText(rows: unknown[][]): string {
  return rows.map(row => row.map(csvCell).join(",")).join("\r\n");
}
