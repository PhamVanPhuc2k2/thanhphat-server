/**
 * Telegram Bot Notification Utility
 *
 * Setup:
 * 1. Nhắn @BotFather trên Telegram → /newbot → lấy BOT_TOKEN
 * 2. Mở chat với bot vừa tạo, nhắn bất kỳ 1 tin
 * 3. Gọi: https://api.telegram.org/bot{BOT_TOKEN}/getUpdates → lấy chat.id
 * 4. Thêm vào .env:
 *      TELEGRAM_BOT_TOKEN=123456:ABC-xxx
 *      TELEGRAM_CHAT_ID=123456789
 */

const TELEGRAM_API = "https://api.telegram.org";

const formatPrice = (amount: number) =>
  amount.toLocaleString("vi-VN") + "₫";

export interface OrderNotifyPayload {
  orderCode: string;
  customer: {
    name: string;
    phone: string;
    email?: string | null;
    address: string;
    note?: string | null;
  };
  items: {
    name: string;
    variantName: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
}

export const sendNewOrderNotification = async (
  order: OrderNotifyPayload,
): Promise<void> => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Silently skip nếu chưa cấu hình
  if (!token || !chatId) return;

  const itemLines = order.items
    .map(
      (item) =>
        `  • <b>${item.name}</b> (${item.variantName}) × ${item.quantity} — ${formatPrice(item.price * item.quantity)}`,
    )
    .join("\n");

  const message = [
    `🛒 <b>ĐƠN HÀNG MỚI!</b>`,
    ``,
    `📋 Mã đơn: <code>${order.orderCode}</code>`,
    `👤 Khách hàng: ${order.customer.name}`,
    `📞 SĐT: <a href="tel:${order.customer.phone}">${order.customer.phone}</a>`,
    order.customer.email ? `📧 Email: ${order.customer.email}` : null,
    `📍 Địa chỉ: ${order.customer.address}`,
    order.customer.note ? `📝 Ghi chú: ${order.customer.note}` : null,
    ``,
    `🧾 <b>Sản phẩm:</b>`,
    itemLines,
    ``,
    `💰 <b>Tổng: ${formatPrice(order.totalAmount)}</b>`,
    `💳 Thanh toán: COD (khi nhận hàng)`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  try {
    const res = await fetch(
      `${TELEGRAM_API}/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[Telegram] Send failed:", err);
    }
  } catch (err) {
    // Không throw - lỗi thông báo không được ảnh hưởng đến đơn hàng
    console.error("[Telegram] Network error:", err);
  }
};
