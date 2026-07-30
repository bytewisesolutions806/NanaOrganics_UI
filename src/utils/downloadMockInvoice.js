export function downloadMockInvoice(order) {
  const rows = [
    ["Nana Organics Demo Invoice"],
    ["Order", order.display_id ?? order.id],
    ["Product", order.name || order.items?.[0]?.title || "Organic product"],
    ["Total", order.totalDisplay ?? order.price ?? "Demo total"],
    ["Status", order.status || "demo"],
  ];
  const content = rows.map((row) => row.join("\t")).join("\n");
  const blob = new Blob([content], { type: "application/vnd.ms-excel" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `invoice-${order.display_id ?? order.id}.xls`;
  link.click();
  URL.revokeObjectURL(link.href);
}
