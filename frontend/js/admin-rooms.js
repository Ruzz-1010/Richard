// Room Management Functions
class RoomManager {
    constructor() {
        this.rooms = [];
        this.currentRoom = null;
    }

    // Load all rooms
    async loadRooms() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/rooms`, {
                headers: auth.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.rooms = data.rooms || [];
            } else {
                this.loadDemoRooms();
            }

            this.renderRooms();
        } catch (error) {
            console.error('Error loading rooms:', error);
            this.loadDemoRooms();
            this.renderRooms();
        }
    }

    // Render rooms grid
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
                        ${(!room.amenities || room.amenities.length === 0) ? 
                            '<span style="color: #666; font-style: italic;">No amenities</span>' : ''
                        }
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; color: #666; font-size: 0.9rem;">
                        <span>Capacity: ${room.capacity || 2} guests</span>
                        <span>Created: ${new Date(room.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                
                <div class="room-footer">
                    <button class="btn btn-primary btn-small" onclick="editRoom('${room.id}')">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteRoom('${room.id}')">Delete</button>
                    <button class="btn btn-secondary btn-small" onclick="viewRoomDetails('${room.id}')">Details</button>
                </div>
            </div>
        `).join('');
    }

    // Show room modal
    showRoomModal(room = null) {
        this.currentRoom = room;
        const modal = document.getElementById('roomModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('roomForm');
        
        if (room) {
            title.textContent = 'Edit Room';
            this.populateRoomForm(room);
        } else {
            title.textContent = 'Add New Room';
            form.reset();
        }
        
        modal.style.display = 'flex';
    }

    // Hide room modal
    hideRoomModal() {
        document.getElementById('roomModal').style.display = 'none';
        this.currentRoom = null;
    }

    // Populate room form for editing
    populateRoomForm(room) {
        document.getElementById('roomId').value = room.id;
        document.getElementById('roomName').value = room.name;
        document.getElementById('roomType').value = room.type;
        document.getElementById('roomPrice').value = room.price;
        document.getElementById('roomCapacity').value = room.capacity || 2;
        document.getElementById('roomStatus').value = room.status;
        document.getElementById('roomBedType').value = room.bedType || 'Queen Bed';
        document.getElementById('roomDescription').value = room.description || '';

        // Clear all amenities checkboxes
        document.querySelectorAll('input[name="amenities"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Check amenities that exist
        if (room.amenities) {
            room.amenities.forEach(amenity => {
                const checkbox = document.querySelector(`input[value="${amenity}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
    }

    // Save room (create or update)
    async saveRoom(roomData) {
        try {
            const url = roomData.id ? 
                `${API_BASE_URL}/api/admin/rooms/${roomData.id}` : 
                `${API_BASE_URL}/api/admin/rooms`;
                
            const method = roomData.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...auth.getAuthHeaders()
                },
                body: JSON.stringify(roomData)
            });

            if (response.ok) {
                alert(`Room ${roomData.id ? 'updated' : 'created'} successfully!`);
                this.hideRoomModal();
                this.loadRooms();
                return true;
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to save room');
                return false;
            }
        } catch (error) {
            console.error('Error saving room:', error);
            alert('Error saving room. Using demo mode.');
            
            // Demo mode fallback
            if (roomData.id) {
                const index = this.rooms.findIndex(r => r.id === roomData.id);
                if (index !== -1) {
                    this.rooms[index] = { ...this.rooms[index], ...roomData };
                }
            } else {
                this.rooms.push({ ...roomData, id: Date.now().toString(), createdAt: new Date() });
            }
            
            this.hideRoomModal();
            this.renderRooms();
            return true;
        }
    }

    // Delete room
    async deleteRoom(roomId) {
        if (!confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
            return false;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/rooms/${roomId}`, {
                method: 'DELETE',
                headers: auth.getAuthHeaders()
            });

            if (response.ok) {
                alert('Room deleted successfully!');
                this.loadRooms();
                return true;
            } else {
                alert('Failed to delete room');
                return false;
            }
        } catch (error) {
            console.error('Error deleting room:', error);
            alert('Error deleting room. Using demo mode.');
            
            // Demo mode fallback
            this.rooms = this.rooms.filter(room => room.id !== roomId);
            this.renderRooms();
            return true;
        }
    }

    // Load demo rooms (fallback)
    loadDemoRooms() {
        this.rooms = [
            {
                id: '1',
                name: 'Deluxe Ocean View',
                type: 'Deluxe',
                price: 299,
                status: 'Available',
                capacity: 3,
                description: 'Beautiful room with ocean view and premium amenities.',
                amenities: ['WiFi', 'TV', 'AC', 'Ocean View', 'Balcony'],
                bedType: 'King Bed',
                createdAt: new Date()
            },
            {
                id: '2',
                name: 'Executive Suite',
                type: 'Suite',
                price: 499,
                status: 'Occupied',
                capacity: 4,
                description: 'Spacious suite with separate living area and work space.',
                amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Safe', 'Jacuzzi'],
                bedType: 'King Bed',
                createdAt: new Date()
            },
            {
                id: '3',
                name: 'Presidential Suite',
                type: 'Presidential',
                price: 899,
                status: 'Reserved',
                capacity: 6,
                description: 'Luxurious presidential suite with premium services.',
                amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Safe', 'Jacuzzi', 'Ocean View', 'Balcony'],
                bedType: 'King Bed',
                createdAt: new Date()
            }
        ];
    }
}

// Create global room manager instance
const roomManager = new RoomManager();

// Global functions
function loadRooms() {
    roomManager.loadRooms();
}

function showRoomModal() {
    roomManager.showRoomModal();
}

function hideRoomModal() {
    roomManager.hideRoomModal();
}

function editRoom(roomId) {
    const room = roomManager.rooms.find(r => r.id === roomId);
    if (room) {
        roomManager.showRoomModal(room);
    }
}

function deleteRoom(roomId) {
    roomManager.deleteRoom(roomId);
}

function viewRoomDetails(roomId) {
    const room = roomManager.rooms.find(r => r.id === roomId);
    if (room) {
        alert(`Room Details:\n\nName: ${room.name}\nType: ${room.type}\nPrice: $${room.price}\nStatus: ${room.status}\nCapacity: ${room.capacity} guests\nAmenities: ${room.amenities ? room.amenities.join(', ') : 'None'}`);
    }
}

// Handle room form submission
document.getElementById('roomForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const amenities = Array.from(document.querySelectorAll('input[name="amenities"]:checked'))
        .map(checkbox => checkbox.value);
    
    const roomData = {
        name: document.getElementById('roomName').value,
        type: document.getElementById('roomType').value,
        price: parseFloat(document.getElementById('roomPrice').value),
        capacity: parseInt(document.getElementById('roomCapacity').value),
        status: document.getElementById('roomStatus').value,
        bedType: document.getElementById('roomBedType').value,
        description: document.getElementById('roomDescription').value,
        amenities: amenities
    };

    const roomId = document.getElementById('roomId').value;
    if (roomId) {
        roomData.id = roomId;
    }

    await roomManager.saveRoom(roomData);
});

// Close modal when clicking outside
document.getElementById('roomModal').addEventListener('click', function(e) {
    if (e.target === this) {
        hideRoomModal();
    }
});