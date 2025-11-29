// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Update navigation based on auth status
    auth.updateNavigation();

    // Load featured rooms on homepage
    if (document.getElementById('featuredRooms')) {
        loadFeaturedRooms();
    }

    // Test backend connection
    testBackendConnection();
});

// Load featured rooms
async function loadFeaturedRooms() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/rooms`);
        const rooms = await response.json();
        
        const featuredRoomsContainer = document.getElementById('featuredRooms');
        if (featuredRoomsContainer) {
            featuredRoomsContainer.innerHTML = rooms.slice(0, 3).map(room => `
                <div class="room-card">
                    <div class="room-image">
                        ${room.images && room.images.length > 0 ? 
                            `<img src="${room.images[0]}" alt="${room.name}" style="width:100%;height:100%;object-fit:cover;">` : 
                            '🏨 Room Image'
                        }
                    </div>
                    <div class="room-content">
                        <h4>${room.name}</h4>
                        <div class="room-price">$${room.price}/night</div>
                        <div class="room-amenities">
                            ${room.amenities ? room.amenities.slice(0, 3).map(amenity => 
                                `<span class="amenity-tag">${amenity}</span>`
                            ).join('') : ''}
                        </div>
                        <span class="room-status status-${room.status.toLowerCase()}">
                            ${room.status}
                        </span>
                        <div style="margin-top: 1rem;">
                            <a href="rooms.html" class="btn btn-primary" style="display: block; text-align: center;">
                                View Details
                            </a>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
        const featuredRoomsContainer = document.getElementById('featuredRooms');
        if (featuredRoomsContainer) {
            featuredRoomsContainer.innerHTML = '<p>Error loading rooms. Please try again later.</p>';
        }
    }
}

// Test backend connection
async function testBackendConnection() {
    try {
        const response = await fetch(API_BASE_URL);
        const data = await response.json();
        console.log('✅ Backend connected:', data.message);
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
    }
}