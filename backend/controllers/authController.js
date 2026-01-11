const User = require('../models/userModel');
const Wishlist = require('../models/wishlistModel');

exports.register = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const user = await User.create({ username, password, role });
        
        // TAMBAHKAN username dan role di respon JSON agar frontend bisa menyimpannya
        res.status(201).json({ 
            message: "Register Berhasil", 
            apiKey: user.apiKey,
            username: user.username,
            role: user.role 
        });
    } catch (err) {
        res.status(400).json({ message: "Username sudah terdaftar atau terjadi kesalahan database" });
    }
};  

exports.login = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username, password } });
    if (user) {
        // Pastikan kirim username di sini
        res.json({ 
            apiKey: user.apiKey, 
            role: user.role, 
            username: user.username // Tambahkan ini
        });
    } else {
        res.status(401).json({ message: "Login Gagal" });
    }
};