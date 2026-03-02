const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const makeAdmin = async (email) => {
  if (!email) {
    console.log('Lütfen bir email adresi girin. Kullanım: node make-admin.js <email>');
    process.exit(1);
  }

  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find the user and update their role
    const user = await User.findOneAndUpdate(
      { email: email }, 
      { role: 'admin' }, 
      { new: true }
    );

    if (user) {
      console.log(`Başarılı! ${user.email} kullanıcısı artık admin.`);
    } else {
      console.log('Hata: Bu email adresiyle kayıtlı kullanıcı bulunamadı.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Sunucu hatası:', err);
    process.exit(1);
  }
};

// Get the email from the command line arguments
const userEmail = process.argv[2];
makeAdmin(userEmail);