//Lógica del Carrito de Compras

// Inicialización del carrito obteniendo datos guardados en localStorage o asignando un array vacío
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Selección de elementos HTML necesarios para la interfaz del carrito
const modalContainer = document.getElementById("modal-container");
const modalOverlay = document.getElementById("modal-overlay");
const cartBtn = document.getElementById("cart-btn");
const cartCounter = document.getElementById("cart-counter");

// Función para guardar el carrito en localStorage
const saveCart = () => {
  localStorage.setItem("cart", JSON.stringify(cart));
};

// Función para actualizar el contador del carrito en la interfaz
const updateCartCounter = () => {
  const totalQuanty = cart.reduce((acc, prod) => acc + prod.quanty, 0);
  cartCounter.textContent = totalQuanty;
  cartCounter.style.display = totalQuanty > 0 ? "block" : "none";
};

// Muestra el carrito en un modal
const displayCart = () => {
  modalContainer.innerHTML = ""; // Limpiar el contenido previo del modal
  modalContainer.style.display = "block";
  modalOverlay.style.display = "block";

  // modal Header, Creación del encabezado del modal
  const modalHeader = document.createElement("div");
  modalHeader.className = "modal-header";

  const modalClose = document.createElement("div");
  modalClose.innerText = "X";
  modalClose.className = "modal-close";
  modalHeader.append(modalClose);

  // Cierra el modal al hacer clic en la "X"
  modalClose.addEventListener("click", () => {
    modalContainer.style.display = "none";
    modalOverlay.style.display = "none";
  });
  ;

  const modalTitle = document.createElement("div");
  modalTitle.innerText = "Carrito";
  modalTitle.className = "modal-title";
  modalHeader.append(modalTitle);

  modalContainer.append(modalHeader);

  // modal Body, Muestra los productos si el carrito no está vacío
  if (cart.length > 0) {
    cart.forEach((product) => {
      const modalBody = document.createElement("div");
      modalBody.className = "modal-body";
      modalBody.innerHTML = `
        <div class="product">
            <img class="product-img" src="${product.img}" />
            <div class="product-info">
                <h4>${product.productName}</h4>
            </div>
            <div class="quantity">
                <span class="quantity-btn-decrease">-</span>
                <span class="quantity-input">${product.quanty}</span>
                <span class="quantity-btn-increase">+</span>
            </div>
            <div class="price pl-1">${product.price * product.quanty} $</div>
            <div class="delete-product m-1">X</div>
        </div>
      `;
      modalContainer.append(modalBody);

       // Disminuye la cantidad de producto o lo elimina si es 1
      const decrese = modalBody.querySelector(".quantity-btn-decrease");
      decrese.addEventListener("click", () => {
        if (product.quanty > 1) {
          product.quanty--;
          updateProductQuantity(product.id, product.quanty); // Optimización
        } else {
          deleteCartProduct(product.id);
        }
      });

      // Aumenta la cantidad del producto
      const increse = modalBody.querySelector(".quantity-btn-increase");
      increse.addEventListener("click", () => {
        product.quanty++;
        updateProductQuantity(product.id, product.quanty); // Optimización
      });

      // Elimina el producto del carrito
      const deleteProduct = modalBody.querySelector(".delete-product");
      deleteProduct.addEventListener("click", () => {
        deleteCartProduct(product.id);
      });
    });

    // modal Footer, Pie del modal con el total y botón de pago
    const modalFooter = document.createElement("div");
    modalFooter.className = "modal-footer";
    modalFooter.innerHTML = `
      <div class="total-price">Total: ${calculateTotalPrice()} $</div>
      <button class="btn" id="checkout-btn">Ir a pagar</button>
      <div id="wallet_container"></div>
    `;
    modalContainer.append(modalFooter);

    // Configuración de MercadoPago para el botón de pago
    const mp = new MercadoPago("APP_USR-50a86a18-e45d-4225-b49a-fc1f782a6bb6", {
      locale: "es-AR",
    });

    const checkoutBtn = document.getElementById("checkout-btn");
    checkoutBtn.addEventListener("click", () => handleCheckout(mp));
  } else {
     // Mensaje cuando el carrito está vacío
    const emptyCartMessage = document.createElement("div");
    emptyCartMessage.className = "empty-cart";
    emptyCartMessage.innerHTML = `<h4>Tu carrito está vacío</h4>`;
    modalContainer.append(emptyCartMessage);
  }
};


// Actualiza la cantidad de un producto específico en el carrito
const updateProductQuantity = (id, quanty) => {
  const product = cart.find((item) => item.id === id);
  if (product) {
    product.quanty = quanty;
    saveCart();
    displayCart();
    updateCartCounter();
  }
};


// Elimina un producto del carrito por su id
const deleteCartProduct = (id) => {
  cart = cart.filter((product) => product.id !== id);
  saveCart();
  displayCart();
  updateCartCounter();
};


// Calcula el precio total del carrito
const calculateTotalPrice = () => {
  return cart.reduce((acc, product) => acc + product.price * product.quanty, 0);
};

// Función de checkout, Maneja el proceso de pago utilizando la API de MercadoPago
const handleCheckout = async (mp) => {
  const total = calculateTotalPrice();
  if (total === 0) {
    alert("No puedes proceder con el pago de un carrito vacío");
    return;
  }

  
  // Creación de preferencia de pago
  try {
    const response = await fetch("http://localhost:3000/create_preference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: generateCartDescription(),
        quantity: 1,
        price: total,
      }),
    });

    const preference = await response.json();
    createCheckoutButton(mp, preference.id);
  } catch (error) {
    console.error("Error:", error);
    alert("Hubo un error al crear la preferencia de pago.");
  }
};


// Crea el botón de pago en el contenedor "wallet_container"
const createCheckoutButton = (mp, preferenceId) => {
  // Limpiar el contenedor antes de crear un nuevo botón
  const walletContainer = document.getElementById("wallet_container");
  walletContainer.innerHTML = '';
  
  const bricksBuilder = mp.bricks();
  bricksBuilder.create("wallet", "wallet_container", {
    initialization: {
      preferenceId,
    },
  });
};


// Genera una descripción del carrito para el proceso de pago
const generateCartDescription = () => {
  return cart
    .map((product) => `${product.productName} (x${product.quanty})`)
    .join(", ");
};

// Event Listeners, Muestra el carrito al hacer clic en el botón del carrito
cartBtn.addEventListener("click", displayCart);

// Cerrar el modal al hacer clic fuera
// modalOverlay.addEventListener("click", (e) => {
//   if (e.target === modalOverlay) {
//     modalContainer.style.display = "none";
//     modalOverlay.style.display = "none";
//   }
// });

