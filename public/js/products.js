// Hàm tải danh sách sản phẩm
async function loadProductList(containerSelector, limit = null) {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        
        // Giới hạn số lượng sản phẩm nếu cần
        const displayProducts = limit ? products.slice(0, limit) : products;
        
        const container = document.querySelector(containerSelector);
        if (!container) return;
        
        if (displayProducts.length === 0) {
            container.innerHTML = '<div class="col-12 text-center">Không có sản phẩm nào.</div>';
            return;
        }
        
        container.innerHTML = displayProducts.map(product => `
            <div class="col-md-3 mb-4">
                <div class="card h-100">
                    <img src="${product.image || 'https://via.placeholder.com/300'}" class="card-img-top" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.description ? product.description.substring(0, 100) + '...' : ''}</p>
                        <p class="card-text text-primary fw-bold">${formatCurrency(product.price)}</p>
                    </div>
                    <div class="card-footer bg-white border-top-0">
                        <a href="/product-detail.html?id=${product.id}" class="btn btn-primary w-100">Xem chi tiết</a>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Lỗi khi tải sản phẩm:', error);
        const container = document.querySelector(containerSelector);
        if (container) {
            container.innerHTML = '<div class="col-12 text-center text-danger">Không thể tải sản phẩm. Vui lòng thử lại sau.</div>';
        }
    }
}

// Hàm tải chi tiết sản phẩm theo ID
async function loadProductDetail(productId, containerSelector) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        
        if (!response.ok) {
            throw new Error('Không tìm thấy sản phẩm');
        }
        
        const product = await response.json();
        document.title = `${product.name} | Cửa hàng trực tuyến`;
        
        const container = document.querySelector(containerSelector);
        if (!container) return;
        
        container.innerHTML = `
            <div class="row">
                <div class="col-md-5">
                    <img src="${product.image || 'https://via.placeholder.com/500'}" alt="${product.name}" class="img-fluid rounded">
                </div>
                <div class="col-md-7">
                    <h1>${product.name}</h1>
                    
                    <p class="fs-2 text-primary fw-bold">${formatCurrency(product.price)}</p>
                    
                    <div class="mb-4">
                        <p>${product.description || 'Không có mô tả chi tiết cho sản phẩm này.'}</p>
                    </div>
                    
                    <div class="mb-4">
                        <p>Tình trạng: <span class="badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}">${product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}</span></p>
                        ${product.category ? `<p>Danh mục: ${product.category}</p>` : ''}
                    </div>
                    
                    <div class="d-flex align-items-center mb-4">
                        <div class="input-group me-3" style="width: 120px;">
                            <button class="btn btn-outline-secondary" type="button" id="decrease-qty">-</button>
                            <input type="number" class="form-control text-center" id="quantity" value="1" min="1">
                            <button class="btn btn-outline-secondary" type="button" id="increase-qty">+</button>
                        </div>
                        
                        <button class="btn btn-primary" id="add-to-cart-btn" ${product.stock <= 0 ? 'disabled' : ''}>
                            Thêm vào giỏ hàng
                        </button>
                    </div>
                    
                    <div class="alert alert-danger" id="add-error" style="display: none;"></div>
                    <div class="alert alert-success" id="add-success" style="display: none;"></div>
                </div>
            </div>
        `;
        
        // Xử lý các nút tăng giảm số lượng
        const quantityInput = document.getElementById('quantity');
        const decreaseBtn = document.getElementById('decrease-qty');
        const increaseBtn = document.getElementById('increase-qty');
        
        decreaseBtn.addEventListener('click', () => {
            const currentQty = parseInt(quantityInput.value);
            if (currentQty > 1) {
                quantityInput.value = currentQty - 1;
            }
        });
        
        increaseBtn.addEventListener('click', () => {
            const currentQty = parseInt(quantityInput.value);
            quantityInput.value = currentQty + 1;
        });
        
        // Xử lý nút thêm vào giỏ hàng
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        addToCartBtn.addEventListener('click', () => addToCart(product.id));
        
        return product;
    } catch (error) {
        console.error('Lỗi khi tải chi tiết sản phẩm:', error);
        const container = document.querySelector(containerSelector);
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    ${error.message || 'Không thể tải chi tiết sản phẩm. Vui lòng thử lại sau.'}
                </div>
            `;
        }
        return null;
    }
}

// Hàm thêm sản phẩm vào giỏ hàng
async function addToCart(productId) {
    // Kiểm tra đăng nhập
    if (!isLoggedIn()) {
        window.location.href = '/login.html';
        return;
    }
    
    const quantity = parseInt(document.getElementById('quantity').value);
    const addError = document.getElementById('add-error');
    const addSuccess = document.getElementById('add-success');
    
    // Kiểm tra số lượng hợp lệ
    if (isNaN(quantity) || quantity < 1) {
        addError.textContent = 'Số lượng không hợp lệ';
        addError.style.display = 'block';
        addSuccess.style.display = 'none';
        return;
    }
    
    try {
        addError.style.display = 'none';
        
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, quantity })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Không thể thêm vào giỏ hàng');
        }
        
        // Hiển thị thông báo thành công
        addSuccess.textContent = 'Đã thêm sản phẩm vào giỏ hàng';
        addSuccess.style.display = 'block';
        
        // Cập nhật số lượng sản phẩm trong giỏ hàng ở header
        updateCartCount();
        
        // Đặt lại số lượng về 1
        document.getElementById('quantity').value = 1;
    } catch (error) {
        addError.textContent = error.message;
        addError.style.display = 'block';
        addSuccess.style.display = 'none';
    }
}

// Hàm định dạng tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}