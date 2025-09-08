let cart = [];

function addToCart(item) {
  cart.push(item);
  renderCart();
}

function renderCart() {
  const cartEl = document.getElementById('cart');
  cartEl.innerHTML = '';
  cart.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = item;
    cartEl.appendChild(li);
  });
}

function placeOrder() {
  if(cart.length === 0) {
    alert("A kosár üres!");
    return;
  }
  alert("Rendelés leadva: " + cart.join(', '));
  cart = [];
  renderCart();
}