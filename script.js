
// Supabase init
const supabaseUrl = "https://ggfrpfpdtzxbrzzwbtpv.supabase.co"; // <- your project URL
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnZnJwZnBkdHp4YnJ6endidHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDc2NzYsImV4cCI6MjA3Mjk4MzY3Nn0.bfjwtlZ7It9Z_fFAIvVgSQ9NrkylgJqODIdkGTxBKnY";                     // <- anon public key
const db = supabase.createClient(supabaseUrl, supabaseKey);

const urlParams = new URLSearchParams(window.location.search);
const table = urlParams.get('table') || '1';
document.querySelector('h1').textContent = `Asztal ${table}`;

const categories = {
    food: [
        {
            sub_menu: "Pizzák",
            items: [
                { id: 100, name: "Pizza Bacon", price: 32, img: "https://fourstarpizzaploiesti.ro/wp-content/uploads/2023/05/pizza-bacon-deluxe-600x600.jpg" },
                { id: 101, name: "Pizza Capriciosa", price: 32, img: "https://fourstarpizzaploiesti.ro/wp-content/uploads/2023/05/pizza-bacon-deluxe-600x600.jpg" },
                { id: 102, name: "Pizza Carnivora", price: 37 },
                { id: 103, name: "Pizza Diavola", price: 31 }
            ]
        },
        {
            sub_menu: "Spagettik",
            items: [
                { id: 200, name: "Spagetti Carbonara", price: 28 }
            ]
        },
        {
            sub_menu: "Saláták",
            items: [
                { id: 300, name: "Saláta", price: 25 }
            ]
        }
    ],
    drink: [
        {
            sub_menu: "Kávék",
            items: [
                { id: 400, name: "Kávé", price: 8 },
                { id: 401, name: "Capuccino", price: 9 }
            ]
        },
        {
            sub_menu: "Üdítők",
            items: [
                { id: 500, name: "Víz", price: 8 },
                { id: 501, name: "Cola", price: 10 }
            ]
        },
        {
            sub_menu: "Alkoholos italok",
            items: [
                { id: 600, name: "Heineken", price: 10 },
                { id: 601, name: "Silva", price: 15 }
            ]
        }
    ]
};


// Cart
let cart = {};

// Menu render
function renderMenu() {
    const foodDiv = document.getElementById("food-list");
    const drinkDiv = document.getElementById("drink-list");

    foodDiv.innerHTML = "";
    drinkDiv.innerHTML = "";

    // Food
    categories.food.forEach(cat => {
        const h3 = document.createElement("h3");
        h3.textContent = cat.sub_menu;
        foodDiv.appendChild(h3);

        const ul = document.createElement("ul");

        cat.items.forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `
        ${item.img ? `<img src="${item.img}" alt="${item.name}" style="width:50px; height:50px; object-fit:cover; margin-right:10px;">` : ""}
        ${item.name} - ${item.price} RON
        <button onclick="updateCart(${item.id}, '${item.name}', ${item.price}, -1)">-</button>
        <span id="qty-${item.id}">0</span>
        <button onclick="updateCart(${item.id}, '${item.name}', ${item.price}, 1)">+</button>
      `;
            ul.appendChild(li);
        });

        foodDiv.appendChild(ul);
    });

    // Drinks
    categories.drink.forEach(cat => {
        const h3 = document.createElement("h3");
        h3.textContent = cat.sub_menu;
        drinkDiv.appendChild(h3);

        const ul = document.createElement("ul");

        cat.items.forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `
        ${item.img ? `<img src="${item.img}" alt="${item.name}" style="width:50px; height:50px; object-fit:cover; margin-right:10px;">` : ""}
        ${item.name} - ${item.price} RON
        <button onclick="updateCart(${item.id}, '${item.name}', ${item.price}, -1)">-</button>
        <span id="qty-${item.id}">0</span>
        <button onclick="updateCart(${item.id}, '${item.name}', ${item.price}, 1)">+</button>
      `;
            ul.appendChild(li);
        });

        drinkDiv.appendChild(ul);
    });
}

// Cart update
function updateCart(id, name, price, change) {
    if (!cart[id]) {
        cart[id] = { name: name, qty: 0, price: price };
    }
    cart[id].qty += change;

    if (cart[id].qty <= 0) {
        delete cart[id];
    }

    // Menu qty update
    const qtySpan = document.getElementById("qty-" + id);
    if (qtySpan) {
        qtySpan.textContent = cart[id] ? cart[id].qty : 0;
    }

    renderCart();
}

// Render cart
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
      ${item.name} - ${item.qty} x ${item.price} RON = ${subtotal} RON
      <button onclick="updateCart(${id}, '${item.name}', ${item.price}, -1)">-</button>
      <button onclick="updateCart(${id}, '${item.name}', ${item.price}, 1)">+</button>
      <button onclick="deleteCartItem(${id})">Törlés</button>
    `;
        cartList.appendChild(li);
    }

    document.getElementById("total").textContent = "Összesen: " + total + " RON";
}

// Delete item from cart
function deleteCartItem(id) {
    delete cart[id];

    // Reset menu qty
    const qtySpan = document.getElementById("qty-" + id);
    if (qtySpan) qtySpan.textContent = 0;

    renderCart();
}

// Clear entire cart
function clearCart() {
    // Reset menu quantities
    for (let id in cart) {
        const qtySpan = document.getElementById("qty-" + id);
        if (qtySpan) qtySpan.textContent = 0;
    }

    // Clear cart
    cart = {};
    renderCart();
}


// Place order - Supabase verzió
async function placeOrder() {
    if (Object.keys(cart).length === 0) {
        alert("A kosár üres!");
        return;
    }

    let total = Object.values(cart).reduce((sum, item) => sum + item.qty * item.price, 0);

    const { data, error } = await db
        .from("orders")
        .insert([
            {
                table_number: parseInt(table),
                items: cart,
                total: total,
                status: 0
            }
        ])
        .select(); // Return the inserted row(s)


    if (error) {
        console.error("Hiba:", error);
        alert("❌ Nem sikerült elmenteni a rendelést!");
        return;
    }

    // Ha sikerült menteni
    alert(`✅ Rendelés leadva!\nVégösszeg: ${total} RON\n\nAzonosító: ${data[0].id}`);

    // Kosár ürítés
    cart = {};
    renderMenu();
    renderCart();
}

// Init
renderMenu();
renderCart();
