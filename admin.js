const noticeForm = document.getElementById("noticeForm");
const adminNoticeList = document.getElementById("adminNoticeList");
const role = localStorage.getItem("role");

// 🚫 If not admin → redirect
if (role !== "admin") {
  alert("Admins only!");
  window.location.href = "auth.html";
}

// Load notices
async function loadAdminNotices() {
  const res = await fetch("/api/notices");
  const data = await res.json();

  adminNoticeList.innerHTML = "";
  data.forEach(n => {
    const div = document.createElement("div");
    div.className = "notice__item";
    div.innerHTML = `
      <h3>${n.title}</h3>
      <button onclick="deleteNotice('${n._id}')">Delete</button>
    `;
    adminNoticeList.appendChild(div);
  });
}

// Add notice (only title now)
noticeForm.addEventListener("submit", async e => {
  e.preventDefault();
  const title = document.getElementById("noticeTitle").value;

  const res = await fetch("/api/notices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, role })
  });

  const data = await res.json();
  if (res.ok) {
    alert("Notice added!");
    noticeForm.reset();
    loadAdminNotices();
  } else {
    alert(data.error);
  }
});

// Delete notice
async function deleteNotice(id) {
  if (!confirm("Delete this notice?")) return;

  const res = await fetch(`/api/notices/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role })
  });

  const data = await res.json();
  if (res.ok) {
    alert("Notice deleted!");
    loadAdminNotices();
  } else {
    alert(data.error);
  }
}

loadAdminNotices();
