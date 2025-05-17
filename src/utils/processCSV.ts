export function transformCsvData(
  data: string[][],
  startDate?: Date,
  endDate?: Date
): string[][] {
  const header = data[0];
  const noIndex = header.indexOf("No.");
  const dateIndex = header.findIndex((col) =>
    col.toLowerCase().includes("date")
  );

  if (noIndex === -1 || dateIndex === -1) return data;

  const filtered = data.filter((row, idx) => {
    if (idx === 0) return true; // Keep header row

    const dateString = row[dateIndex];
    const rowDate = new Date(dateString);

    if (startDate && rowDate < startDate) return false;
    if (endDate && rowDate > endDate) return false;

    return true;
  });

  const transformed = filtered.map((row, idx) => {
    if (idx === 0) return row;

    const newRow = [...row];
    const cell = newRow[noIndex];

    if (typeof cell === "string") {
      newRow[noIndex] = cell.replace(/^(100|200)/, "");
    }

    return newRow;
  });

  return transformed;
}
