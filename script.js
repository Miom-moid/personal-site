// ✅ استمع لتغييرات localStorage من أي موقع في نفس المتصفح
window.addEventListener('storage', function(e) {
  // تأكد أن التغيير في "memoOrders"
  if (e.key === 'memoOrders' && e.newValue) {
    try {
      const orders = JSON.parse(e.newValue);
      const latestOrder = orders[orders.length - 1]; // أحدث طلب

      // إظهار التنبيه
      showOrderAlert(latestOrder);
    } catch (err) {
      console.error("فشل تحليل بيانات الطلب:", err);
    }
  }
});

// عرض تنبيه للطلب الجديد
function showOrderAlert(order) {
  const container = document.getElementById("incoming-orders");
  if (!container) return;

  // تجنب عرض نفس الطلب مرتين
  if (document.querySelector(`[data-order-id="${order.id}"]`)) {
    return;
  }

  const alert = document.createElement("div");
  alert.className = "order-alert";
  alert.setAttribute("data-order-id", order.id);
  alert.innerHTML = `
    <strong>🚨 طلب جديد من: ${order.name}</strong><br>
    <strong>الهاتف:</strong> ${order.phone}<br>
    <strong>العنوان:</strong> ${order.address}<br>
    <strong>الإجمالي:</strong> ${order.total} درهم<br>
    <small><strong>الوقت:</strong> ${order.timestamp}</small>
  `;
  container.appendChild(alert);

  // 🔊 تشغيل صوت عند الاستلام
  const audio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-door-bell-double-ring-306.mp3");
  audio.play().catch(e => {
    console.log("تم تجاهل الصوت — ربما لم يُسمح به تلقائيًا.");
  });

  // 💬 إشعار مكتبي (إذا كان مسموحًا)
  if (Notification.permission === "granted") {
    new Notification("طلب جديد من ميمو إكسبريس!", {
      body: `طلب من ${order.name}، الإجمالي: ${order.total} درهم`,
      icon: "https://cdn-icons-png.flaticon.com/512/2936/2936888.png"
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification("مرحبًا ميمو! أنت الآن تستقبل الطلبات.", {
          body: "كل طلب جديد سيظهر هنا."
        });
      }
    });
  }
}

// 📦 عند تحميل الصفحة: عرض آخر 5 طلبات
window.onload = () => {
  const saved = localStorage.getItem("memoOrders");
  const container = document.getElementById("incoming-orders");

  if (!container) return;

  if (saved) {
    try {
      const orders = JSON.parse(saved);
      if (Array.isArray(orders) && orders.length > 0) {
        container.innerHTML = "<h3>آخر الطلبات:</h3>";
        // عرض أحدث 5 طلبات
        const recent = orders.slice(-5).reverse();
        recent.forEach(order => {
          const alert = document.createElement("div");
          alert.className = "order-alert";
          alert.setAttribute("data-order-id", order.id);
          alert.innerHTML = `
            <strong>${order.name}</strong> - ${order.total} درهم
            <br><small>${order.timestamp}</small>
          `;
          container.appendChild(alert);
        });
      } else {
        container.innerHTML = "<p>لا توجد طلبات سابقة.</p>";
      }
    } catch (err) {
      container.innerHTML = "<p>خطأ في قراءة الطلبات.</p>";
    }
  } else {
    container.innerHTML = "<p>جاري الانتظار... سيتم عرض الطلبات الجديدة هنا فور إرسالها.</p>";
  }
};
