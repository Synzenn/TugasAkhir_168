const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const User = require('../models/userModel');
const Wishlist = require('../models/wishlistModel');

// Auth Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Wishlist Routes
router.post('/wishlist', async (req, res) => {
    const userKey = req.headers['authorization'];
    await Wishlist.create({ ...req.body, userApiKey: userKey });
    res.json({ message: "Ditambahkan ke Wishlist" });
});

router.get('/wishlist', async (req, res) => {
    const userKey = req.headers['authorization'];
    const list = await Wishlist.findAll({ where: { userApiKey: userKey } });
    res.json(list);
});

const { v4: uuidv4 } = require('uuid');

// Route untuk Regenerate API Key
router.post('/user/regenerate-key', async (req, res) => {
    const oldKey = req.headers['authorization'];
    const newKey = uuidv4();

    const user = await User.findOne({ where: { apiKey: oldKey } });
    if (!user) return res.status(403).json({ message: "User not found" });

    // Update di Database
    user.apiKey = newKey;
    await user.save();

    // Update API Key di tabel Wishlist agar tidak kehilangan data (opsional tergantung logika kamu)
    await Wishlist.update({ userApiKey: newKey }, { where: { userApiKey: oldKey } });

    res.json({ message: "Key Updated", newApiKey: newKey });
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

// Admin Routes
router.get('/admin/users', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});

module.exports = router;
