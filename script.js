// ===================================================================
// 🛠 استقبال الطلبات من موقع المطعم
// ✅ يعمل مع: https://miom-moid.github.io/--express.github.io
// 🔁 تحديث تلقائي كل 3 ثواني
// 🔔 صوت + إشعار عند طلب جديد
// ===================================================================

// بدء التحديث التلقائي
document.addEventListener("DOMContentLoaded", () => {
  startPolling();
});

// فحص localStorage كل 3 ثواني
function startPolling() {
  loadExistingOrders(); // عرض الطلبات الحالية

  setInterval(() => {
    const rawData = localStorage.getItem("memoOrders");
    if (rawData) {
      try {
        const orders = JSON.parse(rawData);
        displayNewOrders(orders);
      } catch (e) {
        console.error("خطأ في قراءة الطلبات:", e);
      }
    }
  }, 3000);
}

// عرض الطلبات المحفوظة
function loadExistingOrders() {
  const container = document.getElementById("incoming-orders");
  if (!container) return;

  const saved = localStorage.getItem("memoOrders");
  if (saved) {
    try {
      const orders = JSON.parse(saved);
      if (Array.isArray(orders) && orders.length > 0) {
        container.innerHTML = "<h3>آخر الطلبات:</h3>";
        const latest = orders.slice(-5).reverse();
        latest.forEach(order => appendOrder(order));
      }
    } catch (e) {
      container.innerHTML = "<p>خطأ في تحميل البيانات.</p>";
    }
  }
}

// عرض الطلبات الجديدة فقط
function displayNewOrders(orders) {
  const container = document.getElementById("incoming-orders");
  const existingIds = Array.from(container.querySelectorAll("[data-id]"))
                           .map(el => el.getAttribute("data-id"));

  const reversed = [...orders].reverse();
  let newOrderFound = false;

  reversed.forEach(order => {
    if (!existingIds.includes(String(order.id))) {
      appendOrder(order);
      playSound();
      showNotification(order);
      newOrderFound = true;
    }
  });

  // إعادة الترتيب (الأحدث أولًا)
  if (newOrderFound) {
    const title = container.querySelector("h3");
    const children = Array.from(container.children).filter(c => c !== title);
    container.innerHTML = "";
    if (title) container.appendChild(title);
    children.forEach(c => container.appendChild(c));
  }
}

// إضافة طلب إلى القائمة
function appendOrder(order) {
  const container = document.getElementById("incoming-orders");
  const div = document.createElement("div");
  div.className = "order-alert";
  div.setAttribute("data-id", order.id);
  div.innerHTML = `
    <strong>طلب جديد من: ${order.name}</strong><br>
    <strong>📱:</strong> ${order.phone}<br>
    <strong>📍:</strong> ${order.address}<br>
    <strong>💰:</strong> ${order.total} درهم<br>
    <small>⏰ ${order.timestamp}</small>
  `;
  container.appendChild(div);
}

// 🔊 صوت عند الطلب
function playSound() {
  const audio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-bell-ringing-933.mp3");
  audio.play().catch(() => console.log("تم تجاهل الصوت"));
}

// 💬 إشعار مكتبي
function showNotification(order) {
  if (Notification.permission === "granted") {
    new Notification("طلب جديد!", {
      body: `من ${order.name} - الإجمالي: ${order.total} درهم`,
      icon: "https://cdn-icons-png.flaticon.com/512/2936/2936888.png"
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission();
  }
}
