// --- State ---
let products = JSON.parse(localStorage.getItem('beu_products')) || [];
let currentUser = localStorage.getItem('beu_user') || 'Kullanıcı';
let currentFilter = 'Tümü';
let currentSort = 'newest';
let searchQuery = '';

// --- DOM Elements ---
const form = document.getElementById('product-form');
const container = document.getElementById('product-container');
const filterBtns = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sort-select');
const searchInput = document.getElementById('search-input');
const usernameInput = document.getElementById('username-input');
const modal = document.getElementById('product-modal');
const modalBody = document.getElementById('modal-body');

// --- Init & PWA (Feature 9) ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    usernameInput.value = currentUser;
    renderProducts();

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => console.log('SW Registration Failed:', err));
    }
});

// --- Feature 1: Dark Mode ---
function initTheme() {
    const savedTheme = localStorage.getItem('beu_theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-toggle').addEventListener('click', () => {
        const newTheme = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('beu_theme', newTheme);
    });
}

// --- Feature 7: User Profile ---
usernameInput.addEventListener('input', (e) => {
    currentUser = e.target.value.trim() || 'Kullanıcı';
    localStorage.setItem('beu_user', currentUser);
});

// --- Render Logic (Features 4, 5) ---
function renderProducts() {
    container.innerHTML = '';
    
    // 1. Filter
    let displayList = products.filter(p => {
        const matchCategory = currentFilter === 'Tümü' || 
                             (currentFilter === 'Benim Ürünlerim' && p.author === currentUser) ||
                             p.category === currentFilter;
        const matchSearch = p.title.toLowerCase().includes(searchQuery) || p.description.toLowerCase().includes(searchQuery);
        return matchCategory && matchSearch;
    });

    // 2. Sort (Feature 5)
    displayList.sort((a, b) => {
        if (currentSort === 'price-asc') return a.price - b.price;
        if (currentSort === 'price-desc') return b.price - a.price;
        if (currentSort === 'likes-desc') return b.likes - a.likes;
        return b.createdAt - a.createdAt; // newest default
    });

    if (displayList.length === 0) {
        container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;">Ürün bulunamadı.</div>`;
        updateStats();
        return;
    }

    displayList.forEach(product => {
        const article = document.createElement('article');
        article.draggable = true;
        article.dataset.id = product.id;
        
        // Setup Drag Events
        article.addEventListener('dragstart', handleDragStart);
        article.addEventListener('dragover', handleDragOver);
        article.addEventListener('drop', handleDrop);
        article.addEventListener('dragenter', e => e.preventDefault());

        // Apply background image if it exists
        if (product.image) {
            article.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(${product.image})`;
            article.style.backgroundSize = 'cover';
            article.style.backgroundPosition = 'center';
            article.classList.add('has-bg-image');
        }

        article.innerHTML = `
            <div class="card-content">
                <div class="product-header">
                    <h3>${product.title}</h3>
                    <span class="category-tag">${product.category}</span>
                </div>
                <p style="font-size:0.9rem; color:${product.image ? '#ccc' : 'gray'};">Ekleyen: ${product.author || 'Kullanıcı'}</p>
                <div class="product-price">${product.price} ₺</div>
                <div class="card-actions">
                    <button class="btn-secondary like-btn" data-id="${product.id}">❤️ ${product.likes}</button>
                    <button class="btn-secondary detail-btn" data-id="${product.id}">Detay</button>
                    ${product.author === currentUser ? `<button class="btn-danger delete-btn" data-id="${product.id}">Sil</button>` : ''}
                </div>
            </div>
        `;
        container.appendChild(article);
    });
    updateStats();
}

// --- Add Product with Base64 Image (Feature 3) ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('image-upload');
    let base64Image = null;

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        base64Image = await convertToBase64(file);
    }

    const newProduct = {
        id: Date.now().toString(),
        title: document.getElementById('title').value.trim(),
        description: document.getElementById('description').value.trim(),
        price: parseFloat(document.getElementById('price').value),
        category: document.getElementById('category').value,
        image: base64Image,
        likes: 0,
        comments: [],
        createdAt: Date.now(),
        author: currentUser
    };

    products.unshift(newProduct);
    saveData();
    form.reset();
    renderProducts();
    showToast('Ürün başarıyla paylaşıldı! 🚀'); // Feature 10
});

function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// --- Event Delegation ---
container.addEventListener('click', (e) => {
    const target = e.target;
    const id = target.getAttribute('data-id');

    if (target.classList.contains('like-btn')) {
        const p = products.find(x => x.id === id);
        p.likes++;
        saveData();
        renderProducts();
        showToast('Beğenildi! ❤️');
    }

    if (target.classList.contains('delete-btn')) {
        if (confirm('Silmek istediğine emin misin?')) {
            products = products.filter(x => x.id !== id);
            saveData();
            renderProducts();
            showToast('Ürün silindi.');
        }
    }

    // Feature 6: Open Modal
    if (target.classList.contains('detail-btn')) {
        openModal(id);
    }
});

// --- Feature 6: Modal Logic ---
// --- Feature 6: Modal Logic ---
function openModal(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;

    const imgHtml = p.image ? `<img src="${p.image}" class="modal-img">` : '';
    
    // Gelişmiş Yorum Renderlama (Author and Date included)
    const commentsHtml = p.comments.map(c => {
        // Geriye dönük uyumluluk: Eski yorumlar string ise
        if (typeof c === 'string') {
            return `<p>${c}</p>`;
        } else {
            // Yeni yorumlar obje formatında (tarih ve yazar ile)
            const dateStr = new Date(c.date).toLocaleString('tr-TR', { 
                day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' 
            });
            return `<p><strong>${c.author}</strong> <span style="font-size:0.8rem; color:gray;">(${dateStr})</span>: ${c.text}</p>`;
        }
    }).join('') || '<p style="color: gray; font-style: italic;">Henüz yorum yok.</p>';

    modalBody.innerHTML = `
        ${imgHtml}
        <h2>${p.title}</h2>
        <p><strong>Kategori:</strong> ${p.category} | <strong>Ekleyen:</strong> ${p.author || 'Kullanıcı'}</p>
        <h3 class="product-price" style="color: var(--accent-color);">${p.price} ₺</h3>
        
        <div style="margin: 1.5rem 0; padding: 1rem; background-color: var(--bg-color); border-radius: 6px; border-left: 4px solid var(--primary-color);">
            <h4 style="margin-bottom: 0.5rem; font-size: 0.9rem; color: gray;">Açıklama:</h4>
            <p style="line-height: 1.5;">${p.description}</p>
        </div>
        
        <div class="modal-comments">
            <h3 style="margin-bottom: 1rem;">Yorumlar</h3>
            <div id="modal-comment-list">${commentsHtml}</div>
            
            <div style="display:flex; gap:0.8rem; margin-top:1.5rem; align-items: stretch;">
                <input type="text" id="modal-comment-input" placeholder="Yorumunuzu yazın..." style="flex:1; min-width: 0;">
                <button class="btn-primary" style="width: auto; padding: 0 1.5rem;" onclick="addComment('${p.id}')">Gönder</button>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
}

document.querySelector('.close-modal').addEventListener('click', () => modal.classList.add('hidden'));
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') modal.classList.add('hidden'); });

window.addComment = function(id) {
    const input = document.getElementById('modal-comment-input');
    const text = input.value.trim();
    if (text) {
        const p = products.find(x => x.id === id);
        p.comments.push(`<strong>${currentUser}:</strong> ${text}`);
        saveData();
        openModal(id); // refresh modal
        renderProducts(); // update background
    }
};

// --- Feature 2: Drag & Drop Logic ---
let draggedId = null;

function handleDragStart(e) {
    draggedId = this.dataset.id;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    this.classList.add('drag-over');
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    document.querySelectorAll('article').forEach(a => a.classList.remove('dragging', 'drag-over'));

    const targetId = this.dataset.id;
    if (draggedId && draggedId !== targetId) {
        // Find indices
        const fromIndex = products.findIndex(p => p.id === draggedId);
        const toIndex = products.findIndex(p => p.id === targetId);
        
        // Swap in array
        const [movedItem] = products.splice(fromIndex, 1);
        products.splice(toIndex, 0, movedItem);
        
        saveData();
        renderProducts();
    }
}

// --- Filters & Sorting & Search ---
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.getAttribute('data-category');
        renderProducts();
    });
});

sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderProducts();
});

searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderProducts();
});

// --- Feature 8: Import/Export (Blob API) ---
document.getElementById('export-btn').addEventListener('click', () => {
    const dataStr = JSON.stringify(products);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BEUShareBox_Backup.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Veriler indirildi.');
});

document.getElementById('import-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(event.target.result);
            products = [...importedData, ...products]; // Merge
            saveData();
            renderProducts();
            showToast('Veriler başarıyla yüklendi!');
        } catch (err) {
            alert('Geçersiz dosya formatı!');
        }
    };
    reader.readAsText(file);
});

// --- Utilities & Feature 10 (Toasts) ---
function updateStats() {
    document.getElementById('stat-products').innerText = products.length;
    document.getElementById('stat-likes').innerText = products.reduce((acc, curr) => acc + curr.likes, 0);
}

function saveData() { localStorage.setItem('beu_products', JSON.stringify(products)); }

function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}