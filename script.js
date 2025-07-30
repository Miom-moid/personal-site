// قناة اتصال بين المواقع (نفس المتصفح)
const channel = new BroadcastChannel('memo-orders');

// عند استقبال طلب جديد
channel.onmessage = function(event) {
  const order = event.data;

  // إظهار التنبيه
  const container = document.getElementById("incoming-orders");
  const alert = document.createElement("div");
  alert.className = "order-alert";
  alert.innerHTML = `
    <strong>طلب جديد من: ${order.name}</strong><br>
    <strong>الهاتف:</strong> ${order.phone}<br>
    <strong>العنوان:</strong> ${order.address}<br>
    <strong>الإجمالي:</strong> ${order.total} درهم<br>
    <small>${order.timestamp}</small>
  `;
  container.appendChild(alert);

  // تشغيل صوت (اختياري)
  const audio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-door-bell-double-ring-306.mp3");
  audio.play().catch(e => console.log("لم يُسمح بالصوت تلقائيًا"));

  // إشعار مكتبي (إذا مُسموح)
  if (Notification.permission === "granted") {
    new Notification("طلب جديد!", {
      body: `طلب من ${order.name}، الإجمالي: ${order.total} درهم`
    });
  }
};

// طلب إذن الإشعارات
if (Notification.permission !== "granted" && Notification.permission !== "denied") {
  Notification.requestPermission();
}

// تحميل الطلبات السابقة (اختياري)
window.onload = () => {
  const orders = JSON.parse(localStorage.getItem("memoOrders") || "[]");
  const container = document.getElementById("incoming-orders");
  if (orders.length > 0) {
    container.innerHTML = "<h3>الطلبات السابقة:</h3>";
    orders.reverse().slice(0, 5).forEach(order => {
      const alert = document.createElement("div");
      alert.className = "order-alert";
      alert.innerHTML = `
        <strong>${order.name}</strong> - ${order.total} درهم
        <small>${order.timestamp}</small>
      `;
      container.appendChild(alert);
    });
  }
};
