// Tải giỏ hàng
async function loadCart() {
    const cartContainer = document.getElementById('cart-container');
    const checkoutForm = document.getElementById('checkout-form');
    
    if (!isLoggedIn()) {
        cartContainer.innerHTML = `
            <div class="alert alert-warning">
                Vui lòng <a href="/login.html">đăng nhập</a> để xem giỏ hàng của bạn.
            </div>
        `;
        if (checkoutForm) checkoutForm.style.display = 'none';
        return;
    }
    
    try {
        const response = await fetch('/api/cart');
        const cartItems = await response.json();
        
        if (cartItems.length === 0) {
            cartContainer.innerHTML = `
                <div class="alert alert-info">
                    Giỏ hàng của bạn đang trống. <a href="/products.html">Tiếp tục mua sắm</a>
                </div>
            `;
            if (checkoutForm) checkoutForm.style.display = 'none';
            return;
        }
        
        let totalPrice = 0;
        
        cartContainer.innerHTML = `
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Đơn giá</th>
                            <th>Số lượng</th>
                            <th>Thành tiền</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cartItems.map(item => {
                            const product = item.Product;
                            const itemTotal = product.price * item.quantity;
                            totalPrice += itemTotal;
                            
                            return `
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <img src="${product.image || 'https://via.placeholder.com/50'}" alt="${product.name}" class="img-thumbnail me-2" style="width: 50px;">
                                            <a href="/product-detail.html?id=${product.id}">${product.name}</a>
                                        </div>
                                    </td>
                                    <td>${formatCurrency(product.price)}</td>
                                    <td>
                                        <div class="input-group" style="width: 120px;">
                                            <button class="btn btn-outline-secondary btn-sm" onclick="updateQuantity(${item.id}, ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                                            <input type="text" class="form-control form-control-sm text-center" value="${item.quantity}" readonly>
                                            <button class="btn btn-outline-secondary btn-sm" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                                        </div>
                                    </td>
                                    <td>${formatCurrency(itemTotal)}</td>
                                    <td>
                                        <button class="btn btn-danger btn-sm" onclick="removeFromCart(${item.id})">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" class="text-end fw-bold">Tổng cộng:</td>
                            <td class="fw-bold">${formatCurrency(totalPrice)}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div class="d-flex justify-content-between mt-3">
                <a href="/products.html" class="btn btn-primary">Tiếp tục mua sắm</a>
                <a href="/checkout.html" class="btn btn-success">Thanh toán</a>
            </div>
        `;
        
        if (checkoutForm) checkoutForm.style.display = 'block';
    } catch (error) {
        console.error('Lỗi khi tải giỏ hàng:', error);
        cartContainer.innerHTML = '<div class="alert alert-danger">Không thể tải giỏ hàng. Vui lòng thử lại sau.</div>';
    }
}

// Cập nhật số lượng sản phẩm trong giỏ hàng
async function updateQuantity(itemId, newQuantity) {
    if (newQuantity < 1) return;
    
    try {
        const response = await fetch(`/api/cart/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity: newQuantity })
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message);
        }
        
        loadCart();
        updateCartCount();
    } catch (error) {
        console.error('Lỗi khi cập nhật số lượng:', error);
        alert('Không thể cập nhật số lượng: ' + error.message);
    }
}

// Xóa sản phẩm khỏi giỏ hàng
async function removeFromCart(itemId) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/cart/${itemId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message);
        }
        
        loadCart();
        updateCartCount();
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error);
        alert('Không thể xóa sản phẩm: ' + error.message);
    }
}

// Thực hiện thanh toán
async function checkout(address, phone) {
    try {
        const response = await fetch('/api/cart/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ address, phone })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Đặt hàng không thành công');
        }
        
        return data;
    } catch (error) {
        throw error;
    }
}

// Định dạng tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}