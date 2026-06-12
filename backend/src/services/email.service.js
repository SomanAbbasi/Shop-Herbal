// Nodemailer transporter with reusable sendEmail function used across all email flows
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Organic Wholesale" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

export const sendOrderNotificationToAdmin = async (order) => {
  const itemsList = order.items.map(item =>
    `<tr>
      <td>${item.name}</td>
      <td>${item.quantity} ${item.unit}</td>
      <td>${item.pricePerUnit}</td>
      <td>${item.subtotal}</td>
    </tr>`
  ).join('');

  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `New Order Placed — ${order.invoiceNumber}`,
    html: `
      <h2>New Order Received</h2>
      <p><strong>Invoice:</strong> ${order.invoiceNumber}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      <p><strong>Shipping To:</strong> ${order.shippingAddress.street}, ${order.shippingAddress.city}</p>
      <table border="1" cellpadding="8">
        <tr><th>Product</th><th>Quantity</th><th>Price</th><th>Subtotal</th></tr>
        ${itemsList}
      </table>
      <p><strong>Subtotal:</strong> ${order.subtotal}</p>
      <p><strong>Tax:</strong> ${order.taxAmount}</p>
      <p><strong>Total:</strong> ${order.totalAmount}</p>
    `,
  });
};