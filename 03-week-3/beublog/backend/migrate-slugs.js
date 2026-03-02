const mongoose = require('mongoose');
const Post = require('./models/Post');
require('dotenv').config();

// Helper function to generate a slug from a string
const generateSlug = (title) => {
  return title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

const migrateSlugs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Veritabanına bağlanıldı. (Connected to DB)');

    const posts = await Post.find({ slug: { $exists: false } }); // Find posts without a slug
    
    if (posts.length === 0) {
        console.log('Güncellenecek yazı bulunamadı. (No posts to update)');
        process.exit(0);
    }

    for (let post of posts) {
      post.slug = generateSlug(post.title);
      await post.save();
      console.log(`Güncellendi (Updated): ${post.title} -> ${post.slug}`);
    }

    console.log('Migrasyon tamamlandı. (Migration complete)');
    process.exit(0);
  } catch (err) {
    console.error('Hata (Error):', err);
    process.exit(1);
  }
};

migrateSlugs();