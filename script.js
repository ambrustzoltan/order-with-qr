// ---- Supabase init ----
const supabaseUrl = "https://ggfrpfpdtzxbrzzwbtpv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnZnJwZnBkdHp4YnJ6endidHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDc2NzYsImV4cCI6MjA3Mjk4MzY3Nn0.bfjwtlZ7It9Z_fFAIvVgSQ9NrkylgJqODIdkGTxBKnY";
const db = supabase.createClient(supabaseUrl, supabaseKey);

const urlParams = new URLSearchParams(window.location.search);
const table = urlParams.get('table') || '1';
document.querySelector('h1').textContent = `Asztal ${table}`;

let categories = { food: [], drink: [] };
let cart = {};

// ---- Menu load from DB ----
async function loadMenu() {
    const { data, error } = await db
        .from('items')
        .select(`
            id,
            name,
            price,
            img,
            category_id,
            categories(name, type)
        `)
        .order('id');

    if (error) {
        console.error(error);
        return;
    }

    data.forEach(item => {
        const type = item.categories.type; // food/drink
        let cat = categories[type].find(c => c.sub_menu === item.categories.name);
        if (!cat) {
            cat = { sub_menu: item.categories.name, items: [] };
            categories[type].push(cat);
        }
        cat.items.push({
            id: item.id,
            name: item.name,
            price: item.price,
            img: item.img
        });
    });

    renderMenu();
}

// ---- Menu render ----
function renderMenu() {
    const foodDiv = document.getElementById("food-list");
    const drinkDiv = document.getElementById("drink-list");

    foodDiv.innerHTML = "";
    drinkDiv.innerHTML = "";

    categories.food.forEach(cat => {
        const h3 = document.createElement("h3");
        h3.textContent = cat.sub_menu;
        foodDiv.appendChild(h3);
        const ul = document.createElement("ul");
        cat.items.forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div class="item-wrapper">
                    ${item.img ? `<img src="${item.img}" alt="${item.name}">` : ""}
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
        foodDiv.appendChild(ul);
    });

    categories.drink.forEach(cat => {
        const h3 = document.createElement("h3");
        h3.textContent = cat.sub_menu;
        drinkDiv.appendChild(h3);
        const ul = document.createElement("ul");
        cat.items.forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div class="item-wrapper">
                    ${item.img ? `<img src="${item.img}" alt="${item.name}">` : ""}
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
        drinkDiv.appendChild(ul);
    });
}

// ---- Cart update ----
function updateCart(id, name, price, change, event) {
    if (event) event.stopPropagation();

    if (!cart[id]) cart[id] = { name, qty: 0, price };
    cart[id].qty += change;

    if (cart[id].qty <= 0) delete cart[id];

    const menuQty = document.getElementById("menu-qty-" + id);
    if (menuQty) menuQty.textContent = cart[id]?.qty || 0;

    const cartQty = document.getElementById("cart-qty-" + id);
    if (cartQty) cartQty.textContent = cart[id]?.qty || 0;

    renderCart();
    updateCartCount();
}



// ---- Render cart ----
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
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-subtotal">${item.qty} x ${item.price} RON = ${subtotal} RON</div>
            <div class="cart-buttons">
                <button onclick="updateCart(${id}, '${item.name}', ${item.price}, -1, event)">-</button>
                <span id="cart-qty-${id}">${item.qty}</span>
                <button onclick="updateCart(${id}, '${item.name}', ${item.price}, 1, event)">+</button>
            </div>
            <button class="delete-btn" onclick="deleteCartItem(${id}, event)">Törlés</button>
        `;
        cartList.appendChild(li);
    }

    const cartFooter = document.getElementById("cart-footer");
    if (cartFooter) {
        cartFooter.querySelector("#total").textContent = "Összesen: " + total + " RON";
    }
}


// ---- Toggle cart ----

const cartBtn = document.getElementById("cart-button");
const cartEl = document.getElementById("cart-container");

cartBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    cartEl.classList.toggle("open");
    cartEl.classList.remove("hidden");
});

document.addEventListener("click", function (e) {
    if (!cartEl.contains(e.target) && !cartBtn.contains(e.target)) {
        cartEl.classList.remove("open");
    }
});

// ---- Badge update ----
function updateCartCount() {
    const count = Object.values(cart).reduce((sum, item) => sum + (item.qty || 0), 0);
    const badge = document.getElementById("cart-count");
    if (count > 0) {
        badge.textContent = count;
        badge.classList.remove("hidden");
    } else {
        badge.textContent = 0;
        badge.classList.add("hidden");
    }
}

// ---- Cart item delete & clear ----
function deleteCartItem(id, event) {
    if (event) event.stopPropagation();
    delete cart[id];

    const menuQty = document.getElementById("menu-qty-" + id);
    if (menuQty) menuQty.textContent = 0;

    renderCart();
    updateCartCount();
}


function clearCart(event) {
    if (event) event.stopPropagation();

    for (let id in cart) {
        const menuQty = document.getElementById("menu-qty-" + id);
        if (menuQty) menuQty.textContent = 0;

        const cartQty = document.getElementById("cart-qty-" + id);
        if (cartQty) cartQty.textContent = 0;
    }

    cart = {};
    renderCart();
    updateCartCount();
}

// ---- Place order ----
async function placeOrder() {
    if (Object.keys(cart).length === 0) {
        alert("A kosár üres!");
        return;
    }

    let newItems = {};
    for (let id in cart) {
        let item = cart[id];
        newItems[id] = {
            name: item.name,
            qty: item.qty,
            unit_price: item.price,
            subtotal: item.qty * item.price
        };
    }

    const { data: existing, error: fetchError } = await db
        .from("orders")
        .select("*")
        .eq("table_number", parseInt(table))
        .eq("status", 0)
        .limit(1);

    if (fetchError) { console.error(fetchError); alert("Hiba történt!"); return; }

    if (existing.length > 0) {
        let updatedItems = { ...existing[0].items };
        for (let id in newItems) {
            if (updatedItems[id]) {
                updatedItems[id].qty += newItems[id].qty;
                updatedItems[id].subtotal = updatedItems[id].qty * updatedItems[id].unit_price;
            } else {
                updatedItems[id] = newItems[id];
            }
        }

        let updatedTotal = Object.values(updatedItems).reduce((sum, item) => sum + item.subtotal, 0);

        const { error: updateError } = await db
            .from("orders")
            .update({ items: updatedItems, total: updatedTotal })
            .eq("id", existing[0].id);

        if (updateError) { console.error(updateError); alert("Nem sikerült frissíteni a rendelést!"); return; }

        alert(`✅ Rendelés frissítve! Összesen: ${updatedTotal} RON`);

    } else {
        let total = Object.values(newItems).reduce((sum, item) => sum + item.subtotal, 0);

        const { error } = await db
            .from("orders")
            .insert([
                {
                    table_number: parseInt(table),
                    items: newItems,
                    total: total,
                    status: 0
                }
            ]);

        if (error) { console.error(error); alert("❌ Nem sikerült elmenteni a rendelést!"); return; }

        alert(`✅ Rendelés leadva! Összesen: ${total} RON`);
    }

    cart = {};
    renderMenu();
    renderCart();
}

// ---- Init ----
loadMenu();
