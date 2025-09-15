document.addEventListener('DOMContentLoaded', () => {
    // ================= BASE URL =================
    const BASE_URL = "/To-Do-List-web/"; // เปลี่ยนให้ตรงชื่อ repo

    // ================= Login Check =================
    const currentUser = sessionStorage.getItem('username');

    // ลบ username จาก localStorage เผื่อเก่ามี
    localStorage.removeItem('username');

    if (!currentUser) {
        // ถ้าไม่มี session → redirect ทันที
        window.location.replace(BASE_URL + "index.html");
        return; // หยุดการรันโค้ดต่อ
    }

    // ================= Elements =================
    const welcomeMsg = document.getElementById('welcomeMsg');
    const homeSection = document.getElementById('home');

    // ================= Initial Setup =================
    document.getElementById('usernameDisplay').textContent = currentUser;

    // Hide home at start
    homeSection.style.opacity = "0";
    homeSection.style.pointerEvents = "none";

    // ================= Welcome Fade =================
    welcomeMsg.style.opacity = "1";
    setTimeout(() => {
        welcomeMsg.style.display = "none";
        homeSection.classList.add('active');
        homeSection.style.transition = "opacity 0.5s";
        homeSection.style.opacity = "1";
        homeSection.style.pointerEvents = "auto";
    }, 1000);

    // ================= Navbar Switch =================
    const sections = document.querySelectorAll('.section');
    document.querySelectorAll('.navbar button[data-target]').forEach(btn => {
        btn.addEventListener('click', () => {
            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(btn.dataset.target).classList.add('active');
            updateActivityStats();
        });
    });

    // ================= Logout =================
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('username'); // ล้าง session
        localStorage.removeItem('username');    // ล้าง localStorage เผื่อมีเก็บไว้
        window.location.replace(BASE_URL + "index.html"); // redirect login
    });

    // ================= Toast Function =================
    function showToast(msg, type = "info", duration = 3000) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.textContent = msg;
        toast.style.background = type === "success" ? "green" : type === "error" ? "red" : "blue";
        toast.style.color = "#fff";
        toast.style.padding = "10px";
        toast.style.marginTop = "5px";
        toast.style.borderRadius = "5px";
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-20px)";
        toast.style.transition = "all 0.5s";
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateY(0)";
        }, 50);
        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(-20px)";
            setTimeout(() => container.removeChild(toast), 500);
        }, duration);
    }

    // ================= Profile Info =================
    document.getElementById('profileUsername').textContent = currentUser;
    document.getElementById('profileEmail').textContent = currentUser.toLowerCase() + "@example.com";
    document.getElementById('profileDate').textContent = "2025-09-14";

    // ================= To-Do List =================
    const taskInput = document.getElementById('newTask');
    const addBtn = document.getElementById('addTaskBtn');
    const loadBtn = document.getElementById('loadTasksBtn');
    const taskList = document.getElementById('taskList');
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let tasksVisible = true;

    function renderTasks() {
        taskList.innerHTML = "";
        tasks.forEach((t, i) => {
            const li = document.createElement('li');

            const checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.checked = t.done;
            checkbox.addEventListener('change', () => {
                tasks[i].done = checkbox.checked;
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks();
            });

            const text = document.createElement('span');
            text.textContent = t.text;
            if (t.done) {
                text.style.textDecoration = "line-through";
                text.style.opacity = "0.6";
            }

            const status = document.createElement('span');
            status.style.marginLeft = "10px";
            status.style.fontWeight = "600";
            status.textContent = t.done ? "✅ Done" : "⏳ Pending";

            const delBtn = document.createElement('button');
            delBtn.textContent = "Delete";
            delBtn.addEventListener('click', () => {
                tasks.splice(i, 1);
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks();
                showToast("Task deleted!", "info");
            });

            li.append(checkbox, text, status, delBtn);
            taskList.appendChild(li);
        });
        updateActivityStats();
    }

    addBtn.addEventListener('click', () => {
        const val = taskInput.value.trim();
        if (val) {
            tasks.push({ text: val, done: false });
            localStorage.setItem('tasks', JSON.stringify(tasks));
            taskInput.value = "";
            renderTasks();
            showToast("Task added!", "success");
        }
    });

    loadBtn.addEventListener('click', () => {
        tasksVisible = !tasksVisible;
        if (tasksVisible) {
            renderTasks();
            loadBtn.textContent = "Hide Tasks";
        } else {
            taskList.innerHTML = "";
            loadBtn.textContent = "Show Tasks";
            updateActivityStats();
        }
    });

    // ================= Stats & Chart =================
    const ctx = document.getElementById('taskChart').getContext('2d');
    let taskChart = new Chart(ctx, {
        type: 'pie',
        data: { labels: ['Completed', 'Pending'], datasets: [{ data: [0, 0], backgroundColor: ['#4caf50', '#f44336'] }] },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });

    function updateActivityStats() {
        const completed = tasks.filter(t => t.done).length;
        const total = tasks.length;
        const percent = total === 0 ? 0 : Math.round(completed / total * 100);

        // Profile
        document.getElementById('profileTotalTasks').textContent = total;
        document.getElementById('profileCompletedTasks').textContent = completed;
        document.getElementById('progressBarProfile').style.width = percent + "%";

        // Home
        document.getElementById('homeTotalTasks').textContent = total;
        document.getElementById('homeCompletedTasks').textContent = completed;
        document.getElementById('progressBarHome').style.width = percent + "%";

        // Chart
        taskChart.data.datasets[0].data = [completed, total - completed];
        taskChart.update();

        // Last Active
        localStorage.setItem("lastActive", new Date().toISOString());
        document.getElementById('lastActive').textContent = new Date(localStorage.getItem("lastActive")).toLocaleString();
    }

    renderTasks();
    updateActivityStats();

    // ================= Clock & Date =================
    function updateClock() {
        const now = new Date();
        document.getElementById('currentTime').textContent = now.toLocaleTimeString();
        document.getElementById('profileTime').textContent = now.toLocaleTimeString();
        document.getElementById('todayDate').textContent = now.toLocaleDateString();
    }
    setInterval(updateClock, 1000);
    updateClock();

    // ================= Change Password =================
    document.getElementById('changePassBtn').addEventListener('click', () => {
        const oldPass = document.getElementById('oldPass').value.trim();
        const newPass = document.getElementById('newPass').value.trim();
        const passMsg = document.getElementById('passMsg');

        if (oldPass === "admin","arshi","kanlaya" && newPass.length >= 4) {
            passMsg.style.color = "green";
            passMsg.textContent = "✅ Password updated! Redirecting to login...";
            setTimeout(() => {
                sessionStorage.removeItem('username');
                localStorage.removeItem('username'); // ล้าง localStorage ด้วย
                window.location.replace(BASE_URL + "index.html");
            }, 2000);
        } else {
            passMsg.style.color = "red";
            passMsg.textContent = "❌ Old password incorrect or new password too short.";
        }
    });

    // ================= Quote =================
    const quotes = [
        "Believe you can and you're halfway there.",
        "The journey of a thousand miles begins with one step.",
        "Do something today that your future self will thank you for.",
        "Small steps every day lead to big results."
    ];
    document.getElementById('quote').textContent = quotes[Math.floor(Math.random() * quotes.length)];

    // ================= Daily Note =================
    const noteTextarea = document.getElementById('dailyNote');
    const saveNoteBtn = document.getElementById('saveNoteBtn');
    noteTextarea.value = localStorage.getItem('dailyNote') || "";
    saveNoteBtn.addEventListener('click', () => {
        localStorage.setItem('dailyNote', noteTextarea.value);
        showToast("Note saved!", "success");
    });

    // ================= Reminder =================
    document.getElementById('setReminderBtn').addEventListener('click', () => {
        const timeStr = document.getElementById('reminderTime').value;
        if (!timeStr) return showToast("Please select a time!", "error");

        const now = new Date();
        const [hours, minutes] = timeStr.split(":").map(Number);
        let reminder = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
        if (reminder < now) reminder.setDate(reminder.getDate() + 1);

        const diff = reminder - now;
        showToast(`Reminder set for ${reminder.toLocaleTimeString()}`, "success");
        setTimeout(() => showToast("⏰ Reminder! Check your tasks.", "info", 5000), diff);
    });
});
