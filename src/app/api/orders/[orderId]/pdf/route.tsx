export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";
import { getSessionCookie, getSessionUser } from "@/lib/auth";
import { renderToBuffer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import React from "react";

// Регистрируем шрифт с поддержкой кириллицы
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://cdn.jsdelivr.net/npm/[email protected]/files/roboto-cyrillic-400-normal.woff", fontWeight: 400 },
    { src: "https://cdn.jsdelivr.net/npm/[email protected]/files/roboto-cyrillic-700-normal.woff", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: "Roboto", fontSize: 10, color: "#111827" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, borderBottom: "2px solid #f97316", paddingBottom: 12 },
  brand: { fontSize: 18, fontWeight: 700, color: "#f97316" },
  orderId: { fontSize: 14, fontWeight: 700, textAlign: "right" },
  meta: { fontSize: 9, color: "#9CA3AF", textAlign: "right", marginTop: 2 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: 700, marginBottom: 6 },
  row: { flexDirection: "row", fontSize: 9, marginBottom: 2 },
  label: { width: 110, color: "#9CA3AF" },
  value: { fontWeight: 700 },
  table: { marginTop: 6 },
  tableHeader: { flexDirection: "row", backgroundColor: "#F9FAFB", padding: 6, fontSize: 8, color: "#9CA3AF", textTransform: "uppercase" },
  tableRow: { flexDirection: "row", padding: 6, borderBottom: "1px solid #F1F1F1", fontSize: 9 },
  colTitle: { flex: 3 },
  colSku: { flex: 1.2, color: "#9CA3AF", fontSize: 8 },
  colQty: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1, textAlign: "right" },
  colSum: { flex: 1.2, textAlign: "right", fontWeight: 700 },
  totals: { marginTop: 10, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", fontSize: 10, marginBottom: 3, width: 220, justifyContent: "space-between" },
  totalFinal: { flexDirection: "row", fontSize: 13, fontWeight: 700, width: 220, justifyContent: "space-between", borderTop: "1px solid #E5E7EB", paddingTop: 4, marginTop: 4 },
  discount: { color: "#16A34A" },
  strike: { color: "#9CA3AF", textDecoration: "line-through" },
  footer: { marginTop: 30, fontSize: 8, color: "#9CA3AF", textAlign: "center" },
  comment: { fontSize: 9, backgroundColor: "#F9FAFB", padding: 8, borderRadius: 4, marginTop: 4 },
});

function fmt(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(Math.round(n)) + " \u20BD";
}

type OrderItem = {
  title: string; sku: string; boxes: number; pcs_per_box: number;
  base_price: string; effective_price: string;
};
type OrderData = {
  order_id: string; status: string; comment: string; discount_pct: number;
  total_base: string; total_final: string; created_at: string;
};
type UserData = { name: string; company: string; email: string; phone: string };

function OrderPdf({ order, items, user }: { order: OrderData; items: OrderItem[]; user: UserData }) {
  const totalBase = parseFloat(order.total_base);
  const totalFinal = parseFloat(order.total_final);
  const discount = order.discount_pct ?? 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Пакет Пакетыч</Text>
            <Text style={{ fontSize: 8, color: "#9CA3AF", marginTop: 2 }}>Подарочная упаковка оптом · paketpaketych.ru</Text>
          </View>
          <View>
            <Text style={styles.orderId}>Заказ {order.order_id}</Text>
            <Text style={styles.meta}>от {new Date(order.created_at).toLocaleDateString("ru-RU")}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Клиент</Text>
          <View style={styles.row}><Text style={styles.label}>Контактное лицо</Text><Text style={styles.value}>{user.name}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Компания</Text><Text style={styles.value}>{user.company}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Телефон</Text><Text style={styles.value}>{user.phone}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Email</Text><Text style={styles.value}>{user.email}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Позиции заказа</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colTitle}>Товар</Text>
              <Text style={styles.colQty}>Кол-во</Text>
              <Text style={styles.colPrice}>Цена</Text>
              <Text style={styles.colSum}>Сумма</Text>
            </View>
            {items.map((item, i) => (
              <View style={styles.tableRow} key={i}>
                <View style={styles.colTitle}>
                  <Text>{item.title}</Text>
                  <Text style={styles.colSku}>{item.sku}</Text>
                </View>
                <Text style={styles.colQty}>{item.boxes} кор. ({item.boxes * item.pcs_per_box} шт.)</Text>
                <Text style={styles.colPrice}>{fmt(parseFloat(item.effective_price))}</Text>
                <Text style={styles.colSum}>{fmt(parseFloat(item.effective_price) * item.boxes)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totals}>
            {discount > 0 && (
              <>
                <View style={styles.totalRow}>
                  <Text>Сумма без скидки</Text>
                  <Text style={styles.strike}>{fmt(totalBase)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.discount}>Скидка −{discount}%</Text>
                  <Text style={styles.discount}>−{fmt(totalBase - totalFinal)}</Text>
                </View>
              </>
            )}
            <View style={styles.totalFinal}>
              <Text>Итого</Text>
              <Text>{fmt(totalFinal)}</Text>
            </View>
          </View>
        </View>

        {order.comment && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Комментарий</Text>
            <Text style={styles.comment}>{order.comment}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          Документ сформирован автоматически на сайте paketpaketych.ru. Цены указаны справочно — финальное коммерческое предложение направит менеджер.
        </Text>
      </Page>
    </Document>
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const sessionId = getSessionCookie();
    if (!sessionId) return NextResponse.json({ ok: false }, { status: 401 });

    const user = await getSessionUser(sessionId);
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });

    const order = await queryOne<OrderData & { id: number; user_id: number }>(
      `SELECT id, user_id, order_id, status, comment, discount_pct, total_base, total_final, created_at
       FROM orders WHERE order_id = $1 AND user_id = $2`,
      [params.orderId, user.id]
    );

    if (!order) {
      return NextResponse.json({ ok: false, error: "Заказ не найден" }, { status: 404 });
    }

    const items = await query<OrderItem>(
      `SELECT title, sku, boxes, pcs_per_box, base_price, effective_price
       FROM order_items WHERE order_id = $1`,
      [order.id]
    );

    const pdfBuffer = await renderToBuffer(
      React.createElement(OrderPdf, { order, items, user }) as React.ReactElement
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${order.order_id}.pdf"`,
      },
    });
  } catch (err) {
    console.error("[order pdf]", err);
    return NextResponse.json({ ok: false, error: "Ошибка генерации PDF" }, { status: 500 });
  }
}
