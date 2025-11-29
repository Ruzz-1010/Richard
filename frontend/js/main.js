// Main JavaScript file
console.log('🏨 Luxury Hotel Booking System Loaded');

// Test backend connection on load
async function testBackend() {
    try {
        const response = await fetch('https://hotel-booking-backend-639y.onrender.com');
        const data = await response.json();
        console.log('✅ Backend connected:', data);
    } catch (error) {
        console.log('❌ Backend connection failed:', error);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    testBackend();
});