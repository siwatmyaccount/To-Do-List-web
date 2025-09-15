document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('loginForm');
    const message = document.getElementById('message');
    const passField = document.getElementById('pass');
    const showPassIcon = document.getElementById('show-password');
    const userField = document.getElementById('user');
    const rememberCheckbox = document.getElementById('remember');
    const container = document.getElementById('toastContainer'); 

    // =======================
    // Toast Function
    // =======================
    function showToast(msg, type="info", duration=3000){
    let container = document.getElementById('toastContainer');
    if(!container) return;

    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.background = type==="success" ? "green" : type==="error" ? "red" : "blue";

    container.appendChild(toast);

    // เด้งขึ้น
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)"; // ขึ้นมา
    }, 50);

    // หายลง
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)"; // ลงไป
        setTimeout(()=> container.removeChild(toast), 500);
    }, duration);
}


    // =======================
    // Show/Hide Password
    // =======================
    showPassIcon.addEventListener('click', () => {
        passField.type = passField.type === "password" ? "text" : "password";
        showPassIcon.classList.add('blinking');
        setTimeout(() => showPassIcon.classList.remove('blinking'), 1000);
    });

    // =======================
    // Prefill username if remembered
    // =======================
    const rememberedUser = localStorage.getItem('username');
    if(rememberedUser){
        sessionStorage.setItem('username', rememberedUser);
        window.location.href = "home.html"; // auto-login
    } else {
        const savedUser = sessionStorage.getItem('username');
        if(savedUser) userField.value = savedUser;
    }

    // =======================
    // Login Handler
    // =======================
    loginForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const uname = userField.value.trim();
        const pass = passField.value.trim();
        const remember = rememberCheckbox.checked;

        if(uname === "admin" && pass === "1234"){
            if(remember){
                localStorage.setItem('username', uname);
            } else {
                sessionStorage.setItem('username', uname);
            }

            showToast("Login Successful!", "success", 2000);
            setTimeout(()=> window.location.href="home.html", 500);
        } else {
            showToast("Incorrect username or password!", "error", 2500);
        }
    });
});
