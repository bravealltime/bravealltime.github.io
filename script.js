/*
    This script handles the core functionality of the Electricity Bill Calculator.
    It relies on auth.js for authentication and permission handling.
*/

// Global variables
const ITEMS_PER_PAGE = 5;
let currentPage = 1;
let editingIndex = -1;
let allHistoryData = []; // This will hold all data for the current room, for sorting
let keyForEvidence = null; // For evidence upload modal
let keyToDelete = null; // For delete confirmation modal

// --- Authentication & Initialization ---

document.addEventListener('DOMContentLoaded', async function() {
    // This check is for all pages that require authentication
    // Add the 'requires-auth' class to the body tag of pages that need it.
    if (document.body.classList.contains('requires-auth')) {
        // checkAuth() now resolves with the user object or null
        const user = await checkAuth(); // from auth.js
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        
        // Set global user variables (already done in auth.js, but ensure consistency)
        window.currentUser = user;
        window.currentUserRole = user.role;
        // window.currentUserData is also set in auth.js after getUserData

        // Update UI elements like navbar, user profile icon etc.
        updateAuthUI(user); // Pass the user object to updateAuthUI

        // Load page-specific data after authentication is confirmed
        initializePageContent();
    }
});

function initializePageContent() {
    // Route to the correct function based on the current page
    if (document.getElementById('home-room-cards') || document.getElementById('level1-owner-tabs-container')) { // Check for L1 tabs too
        renderHomeRoomCards(); // This will now use global currentUser, currentUserRole, currentUserData
        
        // Initialize Level 1 Owner specific UI if applicable
        if (window.currentUserRole === '1') {
            if (typeof initializeLevel1OwnerInterface === 'function') {
                initializeLevel1OwnerInterface();
            } else {
                console.error('initializeLevel1OwnerInterface function not found. Make sure tenantManagement.js is loaded.');
            }
        } else {
            // Hide L1 specific elements if user is not L1
            const l1Tabs = document.getElementById('level1-owner-tabs-container');
            if (l1Tabs) l1Tabs.classList.add('hidden');
            const tenantManagementSection = document.getElementById('manage-tenants-content');
            if (tenantManagementSection) tenantManagementSection.classList.add('hidden');
            // Ensure default room content is visible for non-L1 if L1 tabs were planned
             const myRoomsContent = document.getElementById('my-rooms-content');
             if (myRoomsContent) myRoomsContent.classList.remove('hidden');
        }

        // Add event listeners for the 'Add Room' modal - permission check inside handler or here
        // This button might be visible to Admin and Level 1 Owner
        const addRoomBtn = document.getElementById('btn-add-room');
        const closeAddRoomModalBtn = document.getElementById('close-add-room-modal');
        const addRoomModal = document.getElementById('add-room-modal');
        const addRoomForm = document.getElementById('add-room-form');

        // Show/hide add room button based on permissions
        if (addRoomBtn) {
            if (hasPermission('canAddNewBills')) {
                addRoomBtn.classList.remove('hidden');
                addRoomBtn.addEventListener('click', () => addRoomModal.classList.remove('hidden'));
            } else {
                addRoomBtn.classList.add('hidden');
            }
        }
        
        if(closeAddRoomModalBtn) closeAddRoomModalBtn.addEventListener('click', () => addRoomModal.classList.add('hidden'));
        if(addRoomForm) addRoomForm.addEventListener('submit', handleAddRoom);
        
        // Initialize evidence modal listeners for home page - only for admin
        if (hasPermission('canUploadEvidence')) {
            setupEvidenceModalListeners();
        }

    } else if (document.getElementById('history-section')) {
        // This is the index.html page for a specific room
        const params = new URLSearchParams(window.location.search);
        const roomParam = params.get('room');
        if (roomParam) {
            document.title = `ประวัติค่าไฟ - ห้อง ${roomParam}`;
            renderHistoryTable(roomParam);
            updatePreviousReadingFromDB(roomParam);
            
            // Initialize evidence modal listeners - only for admin
            if (hasPermission('canUploadEvidence')) {
                setupEvidenceModalListeners();
            }
        } else {
            // Handle case where room is not specified
            const historySection = document.getElementById('history-section');
            if (historySection) {
                 historySection.innerHTML = `<p class="text-center text-red-400">ไม่พบข้อมูลห้อง</p>`;
            }
        }
    }
}


// --- Data Rendering ---

async function renderHomeRoomCards() {
    const cardsContainer = document.getElementById('home-room-cards');
    if (!cardsContainer) return;

    const user = window.currentUser;
    const userRole = window.currentUserRole;
    const userData = window.currentUserData; // Contains managedRooms or accessibleRooms

    if (!user) {
        cardsContainer.innerHTML = `<p class="text-center text-red-400 col-span-full">กรุณาเข้าสู่ระบบเพื่อดูข้อมูล</p>`;
        return;
    }

    try {
        let allBills = await loadFromFirebase(); // Load all bills first
        if (!allBills || allBills.length === 0) {
            cardsContainer.innerHTML = '<p class="text-center text-gray-400 col-span-full">ยังไม่มีข้อมูลห้องพัก</p>';
            return;
        }

        let displayableBills = [];
        if (userRole === 'admin' || (userRole === 'user' && hasPermission('canViewAllRooms'))) { // Admin and general 'user' with permission see all
            displayableBills = allBills;
        } else if (userRole === '1' && userData && userData.managedRooms) { // Level 1 Owner
            displayableBills = allBills.filter(bill => userData.managedRooms.includes(bill.room));
        } else if (userRole === 'level1_tenant' && userData && userData.accessibleRooms) { // Level 1 Tenant
            displayableBills = allBills.filter(bill => userData.accessibleRooms.includes(bill.room));
        } else {
            // If user is 'user' without canViewAllRooms, or L1/L1_Tenant without room assignments
            if (!hasPermission('canViewAllRooms')) { // Check general permission first
                 cardsContainer.innerHTML = `<p class="text-center text-red-400 col-span-full">คุณไม่มีสิทธิ์ดูข้อมูลห้อง</p>`;
                 return;
            }
            // Fallback for roles like '2' or 'user' who might have canViewAllRooms but no specific room list
            // This part might need refinement based on exact logic for 'user' and '2'
            displayableBills = allBills;
        }

        if (displayableBills.length === 0) {
            cardsContainer.innerHTML = '<p class="text-center text-gray-400 col-span-full">ไม่พบข้อมูลห้องพักที่คุณมีสิทธิ์เข้าถึง</p>';
            return;
        }

        const rooms = {};
        displayableBills.forEach(bill => {
            // Ensure bill and bill.room are valid before trying to use bill.room as a key
            if (bill && typeof bill.room !== 'undefined' && bill.room !== null && String(bill.room).trim() !== '') {
                // Also ensure bill.date is valid for comparison
                if (bill.date && typeof bill.date === 'string' && bill.date.split('/').length === 3) {
                    if (!rooms[bill.room] || new Date(bill.date.split('/').reverse().join('-')) > new Date(rooms[bill.room].date.split('/').reverse().join('-'))) {
                        rooms[bill.room] = bill;
                    }
                } else {
                    // Handle bills with invalid date for sorting - perhaps add them if room doesn't exist yet, or log warning
                    if (!rooms[bill.room]) {
                        rooms[bill.room] = bill; // Add if room not present, but date comparison is skipped
                        console.warn('Bill added to rooms object but date is invalid for comparison:', bill);
                    } else {
                         console.warn('Skipping bill due to invalid date for comparison (existing room entry has valid date or is newer):', bill);
                    }
                }
            } else {
                console.warn('Skipping bill due to missing or invalid room identifier in displayableBills.forEach:', bill);
            }
        });

        const sortedRooms = Object.values(rooms).sort((a, b) => {
            // Add a check for a.room and b.room because if rooms contained an entry with undefined key, it would fail here.
            // However, the check in forEach should prevent undefined keys.
            if (a.room && b.room) {
                return String(a.room).localeCompare(String(b.room));
            } else if (a.room) {
                return -1; // a comes first
            } else if (b.room) {
                return 1; // b comes first
            }
            return 0; // both are problematic
        });

        cardsContainer.innerHTML = sortedRooms.map(roomData => {
            const totalAmount = Number(roomData.total || 0);
            const amountColor = getAmountColor(totalAmount);
            const dueDateInfo = getDueDateInfo(roomData.dueDate);

            // Defensive check for essential data that will be directly accessed.
            // Crucially, roomData.room must exist for the onclick handler.
            if (!roomData || typeof roomData.room === 'undefined') {
                console.warn('Skipping card rendering for roomData because roomData.room is undefined:', roomData);
                return ''; // Skip this card if no room identifier
            }

            return `

            <div class="bg-slate-800 rounded-2xl shadow-lg p-5 flex flex-col justify-between hover:bg-slate-700/50 transition-all border border-slate-700 hover:border-blue-500">
                <div>
                    <div class="flex justify-between items-start">
                        <div class="flex items-center gap-2">
                            <span class="text-3xl font-bold text-blue-400">${roomData.room}</span>
                            ${hasPermission('canEditAllBills') ? 
                                `<button onclick="openEditRoomNameModal('${roomData.room}', '${roomData.name || ''}')" class="text-yellow-400 hover:text-yellow-300 transition-colors" title="แก้ไขชื่อห้อง">
                                    <i class="fas fa-edit text-sm"></i>
                                </button>` : ''
                            }
                        </div>
                        <div class="text-xs text-gray-400 text-right">
                            <span>อัปเดตล่าสุด</span><br>
                            <span>${roomData.date || 'N/A'}</span> {/* Added default for date */}
                        </div>
                    </div>
                    <p class="text-lg text-white font-semibold mt-2 truncate">${roomData.name || 'ไม่มีชื่อ'}</p>
                </div>
                <div class="mt-4 pt-4 border-t border-slate-700 space-y-2">
                     <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-400">จำนวนหน่วย:</span>
                        <span class="text-white font-semibold">${roomData.units || 'N/A'} หน่วย</span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-400">หน่วยละ:</span>
                        <span class="text-white font-semibold">${Number(roomData.rate || 0).toFixed(2)} ฿</span>
                    </div>
                </div>
                <div class="mt-4 pt-4 border-t border-slate-700 space-y-2">
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-400">ค่าน้ำ (หน่วย):</span>
                        <span class="text-cyan-400 font-semibold">${roomData.waterUnits || '-'} หน่วย</span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-400">ค่าน้ำ (บาท):</span>
                        <span class="text-sky-400 font-semibold">฿${Number(roomData.waterTotal || 0).toLocaleString()}</span>
                    </div>
                </div>
                 <div class="mt-4 pt-4 border-t border-slate-700 text-center">
                    <p class="text-sm text-gray-300">ค่าไฟล่าสุด</p>
                    <p class="text-4xl font-bold ${amountColor}">฿${totalAmount.toLocaleString()}</p>
                </div>
                ${dueDateInfo.show ? `
                <div class="mt-4 pt-2 border-t border-slate-700/50 text-center">
                    <div class="flex items-center justify-center gap-2 ${dueDateInfo.color}">
                        <i class="fas fa-clock"></i>
                        <span class="text-sm font-medium">${dueDateInfo.text}</span>
                    </div>
                </div>` : ''}
                <div class="mt-4 pt-4 border-t border-slate-700 flex gap-2">
                    <button onclick="viewRoomHistory('${roomData.room}')" class="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1">
                        <i class="fas fa-history"></i> ประวัติ
                    </button>
                    ${hasPermission('canDeleteBills') ? 
                        `<button onclick="openDeleteRoomConfirmModal('${roomData.room}')" class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center" title="ลบห้อง">
                            <i class="fas fa-trash"></i>
                        </button>` : ''
                    }
                </div>
            </div>
        `}).join('');

    } catch (error) {
        console.error("Error rendering room cards:", error);
        if (cardsContainer) {
            cardsContainer.innerHTML = '<p class="text-center text-red-400 col-span-full">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
        }
    }
}


async function renderHistoryTable(room) {
    const historyBody = document.getElementById('history-body');
    const noHistory = document.getElementById('no-history');
    const historySection = document.getElementById('history-section');
    
    if (!historyBody || !noHistory || !historySection) return;

    // Permission check for viewing history of this specific room
    if (!hasPermission('canViewHistory', room)) {
        historyBody.innerHTML = '';
        noHistory.innerHTML = `<p class="text-center text-red-400">คุณไม่มีสิทธิ์ดูประวัติของห้อง ${room}</p>`;
        noHistory.classList.remove('hidden');
        historySection.style.display = 'none'; // Hide the table section
        // Also hide the form for adding new bills if it exists on this page
        const billForm = document.getElementById('bill-form'); // Assuming your form has this ID
        if (billForm) billForm.style.display = 'none';
        return;
    }

    try {
        const bills = await loadFromFirebase(room); // loadFromFirebase already filters by room if room is provided

        if (!bills || bills.length === 0) {
            historyBody.innerHTML = '';
            noHistory.classList.remove('hidden');
            noHistory.innerHTML = `<p class="text-center text-gray-400">ไม่พบประวัติสำหรับห้อง ${room}</p>`;
            historySection.style.display = 'none';
            return;
        }

        noHistory.classList.add('hidden');
        historySection.style.display = '';

        // Pagination
        const totalPages = Math.ceil(bills.length / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedData = bills.slice(startIndex, endIndex);

        historyBody.innerHTML = paginatedData.map(bill => `
            <tr class="hover:bg-white/5 transition-colors">
                <td class="py-3 px-3 text-center border-r border-slate-700">${bill.date || ''}</td>

                <!-- Electricity Data -->
                <td class="py-3 px-3 text-center text-yellow-400 font-semibold">${bill.units || '-'}</td>
                <td class="py-3 px-3 text-center">${Number(bill.rate || 0).toFixed(2)}</td>
                <td class="py-3 px-3 text-center text-green-400 font-bold border-r border-slate-700">${Number(bill.total || 0).toLocaleString()}</td>

                <!-- Water Data -->
                <td class="py-3 px-3 text-center text-cyan-400 font-semibold">${bill.waterUnits || '-'}</td>
                <td class="py-3 px-3 text-center">${Number(bill.waterRate || 0).toFixed(2)}</td>
                <td class="py-3 px-3 text-center text-sky-400 font-bold border-r border-slate-700">${Number(bill.waterTotal || 0).toLocaleString()}</td>

                <td class="py-3 px-3 text-center">
                    <div class="flex items-center justify-center gap-3">
                        ${hasPermission('canGenerateQRCode', room) ?
                            `<button onclick='generateQRCode(${JSON.stringify(bill)})' class="text-purple-400 hover:text-purple-300 transition-colors" title="สร้าง QR Code ชำระเงิน"><i class="fas fa-qrcode"></i></button>` : ''
                        }
                        ${hasPermission('canUploadEvidence', room) ?
                            `<button onclick="openEvidenceModal('${bill.key}')" class="text-green-400 hover:text-green-300 transition-colors" title="แนบหลักฐาน"><i class="fas fa-upload"></i></button>` : ''
                        }
                        ${bill.evidenceUrl ? 
                            `<button onclick="viewEvidence('${bill.evidenceUrl}', '${bill.evidenceFileName ? bill.evidenceFileName : 'หลักฐานการชำระเงิน'}')" class="text-blue-400 hover:text-blue-300 transition-colors" title="ดูหลักฐาน"><i class="fas fa-eye"></i></button>` : ''
                        }
                        ${hasPermission('canUploadEvidence', room) && bill.evidenceUrl ? // Permission to delete evidence might be same as upload or a new one
                            `<button onclick="deleteEvidence('${bill.key}')" class="text-orange-400 hover:text-orange-300 transition-colors" title="ลบหลักฐาน"><i class="fas fa-trash-alt"></i></button>` : ''
                        }
                        ${hasPermission('canEditAllBills', room) ?  // Note: 'canEditAllBills' might be too broad for L1, consider a more specific 'canEditOwnRoomBills'
                            `<button onclick="openEditModal('${bill.key}')" class="text-blue-400 hover:text-blue-300 transition-colors" title="แก้ไข"><i class="fas fa-edit"></i></button>` : ''
                        }
                        ${hasPermission('canDeleteBills', room) ? // Similar to edit, 'canDeleteOwnRoomBills'
                            `<button onclick="openDeleteConfirmModal('${bill.key}')" class="text-red-400 hover:text-red-300 transition-colors" title="ลบ"><i class="fas fa-trash"></i></button>` : ''
                        }
                    </div>
                </td>
            </tr>
        `).join('');

        updatePagination(bills.length, totalPages);

    } catch (error) {
        console.error('Error rendering history table:', error);
        historyBody.innerHTML = `<tr><td colspan="8" class="text-center text-red-400 py-4">เกิดข้อผิดพลาด: ${error.message}</td></tr>`;
    }
}


// --- Data Manipulation ---

async function loadFromFirebase(room = null) {
    try {
        const snapshot = await db.ref('electricityData').once('value');
        let data = snapshot.val();
        if (!data) return [];

        let bills = Object.keys(data).map(key => ({ key, ...data[key] }));

        // Filter out bills without room property
        bills = bills.filter(bill => bill.room);

        if (room) {
            bills = bills.filter(bill => bill.room === room);
        }

        return bills.sort((a, b) => new Date(b.date.split('/').reverse().join('-')) - new Date(a.date.split('/').reverse().join('-')));
    } catch (error) {
        console.error('Error loading data from Firebase:', error);
        return [];
    }
}

async function saveToFirebase(data) {
    try {
        const newBillRef = db.ref('electricityData').push();
        await newBillRef.set(data);
        return newBillRef.key;
    } catch (error) {
        console.error('Error saving to Firebase:', error);
        showAlert('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
        return null;
    }
}


async function deleteBill(key) {
    if (!hasPermission('canDeleteBills')) {
        showAlert('คุณไม่มีสิทธิ์ลบข้อมูล', 'error');
        return;
    }
    
    if (!confirm('คุณต้องการลบข้อมูลนี้ใช่หรือไม่?')) return;

    try {
        await db.ref(`electricityData/${key}`).remove();
        showAlert('ลบข้อมูลเรียบร้อยแล้ว', 'success');
        
        const params = new URLSearchParams(window.location.search);
        const room = params.get('room');
        currentPage = 1;
        renderHistoryTable(room);
        updatePreviousReadingFromDB(room);
    } catch (error) {
        console.error('Error deleting bill:', error);
        showAlert('เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
    }
}

async function handleAddRoom(event) {
    event.preventDefault();
    
    if (!hasPermission('canAddNewBills')) {
        showAlert('คุณไม่มีสิทธิ์เพิ่มข้อมูลใหม่', 'error');
        return;
    }

    try {
        // Get form values
        const room = document.getElementById('add-room-room').value.trim();
        const name = document.getElementById('add-room-name').value.trim();
        const date = document.getElementById('add-room-date').value.trim();
        const current = parseFloat(document.getElementById('add-room-current').value) || 0;
        const previous = parseFloat(document.getElementById('add-room-previous').value) || 0;
        const rate = parseFloat(document.getElementById('add-room-rate').value) || 0;
        const totalall = parseFloat(document.getElementById('add-room-totalall').value) || 0;
        
        // Water values
        const waterCurrent = parseFloat(document.getElementById('add-room-water-current').value) || 0;
        const waterPrevious = parseFloat(document.getElementById('add-room-water-previous').value) || 0;
        const waterRate = parseFloat(document.getElementById('add-room-water-rate').value) || 0;
        const waterTotalall = parseFloat(document.getElementById('add-room-water-totalall').value) || 0;

        // Validate required fields
        if (!room || !name || !date) {
            showAlert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', 'error');
            return;
        }

        if (current < previous) {
            showAlert('ค่ามิเตอร์ไฟฟ้าปัจจุบันต้องไม่น้อยกว่าครั้งที่แล้ว', 'error');
            return;
        }

        if (waterCurrent < waterPrevious) {
            showAlert('ค่ามิเตอร์น้ำปัจจุบันต้องไม่น้อยกว่าครั้งที่แล้ว', 'error');
            return;
        }

        // Calculate units and totals
        const units = current - previous;
        const total = units * rate;
        const waterUnits = waterCurrent - waterPrevious;
        const waterTotal = waterUnits * waterRate;

        // Prepare data
        const newBill = {
            room,
            name,
            date,
            current,
            previous,
            units,
            rate,
            total,
            totalall,
            waterCurrent,
            waterPrevious,
            waterUnits,
            waterRate,
            waterTotal,
            waterTotalall,
            createdAt: new Date().toISOString(),
            createdBy: auth.currentUser?.uid || 'unknown'
        };

        // Save to Firebase
        const newBillRef = await db.ref('electricityData').push(newBill);
        const newBillKey = newBillRef.key; // Get the key of the new bill/room entry in electricityData
        
        showAlert('เพิ่มข้อมูลห้องใหม่เรียบร้อยแล้ว', 'success');

        // If the current user is Level 1 Owner, add this new room to their managedRooms
        if (window.currentUserRole === '1' && window.currentUser && window.currentUser.uid) {
            const userManagedRoomsRef = db.ref(`users/${window.currentUser.uid}/managedRooms`);
            userManagedRoomsRef.once('value', snapshot => {
                let managedRooms = snapshot.val() || [];
                if (!Array.isArray(managedRooms)) { // Ensure it's an array
                    managedRooms = [];
                }
                if (!managedRooms.includes(newBill.room)) {
                    managedRooms.push(newBill.room);
                    userManagedRoomsRef.set(managedRooms).then(() => {
                        console.log(`Room ${newBill.room} added to managedRooms for user ${window.currentUser.uid}`);
                        // Update local currentUserData as well
                        if (window.currentUserData) {
                            window.currentUserData.managedRooms = managedRooms;
                        }
                        // If tenant management UI is active, refresh room list in modal
                        if (typeof loadManagedRoomsForTenantModal === 'function' &&
                            document.getElementById('level1-owner-tabs-container') &&
                            !document.getElementById('level1-owner-tabs-container').classList.contains('hidden') &&
                            document.getElementById('add-edit-tenant-modal') &&
                            !document.getElementById('add-edit-tenant-modal').classList.contains('hidden') ) {
                            loadManagedRoomsForTenantModal();
                        }
                    }).catch(error => {
                        console.error('Failed to update managedRooms:', error);
                        showAlert('เพิ่มห้องใหม่สำเร็จ แต่เกิดข้อผิดพลาดในการอัปเดตรายการห้องที่จัดการ', 'warning');
                    });
                }
            });
        }

        // Close modal and reset form
        const modal = document.getElementById('add-room-modal');
        modal.classList.add('hidden');
        document.getElementById('add-room-form').reset();

        // Refresh room cards
        renderHomeRoomCards();

    } catch (error) {
        console.error('Error adding room:', error);
        showAlert('เกิดข้อผิดพลาดในการเพิ่มข้อมูล', 'error');
    }
}

async function calculateBill() {
    const room = new URLSearchParams(window.location.search).get('room');
    // Permission Check
    if (!hasPermission('canAddNewBills', room)) { // Check permission for the specific room
        showAlert('คุณไม่มีสิทธิ์เพิ่มข้อมูลใหม่สำหรับห้องนี้', 'error');
        return;
    }

    // Getting values from the form
    const billDate = document.getElementById('bill-date').value;
    const dueDate = document.getElementById('due-date').value; // New field
    const currentReading = parseFloat(document.getElementById('current-reading').value);
    const previousReading = parseFloat(document.getElementById('previous-reading').value);
    const rate = parseFloat(document.getElementById('rate').value);
    const totalAll = parseFloat(document.getElementById('total-all').value) || 0;

    // Water bill fields
    const currentWaterReading = parseFloat(document.getElementById('current-water-reading').value);
    const previousWaterReading = parseFloat(document.getElementById('previous-water-reading').value);
    const totalWaterUnitsHousehold = parseFloat(document.getElementById('total-water-units-household').value) || 0;
    const totalWaterBillHousehold = parseFloat(document.getElementById('total-water-bill-household').value) || 0;
    const waterRate = parseFloat(document.getElementById('water-rate').value);


    // Validation for electricity
    if (!billDate || !dueDate || isNaN(currentReading) || isNaN(rate)) {
        showAlert('กรุณากรอกข้อมูลค่าไฟให้ครบถ้วน: วันที่, วันครบกำหนด, เลขมิเตอร์, และเรทค่าไฟ', 'error');
        return;
    }
    if (currentReading < previousReading) {
        showAlert('ค่ามิเตอร์ไฟฟ้าปัจจุบันต้องไม่น้อยกว่าครั้งที่แล้ว', 'error');
        return;
    }

    // Validation for water (only if any water field is entered)
    const waterFieldsEntered = !isNaN(currentWaterReading) || !isNaN(previousWaterReading) || !isNaN(totalWaterUnitsHousehold) || !isNaN(totalWaterBillHousehold) || !isNaN(waterRate);
    if (waterFieldsEntered) {
        if (isNaN(currentWaterReading) || isNaN(waterRate)) {
            showAlert('กรุณากรอกข้อมูลค่าน้ำให้ครบถ้วน: เลขมิเตอร์น้ำปัจจุบัน และ ค่าน้ำ/หน่วย', 'error');
            return;
        }
        if (currentWaterReading < previousWaterReading) {
            showAlert('ค่ามิเตอร์น้ำปัจจุบันต้องไม่น้อยกว่าครั้งที่แล้ว', 'error');
            return;
        }
    }

    // Electricity Calculation
    const units = currentReading - previousReading;
    const total = units * rate;

    // Water Calculation
    let waterUnits = 0;
    let waterTotal = 0;
    if (waterFieldsEntered && !isNaN(currentWaterReading) && !isNaN(previousWaterReading) && !isNaN(waterRate)) {
        waterUnits = currentWaterReading - previousWaterReading;
        waterTotal = waterUnits * waterRate;
    } else if (waterFieldsEntered && !isNaN(currentWaterReading) && isNaN(previousWaterReading) && !isNaN(waterRate) ) {
        // Case where previous water reading might be 0 or not yet set for the first bill
         waterUnits = currentWaterReading - 0; // Assume previous is 0 if not available but current and rate are
         waterTotal = waterUnits * waterRate;
    }


    // Find the associated room name
    const bills = await loadFromFirebase();
    const latestEntryForRoom = bills.find(b => b.room === room) || {};
    const roomName = latestEntryForRoom.name || 'ไม่มีชื่อ';

    const billData = {
        room: room,
        name: roomName,
        date: billDate,
        dueDate: dueDate,
        current: currentReading,
        previous: previousReading,
        units: units,
        rate: rate,
        total: total,
        totalAll: totalAll,
        // Water data
        currentWater: currentWaterReading || 0,
        previousWater: previousWaterReading || 0,
        waterUnits: waterUnits || 0,
        waterRate: waterRate || 0,
        waterTotal: waterTotal || 0,
        totalWaterBillHousehold: totalWaterBillHousehold || 0,
        totalWaterUnitsHousehold: totalWaterUnitsHousehold || 0,

        createdAt: new Date().toISOString(),
        paid: false
    };

    // Save to Firebase
    const newKey = await saveToFirebase(billData);
    if (newKey) {
        showAlert('บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
        document.getElementById('current-reading').value = '';
        currentPage = 1; // Reset to first page to see the new entry
        renderHistoryTable(room);
        updatePreviousReadingFromDB(room);
    }
}

async function openEditModal(key) {
    try {
        const snapshot = await db.ref(`electricityData/${key}`).once('value');
        const data = snapshot.val();
        if (!data) {
            showAlert('ไม่พบข้อมูลที่ต้องการแก้ไข', 'error');
            return;
        }
        // Permission Check for the specific room
        if (!hasPermission('canEditAllBills', data.room)) { // Assuming 'canEditAllBills' is the correct perm for editing any bill one has access to.
                                                       // Or it could be a more specific one like 'canEditOwnRoomBills'
            showAlert(`คุณไม่มีสิทธิ์แก้ไขข้อมูลของห้อง ${data.room}`, 'error');
            return;
        }

        // Populate form fields
        document.getElementById('edit-room').value = data.room || '';
        document.getElementById('edit-name').value = data.name || '';

        // Populate form fields (only use ids that exist in index.html)
        document.getElementById('edit-key').value = key;

        document.getElementById('edit-date').value = data.date || '';
        document.getElementById('edit-due-date').value = data.dueDate || '';
        document.getElementById('edit-current').value = data.current || '';
        document.getElementById('edit-previous').value = data.previous || '';
        document.getElementById('edit-rate').value = data.rate || '';
        document.getElementById('edit-total-all').value = data.totalAll || '';
        
        // Water fields
        document.getElementById('edit-current-water').value = data.currentWater || '';
        document.getElementById('edit-previous-water').value = data.previousWater || '';
        document.getElementById('edit-water-rate').value = data.waterRate || '';
        document.getElementById('edit-total-water-bill-household').value = data.totalWaterBillHousehold || '';

        // Store the key for saving
        editingIndex = key;

        // Show modal
        const modal = document.getElementById('edit-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        // Calculate and display totals
        calculateEditTotals();

    } catch (error) {
        console.error('Error opening edit modal:', error);
        showAlert('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    }
}

async function saveEdit() {
    if (editingIndex === -1) { // editingIndex is the key of the bill being edited
        showAlert('ไม่พบข้อมูลที่ต้องการแก้ไข (No editing index)', 'error');
        return;
    }

    try {
        // Get original room to check permission before saving
        const originalSnapshot = await db.ref(`electricityData/${editingIndex}`).once('value');
        const originalData = originalSnapshot.val();
        if (!originalData) {
            showAlert('ไม่พบข้อมูลเดิมที่ต้องการแก้ไข', 'error');
            editingIndex = -1; // Reset
            closeModal();
            return;
        }

        // Permission Check for the specific room
        if (!hasPermission('canEditAllBills', originalData.room)) {
            showAlert(`คุณไม่มีสิทธิ์บันทึกการแก้ไขข้อมูลของห้อง ${originalData.room}`, 'error');
            return;
        }

        // Get form values
        const room = document.getElementById('edit-room').value; // Room number might be changed by admin
        const name = document.getElementById('edit-name').value;
        // Get form values (use correct ids from index.html)
        const key = document.getElementById('edit-key').value;
        const date = document.getElementById('edit-date').value;
        const dueDate = document.getElementById('edit-due-date').value;
        const current = parseFloat(document.getElementById('edit-current').value) || 0;
        const previous = parseFloat(document.getElementById('edit-previous').value) || 0;
        const rate = parseFloat(document.getElementById('edit-rate').value) || 0;
        const totalAll = parseFloat(document.getElementById('edit-total-all').value) || 0;
        
        // Water values
        const currentWater = parseFloat(document.getElementById('edit-current-water').value) || 0;
        const previousWater = parseFloat(document.getElementById('edit-previous-water').value) || 0;
        const waterRate = parseFloat(document.getElementById('edit-water-rate').value) || 0;
        const totalWaterBillHousehold = parseFloat(document.getElementById('edit-total-water-bill-household').value) || 0;

        // Validate required fields
        if (!date || !dueDate) {
            showAlert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', 'error');
            return;
        }

        // Calculate units and totals
        const units = current - previous;
        const total = units * rate;
        const waterUnits = currentWater - previousWater;
        const waterTotal = waterUnits * waterRate;

        // Get existing data to preserve room and name
        const snapshot = await db.ref(`electricityData/${editingIndex}`).once('value');
        const existingData = snapshot.val();

        // Prepare update data
        const updateData = {
            date,
            dueDate,
            current,
            previous,
            units,
            rate,
            total,
            totalAll,
            currentWater,
            previousWater,
            waterUnits,
            waterRate,
            waterTotal,
            totalWaterBillHousehold,
            updatedAt: new Date().toISOString(),
            updatedBy: auth.currentUser?.uid || 'unknown'
        };

        // Update in Firebase
        await db.ref(`electricityData/${editingIndex}`).update(updateData);

        showAlert('บันทึกการแก้ไขเรียบร้อยแล้ว', 'success');

        // Close modal
        closeModal();

        // Refresh the table
        const params = new URLSearchParams(window.location.search);
        const roomParam = params.get('room');
        if (roomParam) {
            renderHistoryTable(roomParam);
            updatePreviousReadingFromDB(roomParam);
        } else {
            // If on home page, refresh room cards
            renderHomeRoomCards();
        }

        // Reset editing index
        editingIndex = -1;

    } catch (error) {
        console.error('Error saving edit:', error);
        showAlert('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    }
}

async function migrateOldData() {
    if (!hasPermission('canManageUsers')) { // Admin-only permission
        showAlert('คุณไม่มีสิทธิ์ใช้งานฟังก์ชันนี้', 'error');
        return;
    }

    if (!confirm('คุณต้องการอัปเดตข้อมูลเก่าทั้งหมดที่ไม่มีการระบุห้องหรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้')) {
        return;
    }

    showAlert('กำลังเริ่มกระบวนการอัปเดตข้อมูลเก่า...', 'info');

    try {
        const snapshot = await db.ref('electricityData').once('value');
        const data = snapshot.val();
        if (!data) {
            showAlert('ไม่พบข้อมูลในฐานข้อมูล', 'warning');
            return;
        }

        const updates = {};
        let migrationCount = 0;

        for (const key in data) {
            // Check if the bill object is valid and if 'room' is missing
            if (data.hasOwnProperty(key) && typeof data[key] === 'object' && !data[key].hasOwnProperty('room')) {
                const migratedBill = {
                    ...data[key],
                    room: '001', // Default room
                    name: 'ข้อมูลเก่า' // Default name
                };
                updates[`/${key}`] = migratedBill;
                migrationCount++;
            }
        }

        if (migrationCount > 0) {
            await db.ref('electricityData').update(updates);
            showAlert(`อัปเดตข้อมูลเก่าจำนวน ${migrationCount} รายการสำเร็จ!`, 'success');
        } else {
            showAlert('ไม่พบข้อมูลเก่าที่ต้องอัปเดต', 'info');
        }

        // Refresh the view
        renderHomeRoomCards();

    } catch (error) {
        console.error("Error migrating old data:", error);
        showAlert(`เกิดข้อผิดพลาดในการอัปเดตข้อมูล: ${error.message}`, 'error');
    }
}


// --- UI & Utility ---

function viewRoomHistory(room) {
    if (!hasPermission('canViewHistory')) {
        showAlert('คุณไม่มีสิทธิ์ดูประวัติข้อมูล', 'error');
        return;
    }
    
    window.location.href = `index.html?room=${encodeURIComponent(room)}`;
}

function updatePagination(totalItems, totalPages) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer || totalPages <= 1) {
        if(paginationContainer) paginationContainer.innerHTML = '';
        return;
    }
    // Pagination logic...
    // This needs to be implemented based on your desired UI
}

async function updatePreviousReadingFromDB(room) {
    if (!room) return;
    const bills = await loadFromFirebase(room);
    const previousReadingInput = document.getElementById('previous-reading');
    if (previousReadingInput) {
        previousReadingInput.value = bills.length > 0 ? bills[0].current : '';
    }
    const previousWaterReadingInput = document.getElementById('previous-water-reading');
    if (previousWaterReadingInput) {
        previousWaterReadingInput.value = bills.length > 0 && bills[0].currentWater ? bills[0].currentWater : '';
    }
}

function calculateWaterRatePerUnit() {
    const totalWaterUnits = parseFloat(document.getElementById('total-water-units-household').value);
    const totalWaterBill = parseFloat(document.getElementById('total-water-bill-household').value);
    const waterRateInput = document.getElementById('water-rate');

    if(totalWaterUnits > 0 && totalWaterBill > 0) {
        const rate = totalWaterBill / totalWaterUnits;
        waterRateInput.value = rate.toFixed(4);
    } else {
        waterRateInput.value = 0;
    }
}

// Any other utility functions like calculateBill, formatDate, etc.
// should be reviewed to ensure they don't have conflicting logic.
// The hardcoded electricityData array should be removed if all data comes from Firebase.

// --- Helper Functions for Home Cards ---
function getAmountColor(amount) {
    if (amount <= 1500) return 'text-green-400';
    if (amount <= 2500) return 'text-yellow-400';
    if (amount <= 4000) return 'text-orange-400';
    return 'text-red-500';
}

function getDueDateInfo(dueDateStr) {
    if (!dueDateStr) return { show: false };

    const parts = dueDateStr.split('/');
    if (parts.length !== 3) return { show: false };
    
    const dueDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date
    dueDate.setHours(0, 0, 0, 0); // Normalize due date

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { show: true, text: `เกินกำหนด ${Math.abs(diffDays)} วัน`, color: 'text-red-500 animate-pulse' };
    }
    if (diffDays === 0) {
        return { show: true, text: `ครบกำหนดวันนี้`, color: 'text-red-400 font-bold' };
    }
    if (diffDays <= 7) {
        return { show: true, text: `ครบกำหนดใน ${diffDays} วัน`, color: 'text-yellow-400' };
    }

    return { show: true, text: `ครบกำหนดวันที่ ${dueDateStr}`, color: 'text-gray-400' };
}

// --- Modal Controls ---
function closeModal() {
    const modal = document.getElementById('edit-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function viewEvidence(url, fileName = 'หลักฐานการชำระเงิน') {
    console.log('=== viewEvidence started ===');
    console.log('Evidence URL:', url);
    console.log('File name:', fileName);
    
    if (!url) {
        showAlert('ไม่พบหลักฐานที่ต้องการดู', 'error');
        return;
    }
    
    // Show evidence in modal instead of new tab
    const modal = document.getElementById('evidence-view-modal');
    const container = document.getElementById('evidence-view-container');
    const downloadBtn = document.getElementById('download-evidence-btn');
    
    if (!modal || !container) {
        console.error('Evidence view modal elements not found');
        showAlert('เกิดข้อผิดพลาดในการแสดงรูปภาพ', 'error');
        return;
    }
    
    // Clear previous content
    container.innerHTML = '';
    
    // Create image element
    const img = document.createElement('img');
    img.src = url;
    img.alt = fileName;
    img.className = 'max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg';
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    
    // Add loading state
    img.onload = function() {
        console.log('Image loaded successfully');
    };
    
    img.onerror = function() {
        console.error('Failed to load image');
        container.innerHTML = `
            <div class="text-center text-red-400">
                <i class="fas fa-exclamation-triangle text-4xl mb-2"></i>
                <p>ไม่สามารถโหลดรูปภาพได้</p>
            </div>
        `;
    };
    
    // Add image to container
    container.appendChild(img);
    
    // Set up download button
    if (downloadBtn) {
        downloadBtn.onclick = function() {
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName || 'evidence.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
    }
    
    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    console.log('=== viewEvidence ended ===');
}

function closeEvidenceViewModal() {
    const modal = document.getElementById('evidence-view-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function openEvidenceModal(key) {
    console.log('=== openEvidenceModal started ===');
    console.log('Key parameter:', key);
    
    if (!hasPermission('canUploadEvidence')) {
        console.log('Permission denied: canUploadEvidence');
        showAlert('คุณไม่มีสิทธิ์แนบหลักฐาน', 'error');
        return;
    }
    
    keyForEvidence = key;
    console.log('keyForEvidence set to:', keyForEvidence);
    
    // Reset modal state
    const preview = document.getElementById('evidence-preview');
    const placeholder = document.getElementById('evidence-placeholder');
    const errorMsg = document.getElementById('evidence-error');
    const saveBtn = document.getElementById('evidence-save-btn');
    const fileInput = document.getElementById('evidence-image-input');
    const cameraInput = document.getElementById('evidence-camera-input');
    const progressContainer = document.getElementById('upload-progress-container');
    const uploadStatus = document.getElementById('upload-status');
    
    console.log('Modal elements found:', {
        preview: !!preview,
        placeholder: !!placeholder,
        errorMsg: !!errorMsg,
        saveBtn: !!saveBtn,
        fileInput: !!fileInput,
        cameraInput: !!cameraInput,
        progressContainer: !!progressContainer,
        uploadStatus: !!uploadStatus
    });
    
    // Clear file inputs
    if (fileInput) fileInput.value = '';
    if (cameraInput) cameraInput.value = '';
    
    // Clear preview and show placeholder
    if (preview) {
        preview.innerHTML = '';
        preview.classList.add('hidden');
    }
    if (placeholder) {
        placeholder.classList.remove('hidden');
    }
    
    // Reset save button
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> บันทึก';
    }
    
    // Clear error message
    if (errorMsg) {
        errorMsg.textContent = '';
    }
    
    // Hide progress indicators
    if (progressContainer) {
        progressContainer.classList.add('hidden');
    }
    if (uploadStatus) {
        uploadStatus.classList.add('hidden');
    }

    const modal = document.getElementById('evidence-modal');
    console.log('Modal element found:', !!modal);
    
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        console.log('Modal opened successfully');
        
        // Update modal title to show this is for uploading new evidence
        const modalTitle = modal.querySelector('h2');
        if (modalTitle) {
            modalTitle.textContent = 'แนบหลักฐานการชำระเงิน (ใหม่)';
        }
    } else {
        console.error('Modal element not found!');
    }
    
    console.log('=== openEvidenceModal ended ===');
}

function closeEvidenceModal() {
    keyForEvidence = null;
    const modal = document.getElementById('evidence-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function openDeleteConfirmModal(key) {
    // Fetch the bill data to check which room it belongs to for permission check
    db.ref(`electricityData/${key}`).once('value').then(snapshot => {
        const billData = snapshot.val();
        if (!billData) {
            showAlert('ไม่พบข้อมูลที่ต้องการลบ', 'error');
            return;
        }
        if (!hasPermission('canDeleteBills', billData.room)) {
            showAlert(`คุณไม่มีสิทธิ์ลบข้อมูลของห้อง ${billData.room}`, 'error');
            return;
        }

        keyToDelete = key;
        const modal = document.getElementById('delete-confirm-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }).catch(error => {
        console.error("Error fetching bill data for delete confirmation:", error);
        showAlert('เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์การลบ', 'error');
    });
}

function closeDeleteConfirmModal() {
    keyToDelete = null;
    const modal = document.getElementById('delete-confirm-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeDeleteConfirmModal() {
    keyToDelete = null;
    const modal = document.getElementById('delete-confirm-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function closeQrCodeModal() {
    const modal = document.getElementById('qr-code-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

async function confirmDelete() {
    if (!keyToDelete) {
        showAlert('ไม่พบข้อมูลที่ต้องการลบ (No key to delete)', 'error');
        closeDeleteConfirmModal();
        return;
    }

    try {
        // Fetch the bill data again to double check permission for the room before actual deletion
        const snapshot = await db.ref(`electricityData/${keyToDelete}`).once('value');
        const billData = snapshot.val();

        if (!billData) {
            showAlert('ไม่พบข้อมูลที่ต้องการลบแล้ว (อาจถูกลบไปแล้ว)', 'warning');
            closeDeleteConfirmModal();
            return;
        }

        if (!hasPermission('canDeleteBills', billData.room)) {
            showAlert(`คุณไม่มีสิทธิ์ลบข้อมูลของห้อง ${billData.room}`, 'error');
            closeDeleteConfirmModal();
            return;
        }

        await db.ref(`electricityData/${keyToDelete}`).remove();
        showAlert('ลบข้อมูลเรียบร้อยแล้ว', 'success');
        
        const params = new URLSearchParams(window.location.search);
        const roomParam = params.get('room'); // Renamed to avoid conflict
        currentPage = 1;
        if (roomParam) { // Ensure roomParam exists before using it
            renderHistoryTable(roomParam);
            updatePreviousReadingFromDB(roomParam);
        } else {
            renderHomeRoomCards(); // Refresh home if on home page
        }
    } catch (error) {
        console.error('Error deleting bill:', error);
        showAlert('เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
    } finally {
        closeDeleteConfirmModal(); // Ensure keyToDelete is cleared and modal is closed
    }
}

async function handleEvidenceUpload() {
    console.log('=== handleEvidenceUpload started ===');
    
    const fileInput = document.getElementById('evidence-image-input');
    const cameraInput = document.getElementById('evidence-camera-input');
    
    // Check both file inputs for selected files
    let file = null;
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        file = fileInput.files[0];
        console.log('File found in fileInput:', file.name);
    } else if (cameraInput && cameraInput.files && cameraInput.files.length > 0) {
        file = cameraInput.files[0];
        console.log('File found in cameraInput:', file.name);
    }
    
    console.log('File input:', fileInput);
    console.log('Camera input:', cameraInput);
    console.log('Selected file:', file);
    console.log('keyForEvidence (bill key):', keyForEvidence);
    
    // Additional debugging information
    if (fileInput) {
        console.log('FileInput files length:', fileInput.files.length);
        if (fileInput.files.length > 0) {
            console.log('FileInput first file:', fileInput.files[0].name);
        }
    }
    if (cameraInput) {
        console.log('CameraInput files length:', cameraInput.files.length);
        if (cameraInput.files.length > 0) {
            console.log('CameraInput first file:', cameraInput.files[0].name);
        }
    }
    
    if (!file) {
        console.error('No file selected');
        showAlert('กรุณาเลือกไฟล์รูปภาพก่อน', 'error');
        return;
    }
    
    if (!keyForEvidence) {
        console.error('No keyForEvidence (bill key)');
        showAlert('เกิดข้อผิดพลาด: ไม่พบข้อมูลที่ต้องการแนบหลักฐาน', 'error');
        return;
    }

    // Fetch bill data to check room for permission
    let billRoom;
    try {
        const billSnapshot = await db.ref(`electricityData/${keyForEvidence}`).once('value');
        const billData = billSnapshot.val();
        if (!billData || !billData.room) {
            showAlert('ไม่พบข้อมูลห้องสำหรับบิลนี้ ไม่สามารถตรวจสอบสิทธิ์ได้', 'error');
            return;
        }
        billRoom = billData.room;

        if (!hasPermission('canUploadEvidence', billRoom)) {
            showAlert(`คุณไม่มีสิทธิ์อัปโหลดหลักฐานสำหรับห้อง ${billRoom}`, 'error');
            return;
        }
    } catch (error) {
        console.error("Error fetching bill data for permission check:", error);
        showAlert('เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์อัปโหลด', 'error');
        return;
    }

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
        showAlert('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, GIF)', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showAlert('ขนาดไฟล์ต้องไม่เกิน 5MB', 'error');
        return;
    }

    const saveBtn = document.getElementById('evidence-save-btn');
    const progressContainer = document.getElementById('upload-progress-container');
    const progressBar = document.getElementById('upload-progress-bar');
    const uploadStatus = document.getElementById('upload-status');
    const uploadPercentage = document.getElementById('upload-percentage');
    const uploadFilename = document.getElementById('upload-filename');
    const errorMsg = document.getElementById('evidence-error');

    console.log('UI elements found:', {
        saveBtn: !!saveBtn,
        progressContainer: !!progressContainer,
        progressBar: !!progressBar,
        uploadStatus: !!uploadStatus,
        uploadPercentage: !!uploadPercentage,
        uploadFilename: !!uploadFilename,
        errorMsg: !!errorMsg
    });

    // Update UI for upload state
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>กำลังอัปโหลด...';
    progressContainer.classList.remove('hidden');
    uploadStatus.classList.remove('hidden');
    progressBar.style.width = '0%';
    uploadPercentage.textContent = '0%';
    uploadFilename.textContent = file.name;
    errorMsg.textContent = '';

    try {
        console.log('Checking Firebase Storage availability...');
        // Check if Firebase Storage is available
        if (!firebase.storage) {
            console.error('Firebase Storage not available');
            throw new Error('Firebase Storage ไม่พร้อมใช้งาน');
        }

        console.log('Firebase Storage is available');
        console.log('Firebase config:', firebase.app().options);

        // Create storage reference with proper path structure
        const storageRef = firebase.storage().ref();
        const timestamp = Date.now();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${timestamp}_${sanitizedFileName}`;
        const evidenceRef = storageRef.child(`evidence/${keyForEvidence}/${fileName}`);
        
        console.log('Storage reference created:', {
            timestamp,
            fileName,
            fullPath: `evidence/${keyForEvidence}/${fileName}`
        });
        
        console.log('Starting upload...');
        
        // Create upload task with metadata
        const metadata = {
            contentType: file.type,
            customMetadata: {
                originalName: file.name,
                uploadedBy: auth.currentUser?.uid || 'unknown',
                uploadedAt: new Date().toISOString(),
                billKey: keyForEvidence
            }
        };
        
        const uploadTask = evidenceRef.put(file, metadata);

        // Monitor upload progress
        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload progress:', progress + '%');
                progressBar.style.width = progress + '%';
                uploadPercentage.textContent = `${Math.round(progress)}%`;
                
                // Update status text based on progress
                if (progress < 100) {
                    uploadFilename.textContent = `กำลังอัปโหลด ${file.name}...`;
                } else {
                    uploadFilename.textContent = `อัปโหลดเสร็จสิ้น - ${file.name}`;
                }
            }, 
            (error) => {
                console.error('Upload error:', error);
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);
                
                let errorMessage = 'เกิดข้อผิดพลาดในการอัปโหลด';
                
                // Handle specific Firebase Storage errors
                switch (error.code) {
                    case 'storage/unauthorized':
                        errorMessage = 'ไม่มีสิทธิ์ในการอัปโหลดไฟล์';
                        break;
                    case 'storage/canceled':
                        errorMessage = 'การอัปโหลดถูกยกเลิก';
                        break;
                    case 'storage/unknown':
                        errorMessage = 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
                        break;
                    case 'storage/quota-exceeded':
                        errorMessage = 'พื้นที่จัดเก็บไฟล์เต็ม';
                        break;
                    case 'storage/unauthenticated':
                        errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
                        break;
                    default:
                        errorMessage = `ข้อผิดพลาด: ${error.message}`;
                }
                
                throw new Error(errorMessage);
            }, 
            async () => {
                try {
                    console.log('Upload completed, getting download URL...');
                    // Get download URL
                    const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                    console.log('Download URL obtained:', downloadURL);
                    
                    console.log('Updating database...');
                    // Update database with evidence URL
                    await db.ref(`electricityData/${keyForEvidence}`).update({ 
                        evidenceUrl: downloadURL,
                        evidenceUploadedAt: new Date().toISOString(),
                        evidenceFileName: fileName,
                        evidenceFileSize: file.size,
                        evidenceFileType: file.type,
                        evidenceUploadedBy: auth.currentUser?.uid || 'unknown'
                    });
                    
                    console.log('Database updated successfully');
                    
                    // Show success message
                    showAlert('อัปโหลดหลักฐานสำเร็จ!', 'success');
                    
                    // Close modal and refresh table
                    closeEvidenceModal();
                    const room = new URLSearchParams(window.location.search).get('room');
                    if (room) {
                        renderHistoryTable(room);
                    } else {
                        // If on home page, refresh room cards
                        renderHomeRoomCards();
                    }
                    
                } catch (dbError) {
                    console.error('Database update error:', dbError);
                    throw new Error('ไม่สามารถบันทึกข้อมูลลงฐานข้อมูลได้');
                }
            }
        );

    } catch (error) {
        console.error("Upload failed:", error);
        console.error("Error details:", {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        
        errorMsg.textContent = error.message;
        showAlert(error.message, 'error');
        
        // Reset UI
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> บันทึก';
        progressContainer.classList.add('hidden');
        uploadStatus.classList.add('hidden');
    }
    
    console.log('=== handleEvidenceUpload ended ===');
}


// --- Event Listeners Setup ---

// Global functions for evidence handling
function handleFileSelect(file) {
    console.log('=== handleFileSelect started ===');
    console.log('File received:', file);
    console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
    });
    
    const preview = document.getElementById('evidence-preview');
    const placeholder = document.getElementById('evidence-placeholder');
    const saveBtn = document.getElementById('evidence-save-btn');
    const errorMsg = document.getElementById('evidence-error');
    
    console.log('UI elements found:', {
        preview: !!preview,
        placeholder: !!placeholder,
        saveBtn: !!saveBtn,
        errorMsg: !!errorMsg
    });
    
    // Clear previous error
    errorMsg.textContent = '';
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        console.error('Invalid file type:', file.type);
        errorMsg.textContent = 'กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, GIF)';
        saveBtn.disabled = true;
        return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        console.error('File too large:', file.size);
        errorMsg.textContent = 'ขนาดไฟล์ต้องไม่เกิน 5MB';
        saveBtn.disabled = true;
        return;
    }
    
    // Validate file name
    if (file.name.length > 100) {
        console.error('File name too long:', file.name.length);
        errorMsg.textContent = 'ชื่อไฟล์ต้องไม่เกิน 100 ตัวอักษร';
        saveBtn.disabled = true;
        return;
    }

    console.log('File validation passed, creating preview...');
    
    // Show file info
    const fileSize = (file.size / 1024 / 1024).toFixed(2);
    const objectURL = URL.createObjectURL(file);
    console.log('Object URL created:', objectURL);
    
    // Create preview with better formatting
    preview.innerHTML = `
        <div class="w-full max-w-sm">
            <img src="${objectURL}" class="w-full h-40 object-cover rounded-lg mb-3 border border-slate-600">
            <div class="bg-slate-700/50 rounded-lg p-3 space-y-1">
                <div class="flex justify-between text-sm">
                    <span class="text-slate-400">ชื่อไฟล์:</span>
                    <span class="text-white font-medium truncate ml-2">${file.name}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-slate-400">ขนาด:</span>
                    <span class="text-green-400 font-medium">${fileSize} MB</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-slate-400">ประเภท:</span>
                    <span class="text-blue-400 font-medium">${file.type}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-slate-400">ความละเอียด:</span>
                    <span class="text-yellow-400 font-medium">กำลังตรวจสอบ...</span>
                </div>
            </div>
        </div>
    `;
    
    // Get image dimensions
    const img = new Image();
    img.onload = function() {
        const resolutionText = `${this.width} × ${this.height}`;
        const resolutionElement = preview.querySelector('.text-yellow-400');
        if (resolutionElement) {
            resolutionElement.textContent = resolutionText;
        }
    };
    img.src = objectURL;
    
    preview.classList.remove('hidden');
    placeholder.classList.add('hidden');
    
    // Enable save button and show success message
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fas fa-save"></i> บันทึก';
    console.log('Save button enabled:', !saveBtn.disabled);
    
    // Double-check that the file is properly assigned to the input
    const fileInput = document.getElementById('evidence-image-input');
    const cameraInput = document.getElementById('evidence-camera-input');
    
    if (fileInput && fileInput.files && fileInput.files.length === 0) {
        // If file input is empty, try to assign the file
        try {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            console.log('File reassigned to fileInput:', fileInput.files.length);
        } catch (error) {
            console.error('Error reassigning file to input:', error);
        }
    }
    
    console.log('Preview created successfully');
    console.log('=== handleFileSelect ended ===');
}

function clearEvidenceSelection() {
    console.log('=== clearEvidenceSelection started ===');
    
    const preview = document.getElementById('evidence-preview');
    const placeholder = document.getElementById('evidence-placeholder');
    const saveBtn = document.getElementById('evidence-save-btn');
    const errorMsg = document.getElementById('evidence-error');
    const fileInput = document.getElementById('evidence-image-input');
    const cameraInput = document.getElementById('evidence-camera-input');
    const progressContainer = document.getElementById('upload-progress-container');
    const uploadStatus = document.getElementById('upload-status');
    
    console.log('UI elements found:', {
        preview: !!preview,
        placeholder: !!placeholder,
        saveBtn: !!saveBtn,
        errorMsg: !!errorMsg,
        fileInput: !!fileInput,
        cameraInput: !!cameraInput,
        progressContainer: !!progressContainer,
        uploadStatus: !!uploadStatus
    });
    
    // Clear file inputs
    if (fileInput) fileInput.value = '';
    if (cameraInput) cameraInput.value = '';
    
    // Clear preview
    if (preview) {
        preview.innerHTML = '';
        preview.classList.add('hidden');
    }
    
    // Show placeholder
    if (placeholder) {
        placeholder.classList.remove('hidden');
    }
    
    // Reset save button
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> บันทึก';
    }
    
    // Clear error message
    if (errorMsg) {
        errorMsg.textContent = '';
    }
    
    // Hide progress indicators
    if (progressContainer) {
        progressContainer.classList.add('hidden');
    }
    if (uploadStatus) {
        uploadStatus.classList.add('hidden');
    }
    
    console.log('Evidence selection cleared');
    console.log('=== clearEvidenceSelection ended ===');
}

function setupEvidenceModalListeners() {
    console.log('=== setupEvidenceModalListeners started ===');
    
    const dropzone = document.getElementById('evidence-dropzone');
    const fileInput = document.getElementById('evidence-image-input');
    const cameraInput = document.getElementById('evidence-camera-input');
    const saveBtn = document.getElementById('evidence-save-btn');
    const clearBtn = document.getElementById('evidence-clear-btn');
    const cameraBtn = document.getElementById('camera-btn');
    const galleryBtn = document.getElementById('gallery-btn');
    const fileBtn = document.getElementById('file-btn');

    console.log('Elements found:', {
        dropzone: !!dropzone,
        fileInput: !!fileInput,
        cameraInput: !!cameraInput,
        saveBtn: !!saveBtn,
        clearBtn: !!clearBtn,
        cameraBtn: !!cameraBtn,
        galleryBtn: !!galleryBtn,
        fileBtn: !!fileBtn
    });

    // Camera button
    if (cameraBtn) {
        cameraBtn.addEventListener('click', () => {
            console.log('Camera button clicked');
            cameraInput.click();
        });
        console.log('Camera button listener added');
    } else {
        console.error('Camera button not found');
    }

    // Gallery button
    if (galleryBtn) {
        galleryBtn.addEventListener('click', () => {
            console.log('Gallery button clicked');
            fileInput.click();
        });
        console.log('Gallery button listener added');
    } else {
        console.error('Gallery button not found');
    }

    // File button
    if (fileBtn) {
        fileBtn.addEventListener('click', () => {
            console.log('File button clicked');
            fileInput.click();
        });
        console.log('File button listener added');
    } else {
        console.error('File button not found');
    }

    // Clear button
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            console.log('Clear button clicked');
            clearEvidenceSelection();
        });
        console.log('Clear button listener added');
    } else {
        console.error('Clear button not found');
    }

    // Dropzone click
    if (dropzone) {
        dropzone.addEventListener('click', () => {
            console.log('Dropzone clicked');
            fileInput.click();
        });
        console.log('Dropzone click listener added');
    } else {
        console.error('Dropzone not found');
    }
    
    // Drag and drop functionality
    if (dropzone) {
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('border-blue-500', 'bg-slate-700');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('border-blue-500', 'bg-slate-700');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('border-blue-500', 'bg-slate-700');
            const files = e.dataTransfer.files;
            console.log('Files dropped:', files.length);
            if (files.length) {
                // Create a new FileList-like object and assign to file input
                const file = files[0];
                
                // Create a new DataTransfer object
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                
                // Assign the file to the file input
                fileInput.files = dataTransfer.files;
                
                console.log('File assigned to input:', fileInput.files.length);
                handleFileSelect(file);
            }
        });
        console.log('Drag and drop listeners added');
    }
    
    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', () => {
            console.log('File input changed, files:', fileInput.files.length);
            if (fileInput.files.length) {
                handleFileSelect(fileInput.files[0]);
            }
        });
        console.log('File input change listener added');
    } else {
        console.error('File input not found');
    }

    // Camera input change
    if (cameraInput) {
        cameraInput.addEventListener('change', () => {
            console.log('Camera input changed, files:', cameraInput.files.length);
            if (cameraInput.files.length) {
                handleFileSelect(cameraInput.files[0]);
            }
        });
        console.log('Camera input change listener added');
    } else {
        console.error('Camera input not found');
    }

    // Save button
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            console.log('Save button clicked');
            handleEvidenceUpload();
        });
        console.log('Save button listener added');
    } else {
        console.error('Save button not found');
    }
    
    console.log('=== setupEvidenceModalListeners ended ===');
}

function generateQRCode(record) {
    if (!record || !record.room) {
        console.error("Record not found or room missing in record");
        showAlert('ไม่พบข้อมูลที่ถูกต้องสำหรับสร้าง QR Code', 'error');
        return;
    }

    if (!hasPermission('canGenerateQRCode', record.room)) {
        showAlert(`คุณไม่มีสิทธิ์สร้าง QR Code สำหรับห้อง ${record.room}`, 'error');
        return;
    }
    
    if (!record) { // This check is somewhat redundant now but kept for safety.
        console.error("Record not found");
        showAlert('ไม่พบข้อมูลสำหรับสร้าง QR Code', 'error');
        return;
    }

    const promptPayId = '3101700701928' // Consider making this configurable
    const electricAmount = parseFloat(record.total) || 0;
    const waterAmount = parseFloat(record.waterTotal) || 0;
    const totalAmount = electricAmount + waterAmount;

    const canGenerateQR = !isNaN(totalAmount) && totalAmount > 0;
    let qrCodeImage = '';
    let qrCodeCaption = '';
    const receiptBgColor = '#1e293b'; // Corresponds to bg-slate-800

    try {
        if (canGenerateQR) {
            // 1. Generate QR Code payload and image tag
            const payload = window.ThaiQRCode.generatePayload(promptPayId, { amount: totalAmount });
            const qr = qrcode(0, 'M');
            qr.addData(payload);
            qr.make();
            qrCodeImage = `<div class="bg-white p-2 rounded-lg inline-block">${qr.createImgTag(5, 4)}</div>`;
            qrCodeCaption = `<p class="text-sm font-semibold text-slate-400 mt-2">สแกนเพื่อชำระเงินรวม (ค่าไฟ + ค่าน้ำ)</p>`;
        } else {
            qrCodeImage = `
                <div class="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
                    <p class="font-bold">ไม่สามารถสร้าง QR Code ได้</p>
                    <p>เนื่องจากยอดชำระรวมไม่ถูกต้อง (฿${totalAmount.toFixed(2)})</p>
                </div>`;
            qrCodeCaption = '';
        }

        // 2. Format data for display
        const dateParts = record.date.split('/'); // dd/mm/yyyy
        const billDate = new Date(parseInt(dateParts[2], 10) - 543, parseInt(dateParts[1], 10) - 1, parseInt(dateParts[0], 10));

        const thaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
        
        const displayDate = !isNaN(billDate.getTime()) ? `${dateParts[0]}/${dateParts[1]}/${parseInt(dateParts[2])}` : "ข้อมูลวันที่ไม่ถูกต้อง";
        const monthName = !isNaN(billDate.getTime()) ? thaiMonths[billDate.getMonth()] : "";
        const year = !isNaN(billDate.getTime()) ? billDate.getFullYear() + 543 : "";

        const summaryText = `ค่าบริการห้อง ${record.room} (${record.name || ''}) ประจำเดือน ${monthName} ${year}`;
        const hasWaterBill = (record.waterTotal && parseFloat(record.waterTotal) > 0);

        // 3. Build the receipt HTML
        const receiptContainer = document.getElementById('receipt-container');
        receiptContainer.innerHTML = `
            <div id="receipt-content" class="bg-white text-gray-800 rounded-lg p-6 shadow-lg" style="font-family: 'Kanit', sans-serif; max-width: 400px; margin: auto;">
                <div class="text-center mb-6">
                    <h3 class="text-xl font-bold text-gray-900">ใบแจ้งค่าบริการ</h3>
                    <p class="text-gray-500 text-sm">${summaryText}</p>
                </div>

                <div class="bg-gray-50 rounded-lg p-4 mb-4">
                    <p class="text-sm text-gray-600">ห้อง</p>
                    <p class="text-2xl font-bold text-indigo-600">${record.room} - ${record.name || 'ไม่มีชื่อ'}</p>
                     <p class="text-sm text-gray-500 mt-2">วันที่จด: ${displayDate}</p>
                     ${record.dueDate ? `<p class="text-sm text-gray-500">ครบกำหนดชำระ: ${record.dueDate}</p>` : ''}
                </div>
                
                <!-- Electricity Details -->
                <div class="border-t border-gray-200 pt-4 mt-4">
                    <h4 class="font-semibold text-gray-700 mb-2">รายละเอียดค่าไฟฟ้า</h4>
                    <div class="space-y-1 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600">ค่ามิเตอร์ปัจจุบัน:</span>
                            <span class="font-mono font-medium">${record.current} หน่วย</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">ค่ามิเตอร์ครั้งที่แล้ว:</span>
                            <span class="font-mono font-medium">${record.previous} หน่วย</span>
                        </div>
                         <div class="flex justify-between font-semibold">
                            <span class="text-gray-700">จำนวนหน่วยไฟฟ้าที่ใช้:</span>
                            <span class="font-mono text-indigo-600">${record.units} หน่วย</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">อัตราค่าไฟต่อหน่วย:</span>
                            <span class="font-mono font-medium">${parseFloat(record.rate || 0).toFixed(2)} บาท</span>
                        </div>
                        <div class="flex justify-between font-bold text-base pt-1">
                            <span class="text-gray-800">รวมค่าไฟฟ้า:</span>
                            <span class="font-mono text-indigo-700">฿${electricAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <!-- Water Details (Conditional) -->
                ${hasWaterBill ? `
                <div class="border-t border-gray-200 pt-4 mt-4">
                    <h4 class="font-semibold text-gray-700 mb-2">รายละเอียดค่าน้ำ</h4>
                    <div class="space-y-1 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600">ค่ามิเตอร์น้ำปัจจุบัน:</span>
                            <span class="font-mono font-medium">${record.currentWater || 0} หน่วย</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">ค่ามิเตอร์น้ำครั้งที่แล้ว:</span>
                            <span class="font-mono font-medium">${record.previousWater || 0} หน่วย</span>
                        </div>
                         <div class="flex justify-between font-semibold">
                            <span class="text-gray-700">จำนวนหน่วยน้ำที่ใช้:</span>
                            <span class="font-mono text-indigo-600">${record.waterUnits || 0} หน่วย</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">อัตราค่าน้ำต่อหน่วย:</span>
                            <span class="font-mono font-medium">${parseFloat(record.waterRate || 0).toFixed(2)} บาท</span>
                        </div>
                        <div class="flex justify-between font-bold text-base pt-1">
                            <span class="text-gray-800">รวมค่าน้ำ:</span>
                            <span class="font-mono text-indigo-700">฿${waterAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>` : ''}

                <div class="bg-indigo-50 rounded-lg p-4 mt-6 text-center">
                    <p class="text-sm font-semibold text-indigo-800">ยอดชำระทั้งหมด</p>
                    <h2 class="text-4xl font-bold text-indigo-900 tracking-tight my-1">฿${totalAmount.toFixed(2)}</h2>
                </div>

                <div class="flex flex-col items-center justify-center mt-6">
                    ${qrCodeImage}
                    ${qrCodeCaption}
                </div>

                 <div class="text-xs text-gray-400 mt-6 text-center border-t border-gray-200 pt-2">
                    <p>กรุณาชำระเงินภายในวันที่กำหนด</p>
                </div>
            </div>
        `;
        
        // 4. Setup download button and background color for canvas
        const downloadBtn = document.getElementById('download-qr-btn');
        downloadBtn.style.display = 'flex';
        const receiptElement = document.getElementById('receipt-content');
        const canvasBgColor = window.getComputedStyle(receiptElement).backgroundColor;

        downloadBtn.onclick = () => {
            if (window.html2canvas) {
                html2canvas(receiptElement, { 
                    scale: 3, 
                    backgroundColor: canvasBgColor,
                    useCORS: true
                }).then(canvas => {
                    const link = document.createElement('a');
                    link.href = canvas.toDataURL('image/png');
                    link.download = `bill-receipt-room-${record.room}-${record.date.replace(/\//g, '-')}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }).catch(err => {
                    console.error('Error rendering receipt to image:', err);
                    alert('ขออภัย, ไม่สามารถดาวน์โหลดใบแจ้งหนี้ได้');
                });
            } else {
                console.error('html2canvas is not loaded');
                alert('ไลบรารีสำหรับดาวน์โหลดรูปภาพยังไม่พร้อมใช้งาน');
            }
        };

        // 5. Show the modal
        const modal = document.getElementById('qr-code-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        modal.querySelector('[onclick="closeQrCodeModal()"]').focus();


    } catch (error) {
        console.error("Error generating QR Code:", error);
        alert('เกิดข้อผิดพลาดในการสร้าง QR Code');
    }
}

function downloadQRCode() {
    const canvas = document.getElementById('qr-canvas');
    const link = document.createElement('a');
    link.download = `qr-payment-room-${document.getElementById('qr-room-info').textContent.replace(/\s/g, '-')}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

async function deleteEvidence(key) {
    console.log('=== deleteEvidence started ===');
    console.log('Key parameter (bill key):', key);
    
    if (!key) {
        showAlert('ไม่พบข้อมูล (key) ที่ต้องการลบหลักฐาน', 'error');
        return;
    }
    
    try {
        // Get current evidence data to find the room for permission check
        const snapshot = await db.ref(`electricityData/${key}`).once('value');
        const data = snapshot.val();
        
        if (!data || !data.room) {
            showAlert('ไม่พบข้อมูลห้องสำหรับบิลนี้ ไม่สามารถตรวจสอบสิทธิ์ได้', 'error');
            return;
        }

        // Permission to delete evidence - using 'canUploadEvidence' for now, might need a specific 'canDeleteEvidence'
        if (!hasPermission('canUploadEvidence', data.room)) {
            showAlert(`คุณไม่มีสิทธิ์ลบหลักฐานสำหรับห้อง ${data.room}`, 'error');
            return;
        }

        if (!data.evidenceUrl) {
            showAlert('ไม่พบหลักฐานที่ต้องการลบ (URL missing)', 'info');
            return;
        }

        // Confirm deletion
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหลักฐานนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
            return;
        }
        
        // Delete from Firebase Storage if URL exists
        if (data.evidenceUrl && firebase.storage) {
            try {
                const storageRef = firebase.storage().refFromURL(data.evidenceUrl);
                await storageRef.delete();
                console.log('Evidence file deleted from storage');
            } catch (storageError) {
                console.error('Error deleting from storage:', storageError);
                // Continue with database update even if storage deletion fails, but inform user.
                showAlert('ลบไฟล์หลักฐานจาก Storage ไม่สำเร็จ แต่อัปเดตข้อมูลในระบบแล้ว', 'warning');
            }
        }
        
        // Update database to remove evidence references
        await db.ref(`electricityData/${key}`).update({
            evidenceUrl: null,
            evidenceFileName: null,
            evidenceFileSize: null,
            evidenceFileType: null,
            evidenceUploadedAt: null,
            evidenceUploadedBy: null,
            evidenceDeletedAt: new Date().toISOString(),
            evidenceDeletedBy: auth.currentUser?.uid || 'unknown'
        });
        
        showAlert('ลบหลักฐานเรียบร้อยแล้ว', 'success');
        
        // Refresh the table
        const room = new URLSearchParams(window.location.search).get('room');
        if (room) {
            renderHistoryTable(room);
        } else {
            renderHomeRoomCards();
        }
        
    } catch (error) {
        console.error('Error deleting evidence:', error);
        showAlert('เกิดข้อผิดพลาดในการลบหลักฐาน', 'error');
    }
    
    console.log('=== deleteEvidence ended ===');
}

// Room management functions
function openEditRoomNameModal(roomNumber, currentName) {
    if (!hasPermission('canEditAllBills')) {
        showAlert('คุณไม่มีสิทธิ์แก้ไขข้อมูล', 'error');
        return;
    }
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('edit-room-name-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'edit-room-name-modal';
        modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-lg">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-white">แก้ไขชื่อห้อง</h2>
                    <button class="text-2xl text-slate-400 hover:text-white transition-colors" onclick="closeEditRoomNameModal()">&times;</button>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">เลขห้อง</label>
                        <input type="text" id="edit-room-number" readonly class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white cursor-not-allowed">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">ชื่อผู้เช่า</label>
                        <input type="text" id="edit-room-name-input" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white" placeholder="กรอกชื่อผู้เช่า">
                    </div>
                </div>
                <div class="flex gap-3 mt-6">
                    <button onclick="closeEditRoomNameModal()" class="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors">
                        ยกเลิก
                    </button>
                    <button onclick="saveRoomNameEdit()" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                        บันทึก
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Populate form
    document.getElementById('edit-room-number').value = roomNumber;
    document.getElementById('edit-room-name-input').value = currentName;
    
    // Show modal
    modal.classList.remove('hidden');
}

function closeEditRoomNameModal() {
    const modal = document.getElementById('edit-room-name-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

async function saveRoomNameEdit() {
    if (!hasPermission('canEditAllBills')) {
        showAlert('คุณไม่มีสิทธิ์แก้ไขข้อมูล', 'error');
        return;
    }
    
    const roomNumber = document.getElementById('edit-room-number').value;
    const newName = document.getElementById('edit-room-name-input').value.trim();
    
    if (!newName) {
        showAlert('กรุณากรอกชื่อผู้เช่า', 'error');
        return;
    }
    
    try {
        // Get all bills for this room
        const bills = await loadFromFirebase();
        const roomBills = bills.filter(bill => bill.room === roomNumber);
        
        if (roomBills.length === 0) {
            showAlert('ไม่พบข้อมูลห้องนี้', 'error');
            return;
        }
        
        // Update all bills for this room with new name
        const updates = {};
        roomBills.forEach(bill => {
            updates[`/${bill.key}/name`] = newName;
        });
        
        await db.ref('electricityData').update(updates);
        
        showAlert('แก้ไขชื่อห้องเรียบร้อยแล้ว', 'success');
        closeEditRoomNameModal();
        
        // Refresh room cards
        renderHomeRoomCards();
        
    } catch (error) {
        console.error('Error updating room name:', error);
        showAlert('เกิดข้อผิดพลาดในการแก้ไขชื่อห้อง', 'error');
    }
}

function openDeleteRoomConfirmModal(roomNumber) {
    if (!hasPermission('canDeleteBills')) {
        showAlert('คุณไม่มีสิทธิ์ลบข้อมูล', 'error');
        return;
    }
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('delete-room-confirm-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'delete-room-confirm-modal';
        modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-lg text-center">
                <div class="text-red-500 mb-4">
                    <i class="fas fa-exclamation-triangle fa-3x"></i>
                </div>
                <h2 class="text-xl font-bold text-white mb-2">ยืนยันการลบห้อง</h2>
                <p class="text-slate-400 mb-4">คุณแน่ใจหรือไม่ว่าต้องการลบห้อง <span id="delete-room-number" class="font-bold text-white"></span> และข้อมูลทั้งหมดที่เกี่ยวข้อง?</p>
                <p class="text-red-400 text-sm mb-6">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                <div class="flex justify-center gap-4">
                    <button onclick="closeDeleteRoomConfirmModal()" class="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors">
                        ยกเลิก
                    </button>
                    <button onclick="confirmDeleteRoom()" class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                        ยืนยันการลบ
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Set room number
    document.getElementById('delete-room-number').textContent = roomNumber;
    
    // Store room number for deletion
    window.roomToDelete = roomNumber;
    
    // Show modal
    modal.classList.remove('hidden');
}

function closeDeleteRoomConfirmModal() {
    const modal = document.getElementById('delete-room-confirm-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    window.roomToDelete = null;
}

async function confirmDeleteRoom() {
    if (!hasPermission('canDeleteBills')) {
        showAlert('คุณไม่มีสิทธิ์ลบข้อมูล', 'error');
        return;
    }
    
    const roomNumber = window.roomToDelete;
    if (!roomNumber) {
        showAlert('ไม่พบข้อมูลห้องที่ต้องการลบ', 'error');
        return;
    }
    
    try {
        // Get all bills for this room
        const bills = await loadFromFirebase();
        const roomBills = bills.filter(bill => bill.room === roomNumber);
        
        if (roomBills.length === 0) {
            showAlert('ไม่พบข้อมูลห้องนี้', 'error');
            return;
        }
        
        // Delete all bills for this room
        const deletePromises = roomBills.map(bill => 
            db.ref(`electricityData/${bill.key}`).remove()
        );
        
        await Promise.all(deletePromises);
        
        showAlert(`ลบห้อง ${roomNumber} และข้อมูลทั้งหมดเรียบร้อยแล้ว`, 'success');
        closeDeleteRoomConfirmModal();
        
        // Refresh room cards
        renderHomeRoomCards();
        
    } catch (error) {
        console.error('Error deleting room:', error);
        showAlert('เกิดข้อผิดพลาดในการลบห้อง', 'error');
    }
}