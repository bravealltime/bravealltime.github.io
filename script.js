/*
    This script handles the core functionality of the Electricity Bill Calculator.
    It relies on auth.js for authentication and permission handling.
*/

// Global variables
const ITEMS_PER_PAGE = 5;
let currentPage = 1;
let editingIndex = -1;
let allHistoryData = []; // This will hold all data for the current room, for sorting

// --- Authentication & Initialization ---

document.addEventListener('DOMContentLoaded', async function() {
    // This check is for all pages that require authentication
    // Add the 'requires-auth' class to the body tag of pages that need it.
    if (document.body.classList.contains('requires-auth')) {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
            window.location.href = 'login.html';
            return;
        }
        
        // Update UI elements like navbar, user profile icon etc.
        updateAuthUI();

        // Load page-specific data after authentication is confirmed
        initializePageContent();
    }
});

function initializePageContent() {
    // Route to the correct function based on the current page
    if (document.getElementById('home-room-cards')) {
        renderHomeRoomCards();
        // Add event listeners for the 'Add Room' modal
        const addRoomBtn = document.getElementById('btn-add-room');
        const closeAddRoomModalBtn = document.getElementById('close-add-room-modal');
        const addRoomModal = document.getElementById('add-room-modal');
        const addRoomForm = document.getElementById('add-room-form');

        if(addRoomBtn) addRoomBtn.addEventListener('click', () => addRoomModal.classList.remove('hidden'));
        if(closeAddRoomModalBtn) closeAddRoomModalBtn.addEventListener('click', () => addRoomModal.classList.add('hidden'));
        if(addRoomForm) addRoomForm.addEventListener('submit', handleAddRoom);

    } else if (document.getElementById('history-section')) {
        // This is the index.html page for a specific room
        const params = new URLSearchParams(window.location.search);
        const roomParam = params.get('room');
        if (roomParam) {
            document.title = `ประวัติค่าไฟ - ห้อง ${roomParam}`;
            renderHistoryTable(roomParam);
            updatePreviousReadingFromDB(roomParam);
            setupEvidenceModalListeners(); // Initialize listeners
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
    // Use hasPermission from auth.js
    if (!hasPermission('canViewAllRooms')) {
        const cardsContainer = document.getElementById('home-room-cards');
        if (cardsContainer) {
            cardsContainer.innerHTML = `<p class="text-center text-red-400 col-span-full">คุณไม่มีสิทธิ์ดูข้อมูลห้อง</p>`;
        }
        return;
    }

    const cardsContainer = document.getElementById('home-room-cards');
    if (!cardsContainer) return;

    try {
        const bills = await loadFromFirebase();
        if (!bills || bills.length === 0) {
            cardsContainer.innerHTML = '<p class="text-center text-gray-400 col-span-full">ยังไม่มีข้อมูลห้องพัก</p>';
            return;
        }

        const rooms = {};
        bills.forEach(bill => {
            if (!rooms[bill.room] || new Date(bill.date.split('/').reverse().join('-')) > new Date(rooms[bill.room].date.split('/').reverse().join('-'))) {
                rooms[bill.room] = bill;
            }
        });

        const sortedRooms = Object.values(rooms).sort((a, b) => a.room.localeCompare(b.room));

        cardsContainer.innerHTML = sortedRooms.map(room => {
            const totalAmount = Number(room.total || 0);
            const amountColor = getAmountColor(totalAmount);
            const dueDateInfo = getDueDateInfo(room.dueDate);

            return `
            <div class="bg-slate-800 rounded-2xl shadow-lg p-5 flex flex-col justify-between hover:bg-slate-700/50 transition-all border border-slate-700 hover:border-blue-500 cursor-pointer" onclick="viewRoomHistory('${room.room}')">
                <div>
                    <div class="flex justify-between items-start">
                        <span class="text-3xl font-bold text-blue-400">${room.room}</span>
                        <div class="text-xs text-gray-400 text-right">
                            <span>อัปเดตล่าสุด</span><br>
                            <span>${room.date}</span>
                        </div>
                    </div>
                    <p class="text-lg text-white font-semibold mt-2 truncate">${room.name || 'ไม่มีชื่อ'}</p>
                </div>
                <div class="mt-4 pt-4 border-t border-slate-700 space-y-2">
                     <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-400">จำนวนหน่วย:</span>
                        <span class="text-white font-semibold">${room.units} หน่วย</span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-400">หน่วยละ:</span>
                        <span class="text-white font-semibold">${Number(room.rate || 0).toFixed(2)} ฿</span>
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

    try {
        const bills = await loadFromFirebase(room);

        if (!bills || bills.length === 0) {
            historyBody.innerHTML = '';
            noHistory.classList.remove('hidden');
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
                <td class="py-3 px-3 text-center">${bill.date || ''}</td>
                <td class="py-3 px-3 text-center">${bill.current || ''}</td>
                <td class="py-3 px-3 text-center">${bill.previous || ''}</td>
                <td class="py-3 px-3 text-center text-yellow-400 font-semibold">${bill.units || ''}</td>
                <td class="py-3 px-3 text-center">${Number(bill.rate || 0).toFixed(2)}</td>
                <td class="py-3 px-3 text-center text-green-400 font-bold">${Number(bill.total || 0).toLocaleString()}</td>
                <td class="py-3 px-3 text-center">${Number(bill.totalAll || 0).toLocaleString()}</td>
                <td class="py-3 px-3 text-center">
                    <div class="flex items-center justify-center gap-4">
                        <button onclick='generateQRCode(${JSON.stringify(bill)})' class="text-purple-400 hover:text-purple-300 transition-colors" title="สร้าง QR Code ชำระเงิน"><i class="fas fa-qrcode"></i></button>
                        ${bill.evidenceUrl ? 
                            `<a href="${bill.evidenceUrl}" target="_blank" class="text-blue-400 hover:text-blue-300 transition-colors" title="ดูหลักฐาน"><i class="fas fa-eye"></i></a>` :
                            `<button onclick="openEvidenceModal('${bill.key}')" class="text-blue-400 hover:text-blue-300 transition-colors" title="แนบหลักฐาน"><i class="fas fa-eye"></i></button>`
                        }
                        <button onclick="openEditModal('${bill.key}')" class="text-blue-400 hover:text-blue-300 transition-colors" title="แก้ไข"><i class="fas fa-edit"></i></button>
                        <button onclick="openDeleteConfirmModal('${bill.key}')" class="text-red-400 hover:text-red-300 transition-colors" title="ลบ"><i class="fas fa-trash"></i></button>
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
    const room = document.getElementById('add-room-room').value;
    const name = document.getElementById('add-room-name').value;
    const date = document.getElementById('add-room-date').value;
    const current = parseFloat(document.getElementById('add-room-current').value);
    const previous = parseFloat(document.getElementById('add-room-previous').value);
    const rate = parseFloat(document.getElementById('add-room-rate').value);
    const totalAll = parseFloat(document.getElementById('add-room-totalall').value) || 0;

    if (!room || !name || !date || isNaN(current) || isNaN(previous) || isNaN(rate)) {
        showAlert('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
        return;
    }

    const units = current - previous;
    const total = units * rate;

    const newBill = {
        room, name, date, current, previous, rate, totalAll, units, total,
        timestamp: new Date().toISOString()
    };

    await saveToFirebase(newBill);
    showAlert('สร้างห้องและบันทึกข้อมูลแรกเรียบร้อย', 'success');
    
    const addRoomModal = document.getElementById('add-room-modal');
    if (addRoomModal) addRoomModal.classList.add('hidden');
    
    const addRoomForm = document.getElementById('add-room-form');
    if (addRoomForm) addRoomForm.reset();
    
    renderHomeRoomCards();
}

async function calculateBill() {
    // Permission Check
    if (!hasPermission('canAddBills')) {
        showAlert('คุณไม่มีสิทธิ์เพิ่มข้อมูลใหม่', 'error');
        return;
    }

    // Getting values from the form
    const room = new URLSearchParams(window.location.search).get('room');
    const billDate = document.getElementById('bill-date').value;
    const dueDate = document.getElementById('due-date').value; // New field
    const currentReading = parseFloat(document.getElementById('current-reading').value);
    const previousReading = parseFloat(document.getElementById('previous-reading').value);
    const rate = parseFloat(document.getElementById('rate').value);
    const totalAll = parseFloat(document.getElementById('total-all').value) || 0;

    // Validation
    if (!billDate || !dueDate || isNaN(currentReading) || isNaN(rate)) {
        showAlert('กรุณากรอกข้อมูลให้ครบถ้วน: วันที่, วันครบกำหนด, เลขมิเตอร์, และเรทค่าไฟ', 'error');
        return;
    }
    if (currentReading < previousReading) {
        showAlert('ค่ามิเตอร์ปัจจุบันต้องไม่น้อยกว่าครั้งที่แล้ว', 'error');
        return;
    }

    // Calculation
    const units = currentReading - previousReading;
    const total = units * rate;

    // Find the associated room name
    const bills = await loadFromFirebase();
    const latestEntryForRoom = bills.find(b => b.room === room) || {};
    const roomName = latestEntryForRoom.name || 'ไม่มีชื่อ';

    const billData = {
        room: room,
        name: roomName,
        date: billDate,
        dueDate: dueDate, // New field
        current: currentReading,
        previous: previousReading,
        units: units,
        rate: rate,
        total: total,
        totalAll: totalAll,
        createdAt: new Date().toISOString(),
        paid: false // Add payment status
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
    if (!hasPermission('canEditAllBills')) {
        showAlert('คุณไม่มีสิทธิ์แก้ไขข้อมูล', 'error');
        return;
    }
    const bills = await loadFromFirebase();
    const billToEdit = bills.find(b => b.key === key);

    if (billToEdit) {
        document.getElementById('edit-key').value = key;
        document.getElementById('edit-date').value = billToEdit.date;
        document.getElementById('edit-due-date').value = billToEdit.dueDate || ''; // New
        document.getElementById('edit-current').value = billToEdit.current;
        document.getElementById('edit-previous').value = billToEdit.previous;
        document.getElementById('edit-total-all').value = billToEdit.totalAll || 0;
        
        // Recalculate rate for display
        const units = billToEdit.current - billToEdit.previous;
        const rateInput = document.getElementById('edit-rate');
        if (units > 0 && billToEdit.totalAll > 0) {
             const rate = billToEdit.totalAll / units; // This seems to be total units of house, not room
             // Let's re-evaluate how rate is calculated and stored. For now, just use stored rate.
             rateInput.value = billToEdit.rate.toFixed(4);
        } else if (billToEdit.rate) {
            rateInput.value = billToEdit.rate.toFixed(4);
        }
        else {
             rateInput.value = 0;
        }

        document.getElementById('edit-modal').classList.remove('hidden');
        document.getElementById('edit-modal').classList.add('flex');
    }
}

async function saveEdit() {
    if (!hasPermission('canEditAllBills')) {
        showAlert('คุณไม่มีสิทธิ์แก้ไขข้อมูล', 'error');
        return;
    }
    const key = document.getElementById('edit-key').value;
    const date = document.getElementById('edit-date').value;
    const dueDate = document.getElementById('edit-due-date').value; // New
    const current = parseFloat(document.getElementById('edit-current').value);
    const previous = parseFloat(document.getElementById('edit-previous').value);
    const totalAll = parseFloat(document.getElementById('edit-total-all').value);

     // Validation
    if (!date || !dueDate || isNaN(current) || isNaN(previous)) {
        showAlert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', 'error');
        return;
    }

    // Keep original room and name
    const bills = await loadFromFirebase();
    const originalBill = bills.find(b => b.key === key);
    
    // Recalculate units and total
    const units = current - previous;
    let rate = originalBill.rate; // Keep original rate unless totalAll changes
    if(totalAll && totalAll !== originalBill.totalAll) {
        // Here we need total units of the house for that period to recalculate the rate.
        // This is complex. For now, let's assume rate is manually managed or doesn't change on edit.
        // A better approach would be to store house total units and bill in a separate record.
        // For now, if totalAll changes, we can't accurately get the new rate.
        // Let's just recalculate the total for this room based on the original rate.
    }
    const total = units * rate;


    const updatedData = {
        date: date,
        dueDate: dueDate, // New
        current: current,
        previous: previous,
        totalAll: totalAll,
        units: units,
        total: total,
        rate: rate, // Keep rate
        room: originalBill.room,
        name: originalBill.name
    };

    try {
        await db.ref(`electricityData/${key}`).update(updatedData);
        showAlert('แก้ไขข้อมูลสำเร็จ', 'success');
        closeModal();
        renderHistoryTable(originalBill.room);
    } catch (error) {
        console.error('Error saving edit:', error);
        showAlert('เกิดข้อผิดพลาดในการบันทึกการแก้ไข', 'error');
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
    window.location.href = `index.html?room=${room}`;
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
let keyToDelete = null;
let keyForEvidence = null;

function closeModal() {
    const modal = document.getElementById('edit-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function openEvidenceModal(key) {
    if (!hasPermission('canUploadEvidence')) {
        showAlert('คุณไม่มีสิทธิ์แนบหลักฐาน', 'error');
        return;
    }
    keyForEvidence = key;
    // Reset modal state
    const preview = document.getElementById('evidence-preview');
    const placeholder = document.getElementById('evidence-placeholder');
    const errorMsg = document.getElementById('evidence-error');
    const saveBtn = document.getElementById('evidence-save-btn');
    const fileInput = document.getElementById('evidence-image-input');
    
    fileInput.value = '';
    preview.innerHTML = '';
    preview.classList.add('hidden');
    placeholder.classList.remove('hidden');
    errorMsg.textContent = '';
    saveBtn.disabled = true;

    const modal = document.getElementById('evidence-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeEvidenceModal() {
    keyForEvidence = null;
    const modal = document.getElementById('evidence-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function openDeleteConfirmModal(key) {
    if (!hasPermission('canDeleteBills')) {
        showAlert('คุณไม่มีสิทธิ์ลบข้อมูล', 'error');
        return;
    }
    keyToDelete = key;
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
    if (!keyToDelete) return;

    try {
        await db.ref(`electricityData/${keyToDelete}`).remove();
        showAlert('ลบข้อมูลเรียบร้อยแล้ว', 'success');
        
        const params = new URLSearchParams(window.location.search);
        const room = params.get('room');
        currentPage = 1;
        renderHistoryTable(room);
        updatePreviousReadingFromDB(room);
    } catch (error) {
        console.error('Error deleting bill:', error);
        showAlert('เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
    } finally {
        closeDeleteConfirmModal();
    }
}

async function handleEvidenceUpload() {
    const fileInput = document.getElementById('evidence-image-input');
    const file = fileInput.files[0];
    if (!file || !keyForEvidence) return;

    const saveBtn = document.getElementById('evidence-save-btn');
    const progressContainer = document.getElementById('upload-progress-container');
    const progressBar = document.getElementById('upload-progress-bar');
    const errorMsg = document.getElementById('evidence-error');

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>กำลังอัปโหลด...';
    progressContainer.classList.remove('hidden');
    progressBar.style.width = '0%';
    errorMsg.textContent = '';

    try {
        // Assume storage is initialized in auth.js or globally
        const storageRef = firebase.storage().ref();
        const evidenceRef = storageRef.child(`evidence/${keyForEvidence}/${Date.now()}_${file.name}`);
        
        const uploadTask = evidenceRef.put(file);

        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressBar.style.width = progress + '%';
            }, 
            (error) => {
                throw error; // Pass error to the catch block
            }, 
            async () => {
                const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                await db.ref(`electricityData/${keyForEvidence}`).update({ evidenceUrl: downloadURL });
                
                showAlert('อัปโหลดหลักฐานสำเร็จ!', 'success');
                closeEvidenceModal();
                const room = new URLSearchParams(window.location.search).get('room');
                renderHistoryTable(room);
            }
        );

    } catch (error) {
        console.error("Upload failed:", error);
        errorMsg.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> บันทึก';
        progressContainer.classList.add('hidden');
    }
}


// --- Event Listeners Setup ---

function setupEvidenceModalListeners() {
    const dropzone = document.getElementById('evidence-dropzone');
    const fileInput = document.getElementById('evidence-image-input');
    const preview = document.getElementById('evidence-preview');
    const placeholder = document.getElementById('evidence-placeholder');
    const saveBtn = document.getElementById('evidence-save-btn');
    const errorMsg = document.getElementById('evidence-error');

    dropzone.addEventListener('click', () => fileInput.click());
    
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
        if (files.length) {
            fileInput.files = files;
            handleFileSelect(files[0]);
        }
    });
    
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFileSelect(fileInput.files[0]);
        }
    });

    const handleFileSelect = (file) => {
        errorMsg.textContent = '';
        if (!file.type.startsWith('image/')) {
            errorMsg.textContent = 'กรุณาเลือกไฟล์รูปภาพเท่านั้น';
            saveBtn.disabled = true;
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
             errorMsg.textContent = 'ขนาดไฟล์ต้องไม่เกิน 5MB';
             saveBtn.disabled = true;
             return;
        }

        preview.innerHTML = `<img src="${URL.createObjectURL(file)}" class="max-h-40 rounded-lg object-contain">`;
        preview.classList.remove('hidden');
        placeholder.classList.add('hidden');
        saveBtn.disabled = false;
    };

    saveBtn.addEventListener('click', handleEvidenceUpload);
}

function generateQRCode(record) {
    if (!record) {
        console.error("Record not found");
        alert('ไม่พบข้อมูลสำหรับสร้าง QR Code');
        return;
    }

    const promptPayId = '1209701792030'
    const amount = parseFloat(record.total);
    const canGenerateQR = !isNaN(amount) && amount > 0;
    let qrCodeImage = '';
    let qrCodeCaption = '';
    const receiptBgColor = '#1e293b'; // Corresponds to bg-slate-800

    try {
        if (canGenerateQR) {
            // 1. Generate QR Code payload and image tag
            const payload = window.ThaiQRCode.generatePayload(promptPayId, { amount });
            const qr = qrcode(0, 'M');
            qr.addData(payload);
            qr.make();
            // The QR code library generates an img tag with inline styles. We'll wrap it for centering.
            qrCodeImage = `<div class="bg-white p-2 rounded-lg inline-block">${qr.createImgTag(5, 4)}</div>`;
            qrCodeCaption = `<p class="text-sm font-semibold text-slate-400 mt-2">สแกนเพื่อชำระเงินค่าไฟ</p>`;
        } else {
            qrCodeImage = `
                <div class="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
                    <p class="font-bold">ไม่สามารถสร้าง QR Code ได้</p>
                    <p>เนื่องจากยอดชำระไม่ถูกต้อง (฿${(record.total || 0).toFixed(2)})</p>
                </div>`;
            qrCodeCaption = '';
        }

        // 2. Format data for display
        const dateParts = record.date.split('/'); // dd/mm/yyyy
        const billDate = new Date(parseInt(dateParts[2], 10) - 543, parseInt(dateParts[1], 10) - 1, parseInt(dateParts[0], 10));

        const thaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
        
        const displayDate = !isNaN(billDate.getTime()) ? `${dateParts[0]}/${dateParts[1]}/${parseInt(dateParts[2])}` : "ข้อมูลวันที่ไม่ถูกต้อง";
        const monthName = !isNaN(billDate.getTime()) ? thaiMonths[billDate.getMonth()] : "";
        const year = !isNaN(billDate.getTime()) ? billDate.getFullYear() : "";

        const subtitle = `ค่าไฟห้อง ${record.room} (${record.name || ''}) ประจำเดือน ${monthName} ${year}`;
        const qrCaptionText = `สแกนเพื่อชำระเงินค่าไฟ`;
        const footerText = `กรุณาชำระเงินภายในวันที่กำหนด`;

        // 3. Build the receipt HTML
        const receiptContainer = document.getElementById('receipt-container');
        receiptContainer.innerHTML = `
            <div id="receipt-content" class="bg-white text-gray-800 p-8" style="font-family: 'Kanit', sans-serif; width: 380px; margin: auto;">
                <div class="text-center">
                    <h3 class="text-2xl font-bold text-gray-900">ใบแจ้งค่าไฟฟ้า</h3>
                    <p class="text-gray-500 text-sm mt-1">${subtitle}</p>
                </div>

                <div class="bg-gray-50 rounded-xl p-4 mt-6 text-center">
                    <p class="text-sm text-gray-600">ห้อง</p>
                    <p class="text-3xl font-bold" style="color: #4f46e5;">${record.room} - ${record.name || 'ไม่มีชื่อ'}</p>
                    <p class="text-base text-gray-500 mt-1">วันที่จด: ${displayDate}</p>
                </div>
                
                <div class="mt-6 space-y-3 text-sm">
                    <div class="flex">
                        <span class="text-gray-600" style="width: 150px;">ค่ามิเตอร์ปัจจุบัน:</span>
                        <span class="font-mono font-medium text-right flex-1">${record.current} หน่วย</span>
                    </div>
                    <div class="flex">
                        <span class="text-gray-600" style="width: 150px;">ค่ามิเตอร์ครั้งที่แล้ว:</span>
                        <span class="font-mono font-medium text-right flex-1">${record.previous} หน่วย</span>
                    </div>
                    <div class="flex font-bold text-base items-center">
                        <span class="text-gray-800" style="width: 150px;">จำนวนหน่วยที่ใช้:</span>
                        <span class="font-mono text-indigo-600 text-right flex-1">${record.units} หน่วย</span>
                    </div>
                    <div class="flex">
                        <span class="text-gray-600" style="width: 150px;">อัตราค่าไฟต่อหน่วย:</span>
                        <span class="font-mono font-medium text-right flex-1">${parseFloat(record.rate).toFixed(2)} บาท</span>
                    </div>
                </div>

                <div class="bg-indigo-50 rounded-xl p-4 mt-6 text-center">
                    <p class="text-base font-semibold text-indigo-800">ยอดชำระทั้งหมด</p>
                    <h2 class="text-4xl font-bold tracking-tight my-1" style="color: #312e81;">฿${parseFloat(record.total).toFixed(2)}</h2>
                </div>

                <div class="flex flex-col items-center justify-center mt-6">
                    ${canGenerateQR ? `<div class="p-2 bg-white">${qr.createImgTag(6, 8)}</div><p class="text-sm font-semibold text-gray-700 mt-2">${qrCaptionText}</p>` : qrCodeImage}
                </div>

                 <div class="text-xs text-gray-500 mt-6 text-center border-t border-gray-200 pt-3">
                    <p>${footerText}</p>
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
                    backgroundColor: '#ffffff',
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