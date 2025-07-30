// ===================================================================
// 🛠 ملف script.js - موقعك الشخصي
// ✅ معدّ خصيصًا ليعمل مع: https://miom-moid.github.io/--express.github.io
// 🔁 لا يحتاج تغيير اسم مستودع
// ⏱ يُحدّث الطلبات كل 3 ثواني تلقائيًا
// 🔔 يُظهر تنبيه + صوت + إشعار عند طلب جديد
// ===================================================================

// 🕒 تفعيل التحديث التلقائي كل 3 ثواني
document.addEventListener("DOMContentLoaded", () => {
  startPollingForOrders();
});

// دالة تفحص localStorage كل 3 ثواني
function startPollingForOrders() {
  // عرض الطلبات الحالية فورًا
  loadSavedOrders();

  // ثم التحديث التلقائي
  setInterval(() => {
    const rawData = localStorage.getItem("memoOrders");
    if (rawData) {
      try {
        const orders = JSON.parse(rawData);
        displayNewOrders(orders);
      } catch (e) {
        console.error("فشل تحليل بيانات الطلبات:", e);
      }
    }
  }, 3000);
}

// عرض الطلبات المحفوظة عند التحميل
function loadSavedOrders() {
  const container = document.getElementById("incoming-orders");
  if (!container) return;

  const saved = localStorage.getItem("memoOrders");

  if (saved) {
    try {
      const orders = JSON.parse(saved);
      if (Array.isArray(orders) && orders.length > 0) {
        container.innerHTML = "<h3>الطلبات الواردة 📬</h3>";
        const latest = orders.slice(-5).reverse(); // أحدث 5 طلبات
        latest.forEach(order => {
          appendOrderToList(order);
        });
      } else {
        container.innerHTML = "<p>لا توجد طلبات بعد.</p>";
      }
    } catch (e) {
      container.innerHTML = "<p>حدث خطأ في تحميل الطلبات.</p>";
    }
  } else {
    container.innerHTML = "<p>جاري الانتظار... سيتم عرض الطلبات الجديدة فور إرسالها من موقع المطعم.</p>";
  }
}

// عرض الطلبات الجديدة فقط (لتجنب التكرار)
function displayNewOrders(orders) {
  const container = document.getElementById("incoming-orders");
  if (!container) return;

  const existingIds = Array.from(container.querySelectorAll("[data-order-id]"))
                           .map(el => el.getAttribute("data-order-id"));

  const reversed = [...orders].reverse();

  let newFound = false;

  reversed.forEach(order => {
    if (!existingIds.includes(String(order.id))) {
      appendOrderToList(order);
      playNotificationSound();
      showDesktopNotification(order);
      newFound = true;
    }
  });

  // إذا وُجد طلب جديد، نعيد ترتيب العرض
  if (newFound) {
    const title = container.querySelector("h3");
    const children = Array.from(container.children).filter(el => el !== title);
    container.innerHTML = "";
    if (title) container.appendChild(title);
    children.forEach(child => container.appendChild(child));
  }
}

// إضافة طلب إلى القائمة
function appendOrderToList(order) {
  const container = document.getElementById("incoming-orders");
  const div = document.createElement("div");
  div.className = "order-alert";
  div.setAttribute("data-order-id", order.id);
  div.style.padding = "15px";
  div.style.margin = "10px 0";
  div.style.background = "#e8f5e8";
  div.style.border = "1px solid #8bc34a";
  div.style.borderRadius = "10px";
  div.style.fontFamily = "system-ui";
  div.style.direction = "rtl";
  div.innerHTML = `
    <strong style="color: #2e7d32;">طلب جديد من: ${order.name}</strong><br>
    <strong>📱 الجوال:</strong> ${order.phone}<br>
    <strong>📍 العنوان:</strong> ${order.address}<br>
    <strong>💰 الإجمالي:</strong> ${order.total} درهم<br>
    <small>⏰ ${order.timestamp}</small>
  `;
  container.appendChild(div);
}

// 🔊 تشغيل صوت عند استقبال طلب
function playNotificationSound() {
  const audio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-bell-ringing-933.mp3");
  audio.play().catch(e => {
    console.log("تم تجاهل الصوت — قد يكون ممنوعًا.");
  });
}

// 💬 إشعار مكتبي
function showDesktopNotification(order) {
  if (Notification.permission === "granted") {
    new Notification("طلب جديد من ميمو إكسبريس!", {
      body: `طلب من ${order.name}، الإجمالي: ${order.total} درهم`,
      icon: "https://cdn-icons-png.flaticon.com/512/2936/2936888.png",
      tag: order.id
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission();
  }
}
