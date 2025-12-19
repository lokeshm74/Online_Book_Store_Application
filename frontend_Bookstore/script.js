// User state
let currentUser = null;
let users = JSON.parse(localStorage.getItem("users")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let orders = JSON.parse(localStorage.getItem("orders")) || [];
let books = JSON.parse(localStorage.getItem("books")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let selectedPaymentMethod = "";
let selectedUpiApp = "";

// NEW: Enhanced payment and address functions
function showAddressSection() {
  const cartItems = document.getElementById("cart_list").children.length;
  if (cartItems === 0) {
    alert("Your cart is empty! Add some books before proceeding to payment.");
    return;
  }
  document.getElementById("cart-section").style.display = "none";
  document.getElementById("address-section").style.display = "block";
}

function closeAddressSection() {
  document.getElementById("address-section").style.display = "none";
  document.getElementById("cart-section").style.display = "block";
}

function showPaymentOptions() {
  // Validate address form
  const name = document.getElementById("deliveryName").value;
  const phone = document.getElementById("deliveryPhone").value;
  const address1 = document.getElementById("addressLine1").value;
  const address2 = document.getElementById("addressLine2").value;
  const city = document.getElementById("city").value;
  const state = document.getElementById("state").value;
  const pincode = document.getElementById("pincode").value;

  if (
    !name ||
    !phone ||
    !address1 ||
    !address2 ||
    !city ||
    !state ||
    !pincode
  ) {
    showNotification("Please fill all required address fields!", "error");
    return;
  }

  document.getElementById("address-section").style.display = "none";
  document.getElementById("payment-options-section").style.display = "block";
}

function closePaymentOptions() {
  document.getElementById("payment-options-section").style.display = "none";
  document.getElementById("address-section").style.display = "block";
}

function selectPaymentMethod(method) {
  selectedPaymentMethod = method;
  document.querySelectorAll(".payment-method").forEach((pm) => {
    pm.classList.remove("selected");
  });
  event.currentTarget.classList.add("selected");

  // Update radio button
  document.getElementById(method + "Payment").checked = true;
}

function proceedToSelectedPayment() {
  if (!selectedPaymentMethod) {
    showNotification("Please select a payment method!", "error");
    return;
  }

  document.getElementById("payment-options-section").style.display = "none";

  switch (selectedPaymentMethod) {
    case "card":
      document.getElementById("card-payment-section").style.display = "block";
      break;
    case "upi":
      document.getElementById("upi-payment-section").style.display = "block";
      break;
    case "razorpay":
      processRazorpayPayment();
      break;
    case "cod":
      processCodPayment();
      break;
  }
}

function closeCardPayment() {
  document.getElementById("card-payment-section").style.display = "none";
  document.getElementById("payment-options-section").style.display = "block";
}

function closeUpiPayment() {
  document.getElementById("upi-payment-section").style.display = "none";
  document.getElementById("payment-options-section").style.display = "block";
}

function selectUpiApp(app) {
  selectedUpiApp = app;
  document.querySelectorAll(".upi-app").forEach((ua) => {
    ua.classList.remove("selected");
  });
  event.currentTarget.classList.add("selected");
}

function processUpiPayment() {
  const upiId = document.getElementById("upiId").value;
  if (!upiId) {
    showNotification("Please enter UPI ID!", "error");
    return;
  }
  if (!selectedUpiApp) {
    showNotification("Please select a UPI app!", "error");
    return;
  }

  showNotification(`UPI payment initiated via ${selectedUpiApp}!`, "success");
  completeOrder("upi");
}

// NEW: Enhanced payment processing functions
function processCardPayment() {
  const cardNumber = document.getElementById("cardNumber").value;
  const cardHolder = document.getElementById("cardHolderName").value;
  const expiry = document.getElementById("cardExpiry").value;
  const cvv = document.getElementById("cardCvv").value;

  if (!cardNumber || !cardHolder || !expiry || !cvv) {
    showNotification("Please fill all card details!", "error");
    return;
  }

  showNotification("Card payment processed successfully!", "success");
  completeOrder("card");
}

function processRazorpayPayment() {
  const totalAmount = parseInt(
    document.getElementById("totalAmount").textContent.replace("₹", "")
  );

  showNotification("Redirecting to Razorpay...", "success");

  // Simulate Razorpay payment process
  setTimeout(() => {
    showNotification("Razorpay payment completed successfully!", "success");
    completeOrder("razorpay");
  }, 2000);
}

// cash on delivery
function processCodPayment() {
  showNotification(
    "Order placed successfully! Pay when you receive your books.",
    "success"
  );
  completeOrder("cod");
}

// if user not login it gives message to login to complete order

function completeOrder(paymentMethod) {
  if (!currentUser) {
    showNotification("Please login to complete purchase!", "error");
    showSection("auth");
    return;
  }

  const cartItems = Array.from(document.querySelectorAll("#cart_list li")).map(
    (li) => {
      return {
        title: li.querySelector("h1").textContent,
        price: parseInt(
          li.querySelector(".total-price").textContent.replace("Total: ₹", "")
        ),
        quantity: parseInt(li.querySelector(".quantity").textContent),
      };
    }
  );

  const totalAmount = parseInt(
    document.getElementById("totalAmount").textContent.replace("₹", "")
  );

  // Get address details
  const address = {
    name: document.getElementById("deliveryName").value,
    phone: document.getElementById("deliveryPhone").value,
    addressLine1: document.getElementById("addressLine1").value,
    addressLine2: document.getElementById("addressLine2").value,
    city: document.getElementById("city").value,
    state: document.getElementById("state").value,
    pincode: document.getElementById("pincode").value,
    landmark: document.getElementById("landmark").value,
  };

  createOrder(cartItems, totalAmount, paymentMethod, address);

  // Clear cart and reset forms
  document.getElementById("cart_list").innerHTML = "";
  document.querySelector(".cart_count").textContent = "0";
  document.getElementById("cartTotal").style.display = "none";
  document.getElementById("address-section").style.display = "none";
  document.getElementById("card-payment-section").style.display = "none";
  document.getElementById("upi-payment-section").style.display = "none";

  showSection("home");
}

// UPDATED: Order function to include payment method and address
function createOrder(
  cartItems,
  totalAmount,
  paymentMethod = "card",
  address = {}
) {
  if (!currentUser) return;

  const order = {
    id: Date.now(),
    userId: currentUser.id,
    items: cartItems,
    totalAmount,
    paymentMethod: paymentMethod,
    address: address,
    date: new Date().toISOString(),
    status: paymentMethod === "cod" ? "pending" : "completed",
  };

  orders.push(order);
  localStorage.setItem("orders", JSON.stringify(orders));
  loadOrderHistory();
}

// UPDATED: Enhanced section management to include new sections
function showSection(section) {
  // Hide all sections
  const sections = [
    "home",
    "books",
    "about",
    "contact",
    "cart",
    "payment",
    "auth",
    "wishlist",
    "orders",
    "address",
    "payment-options",
    "card-payment",
    "upi-payment",
  ];
  sections.forEach((sec) => {
    const element = document.getElementById(sec + "-section");
    if (element) element.style.display = "none";
  });

  // Show selected section
  const targetSection = document.getElementById(section + "-section");
  if (targetSection) {
    targetSection.style.display = "block";

    // Load section-specific data
    if (section === "wishlist") loadWishlist();
    if (section === "orders") loadOrderHistory();
    if (section === "books") {
      if (document.getElementById("books-by-category").innerHTML === "") {
        loadBooks();
      }
    }
  }

  // Update active nav
  document.querySelectorAll(".navbar a").forEach((link) => {
    link.classList.remove("nav-active");
  });
  if (event && event.target) {
    event.target.classList.add("nav-active");
  }
}

// Keep all your existing functions exactly as they were...
// Authentication functions
function showAuthTab(tab) {
  document
    .querySelectorAll(".auth-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".auth-content")
    .forEach((c) => c.classList.remove("active"));

  event.target.classList.add("active");
  document.getElementById(tab + "-content").classList.add("active");
}

function register() {
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  if (users.find((u) => u.email === email)) {
    showNotification("User already exists!", "error");
    return;
  }

  const user = { id: Date.now(), name, email, password };
  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));

  showNotification("Registration successful! Please login.", "success");
  showAuthTab("login");
}

function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const user = users.find((u) => u.email === email && u.password === password);
  if (user) {
    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
    updateUI();
    showSection("home");
    showNotification("Login successful!", "success");
  } else {
    showNotification("Invalid credentials!", "error");
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  updateUI();
  showSection("home");
  showNotification("Logged out successfully!", "success");
}

function updateUI() {
  if (currentUser) {
    document.getElementById("authButtons").style.display = "none";
    document.getElementById("userProfile").style.display = "flex";
    document.getElementById("userName").textContent = currentUser.name;
    document.getElementById("auth-section").style.display = "none";
  } else {
    document.getElementById("authButtons").style.display = "block";
    document.getElementById("userProfile").style.display = "none";
  }
}

function toggleUserDropdown() {
  const dropdown = document.getElementById("userDropdown");
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
}

// Close dropdown when clicking outside
window.onclick = function (event) {
  if (!event.target.matches("#userName")) {
    const dropdown = document.getElementById("userDropdown");
    if (dropdown) {
      dropdown.style.display = "none";
    }
  }
};

// Wishlist functions
function toggleWishlist(bookId) {
  if (!currentUser) {
    showNotification("Please login to use wishlist!", "error");
    return;
  }

  const index = wishlist.findIndex(
    (item) => item.bookId === bookId && item.userId === currentUser.id
  );
  if (index > -1) {
    wishlist.splice(index, 1);
    showNotification("Removed from wishlist!", "success");
  } else {
    wishlist.push({ id: Date.now(), bookId, userId: currentUser.id });
    showNotification("Added to wishlist!", "success");
  }
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  loadWishlist();
}

function loadWishlist() {
  if (!currentUser) return;

  const userWishlist = wishlist.filter(
    (item) => item.userId === currentUser.id
  );
  const container = document.getElementById("wishlist-books");
  container.innerHTML = "";

  userWishlist.forEach((item) => {
    const book = books.find((b) => b.id === item.bookId);
    if (book) {
      container.innerHTML += createBookHTML(book, true);
    }
  });
}

// Search functionality
function searchBooks() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const searchResults = document.getElementById("search-results");
  const booksContainer = document.getElementById("books-by-category");

  if (query.length < 2) {
    searchResults.style.display = "none";
    booksContainer.style.display = "block";
    return;
  }

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.categories.some((cat) => cat.toLowerCase().includes(query))
  );

  searchResults.innerHTML = `
          <h3>Search Results for "${query}" (${filteredBooks.length} found)</h3>
          <div class="books-grid">
            ${filteredBooks.map((book) => createBookHTML(book)).join("")}
          </div>
        `;

  searchResults.style.display = "block";
  booksContainer.style.display = "none";
}

function loadOrderHistory() {
  if (!currentUser) return;

  const userOrders = orders.filter((order) => order.userId === currentUser.id);
  const container = document.getElementById("orders-list");
  container.innerHTML = "";

  userOrders.forEach((order) => {
    container.innerHTML += `
            <div class="order-card">
              <h4>Order #${order.id}</h4>
              <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
              <p>Total: ₹${order.totalAmount}</p>
              <p>Status: ${order.status}</p>
              <p>Payment: ${order.paymentMethod || "card"}</p>
              <div class="order-address">
                <p><strong>Delivery Address:</strong></p>
                <p>${order.address.name}, ${order.address.phone}</p>
                <p>${order.address.addressLine1}, ${
      order.address.addressLine2
    }</p>
                <p>${order.address.city}, ${order.address.state} - ${
      order.address.pincode
    }</p>
              </div>
              <div>
                ${order.items
                  .map(
                    (item) =>
                      `<div>${item.title} - ₹${item.price} x ${item.quantity}</div>`
                  )
                  .join("")}
              </div>
            </div>
          `;
  });
}

// Notification system
function showNotification(message, type = "success") {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.style.background = type === "success" ? "#27ae60" : "#e74c3c";
  notification.style.display = "block";

  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

// Cart notification system
function showCartNotification(bookTitle) {
  const notification = document.getElementById("cartNotification");
  notification.textContent = `"${bookTitle}" added to cart!`;
  notification.style.display = "block";

  setTimeout(() => {
    notification.style.display = "none";
  }, 2000);
}

// Enhanced book HTML creation
function createBookHTML(book, isWishlist = false) {
  const inWishlist = wishlist.some(
    (item) => item.bookId === book.id && item.userId === currentUser?.id
  );

  return `
          <div class="container" data-category="${
            book.categories[0] || "Uncategorized"
          }">
            <div class="tooltip">
              <img src="${book.imageUrl}" alt="${book.title}" class="book" />
              <div class="tooltiptext">${book.title}</div>
            </div>
            <span class="bookname">${book.title}</span><br />
            <span class="price">₹${book.price}</span>
            <p class="text" style="display: none">
              Author: ${book.author}<br>
              ${book.description}
            </p>
            <div style="margin: 10px 0;">
              <button class="cartbutton" onclick="addCart(this)">Add to cart</button>
              <button class="wishlist-btn ${
                inWishlist ? "active" : ""
              }" onclick="toggleWishlist(${book.id})">
                ${inWishlist ? "❤️" : "🤍"}
              </button>
            </div>
            <button class="aboutbutton" onclick="showAbout(this)">About</button>
            ${
              !isWishlist
                ? `<button onclick="showReviews(${book.id})" style="background: #95a5a6; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin: 5px;">
              Reviews
            </button>`
                : ""
            }
          </div>
        `;
}

// Enhanced payment processing (original function)
function processPayment() {
  if (!currentUser) {
    showNotification("Please login to complete purchase!", "error");
    showSection("auth");
    return;
  }

  const cartItems = Array.from(document.querySelectorAll("#cart_list li")).map(
    (li) => {
      return {
        title: li.querySelector("h1").textContent,
        price: parseInt(
          li.querySelector(".total-price").textContent.replace("Total: ₹", "")
        ),
        quantity: parseInt(li.querySelector(".quantity").textContent),
      };
    }
  );

  const totalAmount = parseInt(
    document.getElementById("totalAmount").textContent.replace("₹", "")
  );

  createOrder(cartItems, totalAmount, "card", {});

  // Clear cart
  document.getElementById("").innerHTML = "";
  document.querySelector(".cart_count").textContent = "0";
  document.getElementById("cartTotal").style.display = "none";

  showNotification(
    "Order placed successfully! Thank you for your purchase.",
    "success"
  );
  closePayment();
  showSection("home");
}

// Initialize
window.onload = function () {
  // Load current user
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
  }

  updateUI();
  showSection("home");
  addSortingButtons();

  // Load initial data
  if (books.length === 0) {
    // Load default books from backend
    loadBooks();
  }
};

// Payment functions (original)
function showPayment() {
  const cartItems = document.getElementById("cart_list").children.length;
  if (cartItems === 0) {
    alert("Your cart is empty! Add some books before proceeding to payment.");
    return;
  }
  document.getElementById("cart-section").style.display = "none";
  document.getElementById("payment-section").style.display = "block";
}

function closePayment() {
  document.getElementById("payment-section").style.display = "none";
  document.getElementById("cart-section").style.display = "block";
}

// Category rows display
function showCategoryRows() {
  const container = document.getElementById("books-by-category");
  container.innerHTML = "";

  loadBooks("", true);
}

function showAllBooks() {
  const container = document.getElementById("books-by-category");
  container.innerHTML = "";
  loadBooks("", false);
}

// CHANGED: Modified function to load books with category filtering
async function loadBooks(order = "") {
  try {
    const res = await fetch(`http://localhost:8084/api/books?sort=${order}`);
    const data = await res.json();

    const container = document.getElementById("books-by-category");
    container.innerHTML = "";

    // Create a single grid container for ALL books
    const booksGrid = document.createElement("div");
    booksGrid.className = "books-grid";

    container.appendChild(booksGrid);

    let allBooks = [];
    let allCategories = new Set(); // To collect unique categories

    // Check if data is an array (no categories) or object (with categories)
    if (Array.isArray(data)) {
      // Backend returns simple array of books
      allBooks = data;
      // Extract categories from books
      data.forEach((book) => {
        if (book.categories && book.categories.length > 0) {
          book.categories.forEach((cat) => allCategories.add(cat));
        }
      });
    } else {
      // Backend returns object with categories
      for (const [category, books] of Object.entries(data)) {
        allBooks = allBooks.concat(books);
        allCategories.add(category);
        // Add category to each book
        books.forEach((book) => {
          book.category = category;
        });
      }
    }

    // Add category filter dropdown
    addCategoryFilter(Array.from(allCategories));

    // Add ALL books to the single grid
    allBooks.forEach((book) => {
      // Use the first category for filtering
      const bookCategory =
        book.category ||
        (book.categories && book.categories[0]) ||
        "Uncategorized";

      booksGrid.innerHTML += `
              <div class="container" data-category="${bookCategory}">
                <div class="tooltip">
                  <img src="${book.imageUrl}" alt="${book.title}" class="book" />
                  <div class="tooltiptext">${book.title}</div>
                </div>
                <span class="bookname">${book.title}</span><br />
                <span class="price">₹${book.price}</span>
                <p class="text" style="display: none">
                  Author: ${book.author}
                </p>
                <button class="cartbutton" onclick="addCart(this)">Add to cart</button>
                <button class="aboutbutton" onclick="showAbout(this)">About</button>
              </div>
            `;
    });
  } catch (error) {
    console.error("Error loading books:", error);
  }
}

// Function to add category filter options
function addCategoryFilter(categories) {
  const categoryFilter = document.getElementById("categoryFilter");

  // Add all categories to the filter dropdown
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// Function to filter books by category
function filterBooksByCategory() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  const allBooks = document.querySelectorAll(".books-grid .container");

  allBooks.forEach((book) => {
    const bookCategory = book.getAttribute("data-category");

    if (selectedCategory === "all" || bookCategory === selectedCategory) {
      book.style.display = "block";
    } else {
      book.style.display = "none";
    }
  });
}

// Add sorting buttons to your HTML
function addSortingButtons() {
  const sortingDiv = document.createElement("div");
  sortingDiv.innerHTML = `
          <button onclick="loadBooks('asc')" style="background: #3498db; color: white; padding: 8px 15px; border: none; border-radius: 5px; cursor: pointer; margin: 10px;">Price Low to High</button>
          <button onclick="loadBooks('desc')" style="background: #3498db; color: white; padding: 8px 15px; border: none; border-radius: 5px; cursor: pointer; margin: 10px;">Price High to Low</button>
        `;
  document.body.insertBefore(sortingDiv, document.querySelector(".navbar"));
}

// Function to fetch recommended books from backend
async function fetchRecommendedBooks(bookTitle) {
  try {
    // Send request to backend for recommended books
    const response = await fetch(
      `http://localhost:8084/api/books/recommended?title=${encodeURIComponent(
        bookTitle
      )}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch recommendations");
    }

    const recommendedBooks = await response.json();

    // Display recommended books inside cart
    displayRecommendedBooks(recommendedBooks);
  } catch (error) {
    console.error("Error fetching recommended books:", error);
    // Optional: Show some fallback recommendations
    showFallbackRecommendations(bookTitle);
  }
}

function displayRecommendedBooks(books) {
  console.log("Displaying recommended books:", books);

  // FIXED: Use the correct IDs that match the HTML
  const recommendedSection = document.getElementById("recommendedBooks");
  const recommendedContainer = document.getElementById("recommendedContainer");

  console.log("🔍 Section element:", recommendedSection);
  console.log("🔍 Container element:", recommendedContainer);

  if (!books || books.length === 0) {
    console.log("No books to display");
    if (recommendedSection) {
      recommendedSection.style.display = "none";
    }
    return;
  }

  console.log("✅ Found books, clearing container...");
  // Clear previous recommendations
  if (recommendedContainer) {
    recommendedContainer.innerHTML = "";
  }

  // Add each recommended book
  books.forEach((book) => {
    console.log(" Adding book:", book.title);
    if (recommendedContainer) {
      // FIX: Escape special characters in book title and image URL
      const safeTitle = book.title.replace(/'/g, "\\'").replace(/"/g, '\\"');
      const safeImageUrl = book.imageUrl
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');

      recommendedContainer.innerHTML += `
              <div class="recommended-book">
                <img src="${book.imageUrl}" alt="${book.title}" />
                <h4>${book.title}</h4>
                <p style="color: #e74c3c; font-weight: bold;">₹${book.price}</p>
                <button 
                  style="background: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;"
                  onclick="addRecommendedToCart('${safeTitle}', ${book.price}, '${safeImageUrl}')"
                >
                  Add to Cart
                </button>
              </div>
            `;
    }
  });

  console.log(" Showing recommended section");
  // Show the recommended section
  if (recommendedSection) {
    recommendedSection.style.display = "block";
  }

  // Debug: Check if section is visible
  setTimeout(() => {
    console.log(
      " Section display style:",
      recommendedSection ? recommendedSection.style.display : "N/A"
    );
    console.log(
      " Section visibility:",
      recommendedSection
        ? window.getComputedStyle(recommendedSection).display
        : "N/A"
    );
  }, 100);
}

// Fallback function if recommendations fail
function showFallbackRecommendations(bookTitle) {
  console.log("Using fallback recommendations for:", bookTitle);
  const recommendedSection = document.getElementById("recommendedBooks");
  if (recommendedSection) {
    recommendedSection.style.display = "none";
  }
}

// Function to add recommended books directly to cart
function addRecommendedToCart(title, price, imageUrl) {
  const cartlist = document.getElementById("");

  let li = document.createElement("li");
  li.innerHTML = `
          <div class="inside_cart_oneblock">
            <img src="${imageUrl}" style="margin:20px; margin-left:35px; width: 80px; height: 100px; object-fit: cover;" />
            <div class="bookname_price">
              <h1>${title}</h1>
              <p><b>Price:</b> ₹${price}</p>
            </div>
            <div class="increase_button">
              <button onclick="decrease(this)">-</button>
              <span class="quantity">1</span>
              <button onclick="increase(this)">+</button>
              <span class="total-price">Total: ₹${price}</span>
              <button onclick="remove(this)">Remove</button>
            </div>
          </div>
        `;

  // Store the unit price as data attribute
  li.querySelector(".increase_button").setAttribute("data-price", price);

  cartlist.appendChild(li);

  // Update cart count
  let cartCountElem = document.querySelector(".cart_count");
  cartCountElem.textContent = parseInt(cartCountElem.textContent) + 1;

  // Update total amount
  updateTotalAmount();

  // Show success message
  showCartNotification(title);
}

//about the book
function showAbout(button) {
  document.querySelectorAll(".container").forEach((container) => {
    container.style.display = "none";
  });
  let currentContainer = button.closest(".container");
  currentContainer.style.display = "block";
  let textPara = currentContainer.querySelector(".text");
  if (textPara) {
    textPara.style.display = "block";
    textPara.classList.add("adjust");
  }
}

// Function to calculate and update total amount
function updateTotalAmount() {
  const cartItems = document.querySelectorAll("#cart_list li");
  let total = 0;

  cartItems.forEach((item) => {
    const totalPriceElement = item.querySelector(".total-price");
    if (totalPriceElement) {
      const priceText = totalPriceElement.textContent;
      const price = parseInt(priceText.replace("Total: ₹", ""));
      total += price;
    }
  });

  const totalAmountElement = document.getElementById("totalAmount");
  const cartTotalElement = document.getElementById("cartTotal");

  totalAmountElement.textContent = `₹${total}`;

  // Show/hide total amount section based on cart items
  if (cartItems.length > 0) {
    cartTotalElement.style.display = "block";
  } else {
    cartTotalElement.style.display = "none";
  }
}

function addCart(button) {
  console.log("🛒 Add to cart clicked");
  const container = button.closest(".container");
  const cart_book_name = container.querySelector(".bookname").textContent;
  const cart_book = container.querySelector(".book").src;
  const priceText = container.querySelector(".price").textContent;

  console.log("📖 Book added to cart:", cart_book_name);

  // when we click the addcart button the button becomes the opencart like this
  // and about button turns into the goto cart button

  const addcartbutton = container.querySelector(".cartbutton");
  addcartbutton.innerHTML = "open cart";
  addcartbutton.setAttribute("onclick", "opencart()");

  // Extract numeric price from "₹50" format
  const price = parseInt(priceText.replace("₹", ""));

  const cartlist = document.getElementById("cart_list");

  let li = document.createElement("li");
  li.innerHTML = `
          <div class="inside_cart_oneblock">
            <img src="${cart_book}" style="margin:20px; margin-left:35px;" />
            <div class="bookname_price">
              <h1>${cart_book_name}</h1>
              <p><b>Price:</b> ₹${price}</p>
            </div>
            <div class="increase_button">
              <button onclick="decrease(this)">-</button>
              <span class="quantity">1</span>
              <button onclick="increase(this)">+</button>
              <span class="total-price">Total: ₹${price}</span>
              <button onclick="remove(this)">Remove</button>
            </div>
          </div>
        `;

  // Store the unit price as data attribute
  li.querySelector(".increase_button").setAttribute("data-price", price);

  cartlist.appendChild(li);

  // Update cart count
  let cartCountElem = document.querySelector(".cart_count");
  cartCountElem.textContent = parseInt(cartCountElem.textContent) + 1;

  // Update total amount
  updateTotalAmount();

  // Show cart notification
  showCartNotification(cart_book_name);

  //Fetch and show recommended books INSIDE the cart
  console.log("🔍 Fetching recommendations for:", cart_book_name);
  fetchRecommendedBooks(cart_book_name);
}

function decrease(button) {
  let buttonDiv = button.closest(".increase_button");
  let quantitySpan = buttonDiv.querySelector(".quantity");
  let totalPriceSpan = buttonDiv.querySelector(".total-price");
  let price = parseInt(buttonDiv.getAttribute("data-price"));

  let qty = parseInt(quantitySpan.textContent);
  if (qty > 1) {
    qty = qty - 1;
    quantitySpan.textContent = qty;
    totalPriceSpan.textContent = `Total: ₹${price * qty}`;

    // Update total amount after decreasing quantity
    updateTotalAmount();
  }
}

function increase(button) {
  let buttonDiv = button.closest(".increase_button");
  let quantitySpan = buttonDiv.querySelector(".quantity");
  let totalPriceSpan = buttonDiv.querySelector(".total-price");
  let price = parseInt(buttonDiv.getAttribute("data-price"));

  let qty = parseInt(quantitySpan.textContent);
  qty = qty + 1;
  quantitySpan.textContent = qty;
  totalPriceSpan.textContent = `Total: ₹${price * qty}`;

  // Update total amount after increasing quantity
  updateTotalAmount();
}

function remove(button) {
  let li = button.closest("li");
  li.remove();

  // Update cart count
  let cartCountElem = document.querySelector(".cart_count");
  cartCountElem.textContent = parseInt(cartCountElem.textContent) - 1;

  // Update total amount after removing item
  updateTotalAmount();
}

function opencart() {
  document.querySelectorAll(".container").forEach((container) => {
    container.style.display = "none";
  });
  document.getElementById("cart-section").style.display = "block";

  let cartCountElem = document.getElementById("cart_list").children.length;
  if (cartCountElem === 0) {
    alert("Your Cart Is Empty");
  }

  // Update total amount when opening cart
  updateTotalAmount();
}

function closeCart() {
  document.getElementById("cart-section").style.display = "none";
  document.querySelectorAll(".container").forEach((container) => {
    container.style.display = "block";
  });
}
