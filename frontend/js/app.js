const API_URL = "http://localhost:3000/api";

// 1. Fungsi Registrasi
async function handleRegister(username, password, role) {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
    });
    const data = await response.json();
    if (response.ok) {
        alert("API Key Anda: " + data.apiKey);
        localStorage.setItem('userApiKey', data.apiKey); // Simpan di browser
    }
}

// 2. Fungsi Lihat Wishlist (Harus bawa Token/API Key)
async function getMyWishlist() {
    const myKey = localStorage.getItem('userApiKey'); // Ambil dari storage
    
    if (!myKey) {
        alert("Anda harus login/punya API Key!");
        return;
    }

    const response = await fetch(`${API_URL}/wishlist`, {
        headers: { 'Authorization': myKey } // Kirim Key di Header
    });
    const items = await response.json();
    console.log("Wishlist Saya:", items);
}

// --- LOGIKA DROPDOWN & MODAL ---
function toggleProfileMenu() {
    document.getElementById('profile-menu').classList.toggle('hidden');
}

function openProfileModal() {
    const username = localStorage.getItem('username') || 'User'; // Pastikan saat login simpan username ke localStorage
    const role = localStorage.getItem('userRole') || 'USER';
    
    document.getElementById('profile-username-text').innerText = username;
    document.getElementById('profile-avatar-big').innerText = username.charAt(0).toUpperCase();
    document.getElementById('profile-role-badge').innerText = role.toUpperCase();
    document.getElementById('profile-api-key').value = localStorage.getItem('userApiKey');
    
    document.getElementById('profile-modal').classList.remove('hidden');
    document.getElementById('profile-menu').classList.add('hidden');
}

function closeProfileModal() {
    document.getElementById('profile-modal').classList.add('hidden');
}

function toggleShowApiKey() {
    const input = document.getElementById('profile-api-key');
    const icon = document.getElementById('eye-icon');
    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = "password";
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

// --- LOGIKA REGENERATE API KEY (HUBUNGKAN KE BACKEND) ---
async function regenerateApiKey() {
    if(!confirm("API Key lama akan hangus. Lanjutkan generate key baru?")) return;

    const response = await fetch('http://localhost:3000/api/user/regenerate-key', {
        method: 'POST',
        headers: { 
            'Authorization': localStorage.getItem('userApiKey')
        }
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('userApiKey', data.newApiKey);
        document.getElementById('profile-api-key').value = data.newApiKey;
        alert("Success! Your new API Key has been generated.");
    } else {
        alert("Failed to regenerate key: " + data.message);
    }
}

// Inisialisasi Nama di Nav
const storedUser = localStorage.getItem('username') || 'User';
document.getElementById('nav-username').innerText = storedUser;
document.getElementById('avatar-letter').innerText = storedUser.charAt(0).toUpperCase();
document.getElementById('menu-full-username').innerText = storedUser;