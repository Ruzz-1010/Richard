class RoomManager {
    constructor() {
        this.rooms = [];
    }

    // Load REAL rooms from database
    async loadRooms() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/rooms`);
            const data = await response.json();
            
            if (data.success) {
                this.rooms = data.rooms;
                this.renderRooms();
            } else {
                alert('Error loading rooms: ' + data.message);
            }
        } catch (error) {
            alert('Error loading rooms: ' + error.message);
        }
    }

    // Render REAL rooms
    renderRooms() {
        const container = document.getElementById('roomsGrid');
        
        if (this.rooms.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">
                    <h3>No rooms found</h3>
                    <p>Click "Add New Room" to create your first room.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.rooms.map(room => `
            <div class="room-card">
                <div class="room-header">
                    <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 1rem;">
                        <h3 style="margin: 0;">${room.name}</h3>
                        <span class="status-badge status-${room.status.toLowerCase()}">${room.status}</span>
                    </div>
                    <div style="display: flex; justify-content: between; align-items: center;">
                        <span class="room-price">$${room.price}/night</span>
                        <span style="color: #666;">${room.type}</span>
                    </div>
                </div>
                
                <div class="room-body">
                    <div class="room-image">
                        ${room.images && room.images.length > 0 ? 
                            `<img src="${room.images[0]}" alt="${room.name}" style="width:100%;height:100%;object-fit:cover;">` : 
                            '🏨 Room Image'
                        }
                    </div>
                    
                    <div style="margin: 1rem 0;">
                        <strong>Description:</strong>
                        <p style="margin: 0.5rem 0; color: #666; font-size: 0.9rem;">
                            ${room.description || 'No description provided.'}
                        </p>
                    </div>
                    
                    <div class="room-amenities">
                        ${(room.amenities || []).map(amenity => 
                            `<span class="amenity-tag">${amenity}</span>`
                        ).join('')}
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; color: #666; font-size: 0.9rem;">
                        <span>Capacity: ${room.capacity || 2} guests</span>
                        <span>Created: ${new Date(room.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                
                <div class="room-footer">
                    <button class="btn btn-primary btn-small" onclick="editRoom('${room._id}')">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteRoom('${room._id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // ADD NEW ROOM - REAL OPERATION
    async addRoom(roomData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(roomData)
            });

            const data = await response.json();
            
            if (data.success) {
                alert('Room added successfully!');
                this.loadRooms(); // Reload the list
                return true;
            } else {
                alert('Error adding room: ' + data.message);
                return false;
            }
        } catch (error) {
            alert('Error adding room: ' + error.message);
            return false;
        }
    }

    // UPDATE ROOM - REAL OPERATION
    async updateRoom(roomId, roomData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/rooms/${roomId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(roomData)
            });

            const data = await response.json();
            
            if (data.success) {
                alert('Room updated successfully!');
                this.loadRooms(); // Reload the list
                return true;
            } else {
                alert('Error updating room: ' + data.message);
                return false;
            }
        } catch (error) {
            alert('Error updating room: ' + error.message);
            return false;
        }
    }

    // DELETE ROOM - REAL OPERATION
    async deleteRoom(roomId) {
        if (!confirm('Are you sure you want to delete this room?')) return false;

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/rooms/${roomId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            
            if (data.success) {
                alert('Room deleted successfully!');
                this.loadRooms(); // Reload the list
                return true;
            } else {
                alert('Error deleting room: ' + data.message);
                return false;
            }
        } catch (error) {
            alert('Error deleting room: ' + error.message);
            return false;
        }
    }
}

const roomManager = new RoomManager();

// Global functions
function loadRooms() {
    roomManager.loadRooms();
}

function showAddRoomForm() {
    document.getElementById('roomModal').style.display = 'flex';
    document.getElementById('modalTitle').textContent = 'Add New Room';
    document.getElementById('roomForm').reset();
}

function hideRoomModal() {
    document.getElementById('roomModal').style.display = 'none';
}

function editRoom(roomId) {
    const room = roomManager.rooms.find(r => r._id === roomId);
    if (room) {
        document.getElementById('roomModal').style.display = 'flex';
        document.getElementById('modalTitle').textContent = 'Edit Room';
        
        // Fill form with room data
        document.getElementById('roomId').value = room._id;
        document.getElementById('roomName').value = room.name;
        document.getElementById('roomType').value = room.type;
        document.getElementById('roomPrice').value = room.price;
        document.getElementById('roomCapacity').value = room.capacity;
        document.getElementById('roomStatus').value = room.status;
        document.getElementById('roomDescription').value = room.description || '';
    }
}

function deleteRoom(roomId) {
    roomManager.deleteRoom(roomId);
}

// Handle form submission
document.getElementById('roomForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const roomData = {
        name: document.getElementById('roomName').value,
        type: document.getElementById('roomType').value,
        price: parseFloat(document.getElementById('roomPrice').value),
        capacity: parseInt(document.getElementById('roomCapacity').value),
        status: document.getElementById('roomStatus').value,
        description: document.getElementById('roomDescription').value,
        amenities: ['WiFi', 'TV', 'AC'] // Default amenities
    };

    const roomId = document.getElementById('roomId').value;
    
    let success;
    if (roomId) {
        success = await roomManager.updateRoom(roomId, roomData);
    } else {
        success = await roomManager.addRoom(roomData);
    }
    
    if (success) {
        hideRoomModal();
    }
});