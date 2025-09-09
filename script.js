// Supabase init
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
    // Render food
    categories.food.forEach(cat => {
        const h3 = document.createElement("h3");
        h3.textContent = cat.sub_menu;
        foodDiv.appendChild(h3);
        // Render items
        const ul = document.createElement("ul");
        cat.items.forEach(item => {
            const li = document.createElement("li");
            // Using template literals for better readability
            li.innerHTML = `
                ${item.img ? `<img src="${item.img}" alt="${item.name}">` : ""}
                <div class="item-row">
                    <span>${item.name} - ${item.price} RON</span>
                    <button onclick="updateCart(${item.id}, '${item.name}', ${item.price}, -1)">-</button>
                    <span id="qty-${item.id}">0</span>
                    <button onclick="updateCart(${item.id}, '${item.name}', ${item.price}, 1)">+</button>
                </div>
            `;
            ul.appendChild(li);
        });
        foodDiv.appendChild(ul);
    });
    // Render drinks
    categories.drink.forEach(cat => {
        const h3 = document.createElement("h3");
        h3.textContent = cat.sub_menu;
        drinkDiv.appendChild(h3);
        // Render items
        const ul = document.createElement("ul");
        cat.items.forEach(item => {
            const li = document.createElement("li");
            // Using template literals for better readability
            li.innerHTML = `
                    ${item.img ? `<img src="${item.img}" alt="${item.name}">` : ""}
                    <div class="item-row">
                        <span>${item.name} - ${item.price} RON</span>
                        <button onclick="updateCart(${item.id}, '${item.name}', ${item.price}, -1)">-</button>
                        <span id="qty-${item.id}">0</span>
                        <button onclick="updateCart(${item.id}, '${item.name}', ${item.price}, 1)">+</button>
                    </div>
                `;
            ul.appendChild(li);
        });
        drinkDiv.appendChild(ul);
    });
}

// ---- Cart update ----
function updateCart(id, name, price, change) {
    if (!cart[id]) cart[id] = { name, qty: 0, price };
    cart[id].qty += change;
    if (cart[id].qty <= 0) delete cart[id];
    // Update quantity display
    const qtySpan = document.getElementById("qty-" + id);
    if (qtySpan) qtySpan.textContent = cart[id] ? cart[id].qty : 0;

    renderCart();
}

// ---- Render cart ----
function renderCart() {
    const cartList = document.getElementById("cart");
    cartList.innerHTML = "";

    let total = 0;
    // Iterate over cart items
    for (let id in cart) {
        const item = cart[id];
        const subtotal = item.qty * item.price;
        total += subtotal;

        const li = document.createElement("li");
        li.innerHTML = `
            <div class="cart-item-name">
                ${item.name}
            </div>
            <div class="cart-item-subtotal">
                ${item.qty} x ${item.price} RON = ${subtotal} RON
            </div>
            <div class="cart-buttons">
                <button onclick="updateCart(${id}, '${item.name}', ${item.price}, -1)">-</button>
                <span id="qty-${id}">${item.qty}</span>
                <button onclick="updateCart(${id}, '${item.name}', ${item.price}, 1)">+</button>
            </div>
            <button class="delete-btn" onclick="deleteCartItem(${id})">Törlés</button>
        `;
        cartList.appendChild(li);
    }

    document.getElementById("total").textContent = "Összesen: " + total + " RON";
}

// ---- Cart item delete & clear ----
function deleteCartItem(id) {
    delete cart[id];
    const qtySpan = document.getElementById("qty-" + id);
    if (qtySpan) qtySpan.textContent = 0;
    renderCart();
}
// Clear entire cart
function clearCart() {
    for (let id in cart) {
        const qtySpan = document.getElementById("qty-" + id);
        if (qtySpan) qtySpan.textContent = 0;
    }
    cart = {};
    renderCart();
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

        const { data, error } = await db
            .from("orders")
            .insert([
                {
                    table_number: parseInt(table),
                    items: newItems,
                    total: total,
                    status: 0
                }
            ])
            .select();

        if (error) { console.error(error); alert("❌ Nem sikerült elmenteni a rendelést!"); return; }

        alert(`✅ Rendelés leadva! Összesen: ${total} RON`);
    }

    cart = {};
    renderMenu();
    renderCart();
}


// ---- Init ----
loadMenu();
