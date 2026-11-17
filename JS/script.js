"use strict";

// Menu hambúrguer
const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector("#main-navigation");

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const abrir = navigation.hidden;
    navigation.hidden = !abrir;
    menuButton.setAttribute("aria-expanded", String(abrir));
    menuButton.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
    menuButton.textContent = abrir ? "✕" : "☰";
  });
  navigation.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navigation.hidden = true;
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Abrir menu");
      menuButton.textContent = "☰";
    });
  });
}

// Produtos são definidos pelo catálogo HTML. Usamos apenas IDs conhecidos
// para evitar restaurar dados inesperados do localStorage.
const products = new Map(
  [...document.querySelectorAll(".product-card")].map(card => [
    card.dataset.id,
    {
      id: card.dataset.id,
      name: card.dataset.name,
      price: Number(card.dataset.price),
      image: card.dataset.image
    }
  ])
);

const STORAGE_KEY = "cupcake-shop-cart-v1";
const cartButton = document.querySelector(".cart-button");
const cartCount = document.querySelector(".cart-count");
const cartDrawer = document.querySelector("#cart-drawer");
const cartOverlay = document.querySelector("#cart-overlay");
const closeCartButton = document.querySelector(".close-cart");
const cartItems = document.querySelector("#cart-items");
const cartTotal = document.querySelector("#cart-total");
const checkoutButton = document.querySelector("#checkout-button");
const toast = document.querySelector("#cart-toast");
let toastTimer;
let previousFocus = null;

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
    const clean = {};
    for (const [id, quantity] of Object.entries(saved)) {
      if (products.has(id) && Number.isInteger(quantity) && quantity > 0 && quantity <= 99) {
        clean[id] = quantity;
      }
    }
    return clean;
  } catch {
    return {};
  }
}

let cart = loadCart();
const money = value => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function saveCart() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }
  catch { /* Pode estar indisponível em navegação privada. */ }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function openCart() {
  previousFocus = document.activeElement;
  cartDrawer.inert = false;
  cartDrawer.setAttribute("aria-hidden", "false");
  cartDrawer.classList.add("is-open");
  cartOverlay.hidden = false;
  cartButton.setAttribute("aria-expanded", "true");
  document.body.classList.add("cart-open");
  closeCartButton.focus();
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartDrawer.inert = true;
  cartOverlay.hidden = true;
  cartButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("cart-open");
  if (previousFocus && previousFocus.isConnected) previousFocus.focus();
  else cartButton.focus();
}

function changeQuantity(id, delta) {
  if (!products.has(id)) return;
  const next = Math.min(99, Math.max(0, (cart[id] || 0) + delta));
  if (next === 0) delete cart[id];
  else cart[id] = next;
  saveCart();
  renderCart();
}

function renderCart() {
  const entries = Object.entries(cart).filter(([id, qty]) => products.has(id) && qty > 0);
  const count = entries.reduce((sum, [, qty]) => sum + qty, 0);
  const total = entries.reduce((sum, [id, qty]) => sum + products.get(id).price * qty, 0);
  cartCount.textContent = String(count);
  cartCount.setAttribute("aria-label", `${count} itens`);
  cartTotal.textContent = money(total);
  checkoutButton.disabled = entries.length === 0;
  cartItems.replaceChildren();

  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "empty-cart";
    empty.textContent = "Seu carrinho está vazio.";
    cartItems.append(empty);
    return;
  }

  for (const [id, qty] of entries) {
    const product = products.get(id);
    const article = document.createElement("article");
    article.className = "cart-item";
    const img = document.createElement("img");
    img.src = product.image;
    img.alt = `Cupcake ${product.name}`;
    const details = document.createElement("div");
    const name = document.createElement("h3");
    name.textContent = product.name;
    const price = document.createElement("p");
    price.className = "cart-item-price";
    price.textContent = money(product.price * qty);
    const actions = document.createElement("div");
    actions.className = "cart-item-actions";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "quantity-button";
    minus.textContent = "−";
    minus.setAttribute("aria-label", `Diminuir quantidade de ${product.name}`);
    minus.addEventListener("click", () => changeQuantity(id, -1));

    const amount = document.createElement("span");
    amount.className = "quantity-value";
    amount.textContent = String(qty);

    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "quantity-button";
    plus.textContent = "+";
    plus.disabled = qty >= 99;
    plus.setAttribute("aria-label", `Aumentar quantidade de ${product.name}`);
    plus.addEventListener("click", () => changeQuantity(id, 1));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-item";
    remove.textContent = "Remover";
    remove.setAttribute("aria-label", `Remover ${product.name} do carrinho`);
    remove.addEventListener("click", () => {
      delete cart[id];
      saveCart();
      renderCart();
    });

    actions.append(minus, amount, plus, remove);
    details.append(name, price, actions);
    article.append(img, details);
    cartItems.append(article);
  }
}

// Adicionar produtos
for (const card of document.querySelectorAll(".product-card")) {
  card.querySelector(".add-to-cart").addEventListener("click", () => {
    const id = card.dataset.id;
    if (!products.has(id)) return;
    if ((cart[id] || 0) >= 99) {
      showToast("Limite de 99 unidades por sabor.");
      return;
    }
    cart[id] = (cart[id] || 0) + 1;
    saveCart();
    renderCart();
    showToast("Produto adicionado ao carrinho");
    if (!cartDrawer.classList.contains("is-open")) openCart();
  });
}

checkoutButton.addEventListener("click", () => {
  if (Object.keys(cart).length) window.location.href = "checkout.html";
});

cartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

document.addEventListener("keydown", event => {
  if (!cartDrawer.classList.contains("is-open")) return;
  if (event.key === "Escape") closeCart();
  if (event.key === "Tab") {
    const focusable = [...cartDrawer.querySelectorAll("button:not(:disabled)")];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

renderCart();
