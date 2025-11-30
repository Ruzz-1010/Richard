class Auth {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user')) || null;
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.token !== null && this.user !== null;
    }

    // Check if user is admin
    isAdmin() {
        return this.isLoggedIn() && this.user.role === 'admin';
    }

    // Login function
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    // Register function
    async register(name, email, password, role = 'user') {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password, role })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    // Logout function
logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login page
    window.location.href = '../login.html';
}

    // Get auth headers for API calls
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    // Update navigation
    updateNavigation() {
        const authSection = document.getElementById('authSection');
        if (!authSection) return;

        if (this.isLoggedIn()) {
            authSection.innerHTML = `
                <div class="user-info">
                    <span>Welcome, <strong>${this.user.name}</strong></span>
                    ${this.isAdmin() ? '<a href="admin/dashboard.html" class="btn btn-primary">Admin Dashboard</a>' : ''}
                    <button onclick="auth.logout()" class="btn btn-danger">Logout</button>
                </div>
            `;
        } else {
            authSection.innerHTML = `
                <div class="auth-buttons">
                    <a href="login.html" class="btn btn-primary">Login</a>
                    <a href="register.html" class="btn btn-secondary">Register</a>
                </div>
            `;
        }
    }
}

// Create global auth instance
const auth = new Auth();