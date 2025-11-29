// Admin Dashboard Functions
class AdminDashboard {
    constructor() {
        this.rooms = [];
        this.bookings = [];
        this.feedbacks = [];
    }

    // Load all dashboard data
    async loadDashboard() {
        try {
            await Promise.all([
                this.loadRooms(),
                this.loadBookings(),
                this.loadFeedbacks()
            ]);
            
            this.updateStats();
            this.updateRecentActivity();
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    // Load rooms data
    async loadRooms() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/rooms`);
            if (response.ok) {
                this.rooms = await response.json();
            } else {
                // Demo data if API fails
                this.rooms = [
                    { id: 1, name: "Deluxe Room", price: 200, status: "Available" },
                    { id: 2, name: "Executive Suite", price: 350, status: "Occupied" },
                    { id: 3, name: "Presidential Suite", price: 500, status: "Available" },
                    { id: 4, name: "Family Room", price: 300, status: "Maintenance" }
                ];
            }
        } catch (error) {
            console.error('Error loading rooms:', error);
            // Fallback to demo data
            this.rooms = [
                { id: 1, name: "Deluxe Room", price: 200, status: "Available" },
                { id: 2, name: "Executive Suite", price: 350, status: "Occupied" },
                { id: 3, name: "Presidential Suite", price: 500, status: "Available" }
            ];
        }
    }

    // Load bookings data
    async loadBookings() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/bookings`);
            if (response.ok) {
                this.bookings = await response.json();
            } else {
                // Demo bookings data
                this.bookings = [
                    { id: 1, roomId: 1, userName: "John Doe", checkIn: "2023-12-01", checkOut: "2023-12-05", status: "Confirmed", totalPrice: 800 },
                    { id: 2, roomId: 2, userName: "Jane Smith", checkIn: "2023-12-10", checkOut: "2023-12-15", status: "Checked-in", totalPrice: 1750 },
                    { id: 3, roomId: 3, userName: "Mike Johnson", checkIn: "2023-12-20", checkOut: "2023-12-25", status: "Pending", totalPrice: 2500 }
                ];
            }
        } catch (error) {
            console.error('Error loading bookings:', error);
            this.bookings = [
                { id: 1, roomId: 1, userName: "John Doe", checkIn: "2023-12-01", checkOut: "2023-12-05", status: "Confirmed", totalPrice: 800 },
                { id: 2, roomId: 2, userName: "Jane Smith", checkIn: "2023-12-10", checkOut: "2023-12-15", status: "Checked-in", totalPrice: 1750 }
            ];
        }
    }

    // Load feedbacks data
    async loadFeedbacks() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/feedback`);
            if (response.ok) {
                this.feedbacks = await response.json();
            } else {
                // Demo feedback data
                this.feedbacks = [
                    { id: 1, userName: "John Doe", rating: 5, comment: "Excellent service!", createdAt: "2023-11-28" },
                    { id: 2, userName: "Jane Smith", rating: 4, comment: "Great room, will come back!", createdAt: "2023-11-25" }
                ];
            }
        } catch (error) {
            console.error('Error loading feedbacks:', error);
            this.feedbacks = [
                { id: 1, userName: "John Doe", rating: 5, comment: "Excellent service!", createdAt: "2023-11-28" }
            ];
        }
    }

    // Update statistics
    updateStats() {
        const totalRooms = this.rooms.length;
        const occupiedRooms = this.rooms.filter(room => room.status === 'Occupied' || room.status === 'Reserved').length;
        const availableRooms = this.rooms.filter(room => room.status === 'Available').length;
        const totalRevenue = this.bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
        const totalBookings = this.bookings.length;
        const pendingBookings = this.bookings.filter(booking => booking.status === 'Pending').length;

        document.getElementById('totalRooms').textContent = totalRooms;
        document.getElementById('occupiedRooms').textContent = occupiedRooms;
        document.getElementById('availableRooms').textContent = availableRooms;
        document.getElementById('totalRevenue').textContent = `$${totalRevenue}`;
        document.getElementById('totalBookings').textContent = totalBookings;
        document.getElementById('pendingBookings').textContent = pendingBookings;
    }

    // Update recent activity
    updateRecentActivity() {
        const activities = [];
        
        // Add room activities
        this.rooms.slice(0, 3).forEach(room => {
            activities.push({
                message: `Room ${room.name} is ${room.status}`,
                time: 'Recently'
            });
        });

        // Add booking activities
        this.bookings.slice(0, 3).forEach(booking => {
            activities.push({
                message: `New booking from ${booking.userName} - ${booking.status}`,
                time: 'Today'
            });
        });

        // Add feedback activities
        this.feedbacks.slice(0, 2).forEach(feedback => {
            activities.push({
                message: `New ${feedback.rating}⭐ review from ${feedback.userName}`,
                time: 'Yesterday'
            });
        });

        const activityHTML = activities.map(activity => `
            <div class="activity-item">
                <span>${activity.message}</span>
                <span class="activity-time">${activity.time}</span>
            </div>
        `).join('');

        document.getElementById('recentActivity').innerHTML = activityHTML || 
            '<div class="activity-item"><span>No recent activity</span><span class="activity-time">-</span></div>';
    }

    // Show error message
    showError(message) {
        const recentActivity = document.getElementById('recentActivity');
        if (recentActivity) {
            recentActivity.innerHTML = `<div class="activity-item" style="color: #e74c3c;">
                <span>${message}</span>
                <span class="activity-time">Error</span>
            </div>`;
        }
    }

    // Create new room
    async createRoom(roomData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...auth.getAuthHeaders()
                },
                body: JSON.stringify(roomData)
            });

            if (response.ok) {
                alert('Room created successfully!');
                this.loadDashboard();
                return true;
            } else {
                alert('Failed to create room');
                return false;
            }
        } catch (error) {
            console.error('Error creating room:', error);
            alert('Error creating room. Using demo mode.');
            
            // Demo success
            this.rooms.push({ ...roomData, id: Date.now() });
            this.loadDashboard();
            return true;
        }
    }

    // Update room
    async updateRoom(roomId, roomData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...auth.getAuthHeaders()
                },
                body: JSON.stringify(roomData)
            });

            if (response.ok) {
                alert('Room updated successfully!');
                this.loadDashboard();
                return true;
            } else {
                alert('Failed to update room');
                return false;
            }
        } catch (error) {
            console.error('Error updating room:', error);
            alert('Error updating room. Using demo mode.');
            
            // Demo update
            const roomIndex = this.rooms.findIndex(room => room.id == roomId);
            if (roomIndex !== -1) {
                this.rooms[roomIndex] = { ...this.rooms[roomIndex], ...roomData };
            }
            this.loadDashboard();
            return true;
        }
    }

    // Delete room
    async deleteRoom(roomId) {
        if (!confirm('Are you sure you want to delete this room?')) {
            return false;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
                method: 'DELETE',
                headers: auth.getAuthHeaders()
            });

            if (response.ok) {
                alert('Room deleted successfully!');
                this.loadDashboard();
                return true;
            } else {
                alert('Failed to delete room');
                return false;
            }
        } catch (error) {
            console.error('Error deleting room:', error);
            alert('Error deleting room. Using demo mode.');
            
            // Demo delete
            this.rooms = this.rooms.filter(room => room.id != roomId);
            this.loadDashboard();
            return true;
        }
    }

    // Update booking status
    async updateBookingStatus(bookingId, status) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...auth.getAuthHeaders()
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                alert(`Booking ${status.toLowerCase()} successfully!`);
                this.loadDashboard();
                return true;
            } else {
                alert('Failed to update booking');
                return false;
            }
        } catch (error) {
            console.error('Error updating booking:', error);
            alert('Error updating booking. Using demo mode.');
            
            // Demo update
            const booking = this.bookings.find(b => b.id == bookingId);
            if (booking) {
                booking.status = status;
            }
            this.loadDashboard();
            return true;
        }
    }
}

// Create global admin dashboard instance
const adminDashboard = new AdminDashboard();

// Global function to load dashboard
function loadDashboard() {
    adminDashboard.loadDashboard();
}