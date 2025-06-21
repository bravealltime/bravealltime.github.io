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
function renderHistoryTable(data, page = 1) {
    const historyBody = document.getElementById('history-body');
    historyBody.innerHTML = '';
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageData = data.slice(start, end);
    pageData.forEach((data, index) => {
        const row = document.createElement('tr');
        row.className = 'border-b border-white/10 hover:bg-white/5 transition-all duration-200';
        
        // แปลงวันที่ให้ถูกต้อง
        let displayDate = data.date;
        if (displayDate.includes('undefined')) {
            // ถ้ามี undefined ให้ใช้ค่าวันที่ที่ถูกต้อง
            const [day, month, year] = data.date.split('/').filter(part => part !== 'undefined');
            displayDate = `${day}/${month}/${year}`;
        }

        row.innerHTML = `
            <td class="py-3 px-4 text-center text-sm text-white/80 font-medium">${displayDate}</td>
            <td class="py-3 px-4 text-center text-sm text-white/80">${data.current.toLocaleString()}</td>
            <td class="py-3 px-4 text-center text-sm text-white/80">${data.previous.toLocaleString()}</td>
            <td class="py-3 px-4 text-center text-sm text-white/80">${data.units.toLocaleString()}</td>
            <td class="py-3 px-4 text-center text-sm text-white/80">${data.rate.toFixed(2)}</td>
            <td class="py-3 px-4 text-center text-sm font-semibold text-white">฿${data.total.toLocaleString()}</td>
            <td class="py-3 px-4 text-center text-sm font-semibold text-white">${data.totalAll ? '฿'+data.totalAll.toLocaleString() : '-'}</td>
            <td class="py-3 px-4 text-center text-sm">
                <div class="flex justify-center gap-2">
                    <button type="button" class="result-btn px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all duration-200 flex items-center gap-1.5">
                        <i class="fas fa-calculator text-sm"></i>
                    </button>
                    <button class="edit-btn px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-200 flex items-center gap-1.5" onclick="openEditModal(${start + index})">
                        <i class="fas fa-edit text-sm"></i>
                    </button>
                    <button class="delete-btn px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200 flex items-center gap-1.5" onclick="deleteRecord(${start + index})">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
            </td>
        `;
        historyBody.appendChild(row);
        // ป้องกัน error
        const resultBtn = row.querySelector('.result-btn');
        if (resultBtn) {
            resultBtn.addEventListener('click', () => showCalculationResult(data));
        }
    });
}

// ดึงค่าไฟครั้งที่แล้วจากข้อมูลล่าสุด
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

// ฟังก์ชันสำหรับบันทึกข้อมูลลง localStorage
function saveToLocalStorage() {
    localStorage.setItem('electricityData', JSON.stringify(electricityData));
}

// ฟังก์ชันสำหรับโหลดข้อมูลจาก localStorage
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('electricityData');
    if (savedData) {
        electricityData.length = 0; // ล้างข้อมูลเดิม
        electricityData.push(...JSON.parse(savedData));
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

// คำนวณค่าไฟ
function calculateBill() {
    let billDate = document.getElementById('bill-date').value.trim();
    let formattedDate = '';
    if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(billDate)) {
        // กรณี YYYY-MM-DD
        const [year, month, day] = billDate.split('-');
        formattedDate = `${day}/${month}/${year}`;
    } else if (/^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/.test(billDate)) {
        // กรณี DD/MM/YYYY
        formattedDate = billDate;
    } else {
        alert('กรุณากรอกวันที่ในรูปแบบที่ถูกต้อง (DD/MM/YYYY หรือ YYYY-MM-DD)');
        return;
    }
    const currentReading = parseFloat(document.getElementById('current-reading').value);
    const previousReading = getLastReading();
    const rate = parseFloat(document.getElementById('rate').value);
    const totalAll = parseFloat(document.getElementById('total-all').value);

    if (!formattedDate || isNaN(currentReading) || isNaN(rate)) {
        alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
        return;
    }

    if (currentReading < previousReading) {
        alert('ค่าวัดปัจจุบันต้องมากกว่าค่าวัดครั้งที่แล้ว');
        return;
    }

    const unitsUsed = currentReading - previousReading;
    const totalBill = unitsUsed * rate;

    // สร้างข้อความผลการคำนวณ
    const thaiMonth = getThaiMonth(formattedDate);
    const year = parseInt(formattedDate.split('/')[2]) + 543;
    const resultText = `ค่าไฟของป้านาดเดือน${thaiMonth} ${year} ฿${totalBill.toLocaleString()} บาท ${unitsUsed.toLocaleString()} หน่วย หน่วยละ ${rate.toFixed(2)} บาท`;

    // แสดงผลการคำนวณ
    const resultSection = document.getElementById('result-section');
    resultSection.innerHTML = `
        <div class="text-center">
            <h2 class="text-xl font-semibold mb-4">ผลการคำนวณ</h2>
            <p class="text-lg">${resultText}</p>
        </div>
    `;
    
    // แสดงผลลัพธ์ด้วย animation
    resultSection.style.display = 'block';
    resultSection.style.opacity = '0';
    resultSection.style.transform = 'translateY(10px)';
    setTimeout(() => {
        resultSection.style.opacity = '1';
        resultSection.style.transform = 'translateY(0)';
    }, 100);

    // เพิ่มข้อมูลลงในประวัติ
    const newData = {
        date: formattedDate,
        current: currentReading,
        previous: previousReading,
        units: unitsUsed,
        rate: rate,
        total: totalBill,
        totalAll: !isNaN(totalAll) ? totalAll : undefined
    };
    electricityData.unshift(newData);
    
    // บันทึกข้อมูลลง localStorage
    saveToLocalStorage();
    
    // อัปเดตค่าวัดไฟครั้งที่แล้ว
    updatePreviousReading();
    
    // ล้างค่าในช่องค่าวัดปัจจุบัน
    document.getElementById('current-reading').value = '';
    
    displayHistory();
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

// ปิด Modal
function closeModal() {
    const modal = document.getElementById('edit-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// บันทึกการแก้ไขข้อมูล
function saveEdit() {
    const date = document.getElementById('edit-date').value;
    const current = parseFloat(document.getElementById('edit-current').value);
    const previous = parseFloat(document.getElementById('edit-previous').value);
    const rate = parseFloat(document.getElementById('edit-rate').value);
    const totalAll = parseFloat(document.getElementById('edit-total-all').value);

    if (!date || isNaN(current) || isNaN(previous) || isNaN(rate)) {
        alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
        return;
    }

    if (current < previous) {
        alert('ค่าวัดปัจจุบันต้องมากกว่าค่าวัดครั้งที่แล้ว');
        return;
    }

    const units = current - previous;
    const total = units * rate;

    // แปลงวันที่จาก YYYY-MM-DD เป็น DD/MM/YYYY
    const [year, month, day] = date.split('-');
    const formattedDate = `${day}/${month}/${year}`;

    electricityData[editingIndex] = {
        date: formattedDate,
        current: current,
        previous: previous,
        units: units,
        rate: rate,
        total: total,
        totalAll: !isNaN(totalAll) ? totalAll : undefined
    };
    
    // บันทึกข้อมูลลง localStorage
    saveToLocalStorage();
    
    // อัปเดตค่าวัดไฟครั้งที่แล้ว
    updatePreviousReading();
    
    closeModal();
    displayHistory(currentPage);
}

// ลบข้อมูล
function deleteRecord(index) {
    if (confirm('คุณต้องการลบข้อมูลนี้ใช่หรือไม่?')) {
        electricityData.splice(index, 1);
        // บันทึกข้อมูลลง localStorage
        saveToLocalStorage();
        // อัปเดตค่าวัดไฟครั้งที่แล้ว
        updatePreviousReading();
        displayHistory(currentPage);
    }
}

// เพิ่มฟังก์ชันสำหรับการเรียงลำดับ
function sortHistory(type) {
    const dateBtn = document.querySelector('button[onclick="sortHistory(\'date\')"]');
    const amountBtn = document.querySelector('button[onclick="sortHistory(\'amount\')"]');
    
    // รีเซ็ตสไตล์ของปุ่มทั้งหมด
    [dateBtn, amountBtn].forEach(btn => {
        btn.className = 'px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 text-sm flex items-center gap-1.5';
    });

    let sortedData = [...electricityData];
    if (type === 'date') {
        sortedData.sort((a, b) => parseDate(b.date) - parseDate(a.date));
        dateBtn.className = 'px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-1.5';
    } else if (type === 'amount') {
        sortedData.sort((a, b) => b.total - a.total);
        amountBtn.className = 'px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-1.5';
    }
    renderHistoryTable(sortedData);
}

// ปรับปรุงฟังก์ชัน renderPagination
function renderPagination(data, page = 1) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    
    // เพิ่มปุ่ม Previous
    if (totalPages > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.className = `px-3 py-1 rounded-lg transition-all duration-200 text-sm ${page === 1 ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white/70'}`;
        prevBtn.disabled = page === 1;
        prevBtn.onclick = () => {
            if (page > 1) {
                currentPage = page - 1;
                displayHistory(currentPage);
            }
        };
        pagination.appendChild(prevBtn);
    }

    // แสดงปุ่มหมายเลขหน้า
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `px-3 py-1 rounded-lg transition-all duration-200 text-sm ${i === page ? 'bg-secondary text-white font-bold' : 'bg-white/10 hover:bg-white/20 text-white/70'}`;
        btn.onclick = () => {
            currentPage = i;
            displayHistory(i);
        };
        pagination.appendChild(btn);
    }

    // เพิ่มปุ่ม Next
    if (totalPages > 1) {
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.className = `px-3 py-1 rounded-lg transition-all duration-200 text-sm ${page === totalPages ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white/70'}`;
        nextBtn.disabled = page === totalPages;
        nextBtn.onclick = () => {
            if (page < totalPages) {
                currentPage = page + 1;
                displayHistory(currentPage);
            }
        };
        pagination.appendChild(nextBtn);
    }
}

function refreshHistoryAndPagination() {
    renderHistoryPage(currentPage);
    renderPagination();
}

// ฟังก์ชันสำหรับแสดงผลการคำนวณ
function showCalculationResult(data) {
    // ป้องกัน date ผิดรูปแบบ
    let thaiMonth = '-';
    let year = '-';
    let dateDisplay = data.date;
    if (typeof data.date === 'string' && data.date.split('/').length === 3) {
        const [day, month, y] = data.date.split('/');
        const monthNum = parseInt(month);
        thaiMonth = (monthNum >= 1 && monthNum <= 12) ? getThaiMonth(data.date) : '-';
        year = (parseInt(y) ? parseInt(y) + 543 : '-');
        dateDisplay = `${day}/${month}/${y}`;
    }
    // Layout แบบในภาพ + ปุ่ม LINE
    const modal = document.getElementById('result-modal');
    const modalContent = document.getElementById('result-modal-content');
    modalContent.innerHTML = `
        <div class="space-y-4">
            <div class="bg-white/10 rounded-xl p-6 shadow">
                <h3 class="text-lg font-bold mb-4">รายละเอียดการคำนวณ</h3>
                <div class="space-y-2 text-base">
                    <div class="flex justify-between"><span class="text-white/70">วันที่:</span><span>${dateDisplay}</span></div>
                    <div class="flex justify-between"><span class="text-white/70">ค่าวัดปัจจุบัน:</span><span>${data.current.toLocaleString()} หน่วย</span></div>
                    <div class="flex justify-between"><span class="text-white/70">ค่าวัดครั้งที่แล้ว:</span><span>${data.previous.toLocaleString()} หน่วย</span></div>
                    <div class="flex justify-between"><span class="text-white/70">จำนวนหน่วยที่ใช้:</span><span>${data.units.toLocaleString()} หน่วย</span></div>
                    <div class="flex justify-between"><span class="text-white/70">อัตราค่าไฟต่อหน่วย:</span><span>฿${data.rate.toFixed(2)}</span></div>
                </div>
            </div>
            <div class="bg-white/10 rounded-xl p-6 shadow">
                <h3 class="text-lg font-bold mb-4">สรุปผล</h3>
                <div class="flex justify-between items-center mb-2">
                    <span class="text-white/80">ค่าไฟ:</span>
                    <span class="text-2xl font-bold text-green-400">฿${data.total.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
                </div>
                ${data.totalAll ? `
                <div class="flex justify-between items-center mb-2">
                    <span class="text-white/80">ค่าไฟทั้งบ้าน:</span>
                    <span class="text-2xl font-bold text-green-400">฿${data.totalAll.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
                </div>
                ` : ''}
                <button id="line-share-btn" class="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 mx-auto">
                    ส่งข้อความทางไลน์
                </button>
            </div>
            <div class="text-center text-base text-white/70 mt-2">
                ค่าไฟของป้านาดเดือน${thaiMonth !== '-' ? thaiMonth : '-'} ${year !== '-' ? year : '-'}
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.95)';
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.transform = 'scale(1)';
        // LINE share
        const lineBtn = document.getElementById('line-share-btn');
        if (lineBtn) {
            const msg = `ค่าไฟของป้านาดเดือน${thaiMonth} ${year}\n` +
                `รวม ${data.total.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} บาท\n` +
                `ใช้ไฟ ${data.units.toLocaleString()} หน่วย หน่วยละ ฿${data.rate.toFixed(2)}\n` +
                `ค่าวัดปัจจุบัน: ${data.current.toLocaleString()} | ค่าวัดครั้งที่แล้ว: ${data.previous.toLocaleString()}` +
                (data.totalAll ? `\nค่าไฟทั้งบ้าน: ฿${data.totalAll.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}` : '');
            const url = `https://line.me/R/msg/text/?${encodeURIComponent(msg)}`;
            lineBtn.onclick = () => window.open(url, '_blank');
        }
    }, 10);
}

// เรียกเมื่อโหลดหน้า
window.addEventListener('DOMContentLoaded', () => {
    // โหลดข้อมูลจาก localStorage
    loadFromLocalStorage();
    cleanInvalidDates();
    displayHistory();
    // แสดงค่าไฟครั้งที่แล้วในช่อง input
    updatePreviousReading();
    document.getElementById('previous-reading').readOnly = true;
    
    // ตั้งค่าวันที่เริ่มต้นเป็นวันนี้
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bill-date').value = today;

    // เพิ่ม event listener สำหรับปิด modal
    document.querySelector('.close').addEventListener('click', () => {
        closeModal();
    });

    // ปิด modal เมื่อคลิกนอก modal
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('edit-modal');
        if (event.target === modal) {
            closeModal();
        }
        const resultModal = document.getElementById('result-modal');
        if (event.target === resultModal) {
            closeResultModal();
        }
    });

    allowOnlyNumberInput('#current-reading, #previous-reading, #total-units', false);
    allowOnlyNumberInput('#rate, #total-all', true);
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
    saveToLocalStorage();
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