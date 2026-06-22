import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const MANAGER_EMAIL = process.env.MANAGER_EMAIL || "o.vanukova@interteks.ru";
const FROM_EMAIL    = process.env.RESEND_FROM_EMAIL || "Пакет Пакетыч <orders@paketpaketych.ru>";

type OrderItemForEmail = {
  title: string;
  sku: string;
  boxes: number;
  pcsPerBox: number;
  basePrice: number;
  effectivePrice: number;
};

type OrderEmailData = {
  orderId: string;
  client: { name: string; company: string; email: string; phone: string };
  items: OrderItemForEmail[];
  comment?: string;
  discountPct: number;
  totalBase: number;
  totalFinal: number;
};

function formatPrice(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(Math.round(n)) + " ₽";
}

function renderOrderHtml(data: OrderEmailData): string {
  const rows = data.items.map(item => `
    <tr style="border-bottom:1px solid #f1f1f1">
      <td style="padding:10px 8px;font-size:13px;color:#111827">${item.title}<br/><span style="color:#9CA3AF;font-size:12px">${item.sku}</span></td>
      <td style="padding:10px 8px;font-size:13px;color:#374151;text-align:center">${item.boxes} кор.</td>
      <td style="padding:10px 8px;font-size:13px;color:#374151;text-align:center">${item.boxes * item.pcsPerBox} шт.</td>
      <td style="padding:10px 8px;font-size:13px;color:#111827;text-align:right;font-weight:700">${formatPrice(item.effectivePrice * item.boxes)}</td>
    </tr>
  `).join("");

  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111827">
    <div style="background:#f97316;padding:20px;border-radius:12px 12px 0 0;text-align:center">
      <h1 style="color:white;margin:0;font-size:20px">Новый заказ ${data.orderId}</h1>
    </div>
    <div style="border:1px solid #f1f1f1;border-top:none;border-radius:0 0 12px 12px;padding:20px">
      <h2 style="font-size:16px;margin:0 0 8px">Клиент</h2>
      <table style="width:100%;font-size:13px;color:#374151;margin-bottom:16px">
        <tr><td style="padding:2px 0;color:#9CA3AF">Контактное лицо</td><td style="font-weight:700">${data.client.name}</td></tr>
        <tr><td style="padding:2px 0;color:#9CA3AF">Компания</td><td style="font-weight:700">${data.client.company}</td></tr>
        <tr><td style="padding:2px 0;color:#9CA3AF">Телефон</td><td style="font-weight:700">${data.client.phone}</td></tr>
        <tr><td style="padding:2px 0;color:#9CA3AF">Email</td><td style="font-weight:700">${data.client.email}</td></tr>
      </table>

      <h2 style="font-size:16px;margin:0 0 8px">Позиции заказа</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <thead>
          <tr style="background:#F9FAFB">
            <th style="padding:8px;text-align:left;font-size:11px;color:#9CA3AF;text-transform:uppercase">Товар</th>
            <th style="padding:8px;text-align:center;font-size:11px;color:#9CA3AF;text-transform:uppercase">Кол-во</th>
            <th style="padding:8px;text-align:center;font-size:11px;color:#9CA3AF;text-transform:uppercase">Штук</th>
            <th style="padding:8px;text-align:right;font-size:11px;color:#9CA3AF;text-transform:uppercase">Сумма</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <table style="width:100%;font-size:13px;margin-bottom:16px">
        ${data.discountPct > 0 ? `
        <tr><td style="padding:2px 0;color:#9CA3AF">Сумма без скидки</td><td style="text-align:right;text-decoration:line-through;color:#9CA3AF">${formatPrice(data.totalBase)}</td></tr>
        <tr><td style="padding:2px 0;color:#16A34A;font-weight:700">Скидка −${data.discountPct}%</td><td style="text-align:right;color:#16A34A;font-weight:700">−${formatPrice(data.totalBase - data.totalFinal)}</td></tr>
        ` : ""}
        <tr style="border-top:1px solid #E5E7EB"><td style="padding:8px 0 0;font-size:15px;font-weight:800">Итого</td><td style="text-align:right;padding:8px 0 0;font-size:15px;font-weight:800">${formatPrice(data.totalFinal)}</td></tr>
      </table>

      ${data.comment ? `
      <h2 style="font-size:16px;margin:0 0 8px">Комментарий клиента</h2>
      <p style="font-size:13px;color:#374151;background:#F9FAFB;padding:10px;border-radius:8px">${data.comment}</p>
      ` : ""}

      <p style="font-size:11px;color:#9CA3AF;margin-top:20px">Заказ оформлен на сайте paketpaketych.ru</p>
    </div>
  </div>
  `;
}

export async function sendOrderNotification(data: OrderEmailData): Promise<void> {
  if (!resend) {
    console.log("[email] RESEND_API_KEY not set, skipping notification for", data.orderId);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: MANAGER_EMAIL,
      subject: `Новый заказ ${data.orderId} — ${data.client.company}`,
      html: renderOrderHtml(data),
    });
  } catch (err) {
    console.error("[email] failed to send order notification:", err);
    // Не прерываем выполнение — email необязателен для успешного заказа
  }
}

type TeamInviteData = {
  to: string;
  inviterName: string;
  companyName: string;
  inviteUrl: string;
};

export async function sendTeamInvite(data: TeamInviteData): Promise<void> {
  if (!resend) {
    console.log("[email] RESEND_API_KEY not set, skipping invite for", data.to);
    return;
  }

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#111827">
    <div style="background:#f97316;padding:24px;border-radius:12px 12px 0 0;text-align:center">
      <h1 style="color:white;margin:0;font-size:18px">Приглашение в Пакет Пакетыч</h1>
    </div>
    <div style="border:1px solid #f1f1f1;border-top:none;border-radius:0 0 12px 12px;padding:24px;text-align:center">
      <p style="font-size:14px;color:#374151">
        <strong>${data.inviterName}</strong> приглашает вас присоединиться к аккаунту
        компании <strong>${data.companyName}</strong> на сайте Пакет Пакетыч.
      </p>
      <a href="${data.inviteUrl}"
        style="display:inline-block;margin-top:16px;background:#f97316;color:white;text-decoration:none;
        padding:12px 28px;border-radius:24px;font-weight:700;font-size:14px">
        Принять приглашение
      </a>
      <p style="font-size:11px;color:#9CA3AF;margin-top:20px">
        Ссылка действует 14 дней. Если вы не ожидали этого письма — просто игнорируйте его.
      </p>
    </div>
  </div>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: `${data.inviterName} приглашает вас в команду «${data.companyName}»`,
      html,
    });
  } catch (err) {
    console.error("[email] failed to send team invite:", err);
  }
}
