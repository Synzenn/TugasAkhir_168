const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const User = require('../models/userModel');
const Wishlist = require('../models/wishlistModel');
const { v4: uuidv4 } = require('uuid');

// --- 1. AUTH ROUTES ---
router.post('/register', authController.register);
router.post('/login', authController.login);

// --- 2. USER PROFILE ROUTES ---
// Route untuk Regenerate API Key
router.post('/user/regenerate-key', async (req, res) => {
    const oldKey = req.headers['authorization'];
    const newKey = uuidv4();

    const user = await User.findOne({ where: { apiKey: oldKey } });
    if (!user) return res.status(403).json({ message: "User tidak ditemukan" });

    // Update API Key di tabel User
    user.apiKey = newKey;
    await user.save();

    // Update API Key di tabel Wishlist agar data tidak hilang
    await Wishlist.update({ userApiKey: newKey }, { where: { userApiKey: oldKey } });

    res.json({ message: "API Key berhasil diperbarui", newApiKey: newKey });
});

// --- 3. WISHLIST ROUTES ---
router.post('/wishlist', async (req, res) => {
    const userKey = req.headers['authorization'];
    try {
        await Wishlist.create({ ...req.body, userApiKey: userKey });
        res.json({ message: "Ditambahkan ke Wishlist" });
    } catch (err) {
        res.status(500).json({ message: "Gagal menambah ke wishlist" });
    }
});

router.get('/wishlist', async (req, res) => {
    const userKey = req.headers['authorization'];
    const list = await Wishlist.findAll({ where: { userApiKey: userKey } });
    res.json(list);
});

router.delete('/wishlist/:id', async (req, res) => {
    const { id } = req.params;
    const userKey = req.headers['authorization'];

    const deleted = await Wishlist.destroy({ 
        where: { id: id, userApiKey: userKey } 
    });

    if (deleted) {
        res.json({ message: "Film berhasil dihapus dari wishlist" });
    } else {
        res.status(404).json({ message: "Film tidak ditemukan" });
    }
});

// --- 4. ADMIN CRUD ROUTES (Manajemen User) ---

// READ: Ambil semua user
router.get('/admin/users', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});

/// Tambah User (Admin CRUD)
router.post('/admin/users', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        // apiKey akan terisi otomatis oleh UUID di userModel.js
        await User.create({ username, password, role });
        res.status(201).json({ message: "User berhasil ditambahkan" });
    } catch (err) {
        res.status(400).json({ message: "Gagal: Username mungkin sudah ada" });
    }
});

// Edit User (Admin CRUD)
router.put('/admin/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username, role, password } = req.body;
        const user = await User.findByPk(id);
        
        if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

        const updatedData = { username, role };
        if (password) updatedData.password = password; // Hanya ganti password jika diisi

        await user.update(updatedData);
        res.json({ message: "Data user berhasil diperbarui" });
    } catch (err) {
        res.status(400).json({ message: "Gagal memperbarui data" });
    }
});

// DELETE: Admin hapus user
router.delete('/admin/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await User.destroy({ where: { id } });
        
        if (deleted) {
            res.json({ message: "User berhasil dihapus" });
        } else {
            res.status(404).json({ message: "User tidak ditemukan" });
        }
    } catch (err) {
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
});

module.exports = router;