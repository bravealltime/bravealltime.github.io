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
async function renderHistoryTable(data = null, sortBy = 'date') {
    try {
        // If no data is provided, fetch from Firebase
        if (!data) {
            console.log('Fetching data from Firebase...');
            const snapshot = await db.ref('electricityData').once('value');
            data = snapshot.val();
            console.log('Data fetched from Firebase:', data);
        }

        // Convert object to array if needed
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            data = Object.values(data);
        }

        // Validate data
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.warn('No valid data to display');
            document.getElementById('history-body').innerHTML = '';
            document.getElementById('no-history').classList.remove('hidden');
            return;
        }

        // Sort data based on sortBy parameter
        data.sort((a, b) => {
            if (sortBy === 'date') {
                // Sort by date (newest to oldest)
                const dateA = new Date(a.date.split('/').reverse().join('-'));
                const dateB = new Date(b.date.split('/').reverse().join('-'));
                return dateB - dateA;
            } else if (sortBy === 'amount') {
                // Sort by total amount (highest to lowest)
                const amountA = parseFloat(a.totalAll) || 0;
                const amountB = parseFloat(b.totalAll) || 0;
                return amountB - amountA;
            }
            return 0;
        });

        // Generate table rows
        const rows = data.map(bill => `
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
                        <button onclick="editBill('${bill.date}')" class="text-secondary hover:text-secondary/80 transition-colors">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteBill('${bill.date}')" class="text-accent hover:text-accent/80 transition-colors">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Update table
        document.getElementById('history-body').innerHTML = rows;
        document.getElementById('no-history').classList.add('hidden');

        // Update pagination
        updatePagination(data);

    } catch (error) {
        console.error('Error rendering history table:', error);
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

// ฟังก์ชันบันทึกข้อมูลลง Firebase
async function saveToFirebase(data) {
    try {
        const billsRef = db.ref('bills');
        const newBillRef = billsRef.push();
        await newBillRef.set({
            ...data,
            timestamp: Date.now()
        });
        console.log('บันทึกข้อมูลสำเร็จ:', data);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', error);
        throw error; // ส่ง error ไปให้ฟังก์ชันที่เรียกใช้จัดการ
    }
}

// ฟังก์ชันดึงข้อมูลจาก Firebase
async function loadFromFirebase() {
    try {
        const snapshot = await db.ref('bills').once('value');
        const bills = [];
        snapshot.forEach(doc => {
            const data = doc.val();
            bills.push({
                id: doc.key,
                date: data.date,
                currentReading: data.currentReading,
                previousReading: data.previousReading,
                unitsUsed: data.unitsUsed,
                ratePerUnit: data.ratePerUnit,
                totalBill: data.totalBill,
                totalAll: data.totalAll,
                timestamp: data.timestamp
            });
        });
        // เรียงจากใหม่ไปเก่า
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

        if (current < previous) {
            alert('ค่าวัดปัจจุบันต้องมากกว่าค่าวัดครั้งที่แล้ว');
            return;
        }

        const units = current - previous;
        const total = units * rate;

        // บันทึกข้อมูลลง Firebase
        const billData = {
            date: date,
            current: current,
            previous: previous,
            units: units,
            rate: rate,
            total: total,
            totalAll: totalAll || 0
        };

        await db.ref('electricityData').push(billData);
        
        // แสดงผลการคำนวณ
        document.getElementById('units-used').textContent = units.toFixed(2);
        document.getElementById('rate-per-unit').textContent = rate.toFixed(2);
        document.getElementById('total-bill').textContent = total.toFixed(2);
        
        // รีเซ็ตฟอร์ม
        document.getElementById('current-reading').value = '';
        document.getElementById('rate').value = '0';
        document.getElementById('total-all').value = '';
        
        // ดึงค่าวัดล่าสุดมาใส่ในค่าวัดครั้งที่แล้ว
        await fetchLatestReading();
        
        // รีเฟรชตาราง
        renderHistoryTable();
        
        alert('บันทึกข้อมูลสำเร็จ');
    } catch (error) {
        console.error('Error calculating bill:', error);
        alert('เกิดข้อผิดพลาดในการคำนวณ: ' + error.message);
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
async function editBill(date) {
    try {
        console.log('Editing bill for date:', date);
        // ดึงข้อมูลจาก Firebase
        const snapshot = await db.ref('electricityData').once('value');
        const data = snapshot.val();
        const bills = Object.values(data);
        
        // หาข้อมูลที่ต้องการแก้ไข
        const bill = bills.find(b => b.date === date);
        if (!bill) {
            console.error('Bill not found:', date);
            alert('ไม่พบข้อมูลที่ต้องการแก้ไข');
            return;
        }

        // เติมข้อมูลในฟอร์มแก้ไข
        document.getElementById('edit-date').value = bill.date;
        document.getElementById('edit-current').value = bill.current;
        document.getElementById('edit-previous').value = bill.previous;
        document.getElementById('edit-rate').value = bill.rate;
        document.getElementById('edit-total-all').value = bill.totalAll;

        // แสดง modal
        document.getElementById('edit-modal').classList.remove('hidden');
        document.getElementById('edit-modal').classList.add('flex');

    } catch (error) {
        console.error('Error in editBill:', error);
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

        // คำนวณค่าไฟ
        const units = current - previous;
        const total = units * rate; // ค่าไฟทั้งหมด = ราคาต่อหน่วย * จำนวนหน่วย

        // สร้างข้อมูลใหม่
        const updatedBill = {
            date,
            current,
            previous,
            units,
            rate,
            total,
            totalAll
        };

        // บันทึกลง Firebase
        await db.ref(`electricityData/${date}`).set(updatedBill);
        console.log('Bill updated successfully:', updatedBill);

        // ปิด modal
        closeModal();

        // รีเฟรชตาราง
        await renderHistoryTable();

        alert('บันทึกข้อมูลเรียบร้อยแล้ว');

    } catch (error) {
        console.error('Error in saveEdit:', error);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message);
    }
}

// ฟังก์ชันสำหรับลบข้อมูล
async function deleteBill(date) {
    try {
        if (!confirm('คุณต้องการลบข้อมูลนี้ใช่หรือไม่?')) {
            return;
        }

        console.log('Deleting bill for date:', date);
        
        // ลบข้อมูลจาก Firebase
        await db.ref(`electricityData/${date}`).remove();
        console.log('Bill deleted successfully');

        // รีเฟรชตาราง
        await renderHistoryTable();

        alert('ลบข้อมูลเรียบร้อยแล้ว');

    } catch (error) {
        console.error('Error in deleteBill:', error);
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
        // Create refresh button
        const refreshButton = document.createElement('button');
        refreshButton.className = 'px-4 py-2 bg-secondary hover:bg-secondary/90 rounded-lg font-medium text-base transition-all shadow-md flex-shrink-0';
        refreshButton.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>อัปเดตข้อมูล';
        refreshButton.onclick = async function() {
            try {
                console.log('Manual refresh started...');
                // Try to load from Firebase first
                const snapshot = await db.ref('electricityData').once('value');
                const data = snapshot.val();
                
                if (data) {
                    console.log('Data loaded from Firebase:', data);
                    renderHistoryTable(data, 'date'); // Default sort by date
                } else {
                    console.log('No data in Firebase, fetching from Google Sheets...');
                    // If no data in Firebase, fetch from Google Sheets
                    const sheetData = await fetchSheetData();
                    if (sheetData && sheetData.length > 0) {
                        console.log('Data fetched from sheets:', sheetData);
                        await saveToFirebase(sheetData);
                        renderHistoryTable(sheetData, 'date'); // Default sort by date
                    } else {
                        console.warn('No data found from Google Sheets');
                        alert('ไม่พบข้อมูลจาก Google Sheets');
                    }
                }
            } catch (error) {
                console.error('Error during manual refresh:', error);
                alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล: ' + error.message);
            }
        };

        // Add refresh button to the page
        const buttonContainer = document.querySelector('.flex.gap-2.justify-end');
        if (buttonContainer) {
            buttonContainer.appendChild(refreshButton);
        }

        // Initial render with default sort by date
        await renderHistoryTable(null, 'date');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

window.showCalculationResult = showCalculationResult;
window.closeResultModal = closeResultModal;

function closeResultModal() {
    const modal = document.getElementById('result-modal');
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.95)';
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 200);
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
function updatePagination(totalItems, currentStartIndex, itemsPerPage) {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentPage = Math.floor(currentStartIndex / itemsPerPage) + 1;

    let paginationHTML = '';

    // Previous button
    paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" 
            class="px-3 py-1 rounded-lg ${currentPage === 1 ? 'bg-white/10 cursor-not-allowed' : 'bg-white/20 hover:bg-white/30'} transition-all"
            ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button onclick="changePage(${i})" 
                class="px-3 py-1 rounded-lg ${i === currentPage ? 'bg-secondary' : 'bg-white/20 hover:bg-white/30'} transition-all">
                ${i}
            </button>
        `;
    }

    // Next button
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" 
            class="px-3 py-1 rounded-lg ${currentPage === totalPages ? 'bg-white/10 cursor-not-allowed' : 'bg-white/20 hover:bg-white/30'} transition-all"
            ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    pagination.innerHTML = paginationHTML;
}

// Function to change page
function changePage(page) {
    const itemsPerPage = 10;
    const startIndex = (page - 1) * itemsPerPage;
    renderHistoryTable(electricityData, startIndex, itemsPerPage);
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