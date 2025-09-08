// "Adatbázis-szerű" tömb
const categories = [
  {
    name: "Pizzák",
    items: [
      { id: 1, name: "Pizza Bacon", price: 32 },
      { id: 2, name: "Pizza Capriciosa", price: 32 },
      { id: 3, name: "Pizza Carnivora", price: 37 },
      { id: 4, name: "Pizza Diavola", price: 31 }
    ]
  },
  {
    name: "Spagettik",
    items: [
      { id: 10, name: "Spagetti Carbonara", price: 28 }
    ]
  },
  {
    name: "Saláták",
    items: [
      { id: 30, name: "Saláta", price: 25 }
    ]
  },
  {
    name: "Itallap - Kávék",
    items: [
      { id: 200, name: "Kávé", price: 8 },
      { id: 201, name: "Capuccino", price: 9 }
    ]
  },
  {
    name: "Itallap - Üdítők",
    items: [
      { id: 300, name: "Víz", price: 8 },
      { id: 301, name: "Cola", price: 10 }
    ]
  },
  {
    name: "Itallap - Alkoholos italok",
    items: [
      { id: 400, name: "Heineken", price: 10 },
      { id: 401, name: "Silva", price: 15 }
    ]
  }
];

// Kosár
let cart = {};

// Menü generálás
function renderMenu() {
  let menuDiv = document.getElementById("menu-list");
  menuDiv.innerHTML = "";

  categories.forEach(cat => {
    let h3 = document.createElement("h3");
    h3.textContent = cat.name;
    menuDiv.appendChild(h3);

    let ul = document.createElement("ul");

    cat.items.forEach(item => {
      let li = document.createElement("li");
      li.innerHTML = `
        ${item.name} - ${item.price} RON
        <button onclick="updateCart(${item.id}, '${item.name}', ${item.price}, -1)">-</button>
        <span id="qty-${item.id}">0</span>
        <button onclick="updateCart(${item.id}, '${item.name}', ${item.price}, 1)">+</button>
      `;
      ul.appendChild(li);
    });

    menuDiv.appendChild(ul);
  });
}

// Kosár frissítés
function updateCart(id, name, price, change) {
  if (!cart[id]) {
    cart[id] = { name: name, qty: 0, price: price };
  }
  cart[id].qty += change;

  if (cart[id].qty <= 0) {
    delete cart[id];
  }

  // menü mennyiség frissítése
  let qtySpan = document.getElementById("qty-" + id);
  if (qtySpan) {
    qtySpan.textContent = cart[id] ? cart[id].qty : 0;
  }

  renderCart();
}

// Kosár kirajzolás
function renderCart() {
  let cartList = document.getElementById("cart");
  cartList.innerHTML = "";

  let total = 0;

  for (let id in cart) {
    let item = cart[id];
    let subtotal = item.qty * item.price;
    total += subtotal;

    let li = document.createElement("li");
    li.innerHTML = `
      ${item.name} - ${item.qty} x ${item.price} RON = ${subtotal} RON
      <button onclick="updateCart(${id}, '${item.name}', ${item.price}, -1)">-</button>
      <button onclick="updateCart(${id}, '${item.name}', ${item.price}, 1)">+</button>
    `;
    cartList.appendChild(li);
  }

  document.getElementById("total").textContent = "Összesen: " + total + " RON";
}

// Rendelés
function placeOrder() {
  if (Object.keys(cart).length === 0) {
    alert("A kosár üres!");
    return;
  }
  alert("Rendelés leadva! Köszönjük!");
}

// Oldal betöltéskor menü generálás
renderMenu();
