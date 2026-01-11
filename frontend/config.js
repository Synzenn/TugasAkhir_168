// Ganti alamat IP di bawah ini sesuai dengan IP yang muncul di terminal saat 'npm start'
const BASE_IP = '192.168.3.101'; 

// Konfigurasi URL Backend secara global
const CONFIG = {
    BASE_IP: BASE_IP,
    BACKEND_URL: `http://${BASE_IP}:3000/api`,
    TMDB_KEY: '1185eff7012d210749f21ab16f2aa6e8'
};