// Admin panel functionality
let users = [];
let stats = {
    totalUsers: 0,
    totalRooms: 0,
    totalBills: 0,
    totalAdmins: 0
};

// Check admin permission
async function checkAdminPermission() {
    await authUtils.checkAuth();
    if (!authUtils.hasPermission('canManageUsers')) {
        window.location.href = 'home.html';
        return false;
    }
    return true;
}

// Load statistics
async function loadStats() {
    try {
        // Load users count
        const usersSnapshot = await db.ref('users').once('value');
        const usersData = usersSnapshot.val() || {};
        stats.totalUsers = Object.keys(usersData).length;
        stats.totalAdmins = Object.values(usersData).filter(user => user.role === 'admin').length;
        
        // Load rooms count
        const roomsSnapshot = await db.ref('rooms').once('value');
        const roomsData = roomsSnapshot.val() || {};
        stats.totalRooms = Object.keys(roomsData).length;
        
        // Load bills count
        const billsSnapshot = await db.ref('bills').once('value');
        const billsData = billsSnapshot.val() || {};
        stats.totalBills = Object.keys(billsData).length;
        
        // Update UI
        document.getElementById('total-users').textContent = stats.totalUsers;
        document.getElementById('total-rooms').textContent = stats.totalRooms;
        document.getElementById('total-bills').textContent = stats.totalBills;
        document.getElementById('total-admins').textContent = stats.totalAdmins;
        
    } catch (error) {
        console.error('Error loading stats:', error);
        showAlert('เกิดข้อผิดพลาดในการโหลดสถิติ', 'error');
    }
}

// Load users
async function loadUsers() {
    try {
        const snapshot = await db.ref('users').once('value');
        const usersData = snapshot.val() || {};
        
        users = Object.entries(usersData).map(([uid, userData]) => ({
            uid,
            ...userData
        }));
        
        renderUsersTable();
        
    } catch (error) {
        console.error('Error loading users:', error);
        showAlert('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้', 'error');
    }
}

// Render users table
function renderUsersTable() {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.className = 'border-b border-white/10 hover:bg-white/5 transition-colors';
        
        const roleIcon = getRoleIcon(user.role);
        const roleColor = getRoleColor(user.role);
        const createdAt = new Date(user.createdAt).toLocaleDateString('th-TH');
        
        row.innerHTML = `
            <td class="py-3 px-4">
                <div class="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                    ${user.profileImage ? 
                        `<img src="${user.profileImage}" alt="Profile" class="w-10 h-10 rounded-full object-cover">` :
                        `<i class="fas fa-user text-white/70"></i>`
                    }
                </div>
            </td>
            <td class="py-3 px-4 text-white">${user.name}</td>
            <td class="py-3 px-4 text-white/80">${user.email}</td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${roleColor}">
                    ${roleIcon} ${user.role}
                </span>
            </td>
            <td class="py-3 px-4 text-white/70">${createdAt}</td>
            <td class="py-3 px-4">
                <div class="flex space-x-2">
                    <button onclick="editUser('${user.uid}')" 
                            class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors">
                        <i class="fas fa-edit mr-1"></i>แก้ไข
                    </button>
                    <button onclick="deleteUser('${user.uid}')" 
                            class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors">
                        <i class="fas fa-trash mr-1"></i>ลบ
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Get role icon
function getRoleIcon(role) {
    switch (role) {
        case 'admin': return '<i class="fas fa-crown"></i>';
        case 'user': return '<i class="fas fa-user"></i>';
        case '1': return '<i class="fas fa-user-tie"></i>';
        case '2': return '<i class="fas fa-user"></i>';
        default: return '<i class="fas fa-user"></i>';
    }
}

// Get role color
function getRoleColor(role) {
    switch (role) {
        case 'admin': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
        case 'user': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
        case '1': return 'bg-green-500/20 text-green-400 border border-green-500/30';
        case '2': return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
        default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
}

// Add new user
async function addUser(name, email, password, role) {
    try {
        // Create user in Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Save user data to database
        await db.ref(`users/${user.uid}`).set({
            name: name,
            email: email,
            role: role,
            createdAt: new Date().toISOString(),
            profileImage: null
        });
        
        showAlert('เพิ่มผู้ใช้สำเร็จ!', 'success');
        loadUsers();
        loadStats();
        
    } catch (error) {
        console.error('Error adding user:', error);
        let errorMessage = 'เกิดข้อผิดพลาดในการเพิ่มผู้ใช้';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'อีเมลนี้ถูกใช้งานแล้ว';
                break;
            case 'auth/invalid-email':
                errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
                break;
            case 'auth/weak-password':
                errorMessage = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
                break;
        }
        
        showAlert(errorMessage, 'error');
    }
}

// Edit user
async function editUser(uid) {
    const user = users.find(u => u.uid === uid);
    if (!user) return;
    
    // Fill edit form
    document.getElementById('edit-user-id').value = uid;
    document.getElementById('edit-user-name').value = user.name;
    document.getElementById('edit-user-email').value = user.email;
    document.getElementById('edit-user-role').value = user.role;
    
    // Show modal
    document.getElementById('edit-user-modal').classList.remove('hidden');
}

// Update user
async function updateUser(uid, name, email, role) {
    try {
        await db.ref(`users/${uid}`).update({
            name: name,
            email: email,
            role: role
        });
        
        showAlert('อัปเดตผู้ใช้สำเร็จ!', 'success');
        loadUsers();
        loadStats();
        
    } catch (error) {
        console.error('Error updating user:', error);
        showAlert('เกิดข้อผิดพลาดในการอัปเดตผู้ใช้', 'error');
    }
}

// Delete user
async function deleteUser(uid) {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?')) return;
    
    try {
        // Delete from database
        await db.ref(`users/${uid}`).remove();
        
        // Delete from Firebase Auth (requires admin SDK, so we'll just remove from database)
        showAlert('ลบผู้ใช้สำเร็จ!', 'success');
        loadUsers();
        loadStats();
        
    } catch (error) {
        console.error('Error deleting user:', error);
        showAlert('เกิดข้อผิดพลาดในการลบผู้ใช้', 'error');
    }
}

// Switch tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('[id$="-tab"]').forEach(tab => {
        tab.classList.remove('bg-secondary', 'text-white');
        tab.classList.add('text-white/70', 'hover:text-white');
    });
    
    document.getElementById(`${tabName}-tab`).classList.add('bg-secondary', 'text-white');
    document.getElementById(`${tabName}-tab`).classList.remove('text-white/70', 'hover:text-white');
    
    // Update content
    document.querySelectorAll('[id$="-content"]').forEach(content => {
        content.classList.add('hidden');
    });
    
    document.getElementById(`${tabName}-content`).classList.remove('hidden');
    
    // Load specific content
    if (tabName === 'reports') {
        loadReports();
    }
}

// Load reports
async function loadReports() {
    // This would load charts and reports
    // For now, just show placeholder
    console.log('Loading reports...');
}

// Show modal
function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

// Hide modal
function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Permission check
    const hasPermission = await checkAdminPermission();
    if (!hasPermission) return;
    
    // Set current user
    const currentUser = authUtils.currentUser();
    if (currentUser) {
        document.getElementById('current-user').textContent = `ยินดีต้อนรับ, ${currentUser.email}`;
    }
    
    // Setup UI components like tabs
    setupTabs();
    
    // Initial data load
    await loadStats();
    await loadUsers();
    
    // Tab switching
    const usersTab = document.getElementById('users-tab');
    usersTab.addEventListener('click', () => switchTab('users'));
    document.getElementById('roles-tab').addEventListener('click', () => switchTab('roles'));
    document.getElementById('reports-tab').addEventListener('click', () => switchTab('reports'));
    
    // Add user modal
    document.getElementById('add-user-btn').addEventListener('click', () => showModal('add-user-modal'));
    document.getElementById('close-add-user-modal').addEventListener('click', () => hideModal('add-user-modal'));
    
    // Add user form
    document.getElementById('add-user-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('new-user-name').value;
        const email = document.getElementById('new-user-email').value;
        const password = document.getElementById('new-user-password').value;
        const role = document.getElementById('new-user-role').value;
        
        await addUser(name, email, password, role);
        hideModal('add-user-modal');
        this.reset();
    });
    
    // Edit user modal
    document.getElementById('close-edit-user-modal').addEventListener('click', () => hideModal('edit-user-modal'));
    
    // Edit user form
    document.getElementById('edit-user-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const uid = document.getElementById('edit-user-id').value;
        const name = document.getElementById('edit-user-name').value;
        const email = document.getElementById('edit-user-email').value;
        const role = document.getElementById('edit-user-role').value;
        
        await updateUser(uid, name, email, role);
        hideModal('edit-user-modal');
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('[id$="-modal"]').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideModal(this.id);
            }
        });
    });
});

// Export functions for global use
window.editUser = editUser;
window.deleteUser = deleteUser;

function setupTabs() {
    // ... existing code ...
}

// --- Report Generator ---
async function initializeReportGenerator() {
    try {
        // Initialize flatpickr date picker
        flatpickr("#report-date", {
            dateFormat: "d/m/Y",
            altInput: true,
            altFormat: "j F Y",
            locale: "th"
        });

        // Populate room dropdown
        const roomSelect = document.getElementById('report-room');
        const snapshot = await db.ref('electricityData').once('value');
        const data = snapshot.val();
        if (!data) {
            roomSelect.innerHTML = '<option value="">ไม่พบข้อมูลห้อง</option>';
            return;
        }

        const rooms = [...new Set(Object.values(data).map(bill => bill.room))].sort();
        roomSelect.innerHTML = '<option value="">-- เลือกห้อง --</option>';
        rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room;
            option.textContent = room;
            roomSelect.appendChild(option);
        });

        // Add form submit listener
        const reportForm = document.getElementById('report-form');
        reportForm.addEventListener('submit', handleReportGeneration);

    } catch (error) {
        console.error("Error initializing report generator:", error);
        document.getElementById('report-error').textContent = 'ไม่สามารถโหลดข้อมูลห้องได้';
    }
}

async function handleReportGeneration(event) {
    event.preventDefault();
    const room = document.getElementById('report-room').value;
    const date = document.getElementById('report-date').value;
    const errorEl = document.getElementById('report-error');
    errorEl.textContent = '';

    if (!room || !date) {
        errorEl.textContent = 'กรุณาเลือกห้องและวันที่';
        return;
    }

    try {
        const snapshot = await db.ref('electricityData')
            .orderByChild('room')
            .equalTo(room)
            .once('value');
            
        const data = snapshot.val();
        if (!data) {
            errorEl.textContent = 'ไม่พบบิลสำหรับห้องที่เลือก';
            return;
        }

        // Find the specific bill for that date
        const bill = Object.values(data).find(b => b.date === date);

        if (bill) {
            // Found the bill, now generate the receipt using the global function
            if (typeof generateQRCode === 'function') {
                generateQRCode(bill);
            } else {
                console.error('generateQRCode function is not available.');
                errorEl.textContent = 'เกิดข้อผิดพลาด: ฟังก์ชันสร้างใบแจ้งหนี้ไม่พร้อมใช้งาน';
            }
        } else {
            errorEl.textContent = 'ไม่พบบิลสำหรับวันที่ที่เลือก';
        }
    } catch (error) {
        console.error("Error fetching report data:", error);
        errorEl.textContent = 'เกิดข้อผิดพลาดในการค้นหาข้อมูล';
    }
} 