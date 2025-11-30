// Admin Dashboard Functions
class AdminDashboard {
    constructor() {
        this.stats = {};
        this.recentBookings = [];
        this.recentFeedback = [];
    }

    // Load dashboard data
    async loadDashboard() {
        try {
            console.log('Loading dashboard data...');
            
            const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
                headers: auth.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Dashboard data:', data);

            if (data.success) {
                this.stats = data.stats;
                this.recentBookings = data.recentBookings || [];
                this.recentFeedback = data.recentFeedback || [];
                
                this.updateStats();
                this.updateRecentBookings();
                this.updateRecentFeedback();
                this.updateSystemStatus('✅ Connected', '✅ Connected');
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.loadDemoData();
            this.updateSystemStatus('❌ Error', '❌ Error');
        }
    }

    // Update statistics
    updateStats() {
        const stats = this.stats;
        
        document.getElementById('totalRooms').textContent = stats.totalRooms || 0;
        document.getElementById('occupiedRooms').textContent = stats.occupiedRooms || 0;
        document.getElementById('availableRooms').textContent = stats.availableRooms || 0;
        document.getElementById('totalRevenue').textContent = `$${(stats.totalRevenue || 0).toLocaleString()}`;
        document.getElementById('totalBookings').textContent = stats.totalBookings || 0;
        document.getElementById('occupancyRate').textContent = `${stats.occupancyRate || 0}%`;

        // Update change indicators (demo data)
        document.getElementById('roomsChange').textContent = '+2%';
        document.getElementById('occupiedChange').textContent = '+5%';
        document.getElementById('availableChange').textContent = '-3%';
        document.getElementById('revenueChange').textContent = '+12%';
        document.getElementById('bookingsChange').textContent = '+8%';
        document.getElementById('occupancyChange').textContent = '+4%';

        document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
    }

    // Update recent bookings
    updateRecentBookings() {
        const container = document.getElementById('recentBookings');
        
        if (this.recentBookings.length === 0) {
            container.innerHTML = '<div class="activity-item"><span>No recent bookings</span></div>';
            return;
        }

        container.innerHTML = this.recentBookings.map(booking => `
            <div class="activity-item">
                <div style="flex: 1;">
                    <strong>${booking.userName}</strong>
                    <div style="font-size: 0.8rem; color: #666;">
                        ${booking.roomName} • ${new Date(booking.checkIn).toLocaleDateString()} - ${new Date(booking.checkOut).toLocaleDateString()}
                    </div>
                </div>
                <div>
                    <span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span>
                    <div class="activity-time">$${booking.totalPrice}</div>
                </div>
            </div>
        `).join('');
    }

    // Update recent feedback
    updateRecentFeedback() {
        const container = document.getElementById('recentFeedback');
        
        if (this.recentFeedback.length === 0) {
            container.innerHTML = '<div class="activity-item"><span>No recent feedback</span></div>';
            return;
        }

        container.innerHTML = this.recentFeedback.map(feedback => `
            <div class="activity-item">
                <div style="flex: 1;">
                    <strong>${feedback.userName}</strong>
                    <div style="font-size: 0.8rem; color: #666;">
                        ${'⭐'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}
                    </div>
                    <div style="font-size: 0.9rem; margin-top: 0.3rem;">${feedback.comment || 'No comment'}</div>
                </div>
                <div class="activity-time">${new Date(feedback.createdAt).toLocaleDateString()}</div>
            </div>
        `).join('');
    }

    // Update system status
    updateSystemStatus(apiStatus, dbStatus) {
        document.getElementById('apiStatus').textContent = apiStatus;
        document.getElementById('apiStatus').style.color = apiStatus.includes('✅') ? '#27ae60' : '#e74c3c';
        
        document.getElementById('dbStatus').textContent = dbStatus;
        document.getElementById('dbStatus').style.color = dbStatus.includes('✅') ? '#27ae60' : '#e74c3c';
    }

    // Demo data fallback
    loadDemoData() {
        console.log('Loading demo data...');
        
        this.stats = {
            totalRooms: 25,
            occupiedRooms: 18,
            availableRooms: 5,
            reservedRooms: 2,
            totalRevenue: 45200,
            totalBookings: 124,
            occupancyRate: '72.0'
        };

        this.recentBookings = [
            {
                userName: 'John Smith',
                roomName: 'Deluxe Suite',
                checkIn: new Date(),
                checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                status: 'Checked-in',
                totalPrice: 450
            },
            {
                userName: 'Maria Garcia',
                roomName: 'Executive Room',
                checkIn: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                checkOut: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                status: 'Confirmed',
                totalPrice: 750
            },
            {
                userName: 'Robert Johnson',
                roomName: 'Presidential Suite',
                checkIn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                status: 'Checked-in',
                totalPrice: 1200
            }
        ];

        this.recentFeedback = [
            {
                userName: 'Sarah Wilson',
                rating: 5,
                comment: 'Excellent service and beautiful rooms!',
                createdAt: new Date()
            },
            {
                userName: 'Mike Chen',
                rating: 4,
                comment: 'Great location and friendly staff.',
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
        ];

        this.updateStats();
        this.updateRecentBookings();
        this.updateRecentFeedback();
        this.updateSystemStatus('✅ Connected (Demo)', '✅ Connected (Demo)');
    }
}

// Create global admin dashboard instance
const adminDashboard = new AdminDashboard();

// Global function to load dashboard
function loadDashboard() {
    adminDashboard.loadDashboard();
}