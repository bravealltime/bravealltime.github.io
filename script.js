// ข้อมูลจาก Google Sheets
const electricityData = [
    { date: '19/12/2021', current: 9320, previous: 9007, units: 313, rate: 4.4, total: 1377, totalAll: 3426 },
    { date: '19/1/2022', current: 9562, previous: 9320, units: 242, rate: 4.5, total: 1089, totalAll: 3306 },
    { date: '19/2/2022', current: 9897, previous: 9562, units: 335, rate: 4.55, total: 1524, totalAll: 4199 },
    { date: '19/3/2022', current: 10199, previous: 9897, units: 302, rate: 4.5, total: 1359, totalAll: 3577 },
    { date: '19/4/2022', current: 10483, previous: 10199, units: 284, rate: 4.5, total: 1278, totalAll: 4099 },
    { date: '19/5/2022', current: 10806, previous: 10483, units: 323, rate: 4.5, total: 1454, totalAll: 3749 },
    { date: '19/6/2022', current: 11100, previous: 10806, units: 294, rate: 4.5, total: 1323, totalAll: 4279 },
    { date: '19/7/2022', current: 11636, previous: 11100, units: 268, rate: 4.79, total: 1285, totalAll: 4745 },
    { date: '19/8/2022', current: 11669, previous: 11636, units: 301, rate: 4.78, total: 1438, totalAll: 4375 },
    { date: '19/9/2022', current: 12016, previous: 11669, units: 347, rate: 5.55, total: 1926, totalAll: 6183 },
    { date: '19/10/2022', current: 12231, previous: 12016, units: 215, rate: 5.46, total: 1175, totalAll: 4109 },
    { date: '19/11/2022', current: 12530, previous: 12231, units: 299, rate: 5.31, total: 1588, totalAll: 3994 },
    { date: '19/12/2022', current: 12840, previous: 12530, units: 310, rate: 5.42, total: 1680, totalAll: 3507 },
    { date: '19/1/2023', current: 13117, previous: 12840, units: 277, rate: 5.37, total: 1488, totalAll: 3212 },
    { date: '19/2/2023', current: 13436, previous: 13117, units: 319, rate: 5.42, total: 1729, totalAll: 3773 },
    { date: '19/3/2023', current: 13663, previous: 13436, units: 227, rate: 5.37, total: 1220, totalAll: 3240 },
    { date: '19/4/2023', current: 13969, previous: 13663, units: 306, rate: 5.45, total: 1667, totalAll: 4134 },
    { date: '19/5/2023', current: 14222, previous: 13969, units: 253, rate: 5.38, total: 1360, totalAll: 3505 },
    { date: '19/6/2023', current: 14409, previous: 14222, units: 160, rate: 5.35, total: 857, totalAll: 3214 },
    { date: '19/7/2023', current: 14669, previous: 14409, units: 260, rate: 5.40, total: 1403, totalAll: 3739 },
    { date: '19/8/2023', current: 14992, previous: 14669, units: 323, rate: 5.34, total: 1724, totalAll: 4099 },
    { date: '19/9/2023', current: 15320, previous: 14992, units: 328, rate: 5.25, total: 1721, totalAll: 3968 },
    { date: '19/10/2023', current: 15669, previous: 15320, units: 349, rate: 4.67, total: 1630, totalAll: 3586 },
    { date: '19/11/2023', current: 16046, previous: 15669, units: 377, rate: 4.69, total: 1767, totalAll: 3849 },
    { date: '19/12/2023', current: 16388, previous: 16046, units: 342, rate: 4.68, total: 1601, totalAll: 3760 },
    { date: '19/1/2024', current: 16746, previous: 16388, units: 358, rate: 4.90, total: 1753, totalAll: 4080 },
    { date: '19/2/2024', current: 17164, previous: 16746, units: 418, rate: 4.92, total: 2058, totalAll: 4580 },
    { date: '19/3/2024', current: 17505, previous: 17164, units: 341, rate: 4.91, total: 1673, totalAll: 4209 },
    { date: '19/4/2024', current: 17886, previous: 17505, units: 381, rate: 4.91, total: 1870, totalAll: 4250 },
    { date: '19/5/2024', current: 18263, previous: 17886, units: 377, rate: 5.04, total: 1901, totalAll: 4250 },
    { date: '19/6/2024', current: 18660, previous: 18263, units: 397, rate: 4.92, total: 1953, totalAll: 4497 },
    { date: '19/7/2024', current: 19063, previous: 18660, units: 403, rate: 4.92, total: 1982, totalAll: 4456 },
    { date: '19/8/2024', current: 19466, previous: 19063, units: 403, rate: 4.90, total: 1974, totalAll: 4085 },
    { date: '19/9/2024', current: 19855, previous: 19466, units: 389, rate: 4.88, total: 1900, totalAll: 3863 },
    { date: '19/10/2024', current: 20218, previous: 19855, units: 363, rate: 4.85, total: 1761, totalAll: 3440 },
    { date: '19/11/2024', current: 20573, previous: 20218, units: 355, rate: 4.84, total: 1717, totalAll: 3260 }
];

// ตัวแปรสำหรับเก็บ index ของข้อมูลที่กำลังแก้ไข
let editingIndex = -1;

// เปลี่ยนจำนวนแถวต่อหน้าเป็น 5
const ITEMS_PER_PAGE = 5;
let currentPage = 1;
let historyData = [];

// ตัวแปรสำหรับควบคุมการแสดงสรุปผลลัพธ์ใต้ประวัติ
let hasShownInlineResult = false;

// แปลงวันที่จาก DD/MM/YYYY เป็น Date object
function parseDate(dateStr) {
    if (!dateStr) return new Date();
    const [day, month, year] = dateStr.split('/');
    return new Date(year, month - 1, day);
}

// แปลงวันที่เป็นรูปแบบ DD/MM/YYYY
function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) {
        return new Date().toLocaleDateString('th-TH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '/');
    }
    return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).replace(/\//g, '/');
}

// แปลงวันที่จาก DD/MM/YYYY เป็น YYYY-MM-DD
function formatDateForInput(dateStr) {
    if (!dateStr) return '';
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
}

// แสดงประวัติการคำนวณ
function displayHistory(page = 1) {
    // เรียงข้อมูลจากใหม่ไปเก่า
    const sortedData = [...electricityData].sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateB - dateA;
    });
    renderHistoryTable(sortedData, page);
    renderPagination(sortedData, page);
}

// ฟังก์ชันสำหรับแสดงตารางประวัติ
async function renderHistoryTable(data = null, sortBy = 'date', room = null) {
    try {
        // If no data is provided, fetch from Firebase
        if (!data) {
            const snapshot = await db.ref('electricityData').once('value');
            data = snapshot.val();
        }
        // Convert object to array if needed
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            data = Object.values(data);
        }
        // Filter by room if specified
        if (room) {
            data = data.filter(bill => bill.room === room);
        }
        // Validate data
        if (!data || !Array.isArray(data) || data.length === 0) {
            document.getElementById('history-body').innerHTML = '';
            document.getElementById('no-history').classList.remove('hidden');
            // ซ่อน section ตารางถ้ามี id='history-section'
            var section = document.getElementById('history-section');
            if (section) section.style.display = 'none';
            return;
        } else {
            // แสดง section ตารางถ้ามีข้อมูล
            var section = document.getElementById('history-section');
            if (section) section.style.display = '';
        }
        // เรียงข้อมูลตาม room และ date (แต่ไม่แสดง room/name)
        data.sort((a, b) => {
            if (a.room !== b.room) {
                return a.room.localeCompare(b.room);
            }
            const dateA = new Date(a.date.split('/').reverse().join('-'));
            const dateB = new Date(b.date.split('/').reverse().join('-'));
            return dateB - dateA;
        });
        // Pagination
        const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedData = data.slice(startIndex, endIndex);
        // Generate table rows (ไม่แสดงห้อง/ชื่อ)
        const rows = paginatedData.map((bill, idx) => `
            <tr class="hover:bg-white/5 transition-colors">
                <td class="py-3 px-3 text-center">${bill.date || ''}</td>
                <td class="py-3 px-3 text-center">${bill.current || ''}</td>
                <td class="py-3 px-3 text-center">${bill.previous || ''}</td>
                <td class="py-3 px-3 text-center">${bill.units || ''}</td>
                <td class="py-3 px-3 text-center">${bill.rate ? bill.rate.toFixed(2) : ''}</td>
                <td class="py-3 px-3 text-center">${bill.total ? bill.total.toFixed(2) : ''}</td>
                <td class="py-3 px-3 text-center">${bill.totalAll ? bill.totalAll.toFixed(2) : ''}</td>
                <td class="py-3 px-3 text-center">
                    <div class="flex justify-center gap-2">
                        <button onclick="showResultModalFromHistory('${bill.date}', '${bill.room}')" class="text-blue-400 hover:text-blue-300 transition-colors" title="แสดงผลลัพธ์">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="editBill('${bill.date}', '${bill.room}')" class="text-secondary hover:text-secondary/80 transition-colors" title="แก้ไข">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteBill('${bill.date}', '${bill.room}')" class="text-accent hover:text-accent/80 transition-colors" title="ลบ">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        document.getElementById('history-body').innerHTML = rows;
        document.getElementById('no-history').classList.add('hidden');
        updatePagination(data.length);
    } catch (error) {
        document.getElementById('history-body').innerHTML = '';
        document.getElementById('no-history').classList.remove('hidden');
    }
}

// ฟังก์ชันดึงค่าไฟครั้งที่แล้วจากข้อมูลล่าสุด
function getLastReading() {
    if (electricityData.length > 0) {
        // เรียงข้อมูลตามวันที่และดึงค่าล่าสุด
        const sortedData = [...electricityData].sort((a, b) => {
            return parseDate(b.date) - parseDate(a.date);
        });
        return sortedData[0].current;
    }
    return 0;
}

// อัปเดตค่าวัดไฟครั้งที่แล้ว
function updatePreviousReading() {
    const previousReading = getLastReading();
    document.getElementById('previous-reading').value = previousReading;
}

// ฟังก์ชันบันทึกข้อมูลลง Firebase พร้อม firebaseKey
async function saveToFirebase(data) {
    try {
        const billsRef = db.ref('electricityData');
        const newBillRef = billsRef.push();
        const key = newBillRef.key;
        // เพิ่มข้อมูลห้องและชื่อ
        const billData = {
            ...data,
            room: '001',
            name: 'ป้านาท',
            firebaseKey: key
        };
        await newBillRef.set(billData);
        console.log('บันทึกข้อมูลสำเร็จ:', billData);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', error);
        throw error;
    }
}

// ฟังก์ชันดึงข้อมูลจาก Firebase
async function loadFromFirebase() {
    try {
        const snapshot = await db.ref('electricityData').once('value');
        const bills = [];
        snapshot.forEach(doc => {
            bills.push(doc.val());
        });
        return bills.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
        return [];
    }
}

// ฟังก์ชันสำหรับแปลงเดือนเป็นภาษาไทย
function getThaiMonth(date) {
    const months = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const [day, month, year] = date.split('/');
    return months[parseInt(month) - 1];
}

// ฟังก์ชันสำหรับคำนวณค่าไฟ
async function calculateBill() {
    try {
        const date = document.getElementById('bill-date').value;
        const current = parseFloat(document.getElementById('current-reading').value);
        const previous = parseFloat(document.getElementById('previous-reading').value);
        const rate = parseFloat(document.getElementById('rate').value);
        const totalAll = parseFloat(document.getElementById('total-all').value);

        if (!date || isNaN(current) || isNaN(previous) || isNaN(rate)) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        // คำนวณจำนวนหน่วยที่ใช้
        const units = current - previous;
        if (units < 0) {
            alert('ค่าวัดปัจจุบันต้องมากกว่าค่าวัดครั้งที่แล้ว');
            return;
        }

        // คำนวณค่าไฟ
        const total = units * rate;

        // สร้างข้อมูลสำหรับบันทึก
        const billData = {
            date: date,
            current: current,
            previous: previous,
            units: units,
            rate: rate,
            total: total,
            totalAll: totalAll,
            room: '001',
            name: 'ป้านาท',
            timestamp: Date.now()
        };

        // บันทึกข้อมูลลง Firebase
        await saveToFirebase(billData);

        // ดึงประวัติใหม่จากฐานข้อมูลและอัปเดตตาราง
        await renderHistoryTable();
        await updatePreviousReadingFromDB();

        // แสดงสรุปผลลัพธ์ใต้ประวัติ เฉพาะครั้งแรกที่บันทึกข้อมูลใหม่
        if (!hasShownInlineResult) {
            const summary = `
                <div class="bg-blue-50/50 rounded-xl p-6 shadow-sm mt-6 border border-blue-100">
                    <div class="text-center mb-4">
                        <h3 class="text-2xl font-bold text-blue-800">สรุปผลการคำนวณ</h3>
                        <div class="text-blue-600 text-lg font-medium mt-1">บันทึกข้อมูลสำเร็จ!</div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-white/80 p-4 rounded-lg border border-blue-100">
                            <div class="text-blue-600 mb-1">วันที่บันทึก</div>
                            <div class="text-lg font-semibold text-blue-800">${date}</div>
                        </div>
                        <div class="bg-white/80 p-4 rounded-lg border border-blue-100">
                            <div class="text-blue-600 mb-1">จำนวนหน่วยที่ใช้</div>
                            <div class="text-lg font-semibold text-blue-800">${units} หน่วย</div>
                        </div>
                        <div class="bg-white/80 p-4 rounded-lg border border-blue-100">
                            <div class="text-blue-600 mb-1">ค่าไฟทั้งหมด</div>
                            <div class="text-lg font-semibold text-blue-800">${total.toLocaleString()} บาท</div>
                        </div>
                        <div class="bg-white/80 p-4 rounded-lg border border-blue-100">
                            <div class="text-blue-600 mb-1">สถานะ</div>
                            <div class="text-lg font-semibold text-blue-600">บันทึกเรียบร้อย</div>
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('inline-result').innerHTML = summary;
            hasShownInlineResult = true;
        }

        // รีเซ็ตฟอร์ม
        document.getElementById('current-reading').value = '';
        document.getElementById('rate').value = '';
        document.getElementById('total-all').value = '';
        document.getElementById('total-units').value = '';
        // previous-reading จะอัปเดตอัตโนมัติ

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการคำนวณ:', error);
        alert('เกิดข้อผิดพลาดในการคำนวณ กรุณาลองใหม่อีกครั้ง');
    }
}

// เปิด Modal สำหรับแก้ไขข้อมูล
function openEditModal(index) {
    editingIndex = index;
    const data = electricityData[index];
    
    // แปลงวันที่จาก DD/MM/YYYY เป็น YYYY-MM-DD สำหรับ input
    const [day, month, year] = data.date.split('/');
    const formattedDate = `${year}-${month}-${day}`;
    
    document.getElementById('edit-date').value = formattedDate;
    document.getElementById('edit-current').value = data.current;
    document.getElementById('edit-previous').value = data.previous;
    document.getElementById('edit-rate').value = data.rate;
    document.getElementById('edit-total-all').value = data.totalAll !== undefined ? data.totalAll : '';
    
    const modal = document.getElementById('edit-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// ฟังก์ชันสำหรับแก้ไขข้อมูล
async function editBill(date, room) {
    try {
        const bills = await loadFromFirebase();
        const bill = bills.find(b => b.date === date && b.room === room);
        if (!bill) {
            alert('ไม่พบข้อมูลที่ต้องการแก้ไข');
            return;
        }
        document.getElementById('edit-date').value = bill.date;
        document.getElementById('edit-current').value = bill.current;
        document.getElementById('edit-previous').value = bill.previous;
        document.getElementById('edit-rate').value = bill.rate;
        document.getElementById('edit-total-all').value = bill.totalAll;
        var editRoomInput = document.getElementById('edit-room');
        if (editRoomInput) editRoomInput.value = bill.room;
        var editNameInput = document.getElementById('edit-name');
        if (editNameInput) editNameInput.value = bill.name;
        document.getElementById('edit-modal').classList.remove('hidden');
        document.getElementById('edit-modal').classList.add('flex');
    } catch (error) {
        alert('เกิดข้อผิดพลาดในการแก้ไขข้อมูล: ' + error.message);
    }
}

// ฟังก์ชันสำหรับบันทึกการแก้ไข
async function saveEdit() {
    try {
        const date = document.getElementById('edit-date').value;
        const current = parseFloat(document.getElementById('edit-current').value);
        const previous = parseFloat(document.getElementById('edit-previous').value);
        const rate = parseFloat(document.getElementById('edit-rate').value);
        const totalAll = parseFloat(document.getElementById('edit-total-all').value);

        if (isNaN(current) || isNaN(previous) || isNaN(rate)) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        // คำนวณจำนวนหน่วยที่ใช้
        const units = current - previous;
        if (units < 0) {
            alert('ค่าวัดปัจจุบันต้องมากกว่าค่าวัดครั้งที่แล้ว');
            return;
        }

        // คำนวณค่าไฟใหม่
        const total = units * rate;

        // สร้างข้อมูลใหม่
        const updatedBill = {
            date,
            current,
            previous,
            units,
            rate,
            total,
            totalAll,
            timestamp: Date.now()
        };

        // บันทึกลง Firebase
        const snapshot = await db.ref('electricityData').once('value');
        const data = snapshot.val();
        let keyToUpdate = null;
        for (const key in data) {
            if (data[key].date === date) {
                keyToUpdate = key;
                break;
            }
        }

        if (keyToUpdate) {
            await db.ref(`electricityData/${keyToUpdate}`).set(updatedBill);
            console.log('Bill updated successfully:', updatedBill);

            // ปิด modal
            closeModal();

            // รีเฟรชตาราง
            await renderHistoryTable();
            await updatePreviousReadingFromDB();

            alert('บันทึกข้อมูลเรียบร้อยแล้ว');
        } else {
            alert('ไม่พบข้อมูลที่ต้องการแก้ไขในฐานข้อมูล');
        }

    } catch (error) {
        console.error('Error in saveEdit:', error);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message);
    }
}

// ฟังก์ชันสำหรับลบข้อมูล
async function deleteBill(date, room) {
    try {
        if (!confirm('คุณต้องการลบข้อมูลนี้ใช่หรือไม่?')) {
            return;
        }
        const snapshot = await db.ref('electricityData').once('value');
        const data = snapshot.val();
        let keyToDelete = null;
        for (const key in data) {
            if (data[key].date === date && data[key].room === room) {
                keyToDelete = key;
                break;
            }
        }
        if (keyToDelete) {
            await db.ref(`electricityData/${keyToDelete}`).remove();
            await renderHistoryTable();
            await updatePreviousReadingFromDB();
            alert('ลบข้อมูลเรียบร้อยแล้ว');
        } else {
            alert('ไม่พบข้อมูลที่ต้องการลบในฐานข้อมูล');
        }
    } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบข้อมูล: ' + error.message);
    }
}

// ฟังก์ชันสำหรับปิด modal
function closeModal() {
    document.getElementById('edit-modal').classList.add('hidden');
    document.getElementById('edit-modal').classList.remove('flex');
}

// เพิ่ม event listener สำหรับปุ่มปิด modal
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...

    // เพิ่ม event listener สำหรับปุ่มปิด modal
    document.querySelector('#edit-modal button[onclick="closeModal()"]').addEventListener('click', closeModal);

    // ปิด modal เมื่อคลิกนอก modal
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('edit-modal');
        if (event.target === modal) {
            closeModal();
        }
    });
});

// เพิ่มฟังก์ชันสำหรับการเรียงลำดับ
function sortHistory(sortBy) {
    console.log('Sorting by:', sortBy);
    renderHistoryTable(null, sortBy);
}

// ฟังก์ชันดึง room ปัจจุบันจาก query string
function getRoomFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || '001';
}

// ฟังก์ชันอัปเดตค่าวัดครั้งที่แล้วจากฐานข้อมูล (sort ตามวันที่ใหม่สุด เฉพาะ room)
async function updatePreviousReadingFromDB(selectedRoom = null, selectedDate = null) {
    try {
        const bills = await loadFromFirebase();
        if (!bills || bills.length === 0) {
            document.getElementById('previous-reading').value = '';
            return;
        }
        // ถ้าไม่มี roomInput ให้ใช้ room จาก query string
        let room = selectedRoom;
        if (!room) {
            room = getRoomFromQuery();
        }
        // ถ้ามี room และ date ให้ filter เฉพาะห้องและวันที่ก่อนหน้าวันที่เลือก
        let filtered = bills;
        if (room) {
            filtered = filtered.filter(b => b.room === room);
        }
        if (selectedDate) {
            // แปลงวันที่เป็น YYYY-MM-DD เพื่อเปรียบเทียบ
            const [d, m, y] = selectedDate.split('/');
            const selDate = new Date(y, m - 1, d);
            filtered = filtered.filter(b => {
                if (!b.date) return false;
                const [bd, bm, by] = b.date.split('/');
                const billDate = new Date(by, bm - 1, bd);
                return billDate < selDate;
            });
        }
        // หา record ที่ date ใหม่สุด
        filtered.sort((a, b) => {
            const [ad, am, ay] = a.date.split('/');
            const [bd, bm, by] = b.date.split('/');
            return new Date(by, bm - 1, bd) - new Date(ay, am - 1, ad);
        });
        if (filtered.length > 0) {
            document.getElementById('previous-reading').value = filtered[0].current;
        } else {
            document.getElementById('previous-reading').value = '';
        }
    } catch (error) {
        document.getElementById('previous-reading').value = '';
    }
}

// เพิ่ม event listener ให้ input วันที่ เรียก updatePreviousReadingFromDB(room, date) โดยดึง room จาก query string ถ้าไม่มี dropdown
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('bill-date');
    if (dateInput) {
        dateInput.addEventListener('change', function() {
            const date = this.value;
            const room = getRoomFromQuery();
            updatePreviousReadingFromDB(room, date);
        });
    }
});

// ฟังก์ชันอัพโหลดข้อมูลจาก localStorage ขึ้น Firebase
async function uploadLocalDataToFirebase() {
    try {
        // อ่านข้อมูลจาก localStorage
        const savedData = localStorage.getItem('electricityData');
        if (!savedData) {
            console.log('ไม่มีข้อมูลใน localStorage');
            return;
        }

        const localData = JSON.parse(savedData);
        console.log('พบข้อมูลใน localStorage:', localData.length, 'รายการ');

        // อัพโหลดทีละรายการ
        for (const data of localData) {
            const billData = {
                date: data.date,
                currentReading: parseFloat(data.current),
                previousReading: parseFloat(data.previous),
                unitsUsed: parseFloat(data.units),
                ratePerUnit: parseFloat(data.rate),
                totalBill: parseFloat(data.total),
                totalAll: parseFloat(data.totalAll || 0),
                timestamp: Date.now() - Math.random() * 1000000 // ทำให้ timestamp ไม่ซ้ำกัน
            };

            console.log('กำลังอัพโหลดข้อมูล:', billData);
            await saveToFirebase(billData);
        }

        console.log('อัพโหลดข้อมูลสำเร็จ');
        alert('อัพโหลดข้อมูลสำเร็จ');
        
        // รีโหลดตารางประวัติ
        await renderHistoryTable();
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการอัพโหลดข้อมูล:', error);
        alert('เกิดข้อผิดพลาดในการอัพโหลดข้อมูล');
    }
}

// เรียกใช้ฟังก์ชันอัพโหลดเมื่อโหลดหน้า
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initializing...');
    try {
        // ตรวจสอบ query string ว่ามี room หรือไม่
        const params = new URLSearchParams(window.location.search);
        const roomParam = params.get('room');
        if (roomParam) {
            await renderHistoryTable(null, 'date', roomParam);
        } else {
            await renderHistoryTable(null, 'date');
        }
        await updatePreviousReadingFromDB();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

window.showCalculationResult = showCalculationResult;
window.closeResultModal = closeResultModal;

function closeResultModal() {
    const modal = document.getElementById('result-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function cleanInvalidDates() {
    for (let i = electricityData.length - 1; i >= 0; i--) {
        const d = electricityData[i].date;
        if (
            typeof d !== 'string' ||
            !/^[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}$/.test(d) ||
            d.includes('undefined')
        ) {
            electricityData.splice(i, 1);
        }
    }
    saveToFirebase(electricityData[0]);
}

function allowOnlyNumberInput(selector, allowDecimal = false) {
    document.querySelectorAll(selector).forEach(input => {
        input.addEventListener('input', function () {
            let value = this.value.replace(/[^0-9.]/g, '');
            if (!allowDecimal) value = value.replace(/\./g, '');
            // ป้องกันจุดทศนิยมซ้ำ
            if (allowDecimal) {
                const parts = value.split('.');
                if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
            }
            this.value = value;
        });
        input.addEventListener('paste', function (e) {
            e.preventDefault();
        });
    });
}

// Function to update pagination
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const paginationContainer = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" 
            class="px-3 py-1 rounded-lg ${currentPage === 1 ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'} transition-all"
            ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 || // First page
            i === totalPages || // Last page
            (i >= currentPage - 1 && i <= currentPage + 1) // Pages around current
        ) {
            paginationHTML += `
                <button onclick="changePage(${i})" 
                    class="px-3 py-1 rounded-lg ${i === currentPage ? 'bg-secondary text-white' : 'bg-white/10 hover:bg-white/20'} transition-all">
                    ${i}
                </button>
            `;
        } else if (
            i === currentPage - 2 || 
            i === currentPage + 2
        ) {
            paginationHTML += `
                <span class="px-2 text-white/50">...</span>
            `;
        }
    }

    // Next button
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" 
            class="px-3 py-1 rounded-lg ${currentPage === totalPages ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'} transition-all"
            ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

// Function to change page
async function changePage(page) {
    if (page < 1) return;
    currentPage = page;
    await renderHistoryTable();
}

// ฟังก์ชันดึงค่าวัดไฟฟ้าล่าสุดจาก Firebase
async function fetchLatestReading() {
    try {
        if (!db) {
            throw new Error('Firebase is not initialized');
        }
        
        const snapshot = await db.ref('electricityData').orderByChild('date').limitToLast(1).once('value');
        const data = snapshot.val();
        
        if (data) {
            const latestBill = Object.values(data)[0];
            document.getElementById('previous-reading').value = latestBill.current;
            return latestBill.current;
        }
        return null;
    } catch (error) {
        console.error('Error fetching latest reading:', error);
        return null;
    }
}

// เพิ่มการเรียกใช้ fetchLatestReading เมื่อโหลดหน้าเว็บ
document.addEventListener('DOMContentLoaded', function() {
    fetchLatestReading();
});

// ฟังก์ชันแสดงผลการคำนวณ
function showCalculationResult() {
    const current = parseFloat(document.getElementById('current-reading').value);
    const previous = parseFloat(document.getElementById('previous-reading').value);
    const rate = parseFloat(document.getElementById('rate').value);
    const totalAll = parseFloat(document.getElementById('total-all').value);

    if (isNaN(current) || isNaN(previous) || isNaN(rate)) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }

    const units = current - previous;
    if (units < 0) {
        alert('ค่าวัดปัจจุบันต้องมากกว่าค่าวัดครั้งที่แล้ว');
        return;
    }

    const total = units * rate;
    const date = document.getElementById('bill-date').value;
    const formattedDate = formatDate(new Date(date));

    const modalContent = document.getElementById('result-modal-content');
    modalContent.innerHTML = `
        <div class="bg-white/90 rounded-2xl p-6 shadow-xl max-w-md mx-auto result-capture">
            <div class="result-capture-content px-6" style="overflow:visible;">
                <div class="text-center mb-4">
                    <div class="text-2xl font-bold text-blue-800 mb-1">ผลการคำนวณค่าไฟ</div>
                    <div class="text-base text-gray-500">วันที่ ${formattedDate}</div>
                </div>
                <div class="divide-y divide-blue-100 mb-4">
                    <div class="flex justify-between py-2">
                        <span class="text-gray-600">ค่าวัดปัจจุบัน</span>
                        <span class="font-bold text-blue-900">${current} หน่วย</span>
                    </div>
                    <div class="flex justify-between py-2">
                        <span class="text-gray-600">ค่าวัดครั้งที่แล้ว</span>
                        <span class="font-bold text-blue-900">${previous} หน่วย</span>
                    </div>
                    <div class="flex justify-between py-2">
                        <span class="text-gray-600">จำนวนหน่วยที่ใช้</span>
                        <span class="font-bold text-blue-900">${units} หน่วย</span>
                    </div>
                    <div class="flex justify-between py-2">
                        <span class="text-gray-600">อัตราค่าไฟต่อหน่วย</span>
                        <span class="font-bold text-blue-900">${rate.toFixed(2)} บาท</span>
                    </div>
                </div>
                <div class="bg-blue-50 rounded-xl p-4 text-center mb-4">
                    <div class="text-lg font-semibold text-blue-700">ค่าไฟทั้งหมด</div>
                    <div class="text-3xl font-bold text-blue-900">฿${total.toLocaleString()}</div>
                    <div class="text-base text-blue-700">(${units} หน่วย หน่วยละ ${rate.toFixed(2)} บาท)</div>
                </div>
                <div class="bg-gray-100 rounded-xl p-3 text-center text-base text-gray-700 mb-4" id="summary-line">
                    ${generateSummaryLine({date: formattedDate, total, units, rate})}
                </div>
                <div class="flex flex-col items-center my-4">
                    <canvas id="promptpay-qr-canvas" width="224" height="224" class="rounded-xl shadow mb-2"></canvas>
                    <div class="text-sm text-gray-600">สแกนเพื่อชำระเงินค่าไฟ</div>
                </div>
            </div>
            <div class="flex justify-end gap-2">
                <button id="copy-image-btn" onclick="copyResultAsImage()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <i class="fas fa-copy"></i> <span>คัดลอก</span>
                </button>
                <button id="download-image-btn" onclick="downloadResultAsImage()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                    <i class="fas fa-download"></i> ดาวน์โหลดรูปภาพ
                </button>
            </div>
        </div>
    `;

    document.getElementById('result-modal').classList.remove('hidden');
    document.getElementById('result-modal').classList.add('flex');

    // สร้าง QR Code
    try {
        const idOrPhone = '1209701792030';
        const amount = Number(bill.total);
        const canvas = document.getElementById('promptpay-qr-canvas');
        if (!canvas) {
            console.error('ไม่พบ element promptpay-qr-canvas');
            return;
        }
        // สร้าง QR Code ด้วย promptpay.js
        const qrcodeImg = ThaiQRCode.generate(idOrPhone, { amount: amount });
        const img = new Image();
        img.src = qrcodeImg;
        img.onload = () => {
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 224, 224);
        };
    } catch(e) {
        console.error('เกิดข้อผิดพลาดในการสร้าง QR:', e);
    }
}

// ฟังก์ชันสร้างข้อความสรุปแบบสั้น
function generateSummaryLine(bill) {
    // แปลงวันที่เป็นเดือน/ปีไทย
    const [day, month, year] = bill.date.split('/');
    const months = [
        '', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const thaiMonth = months[parseInt(month, 10)];
    const thaiYear = (parseInt(year, 10) + 543).toString();
    return `ค่าไฟห้อง ${bill.room} ${bill.name} เดือน${thaiMonth} ${thaiYear} ฿${Number(bill.total).toLocaleString()} บาท ${bill.units.toLocaleString()} หน่วย หน่วยละ ${Number(bill.rate).toFixed(2)} บาท`;
}

// ฟังก์ชันส่งข้อความไป LINE Notify
async function sendResultToLine(message) {
    // ใส่ LINE Notify Token ของคุณที่นี่
    const token = 'YOUR_LINE_NOTIFY_TOKEN'; // <-- ใส่ token จริงตรงนี้
    const url = 'https://notify-api.line.me/api/notify';

    const formData = new FormData();
    formData.append('message', message);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            body: formData
        });
        if (response.ok) {
            alert('ส่งผลลัพธ์ไป LINE สำเร็จ!');
        } else {
            alert('ส่งไป LINE ไม่สำเร็จ');
        }
    } catch (error) {
        alert('เกิดข้อผิดพลาดในการส่งไป LINE');
    }
}

// ฟังก์ชันลบข้อมูล electricityData ทั้งหมดใน Firebase
async function clearAllElectricityData() {
    try {
        await db.ref('electricityData').remove();
        alert('ลบข้อมูลทั้งหมดในฐานข้อมูลเรียบร้อยแล้ว');
        await renderHistoryTable();
    } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบข้อมูล: ' + error.message);
    }
}
window.clearAllElectricityData = clearAllElectricityData;

// ฟังก์ชันคัดลอกผลการคำนวณเป็นรูปภาพ
async function copyResultAsImage() {
    const target = document.querySelector('.result-capture');
    const btn = document.getElementById('copy-image-btn');
    if (!target || !btn) return;
    let status = '';
    await html2canvas(target, {backgroundColor: null, scale: 2}).then(async canvas => {
        await new Promise(resolve => {
            canvas.toBlob(async blob => {
                if (navigator.clipboard && window.ClipboardItem) {
                    try {
                        await navigator.clipboard.write([
                            new window.ClipboardItem({ 'image/png': blob })
                        ]);
                        status = 'success';
                    } catch (e) {
                        status = 'download';
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'ผลการคำนวณค่าไฟ.png';
                        a.click();
                        URL.revokeObjectURL(url);
                    }
                } else {
                    status = 'download';
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'ผลการคำนวณค่าไฟ.png';
                    a.click();
                    URL.revokeObjectURL(url);
                }
                resolve();
            }, 'image/png');
        });
    });
    if (status === 'success') {
        btn.querySelector('span').textContent = 'คัดลอกสำเร็จ!';
    } else if (status === 'download') {
        btn.querySelector('span').textContent = 'ดาวน์โหลดรูปภาพแล้ว';
    } else {
        btn.querySelector('span').textContent = 'คัดลอกไม่ได้';
    }
    setTimeout(() => {
        btn.querySelector('span').textContent = 'คัดลอก';
    }, 1500);
}

// ฟังก์ชันดาวน์โหลดผลการคำนวณเป็นรูปภาพ (ไม่รวมปุ่ม)
async function downloadResultAsImage() {
    const target = document.querySelector('.result-capture-content');
    const btn = document.getElementById('download-image-btn');
    if (!target || !btn) return;
    btn.disabled = true;
    btn.querySelector('span')?.remove();
    btn.innerHTML = '<i class="fas fa-download"></i> กำลังดาวน์โหลด...';
    // สร้างชื่อไฟล์ตามเดือน/ปี
    let filename = 'ค่าไฟ.png';
    try {
        const dateText = target.querySelector('.text-base.text-gray-500')?.textContent || '';
        const dateMatch = dateText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (dateMatch) {
            const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
            const month = months[parseInt(dateMatch[2], 10) - 1];
            const year = (parseInt(dateMatch[3], 10) + 543).toString();
            filename = `ค่าไฟ_${month}_${year}.png`;
        }
    } catch(e) {}
    // เพิ่มขอบมลและพื้นหลังเฉพาะตอนแคป
    const prevBorderRadius = target.style.borderRadius;
    const prevBg = target.style.background;
    const prevOverflow = target.style.overflow;
    target.style.borderRadius = '1.5rem';
    target.style.background = '#f6f9ff';
    target.style.overflow = 'hidden';
    await html2canvas(target, {backgroundColor: null, scale: 2}).then(canvas => {
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
    });
    // คืนค่า style เดิม
    target.style.borderRadius = prevBorderRadius;
    target.style.background = prevBg;
    target.style.overflow = prevOverflow;
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-download"></i> ดาวน์โหลดรูปภาพ';
        btn.disabled = false;
    }, 1200);
}

// ฟังก์ชันรอให้ PromptPayQR โหลดเสร็จก่อน
function waitForPromptPayQR(callback) {
    if (window.PromptPayQR && window.QRious) {
        callback();
    } else {
        setTimeout(() => waitForPromptPayQR(callback), 100);
    }
}

// ฟังก์ชันแสดงผลลัพธ์จากประวัติ
function showResultModalFromHistory(date, room) {
    loadFromFirebase().then(bills => {
        const bill = bills.find(b => b.date === date && b.room === room);
        if (bill) {
            const modalContent = document.getElementById('result-modal-content');
            modalContent.innerHTML = `
                <div class="bg-white/90 rounded-2xl p-6 shadow-xl max-w-md mx-auto result-capture">
                    <div class="result-capture-content px-6" style="overflow:visible;">
                        <div class="text-center mb-4">
                            <div class="text-2xl font-bold text-blue-800 mb-1">ผลการคำนวณค่าไฟ</div>
                            <div class="text-base text-gray-500">ห้อง ${bill.room} - ${bill.name}</div>
                            <div class="text-base text-gray-500">วันที่ ${bill.date}</div>
                        </div>
                        <div class="divide-y divide-blue-100 mb-4">
                            <div class="flex justify-between py-2">
                                <span class="text-gray-600">ค่าวัดปัจจุบัน</span>
                                <span class="font-bold text-blue-900">${bill.current} หน่วย</span>
                            </div>
                            <div class="flex justify-between py-2">
                                <span class="text-gray-600">ค่าวัดครั้งที่แล้ว</span>
                                <span class="font-bold text-blue-900">${bill.previous} หน่วย</span>
                            </div>
                            <div class="flex justify-between py-2">
                                <span class="text-gray-600">จำนวนหน่วยที่ใช้</span>
                                <span class="font-bold text-blue-900">${bill.units} หน่วย</span>
                            </div>
                            <div class="flex justify-between py-2">
                                <span class="text-gray-600">อัตราค่าไฟต่อหน่วย</span>
                                <span class="font-bold text-blue-900">${Number(bill.rate).toFixed(2)} บาท</span>
                            </div>
                        </div>
                        <div class="bg-blue-50 rounded-xl p-4 text-center mb-4">
                            <div class="text-lg font-semibold text-blue-700">ค่าไฟทั้งหมด</div>
                            <div class="text-3xl font-bold text-blue-900">฿${Number(bill.total).toLocaleString()}</div>
                            <div class="text-base text-blue-700">(${bill.units} หน่วย หน่วยละ ${Number(bill.rate).toFixed(2)} บาท)</div>
                        </div>
                        <div class="bg-gray-100 rounded-xl p-3 text-center text-base text-gray-700 mb-4" id="summary-line">
                            ${generateSummaryLine(bill)}
                        </div>
                        <div class="flex flex-col items-center my-4">
                            <canvas id="promptpay-qr-canvas" width="224" height="224" class="rounded-xl shadow mb-2"></canvas>
                            <div class="text-sm text-gray-600">สแกนเพื่อชำระเงินค่าไฟ</div>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2">
                        <button id="copy-image-btn" onclick="copyResultAsImage()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <i class="fas fa-copy"></i> <span>คัดลอก</span>
                        </button>
                        <button id="download-image-btn" onclick="downloadResultAsImage()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                            <i class="fas fa-download"></i> ดาวน์โหลดรูปภาพ
                        </button>
                    </div>
                </div>
            `;
            document.getElementById('result-modal').classList.remove('hidden');
            document.getElementById('result-modal').classList.add('flex');

            // เพิ่ม event สำหรับปุ่มคัดลอกผลลัพธ์
            document.getElementById('copy-image-btn').onclick = function() {
                const summary = document.getElementById('summary-line').innerText;
                navigator.clipboard.writeText(summary).then(() => {
                    alert('คัดลอกผลลัพธ์แล้ว! ไปวางใน LINE ได้เลย');
                });
            };

            // สร้าง QR Code
            try {
                const idOrPhone = '1209701792030';
                const amount = Number(bill.total);
                const canvas = document.getElementById('promptpay-qr-canvas');
                if (!canvas) {
                    console.error('ไม่พบ element promptpay-qr-canvas');
                    return;
                }
                // สร้าง QR Code ด้วย promptpay.js
                const qrcodeImg = ThaiQRCode.generate(idOrPhone, { amount: amount });
                const img = new Image();
                img.src = qrcodeImg;
                img.onload = () => {
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, 224, 224);
                };
            } catch(e) {
                console.error('เกิดข้อผิดพลาดในการสร้าง QR:', e);
            }
        }
    });
}

// ฟังก์ชันสำหรับอัปเดตข้อมูลเก่าใน Firebase ให้มี room และ name
async function updateOldBillsRoomName() {
    try {
        const snapshot = await db.ref('electricityData').once('value');
        const data = snapshot.val();
        if (!data) {
            alert('ไม่พบข้อมูลใน Firebase');
            return;
        }
        const updates = {};
        for (const key in data) {
            const bill = data[key];
            if (!bill.room || !bill.name) {
                updates[key] = {
                    ...bill,
                    room: '001',
                    name: 'ป้านาท'
                };
            }
        }
        const updateKeys = Object.keys(updates);
        if (updateKeys.length === 0) {
            alert('ข้อมูลทั้งหมดมี room และ name แล้ว');
            return;
        }
        // อัปเดตข้อมูลใน Firebase
        for (const key of updateKeys) {
            await db.ref(`electricityData/${key}`).set(updates[key]);
        }
        alert('อัปเดตข้อมูลเก่าเรียบร้อยแล้ว!');
        await renderHistoryTable();
    } catch (error) {
        alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล: ' + error.message);
    }
}

// ฟังก์ชันแสดงการ์ดห้องในหน้า Home
async function renderHomeRoomCards() {
    try {
        const snapshot = await db.ref('electricityData').once('value');
        const data = snapshot.val();
        if (!data) {
            document.getElementById('home-room-cards').innerHTML = '<div class="col-span-full text-center text-gray-400">ไม่มีข้อมูลห้อง</div>';
            return;
        }
        // หา bill ล่าสุดของแต่ละ room (เช็ค date ใหม่สุด)
        const roomMap = {};
        Object.values(data).forEach(bill => {
            if (!bill.room || !bill.date) return;
            const key = bill.room;
            // เปรียบเทียบวันที่ (DD/MM/YYYY)
            const parseDate = d => {
                const [day, month, year] = d.split('/');
                return new Date(year, month - 1, day);
            };
            if (!roomMap[key] || parseDate(bill.date) > parseDate(roomMap[key].date)) {
                roomMap[key] = bill;
            }
        });
        const rooms = Object.values(roomMap);
        if (rooms.length === 0) {
            document.getElementById('home-room-cards').innerHTML = '<div class="col-span-full text-center text-gray-400">ไม่มีข้อมูลห้อง</div>';
            return;
        }
        // สร้างการ์ดใหม่ให้อยู่ตรงกลางและดูดีขึ้น
        const cards = rooms.map(bill => `
            <div class="bg-slate-800 rounded-2xl shadow p-7 flex flex-col items-center border border-blue-900 w-full max-w-xs mx-auto relative">
                <div class="absolute top-3 right-3 flex gap-2">
                    <button title="แก้ไขห้อง" onclick="handleEditRoom('${bill.room}')" class="text-blue-300 hover:text-blue-500 bg-slate-700 rounded-full p-2 shadow"><i class="fas fa-edit"></i></button>
                    <button title="ลบห้อง" onclick="handleDeleteRoom('${bill.room}')" class="text-red-300 hover:text-red-500 bg-slate-700 rounded-full p-2 shadow"><i class="fas fa-trash-alt"></i></button>
                </div>
                <div class="text-2xl font-extrabold text-blue-300 mb-1 tracking-wide">ห้อง ${bill.room}</div>
                <div class="text-base text-blue-100 mb-2">${bill.name ? 'ผู้เช่า: ' + bill.name : ''}</div>
                <div class="w-full flex flex-col gap-2 mb-3">
                    <div class="flex justify-between text-sm text-blue-200">
                        <span>วันที่ล่าสุด</span>
                        <span class="text-blue-100 font-medium">${bill.date || '-'}</span>
                    </div>
                    <div class="flex justify-between text-sm text-blue-200">
                        <span>ค่าไฟต่อหน่วย</span>
                        <span class="text-blue-300 font-semibold">${bill.rate ? bill.rate.toFixed(2) : '-'}</span>
                    </div>
                </div>
                <div class="flex flex-col items-center bg-blue-900/30 rounded-xl p-4 w-full mb-2">
                    <div class="text-xs text-blue-200">จำนวนหน่วยล่าสุด</div>
                    <div class="text-xl font-bold text-blue-100">${bill.units ?? '-'}</div>
                </div>
                <div class="flex flex-col items-center bg-green-900/30 rounded-xl p-4 w-full mb-4">
                    <div class="text-xs text-green-200">ค่าไฟทั้งหมดล่าสุด (บาท)</div>
                    <div class="text-xl font-bold text-green-200">${bill.total ? bill.total.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}</div>
                </div>
                <button class="mt-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold w-full text-base shadow transition-all" onclick="viewRoomHistory('${bill.room}')">ดูประวัติ</button>
            </div>
        `).join('');
        document.getElementById('home-room-cards').className = 'flex flex-wrap justify-center gap-8 p-8';
        document.getElementById('home-room-cards').innerHTML = cards;
    } catch (error) {
        document.getElementById('home-room-cards').innerHTML = '<div class="col-span-full text-center text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูลห้อง</div>';
    }
}

// ฟังก์ชันเมื่อคลิกดูประวัติห้อง (ตัวอย่าง: ไปหน้าใหม่หรือ filter ตาราง)
function viewRoomHistory(room) {
    window.location.href = `index.html?room=${encodeURIComponent(room)}`;
}

// === Modal สร้างห้องใหม่ ===
document.addEventListener('DOMContentLoaded', function() {
    const btnAddRoom = document.getElementById('btn-add-room');
    const modal = document.getElementById('add-room-modal');
    const closeModalBtn = document.getElementById('close-add-room-modal');
    const form = document.getElementById('add-room-form');

    if (btnAddRoom && modal && closeModalBtn && form) {
        btnAddRoom.onclick = () => { modal.classList.remove('hidden'); };
        closeModalBtn.onclick = () => { modal.classList.add('hidden'); };
        modal.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };

        form.onsubmit = async function(e) {
            e.preventDefault();
            // รับค่าจากฟอร์ม
            const room = document.getElementById('add-room-room').value.trim();
            const name = document.getElementById('add-room-name').value.trim();
            const date = document.getElementById('add-room-date').value.trim();
            const current = parseFloat(document.getElementById('add-room-current').value);
            const previous = parseFloat(document.getElementById('add-room-previous').value);
            const rate = parseFloat(document.getElementById('add-room-rate').value);
            const totalAll = parseFloat(document.getElementById('add-room-totalall').value);
            if (!room || !name || !date || isNaN(current) || isNaN(previous) || isNaN(rate)) {
                alert('กรุณากรอกข้อมูลให้ครบถ้วน');
                return;
            }
            if (current < previous) {
                alert('ค่าปัจจุบันต้องมากกว่าค่าครั้งที่แล้ว');
                return;
            }
            // คำนวณ
            const units = current - previous;
            const total = units * rate;
            // สร้างข้อมูลใหม่
            const billData = {
                room,
                name,
                date,
                current,
                previous,
                units,
                rate,
                total,
                totalAll: isNaN(totalAll) ? undefined : totalAll,
                timestamp: Date.now()
            };
            // บันทึกลง Firebase
            try {
                await db.ref('electricityData').push(billData);
                modal.classList.add('hidden');
                form.reset();
                await renderHomeRoomCards();
                alert('สร้างห้องใหม่สำเร็จ!');
            } catch (err) {
                alert('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
            }
        };
    }
});

// ฟังก์ชันลบห้อง (ลบทุก record ของ room นั้น)
async function handleDeleteRoom(room) {
    if (!confirm(`คุณต้องการลบข้อมูลทั้งหมดของห้อง ${room} หรือไม่?`)) return;
    try {
        const snapshot = await db.ref('electricityData').once('value');
        const data = snapshot.val();
        if (!data) return;
        const updates = {};
        for (const key in data) {
            if (data[key].room === room) {
                updates[key] = null;
            }
        }
        await db.ref('electricityData').update(updates);
        await renderHomeRoomCards();
        alert('ลบห้องสำเร็จ');
    } catch (err) {
        alert('เกิดข้อผิดพลาดในการลบ: ' + err.message);
    }
}

// ฟังก์ชันแก้ไขห้อง (เปิด modal พร้อมเติมข้อมูลเดิม)
async function handleEditRoom(room) {
    try {
        const snapshot = await db.ref('electricityData').once('value');
        const data = snapshot.val();
        if (!data) return;
        // หา record ล่าสุดของห้องนี้
        let latest = null;
        for (const key in data) {
            if (data[key].room === room) {
                if (!latest || new Date(data[key].timestamp || 0) > new Date(latest.timestamp || 0)) {
                    latest = data[key];
                }
            }
        }
        if (!latest) return;
        // เปิด modal และเติมข้อมูลเดิม
        document.getElementById('add-room-modal').classList.remove('hidden');
        document.getElementById('add-room-room').value = latest.room;
        document.getElementById('add-room-name').value = latest.name;
        document.getElementById('add-room-date').value = latest.date;
        document.getElementById('add-room-current').value = latest.current;
        document.getElementById('add-room-previous').value = latest.previous;
        document.getElementById('add-room-rate').value = latest.rate;
        document.getElementById('add-room-totalall').value = latest.totalAll || '';
        // เมื่อ submit จะบันทึกทับทุก record ของห้องนี้
        const form = document.getElementById('add-room-form');
        form.onsubmit = async function(e) {
            e.preventDefault();
            const name = document.getElementById('add-room-name').value.trim();
            const newRoom = document.getElementById('add-room-room').value.trim();
            if (!newRoom) return;
            const updates = {};
            for (const key in data) {
                if (data[key].room === room) {
                    updates[`${key}/name`] = name;
                    updates[`${key}/room`] = newRoom;
                }
            }
            await db.ref('electricityData').update(updates);
            document.getElementById('add-room-modal').classList.add('hidden');
            form.reset();
            await renderHomeRoomCards();
            alert('แก้ไขข้อมูลห้องสำเร็จ!');
        };
    } catch (err) {
        alert('เกิดข้อผิดพลาดในการแก้ไข: ' + err.message);
    }
} 