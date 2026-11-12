
const $ = id => document.getElementById(id);

let cart = [];
let favoritesOnly = false;
let activeCategory = "all";

function toast(message) {
    $("toast").textContent = message;
    $("toast").classList.add("show");
    setTimeout(() => $("toast").classList.remove("show"), 2200);
}

window.addEventListener("load", () => {
    setTimeout(() => $("loader").classList.add("hide"), 700);
});

$("menuBtn").onclick = () => $("nav").classList.toggle("show");

document.querySelectorAll("nav a").forEach(link => {
    link.onclick = () => $("nav").classList.remove("show");
});

$("themeBtn").onclick = () => {
    document.body.classList.toggle("light");
    $("themeBtn").textContent =
        document.body.classList.contains("light") ? "☾" : "☀";
};

function filterProducts() {
    const search = $("searchInput").value.toLowerCase();
    let visible = 0;

    document.querySelectorAll(".product-card").forEach(card => {
        const categoryMatch =
            activeCategory === "all" ||
            card.dataset.category === activeCategory;

        const searchMatch =
            card.dataset.name.toLowerCase().includes(search);

        const favoriteMatch =
            !favoritesOnly || card.querySelector(".heart").classList.contains("liked");

        const show = categoryMatch && searchMatch && favoriteMatch;
        card.style.display = show ? "" : "none";

        if (show) visible++;
    });

    $("empty").style.display = visible ? "none" : "block";
}

document.querySelectorAll(".filter").forEach(button => {
    button.onclick = () => {
        document.querySelector(".filter.active").classList.remove("active");
        button.classList.add("active");
        activeCategory = button.dataset.category;
        favoritesOnly = false;
        $("favoriteBtn").style.color = "";
        filterProducts();
    };
});

$("searchInput").addEventListener("input", filterProducts);

document.querySelectorAll(".heart").forEach(button => {
    button.onclick = () => {
        button.classList.toggle("liked");
        button.textContent = button.classList.contains("liked") ? "♥" : "♡";
        toast(button.classList.contains("liked") ? "Sevimlilarga qo‘shildi" : "Sevimlilardan olindi");
        filterProducts();
    };
});

$("favoriteBtn").onclick = () => {
    favoritesOnly = !favoritesOnly;
    $("favoriteBtn").style.color = favoritesOnly ? "#ff5470" : "";
    filterProducts();
};

document.querySelectorAll(".add-btn").forEach(button => {
    button.onclick = () => {
        const name = button.dataset.name;
        const price = Number(button.dataset.price);
        const item = cart.find(product => product.name === name);

        if (item) {
            item.quantity++;
        } else {
            cart.push({ name, price, quantity: 1 });
        }

        updateCart();
        toast(name + " savatchaga qo‘shildi");
    };
});

function updateCart() {
    $("cartCount").textContent =
        cart.reduce((sum, item) => sum + item.quantity, 0);

    $("cartItems").innerHTML = "";

    cart.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "cart-item";

        const name = document.createElement("strong");
        name.textContent = item.name + " × " + item.quantity;

        const price = document.createElement("span");
        price.textContent = "$" + item.price * item.quantity;

        const remove = document.createElement("button");
        remove.textContent = "O‘chirish";
        remove.onclick = () => {
            cart.splice(index, 1);
            updateCart();
        };

        row.append(name, price, remove);
        $("cartItems").append(row);
    });

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    $("total").textContent = "$" + total;
}

function openCart() {
    $("cartPanel").classList.add("open");
    $("overlay").classList.add("show");
}

function closePanels() {
    $("cartPanel").classList.remove("open");
    $("overlay").classList.remove("show");
    $("orderModal").classList.remove("show");
}

$("cartBtn").onclick = openCart;
$("closeCart").onclick = closePanels;
$("overlay").onclick = closePanels;

$("checkout").onclick = () => {
    if (!cart.length) {
        toast("Savatcha bo‘sh!");
        return;
    }

    $("orderModal").classList.add("show");
};

$("closeModal").onclick = closePanels;

$("orderForm").onsubmit = event => {
    event.preventDefault();

    const name = $("customerName").value.trim();
    const phone = $("customerPhone").value.trim();

    if (!name || !phone) return;

    const products = cart.map(item =>
        `${item.name} x${item.quantity} = $${item.price * item.quantity}`
    ).join("\n");

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    const message =
        `NEXORA BUYURTMA\nIsm: ${name}\nTelefon: ${phone}\n\n${products}\n\nJami: $${total}`;

    const telegramText = encodeURIComponent(message);

    toast("Buyurtma ma'lumotlari tayyorlandi!");

    $("orderModal").classList.remove("show");
    closePanels();

    const mail = "mailto:hello@nexora.uz?subject=" +
        encodeURIComponent("NEXORA buyurtma") +
        "&body=" + telegramText;

    window.location.href = mail;
};

updateCart();
