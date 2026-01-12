const express = require('express');
const cors = require('cors');
const sequelize = require('./models/index'); 
// IMPORT MODEL DARI FILE MASING-MASING
const User = require('./models/userModel'); 
const Wishlist = require('./models/wishlistModel'); 
const apiRoutes = require('./routes/api'); // Gunakan file routes yang sudah kita ubah tadi

const app = express();
app.use(cors());
app.use(express.json());

// RELASI (Tetap harus didefinisikan setelah import)
User.hasMany(Wishlist);
Wishlist.belongsTo(User);

// GUNAKAN ROUTES (Semua app.post/get admin tadi pindahkan ke routes/api.js)
app.use('/api', apiRoutes);

// SINKRONISASI
sequelize.sync({ alter: true }).then(() => {
    console.log('Database Connected & Synced');
    app.listen(3000, () => console.log('Server running on port 3000'));
});