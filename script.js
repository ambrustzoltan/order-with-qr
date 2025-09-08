const urlParams = new URLSearchParams(window.location.search);
const table = urlParams.get('table') || '1';
document.querySelector('h1').textContent = `Asztal ${table}`;

const categories = {
  food: [
    { 
      sub_menu: "Pizzák",
      items: [
        { id: 1, name: "Pizza Bacon", price: 32 },
        { id: 2, name: "Pizza Capriciosa", price: 32 },
        { id: 3, name: "Pizza Carnivora", price: 37 },
        { id: 4, name: "Pizza Diavola", price: 31 }
      ]
    },
    {
      sub_menu: "Spagettik",
      items: [
        { id: 10, name: "Spagetti Carbonara", price: 28 }
      ]
    },
    {
      sub_menu: "Saláták",
      items: [
        { id: 30, name: "Saláta", price: 25 }
      ]
    }
  ],
  drink: [
    {
      sub_menu: "Kávék",
      items: [
        { id: 200, name: "Kávé", price: 8 },
        { id: 201, name: "Capuccino", price: 9 }
      ]
    },
    {
      sub_menu: "Üdítők",
      items: [
        { id: 300, name: "Víz", price: 8 },
        { id: 301, name: "Cola", price: 10 }
      ]
    },
    {
      sub_menu: "Alkoholos italok",
      items: [
        { id: 400, name: "Heineken", price: 10 },
        { id: 401, name: "Silva", price: 15 }
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

// Place order
function placeOrder() {
  if (Object.keys(cart).length === 0) {
    alert("A kosár üres!");
    return;
  }

  let orderText = Object.values(cart)
    .map(item => `${item.name} - ${item.qty} x ${item.price} RON`)
    .join("\n");

  let total = Object.values(cart).reduce((sum, item) => sum + item.qty * item.price, 0);

  alert(`Rendelés leadva:\n${orderText}\n\nVégösszeg: ${total} RON`);

  // Clear cart
  cart = {};
  renderMenu();
  renderCart();
}

// Init
renderMenu();
renderCart();
