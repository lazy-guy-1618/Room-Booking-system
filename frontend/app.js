document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const searchForm = document.getElementById('search-form');
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const loader = document.getElementById('loader');
    const resultsSection = document.getElementById('results-section');
    const roomsGrid = document.getElementById('rooms-grid');
    const noRoomsMsg = document.getElementById('no-rooms-msg');

    // Modal Elements
    const modal = document.getElementById('booking-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const bookForm = document.getElementById('book-form');
    const modalRoomNumber = document.getElementById('modal-room-number');
    const modalTimeDesc = document.getElementById('modal-time-desc');
    const clientNameInput = document.getElementById('client-name');

    // Toast
    const toast = document.getElementById('toast');

    let currentRoomId = null;
    let currentStartTime = null;
    let currentEndTime = null;

    // Set default times (Current hour up to Next hour)
    const now = new Date();
    now.setMinutes(0, 0, 0);
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);

    // Format for datetime-local (YYYY-MM-DDThh:mm)
    const formatDateTime = (date) => {
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    startTimeInput.value = formatDateTime(now);
    endTimeInput.value = formatDateTime(nextHour);

    // Search Submit
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        currentStartTime = startTimeInput.value;
        currentEndTime = endTimeInput.value;

        if (new Date(currentStartTime) >= new Date(currentEndTime)) {
            showToast('Start time must be before end time', 'error');
            return;
        }

        if (new Date(currentEndTime) < new Date()) {
            showToast('Cannot select a time slot that has entirely passed', 'error');
            return;
        }

        // Show loader
        resultsSection.classList.add('hidden');
        loader.classList.remove('hidden');

        try {
            const response = await fetch(`/api/availability?startTime=${currentStartTime}&endTime=${currentEndTime}`);
            const data = await response.json();

            loader.classList.add('hidden');
            resultsSection.classList.remove('hidden');

            if (response.ok) {
                displayRooms(data.availableRooms);
            } else {
                showToast(data.error || 'Failed to fetch rooms', 'error');
            }
        } catch (error) {
            loader.classList.add('hidden');
            showToast('Network error, please try again.', 'error');
        }
    });

    // Display Rooms Function
    function displayRooms(rooms) {
        roomsGrid.innerHTML = '';

        if (rooms.length === 0) {
            noRoomsMsg.classList.remove('hidden');
            return;
        }

        noRoomsMsg.classList.add('hidden');

        rooms.forEach((room) => {
            const card = document.createElement('div');
            card.className = 'room-card';

            const typeLabel = room.roomType || (room.capacity > 10 ? 'Conference' : 'Standard');
            const capacity = room.capacity || (typeLabel === 'Conference' ? 20 : 4);

            card.innerHTML = `
        <h3>Room ${room.roomNumber}</h3>
        <p><strong>Type:</strong> ${typeLabel}<br>
        <strong>Capacity:</strong> Up to ${capacity} people</p>
        <button onclick="openBookingModal('${room.roomNumber}')">Book Now</button>
      `;
            roomsGrid.appendChild(card);
        });
    }

    // Define global function for inline onclick
    window.openBookingModal = (roomId) => {
        currentRoomId = roomId;
        modalRoomNumber.textContent = roomId;

        const startStr = new Date(currentStartTime).toLocaleString();
        const endStr = new Date(currentEndTime).toLocaleString();
        modalTimeDesc.innerHTML = `From: <strong>${startStr}</strong><br>To: <strong>${endStr}</strong>`;

        clientNameInput.value = '';
        modal.classList.remove('hidden');
    };

    // Close Modal
    closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Click outside modal to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    // Book Form Submit
    bookForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const clientName = clientNameInput.value.trim();
        if (!clientName) return;

        const btn = bookForm.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = 'Booking...';
        btn.disabled = true;

        try {
            const response = await fetch('/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: currentRoomId,
                    startTime: currentStartTime,
                    endTime: currentEndTime,
                    clientName
                })
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Room booked successfully!', 'success');
                modal.classList.add('hidden');
                // Refresh room list implicitly by calling APIs again
                searchForm.dispatchEvent(new Event('submit'));
            } else {
                showToast(data.error || 'Failed to book room', 'error');
            }
        } catch (error) {
            showToast('Network error, please try again.', 'error');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });

    // Toast Function
    function showToast(message, type = 'success') {
        toast.textContent = message;
        toast.className = `toast show ${type}`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
});
