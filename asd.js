// ---- Supabase init ----
const supabaseUrl = "https://ggfrpfpdtzxbrzzwbtpv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnZnJwZnBkdHp4YnJ6endidHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDc2NzYsImV4cCI6MjA3Mjk4MzY3Nn0.bfjwtlZ7It9Z_fFAIvVgSQ9NrkylgJqODIdkGTxBKnY";
const db = supabase.createClient(supabaseUrl, supabaseKey);

// ---- Init on DOM load ----
document.addEventListener("DOMContentLoaded", () => {

    // URL paraméter
    const urlParams = new URLSearchParams(window.location.search);
    const table = urlParams.get('table') || '1';
    document.getElementById('table-header').textContent = `Asztal ${table}`;

    // Adatok
    let categories = { food: [], drink: [] };
    let cart = {};

    // DOM elemek
    const categoryMenu = document.getElementById("category-menu");
    const categoryToggle = document.querySelector(".category-toggle");
    const cartBtn = document.getElementById("cart-button");
    const cartEl = document.getElementById("cart-container");

    // ---- Menu load from DB ----
    async function loadMenu() {
        const { data, error } = await db
            .from('items')
            .select(`id,name,price,img,category_id,description,categories(id,name,type)`)
            .order('id');

        if (error) { console.error(error); return; }

        data.forEach(item => {
            const type = item.categories.type;
            let cat = categories[type].find(c => c.sub_menu === item.categories.name);
            if (!cat) {
                cat = { sub_menu: item.categories.name, id: item.categories.id, type: type, items: [] };
                categories[type].push(cat);
            }
            cat.items.push({
                id: item.id,
                name: item.name,
                price: item.price,
                img: item.img,
                description: item.description
            });
        });

        renderCategoryMenu();
    }

    // ---- Render category menu ----
    function renderCategoryMenu() {
        const categoryList = document.getElementById("category-list");
        categoryList.innerHTML = "";

        ["food", "drink"].forEach(type => {
            categories[type].forEach(cat => {
                const li = document.createElement("li");
                li.textContent = cat.sub_menu;
                li.addEventListener("click", () => {
                    renderMenuByCategory(cat.type, cat.sub_menu);
                    if (window.innerWidth <= 768) categoryMenu.classList.remove("open");
                });
                categoryList.appendChild(li);
            });
        });

        openDefaultCategory();
    }

    // ---- Open default category (smallest id) ----
    function openDefaultCategory() {
        const allCats = [...categories.food, ...categories.drink];
        if (!allCats.length) return;
        const defaultCat = allCats.reduce((prev, curr) => (curr.id < prev.id ? curr : prev), allCats[0]);
        renderMenuByCategory(defaultCat.type, defaultCat.sub_menu);
    }

    // ---- Render menu by category ----
    function renderMenuByCategory(type, subMenuName) {
        const foodDiv = document.getElementById("food-list");
        const drinkDiv = document.getElementById("drink-list");
        foodDiv.innerHTML = "";
        drinkDiv.innerHTML = "";

        const selectedCat = categories[type].find(c => c.sub_menu === subMenuName);
        if (!selectedCat) return;

        const h3 = document.createElement("h3");
        h3.textContent = selectedCat.sub_menu;
        const ul = document.createElement("ul");

        selectedCat.items.forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div class="item-wrapper">
                    ${item.img ? `<img src="${item.img}" alt="${item.name}" width="80">` : ""}
                    <div class="item-info">
                        <div class="item-top">
                            <div class="item-name-price">
                                <span class="item-name">${item.name}</span>
                                <span class="item-price">${item.price} RON</span>
                            </div>
                            <div class="item-qty-buttons">
                                <button onclick="updateCart(${item.id}, '${item.name}', ${item.price}, -1)">-</button>
                                <span id="menu-qty-${item.id}">0</span>
                                <button onclick="updateCart(${item.id}, '${item.name}', ${item.price}, 1)">+</button>
                            </div>
                        </div>
                        <hr>
                        <div class="item-description">${item.description || ""}</div>
                    </div>
                </div>
            `;
            ul.appendChild(li);
        });

        if (type === "food") foodDiv.appendChild(h3), foodDiv.appendChild(ul);
        else drinkDiv.appendChild(h3), drinkDiv.appendChild(ul);
    }

    // ---- Cart logic ----
    function updateCart(id, name, price, change) {
        if (!cart[id]) cart[id] = { name, qty: 0, price };
        cart[id].qty += change;
        if (cart[id].qty <= 0) delete cart[id];

        const menuQty = document.getElementById("menu-qty-" + id);
        if (menuQty) menuQty.textContent = cart[id]?.qty || 0;

        renderCart();
        updateCartCount();
    }

    function renderCart() {
        const cartList = document.getElementById("cart");
        cartList.innerHTML = "";
        let total = 0;
        for (let id in cart) {
            const item = cart[id];
            const subtotal = item.qty * item.price;
            total += subtotal;

            const li = document.createElement("li");
            li.innerHTML = `
                <div>${item.name}</div>
                <div>${item.qty} x ${item.price} RON = ${subtotal} RON</div>
                <div>
                    <button onclick="updateCart(${id}, '${item.name}', ${item.price}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="updateCart(${id}, '${item.name}', ${item.price}, 1)">+</button>
                    <button onclick="deleteCartItem(${id})">Törlés</button>
                </div>
            `;
            cartList.appendChild(li);
        }

        document.getElementById("total").textContent = "Összesen: " + total + " RON";
    }

    function updateCartCount() {
        const count = Object.values(cart).reduce((sum, item) => sum + (item.qty || 0), 0);
        const badge = document.getElementById("cart-count");
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove("hidden");
        } else {
            badge.classList.add("hidden");
        }
    }

    function deleteCartItem(id) { delete cart[id]; renderCart(); updateCartCount(); }
    function clearCart() { cart = {}; renderCart(); updateCartCount(); }
    function placeOrder() { if (!Object.keys(cart).length) alert("A kosár üres!"); else alert("Rendelés leadva!"); }

    // ---- Category menu toggle ----
    function toggleCategoryMenu() {
        const isOpen = categoryMenu.classList.contains('open');
        if (isOpen) {
            categoryMenu.classList.remove('open');
            categoryToggle.classList.remove('hidden');
            document.removeEventListener('click', outsideClickListener);
        } else {
            categoryMenu.classList.add('open');
            categoryToggle.classList.add('hidden');
            setTimeout(() => { document.addEventListener('click', outsideClickListener); }, 0);
        }
    }

    function outsideClickListener(e) {
        if (!categoryMenu.contains(e.target) && !categoryToggle.contains(e.target)) {
            toggleCategoryMenu();
        }
    }

    categoryToggle.addEventListener('click', e => {
        e.stopPropagation();
        toggleCategoryMenu();
    });

    // ---- Cart toggle ----
    cartBtn.addEventListener("click", () => cartEl.classList.toggle("open"));

    // ---- Load menu ----
    loadMenu();
});
