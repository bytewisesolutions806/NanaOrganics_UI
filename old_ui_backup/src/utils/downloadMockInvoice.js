export function downloadMockInvoice(order) {
  const itemRows = (order.items || []).map((item) => [
    item.title || item.variant_title || "Product",
    item.variant_title || "",
    item.quantity || 0,
    item.unit_price != null ? Number(item.unit_price) / 100 : "",
    item.total != null ? Number(item.total) / 100 : "",
  ]);
  const taxRows = (order.taxLines || []).map((tax) => [
    `${tax.description || "Tax"}${tax.rate != null ? ` (${tax.rate}%)` : ""}`,
    tax.amountDisplay || "",
  ]);
  const rows = [
    ["Nana Organics Invoice"],
    ["Order", order.display_id ?? order.id],
    ["Order date", order.created_at || ""],
    ["Status", order.status || ""],
    ["Delivery address", String(order.deliveryAddressStr || "").replaceAll("\n", ", ")],
    [],
    ["Product", "Variant", "Quantity", "Unit price", "Line total"],
    ...itemRows,
    [],
    ["Price details"],
    ["Subtotal", order.subtotalDisplay || ""],
    ["Shipping", order.shippingDisplay || ""],
    ["Tax", order.taxDisplay || ""],
    ...taxRows,
    ...(Number(order.discount_total || 0) > 0
      ? [["Discount", `- ${order.discountDisplay}`]]
      : []),
    ["Total", order.totalDisplay ?? order.price ?? ""],
  ];
  const content = rows.map((row) => row.join("\t")).join("\n");
  const blob = new Blob([content], { type: "application/vnd.ms-excel" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `invoice-${order.display_id ?? order.id}.xls`;
  link.click();
  URL.revokeObjectURL(link.href);
}
