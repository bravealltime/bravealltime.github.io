/*
    This script handles the core functionality of the Electricity Bill Calculator.
    It relies on auth.js for authentication and permission handling.
*/

// Global variables
const ITEMS_PER_PAGE = 5;
let currentPage = 1;
let editingIndex = -1;

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
                    <div class="flex items-center justify-center gap-3">
                        ${bill.evidenceUrl ? 
                            `<a href="${bill.evidenceUrl}" target="_blank" class="text-green-400 hover:text-green-300 transition-colors" title="ดูหลักฐาน"><i class="fas fa-receipt"></i></a>` :
                            `<button onclick="openEvidenceModal('${bill.key}')" class="text-gray-400 hover:text-white transition-colors ${!hasPermission('canUploadEvidence') ? 'hidden' : ''}" title="แนบหลักฐาน"><i class="fas fa-camera"></i></button>`
                        }
                        <button onclick="openEditModal('${bill.key}')" class="text-blue-400 hover:text-blue-300 transition-colors ${!hasPermission('canEditAllBills') ? 'hidden' : ''}" title="แก้ไข"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteBill('${bill.key}')" class="text-red-400 hover:text-red-300 transition-colors ${!hasPermission('canDeleteBills') ? 'hidden' : ''}" title="ลบ"><i class="fas fa-trash"></i></button>
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