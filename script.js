let cart = [];

function addToCart(name, price) {
    cart.push({name, price});
    renderCart();
}

function renderCart() {
    const cartEl = document.getElementById('cart');
    cartEl.innerHTML = '';
    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - ${item.price} RON`;
        cartEl.appendChild(li);
    });
}

function placeOrder() {
    if(cart.length === 0) {
        alert("A kosár üres!");
        return;
    }
    let total = cart.reduce((sum, item) => sum + item.price, 0);
    let items = cart.map(item => `${item.name} - ${item.price} RON`).join('\n');
    alert(`Rendelés leadva:\n${items}\n\nVégösszeg: ${total} RON`);
    cart = [];
    renderCart();
}
