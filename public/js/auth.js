// Kiểm tra xem người dùng đã đăng nhập chưa
function isLoggedIn() {
    return localStorage.getItem('user') !== null;
}

// Kiểm tra quyền admin
function isAdmin() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'admin';
}

// Kiểm tra xác thực và cập nhật giao diện
function checkAuth() {
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const userDropdown = document.getElementById('user-dropdown');
    const adminLink = document.getElementById('admin-link');
    
    if (isLoggedIn()) {
        // Ẩn liên kết đăng nhập và đăng ký
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        
        // Hiển thị dropdown người dùng
        if (userDropdown) {
            userDropdown.style.display = 'block';
            const user = JSON.parse(localStorage.getItem('user'));
            document.getElementById('username').textContent = user.name;
        }
        
        // Kiểm tra quyền admin để hiển thị liên kết quản trị
        if (adminLink && isAdmin()) {
            adminLink.style.display = 'block';
        }
        
        // Thêm sự kiện đăng xuất
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
        
        // Cập nhật số lượng sản phẩm trong giỏ hàng
        updateCartCount();
    } else {
        // Hiển thị liên kết đăng nhập và đăng ký
        if (loginLink) loginLink.style.display = 'block';
        if (registerLink) registerLink.style.display = 'block';
        
        // Ẩn dropdown người dùng
        if (userDropdown) userDropdown.style.display = 'none';
        
        // Ẩn liên kết quản trị
        if (adminLink) adminLink.style.display = 'none';
    }
}

// Kiểm tra quyền admin và chuyển hướng nếu không phải admin
function checkAdminAuth() {
    if (!isLoggedIn()) {
        window.location.href = '/login.html';
        return;
    }
    
    if (!isAdmin()) {
        window.location.href = '/';
        return;
    }
    
    // Hiển thị tên người dùng admin
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        const user = JSON.parse(localStorage.getItem('user'));
        usernameElement.textContent = user.name;
    }
    
    // Thêm sự kiện đăng xuất
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Cập nhật số lượng sản phẩm trong giỏ hàng
    updateCartCount();
}

// Đăng xuất
async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        localStorage.removeItem('user');
        window.location.href = '/';
    } catch (error) {
        console.error('Lỗi khi đăng xuất:', error);
        alert('Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.');
    }
}

// Cập nhật số lượng sản phẩm trong giỏ hàng
async function updateCartCount() {
    if (!isLoggedIn()) return;
    
    try {
        const response = await fetch('/api/cart');
        const cartItems = await response.json();
        
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = cartItems.length;
        }
    } catch (error) {
        console.error('Lỗi khi tải số lượng giỏ hàng:', error);
    }
}