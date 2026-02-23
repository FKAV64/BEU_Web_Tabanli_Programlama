# BEUShareBox 📦

A mini social media and product-sharing Single Page Application (SPA) built entirely with Vanilla web technologies. This project combines the visual sharing aspect of platforms like Instagram with the structured layout of a product catalog. 

Developed as a classroom project for the Web-Based Programming course at Bitlis Eren University (Computer Engineering Department).

## 🚀 Demo
*(You can add a link here if you host it on GitHub Pages or Vercel later)*

## 🛠️ Technologies Used
This project was built strictly without any external frameworks or libraries to demonstrate core frontend proficiency:
* **HTML5** (Semantic structuring & Accessibility)
* **CSS3** (Responsive Grid/Flexbox layouts, Custom Properties, Animations)
* **Vanilla JavaScript** (DOM manipulation, Event Delegation, LocalStorage API)

## ✨ Features

### Core Capabilities (Minimum Requirements)
* **Product Management:** Users can add and delete products dynamically.
* **Interactive Social Elements:** Fully functional like counters and a localized commenting system.
* **Search & Filter:** Real-time search by product name/description and category-based filtering.
* **Data Persistence:** All products, likes, and comments are saved locally using the `localStorage` API.
* **Responsive Design:** Adapts smoothly from mobile (single column) to desktop (multi-column grid).
* **Form Validation:** Input validation for product details and prices to ensure clean data entry.

### Advanced / Showcase Features (Pro Version)
This repository includes all 10 advanced showcase features:
1. **Dark / Light Mode:** Theme toggle with user preference saved in `localStorage`.
2. **Drag & Drop Reordering:** Rearrange product cards using the HTML5 Drag and Drop API.
3. **Image Upload (Base64):** Users can upload device images, converted and stored via the FileReader API.
4. **Animated Transitions:** Smooth CSS `@keyframes` for card appearances and hover states.
5. **Dynamic Sorting:** Sort products by newest, price (asc/desc), or most liked.
6. **Product Detail Modal:** A dedicated modal view for expanded descriptions and full comment histories.
7. **User Profile System:** Basic profile tracking associating uploaded products and comments with a specific user.
8. **Data Import / Export:** Download a `.json` backup of the platform's state or upload one using the Blob API.
9. **PWA Support:** `manifest.json` and a Service Worker enable basic offline support and "Add to Home Screen" functionality.
10. **Toast Notifications:** Automated, self-dismissing alerts for user actions (adding, liking, deleting).

## 💻 Installation & Usage

Because this project uses vanilla technologies, no package manager (like npm) is required!

1. **Clone the repository:**
   ```bash
   git clone https://github.com/FKAV64/BEU_Web_Tabanli_Programlama
