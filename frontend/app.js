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

  // Auth Elements
  const btnLoginModal = document.getElementById('btn-login-modal');
  const btnRegisterModal = document.getElementById('btn-register-modal');
  const userInfo = document.getElementById('user-info');
  const welcomeMsg = document.getElementById('welcome-msg');
  const btnMyBookings = document.getElementById('btn-my-bookings');
  const btnAdminDash = document.getElementById('btn-admin-dash');
  const btnLogout = document.getElementById('btn-logout');

  const authModal = document.getElementById('auth-modal');
  const closeAuthModal = document.getElementById('close-auth-modal');
  const authTitle = document.getElementById('auth-title');
  const authForm = document.getElementById('auth-form');
  const groupName = document.getElementById('group-name');
  const authName = document.getElementById('auth-name');
  const authEmail = document.getElementById('auth-email');
  const authPassword = document.getElementById('auth-password');
  const authError = document.getElementById('auth-error');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const linkToggleAuth = document.getElementById('link-toggle-auth');
  const linkForgotPassword = document.getElementById('link-forgot-password');

  const forgotPasswordModal = document.getElementById('forgot-password-modal');
  const closeForgotModal = document.getElementById('close-forgot-modal');
  const forgotForm = document.getElementById('forgot-form');
  const forgotEmail = document.getElementById('forgot-email');
  const forgotPasswordNew = document.getElementById('forgot-password-new');

  const myBookingsSection = document.getElementById('my-bookings-section');
  const myBookingsGrid = document.getElementById('my-bookings-grid');
  const noMyBookingsMsg = document.getElementById('no-my-bookings-msg');
  const adminSection = document.getElementById('admin-section');

  const confirmModal = document.getElementById('confirm-modal');
  const btnConfirmYes = document.getElementById('btn-confirm-yes');
  const btnConfirmNo = document.getElementById('btn-confirm-no');

  let currentRoomId = null;
  let currentStartTime = null;
  let currentEndTime = null;
  let isRegistering = false;
  
  let pendingCancelId = null;
  let pendingCancelIsAdmin = false;

  // --- Auth State Management ---
  function getAuth() {
    return {
      token: localStorage.getItem('token'),
      user: JSON.parse(localStorage.getItem('user') || 'null')
    };
  }

  function setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    updateUIForAuth();
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateUIForAuth();
    showToast('Logged out');
  }

  function updateUIForAuth() {
    const { token, user } = getAuth();
    
    if (token && user) {
      btnLoginModal.classList.add('hidden');
      btnRegisterModal.classList.add('hidden');
      userInfo.classList.remove('hidden');
      welcomeMsg.textContent = `Hi, ${user.name.split(' ')[0]}`;
      
      if (user.role === 'ADMIN') {
        btnAdminDash.classList.remove('hidden');
      } else {
        btnAdminDash.classList.add('hidden');
      }
    } else {
      btnLoginModal.classList.remove('hidden');
      btnRegisterModal.classList.remove('hidden');
      userInfo.classList.add('hidden');
      btnAdminDash.classList.add('hidden');
      resultsSection.classList.add('hidden');
      myBookingsSection.classList.add('hidden');
      adminSection.classList.add('hidden');
    }
  }

  // Initial Auth Check
  updateUIForAuth();

  // --- Auth API Helpers ---
  const fetchWithAuth = async (url, options = {}) => {
    const { token } = getAuth();
    const headers = { ...options.headers };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401 || response.status === 403) {
      logout();
      showToast('Session expired. Please log in again.', 'error');
    }
    return response;
  };

  // --- Event Listeners: Auth Modals ---
  btnLoginModal.addEventListener('click', () => {
    isRegistering = false;
    authTitle.textContent = 'Login';
    groupName.classList.add('hidden');
    authName.removeAttribute('required');
    authSubmitBtn.textContent = 'Login';
    linkToggleAuth.textContent = "Don't have an account? Register";
    authModal.classList.remove('hidden');
  });

  btnRegisterModal.addEventListener('click', () => {
    isRegistering = true;
    authTitle.textContent = 'Register';
    groupName.classList.remove('hidden');
    authName.setAttribute('required', 'true');
    authSubmitBtn.textContent = 'Register';
    linkToggleAuth.textContent = "Already have an account? Login";
    authModal.classList.remove('hidden');
  });

  closeAuthModal.addEventListener('click', () => authModal.classList.add('hidden'));

  linkToggleAuth.addEventListener('click', (e) => {
    e.preventDefault();
    isRegistering = !isRegistering;
    if (isRegistering) {
      authTitle.textContent = 'Register';
      groupName.classList.remove('hidden');
      authName.setAttribute('required', 'true');
      authSubmitBtn.textContent = 'Register';
      linkToggleAuth.textContent = "Already have an account? Login";
    } else {
      authTitle.textContent = 'Login';
      groupName.classList.add('hidden');
      authName.removeAttribute('required');
      authSubmitBtn.textContent = 'Login';
      linkToggleAuth.textContent = "Don't have an account? Register";
    }
  });

  linkForgotPassword.addEventListener('click', (e) => {
    e.preventDefault();
    authModal.classList.add('hidden');
    forgotPasswordModal.classList.remove('hidden');
  });

  closeForgotModal.addEventListener('click', () => forgotPasswordModal.classList.add('hidden'));

  btnLogout.addEventListener('click', logout);

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

        const { token } = getAuth();
        if (!token) {
            showToast('Please log in to search and book rooms', 'error');
            return;
        }

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
        
        const { token, user } = getAuth();
        if (!token) {
          showToast('Please log in first', 'error');
          return;
        }

        const clientName = clientNameInput.value.trim();
        if (!clientName) return;

        const btn = bookForm.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = 'Booking...';
        btn.disabled = true;

        try {
            const response = await fetchWithAuth('/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: currentRoomId,
                    startTime: new Date(currentStartTime).toISOString(),
                    endTime: new Date(currentEndTime).toISOString(),
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

    // --- Auth Submits ---
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      authError.classList.add('hidden');
      
      const payload = {
        email: authEmail.value,
        password: authPassword.value
      };
      if (isRegistering) {
        payload.name = authName.value;
      }

      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok) {
          setAuth(data.token, data.user);
          authModal.classList.add('hidden');
          showToast(isRegistering ? 'Registered successfully' : 'Logged in');
          authForm.reset();
        } else {
          authError.textContent = data.error;
          authError.classList.remove('hidden');
        }
      } catch (err) {
        authError.textContent = 'Network error';
        authError.classList.remove('hidden');
      }
    });

    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: forgotEmail.value,
            newPassword: forgotPasswordNew.value
          })
        });
        const data = await res.json();
        showToast(data.message || 'Password reset requested');
        forgotPasswordModal.classList.add('hidden');
        forgotForm.reset();
      } catch (err) {
        showToast('Error resetting password', 'error');
      }
    });

    // --- My Bookings ---
    btnMyBookings.addEventListener('click', async () => {
      resultsSection.classList.add('hidden');
      adminSection.classList.add('hidden');
      myBookingsSection.classList.remove('hidden');
      
      try {
        const res = await fetchWithAuth('/api/my-bookings');
        const data = await res.json();
        
        myBookingsGrid.innerHTML = '';
        if (data.bookings.length === 0) {
          noMyBookingsMsg.classList.remove('hidden');
        } else {
          noMyBookingsMsg.classList.add('hidden');
          data.bookings.forEach(b => {
             const card = document.createElement('div');
             card.className = 'room-card';
             card.innerHTML = `
               <h3>Room ${b.roomId}</h3>
               <p><strong>Start:</strong> ${new Date(b.startTime).toLocaleString()}<br>
               <strong>End:</strong> ${new Date(b.endTime).toLocaleString()}</p>
               <button class="cancel-btn" onclick="cancelBooking(event, '${b.id}')">Cancel Booking</button>
             `;
             myBookingsGrid.appendChild(card);
          });
        }
      } catch (err) {
        showToast('Failed to load bookings', 'error');
      }
    });

    // --- Admin Dashboard ---
    btnAdminDash.addEventListener('click', async () => {
      resultsSection.classList.add('hidden');
      myBookingsSection.classList.add('hidden');
      adminSection.classList.remove('hidden');

      try {
        const [usersRes, bookingsRes] = await Promise.all([
          fetchWithAuth('/api/admin/users'),
          fetchWithAuth('/api/admin/bookings')
        ]);
        
        const usersData = await usersRes.json();
        const bookingsData = await bookingsRes.json();

        const usersList = document.getElementById('admin-users-list');
        const bookingsList = document.getElementById('admin-bookings-list');

        usersList.innerHTML = '';
        usersData.users.forEach(u => {
          const item = document.createElement('div');
          item.className = 'list-item';
          item.innerHTML = `
            <div>
              <strong>${u.name}</strong> (${u.role})<br>
              <span class="text-muted">${u.email}</span>
            </div>
          `;
          usersList.appendChild(item);
        });

        bookingsList.innerHTML = '';
        if (bookingsData.bookings.length === 0) {
          bookingsList.innerHTML = '<p class="text-muted">No active bookings.</p>';
        } else {
          bookingsData.bookings.forEach(b => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
              <div>
                <strong>Room ${b.roomId}</strong> - ${b.clientName}<br>
                <span class="text-muted">${new Date(b.startTime).toLocaleString()} to ${new Date(b.endTime).toLocaleString()}</span>
              </div>
              <button class="cancel-btn" onclick="cancelBooking(event, '${b.id}', true)">Force Cancel</button>
            `;
            bookingsList.appendChild(item);
          });
        }
      } catch (err) {
        showToast('Failed to load admin data', 'error');
      }
    });

    // Global cancellation trigger
    window.cancelBooking = (event, id, isAdmin = false) => {
      if (event) {
          event.preventDefault();
          event.stopPropagation();
      }
      pendingCancelId = id;
      pendingCancelIsAdmin = isAdmin;
      confirmModal.classList.remove('hidden');
    };

    // Confirm Modal Listeners
    btnConfirmNo.addEventListener('click', () => {
      confirmModal.classList.add('hidden');
      pendingCancelId = null;
    });

    btnConfirmYes.addEventListener('click', async () => {
      if (!pendingCancelId) return;
      
      const id = pendingCancelId;
      const isAdmin = pendingCancelIsAdmin;
      const endpoint = isAdmin ? `/api/admin/bookings/${id}` : `/api/bookings/${id}`;
      
      confirmModal.classList.add('hidden');
      pendingCancelId = null;

      try {
        const res = await fetchWithAuth(endpoint, { method: 'DELETE' });
        if (res.ok) {
          showToast('Booking cancelled', 'success');
          if (isAdmin) {
             btnAdminDash.click();
          } else {
             btnMyBookings.click();
          }
        } else {
          const data = await res.json();
          showToast(data.error || 'Failed to cancel', 'error');
        }
      } catch (err) {
        showToast('Network error', 'error');
      }
    });
});
