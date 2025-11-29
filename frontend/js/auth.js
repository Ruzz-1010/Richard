class Auth {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user'));
        this.demoMode = true; // Enable demo mode
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.token !== null;
    }

    // Check if user is admin
    isAdmin() {
        return this.user && this.user.role === 'admin';
    }

    // Login function with demo fallback
    async login(email, password) {
        // Demo mode - accept any credentials
        if (this.demoMode) {
            const isAdmin = email.includes('admin');
            
            this.token = 'demo-token-' + Date.now();
            this.user = {
                id: 'demo-id',
                name: isAdmin ? 'Admin User' : 'Regular User',
                email: email,
                role: isAdmin ? 'admin' : 'user'
            };
            
            localStorage.setItem('token', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));
            
            return { 
                success: true, 
                user: this.user,
                message: 'Demo login successful' 
            };
        }

        // Real API call
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
            console.log('API login failed, using demo mode');
            // Fallback to demo mode
            return this.login(email, password);
        }
    }

    // Register function with demo fallback
    async register(name, email, password, role = 'user') {
        // Demo mode
        if (this.demoMode) {
            this.token = 'demo-token-' + Date.now();
            this.user = {
                id: 'demo-id',
                name: name,
                email: email,
                role: role
            };
            
            localStorage.setItem('token', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));
            
            return { 
                success: true, 
                user: this.user,
                message: 'Demo registration successful' 
            };
        }

        // Real API call
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
            console.log('API register failed, using demo mode');
            // Fallback to demo mode
            return this.register(name, email, password, role);
        }
    }

    // Logout function
    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    // Get auth headers for API calls
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
}

// Create global auth instance
const auth = new Auth();