const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./models/index');

const app = express();
app.use(cors());
app.use(express.json());



// --- 2. DEFINISI MODEL ---
// Pastikan posterPath didefinisikan di sini agar Sequelize mengenalinya
const User = sequelize.define('User', {
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: 'user' },
    apiKey: { type: DataTypes.STRING, unique: true }
});

const Wishlist = sequelize.define('Wishlist', {
    movieId: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    posterPath: { type: DataTypes.STRING, allowNull: true } // Kolom baru untuk gambar
});

// Relasi: Satu user bisa punya banyak wishlist
User.hasMany(Wishlist);
Wishlist.belongsTo(User);

// --- 3. ROUTES API ---

// Middleware Auth (Cek API Key)
const authenticate = async (req, res, next) => {
    const apiKey = req.headers['authorization'];
    const user = await User.findOne({ where: { apiKey } });
    if (!user) return res.status(401).json({ message: 'API Key tidak valid' });
    req.user = user;
    next();
};

// --- AUTH ROUTES ---
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const apiKey = 'key_' + Math.random().toString(36).substr(2, 12);
        const user = await User.create({ username, password, role, apiKey });
        res.json({ message: 'Registrasi Berhasil', apiKey: user.apiKey, role: user.role, username: user.username });
    } catch (err) {
        res.status(400).json({ message: 'Username sudah digunakan' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username, password } });
    if (user) {
        res.json({ apiKey: user.apiKey, role: user.role, username: user.username });
    } else {
        res.status(401).json({ message: 'Login Gagal' });
    }
});

// --- WISHLIST ROUTES ---
app.get('/api/wishlist', authenticate, async (req, res) => {
    const wishlist = await Wishlist.findAll({ where: { UserId: req.user.id } });
    res.json(wishlist);
});

app.post('/api/wishlist', authenticate, async (req, res) => {
    try {
        const { movieId, title, posterPath } = req.body;
        const item = await Wishlist.create({
            movieId,
            title,
            posterPath, // Menyimpan posterPath ke MySQL
            UserId: req.user.id
        });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: 'Gagal menyimpan wishlist' });
    }
});

app.delete('/api/wishlist/:id', authenticate, async (req, res) => {
    await Wishlist.destroy({ where: { id: req.params.id, UserId: req.user.id } });
    res.json({ message: 'Berhasil dihapus' });
});

// --- ADMIN ROUTES ---
app.get('/api/admin/users', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});

app.delete('/api/admin/users/:id', async (req, res) => {
    await User.destroy({ where: { id: req.params.id } });
    res.json({ message: 'User berhasil dihapus' });
});

// Regenerate API Key
app.post('/api/user/regenerate-key', authenticate, async (req, res) => {
    const newKey = 'key_' + Math.random().toString(36).substr(2, 12);
    await req.user.update({ apiKey: newKey });
    res.json({ newApiKey: newKey });
});

// --- 4. SINKRONISASI & JALANKAN SERVER ---
// ALTER: true akan memperbarui tabel di MySQL jika ada perubahan kolom (seperti posterPath)
sequelize.sync({ alter: true }).then(() => {
    console.log('Database Connected & Synced with PosterPath support');
    app.listen(3000, () => console.log('Server running on http://localhost:3000'));
}).catch(err => {
    console.error('Database Connection Error:', err);
});