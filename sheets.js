// Google Sheets API configuration
const SHEET_ID = '2PACX-1vR38MDD2Xj9J7Iq7QnePSX081nZg3fyE7wzOPzrIRcnSNqS5qk4rMPSu42FsLW5RJ-ORuT2oYQ_8IIj';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pubhtml`;

// Initial data from Google Sheets
const initialData = [
    {
        "date": "19/11/2024",
        "current": 20573,
        "previous": 20218,
        "units": 355,
        "rate": 4.84,
        "total": 1717,
        "totalAll": 3259.85
    },
    {
        "date": "19/10/2024",
        "current": 20218,
        "previous": 19855,
        "units": 363,
        "rate": 4.85,
        "total": 1761,
        "totalAll": 3440.32
    },
    {
        "date": "19/9/2024",
        "current": 19855,
        "previous": 19466,
        "units": 389,
        "rate": 4.88,
        "total": 1900,
        "totalAll": 3863.13
    },
    {
        "date": "19/8/2024",
        "current": 19466,
        "previous": 19063,
        "units": 403,
        "rate": 4.90,
        "total": 1974,
        "totalAll": 4084.84
    },
    {
        "date": "19/7/2024",
        "current": 19063,
        "previous": 18660,
        "units": 403,
        "rate": 4.92,
        "total": 1982,
        "totalAll": 4456.09
    },
    {
        "date": "19/6/2024",
        "current": 18660,
        "previous": 18263,
        "units": 397,
        "rate": 4.92,
        "total": 1953,
        "totalAll": 4497.34
    },
    {
        "date": "19/5/2024",
        "current": 18263,
        "previous": 17886,
        "units": 377,
        "rate": 5.04,
        "total": 1901,
        "totalAll": 4249.85
    },
    {
        "date": "19/4/2024",
        "current": 17886,
        "previous": 17505,
        "units": 381,
        "rate": 4.91,
        "total": 1870,
        "totalAll": 4249.85
    },
    {
        "date": "19/3/2024",
        "current": 17505,
        "previous": 17164,
        "units": 341,
        "rate": 4.91,
        "total": 1673,
        "totalAll": 4208.60
    },
    {
        "date": "19/2/2024",
        "current": 17164,
        "previous": 16746,
        "units": 418,
        "rate": 4.92,
        "total": 2058,
        "totalAll": 4579.85
    },
    {
        "date": "19/1/2024",
        "current": 16746,
        "previous": 16388,
        "units": 358,
        "rate": 4.90,
        "total": 1753,
        "totalAll": 4079.70
    },
    {
        "date": "19/12/2023",
        "current": 16388,
        "previous": 16046,
        "units": 342,
        "rate": 4.68,
        "total": 1601,
        "totalAll": 3759.69
    },
    {
        "date": "19/11/2023",
        "current": 16046,
        "previous": 15669,
        "units": 377,
        "rate": 4.69,
        "total": 1767,
        "totalAll": 3849.00
    },
    {
        "date": "19/10/2023",
        "current": 15669,
        "previous": 15320,
        "units": 349,
        "rate": 4.67,
        "total": 1630,
        "totalAll": 3586.00
    },
    {
        "date": "19/9/2023",
        "current": 15320,
        "previous": 14992,
        "units": 328,
        "rate": 5.25,
        "total": 1721,
        "totalAll": 3968.00
    },
    {
        "date": "19/8/2023",
        "current": 14992,
        "previous": 14669,
        "units": 323,
        "rate": 5.34,
        "total": 1724,
        "totalAll": 4099.00
    },
    {
        "date": "19/7/2023",
        "current": 14669,
        "previous": 14409,
        "units": 260,
        "rate": 5.40,
        "total": 1403,
        "totalAll": 3739.00
    },
    {
        "date": "19/6/2023",
        "current": 14409,
        "previous": 14222,
        "units": 160,
        "rate": 5.35,
        "total": 857,
        "totalAll": 3214.00
    },
    {
        "date": "19/5/2023",
        "current": 14222,
        "previous": 13969,
        "units": 253,
        "rate": 5.38,
        "total": 1360,
        "totalAll": 3505.00
    },
    {
        "date": "19/4/2023",
        "current": 13969,
        "previous": 13663,
        "units": 306,
        "rate": 5.45,
        "total": 1667,
        "totalAll": 4134.00
    },
    {
        "date": "19/3/2023",
        "current": 13663,
        "previous": 13436,
        "units": 227,
        "rate": 5.37,
        "total": 1220,
        "totalAll": 3240.00
    },
    {
        "date": "19/2/2023",
        "current": 13436,
        "previous": 13117,
        "units": 319,
        "rate": 5.42,
        "total": 1729,
        "totalAll": 3773.00
    },
    {
        "date": "19/1/2023",
        "current": 13117,
        "previous": 12840,
        "units": 277,
        "rate": 5.37,
        "total": 1488,
        "totalAll": 3212.00
    },
    {
        "date": "19/12/2022",
        "current": 12840,
        "previous": 12530,
        "units": 310,
        "rate": 5.42,
        "total": 1680,
        "totalAll": 3507.00
    },
    {
        "date": "19/11/2022",
        "current": 12530,
        "previous": 12231,
        "units": 299,
        "rate": 5.31,
        "total": 1588,
        "totalAll": 3994.00
    },
    {
        "date": "19/10/2022",
        "current": 12231,
        "previous": 12016,
        "units": 215,
        "rate": 5.46,
        "total": 1175,
        "totalAll": 4109.00
    },
    {
        "date": "19/9/2022",
        "current": 12016,
        "previous": 11669,
        "units": 347,
        "rate": 5.55,
        "total": 1926,
        "totalAll": 6183.00
    },
    {
        "date": "19/8/2022",
        "current": 11669,
        "previous": 11636,
        "units": 301,
        "rate": 4.78,
        "total": 1438,
        "totalAll": 4375.00
    },
    {
        "date": "19/7/2022",
        "current": 11636,
        "previous": 11100,
        "units": 268,
        "rate": 4.79,
        "total": 1285,
        "totalAll": 4745.00
    },
    {
        "date": "19/6/2022",
        "current": 11100,
        "previous": 10806,
        "units": 294,
        "rate": 4.50,
        "total": 1323,
        "totalAll": 4279.00
    },
    {
        "date": "19/5/2022",
        "current": 10806,
        "previous": 10483,
        "units": 323,
        "rate": 4.50,
        "total": 1454,
        "totalAll": 3749.00
    },
    {
        "date": "19/4/2022",
        "current": 10483,
        "previous": 10199,
        "units": 284,
        "rate": 4.50,
        "total": 1278,
        "totalAll": 4099.00
    },
    {
        "date": "19/3/2022",
        "current": 10199,
        "previous": 9897,
        "units": 302,
        "rate": 4.50,
        "total": 1359,
        "totalAll": 3577.00
    },
    {
        "date": "19/2/2022",
        "current": 9897,
        "previous": 9562,
        "units": 335,
        "rate": 4.55,
        "total": 1524,
        "totalAll": 4199.00
    },
    {
        "date": "19/1/2022",
        "current": 9562,
        "previous": 9320,
        "units": 242,
        "rate": 4.50,
        "total": 1089,
        "totalAll": 3306.00
    },
    {
        "date": "19/12/2021",
        "current": 9320,
        "previous": 9007,
        "units": 313,
        "rate": 4.40,
        "total": 1377,
        "totalAll": 3426.00
    }
];

// เพิ่มบรรทัดนี้ไว้ด้านบนสุดของไฟล์
let electricityData = [];

// Function to fetch data from Google Sheets
async function fetchSheetData() {
    try {
        console.log('Fetching data from Google Sheets...');
        const response = await fetch(SHEET_URL);
        const html = await response.text();
        
        // Create a temporary DOM element to parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Get all rows from the table
        const rows = doc.querySelectorAll('table tr');
        console.log('Found rows:', rows.length);
        
        const data = [];
        let isFirstRow = true;
        
        rows.forEach(row => {
            if (isFirstRow) {
                isFirstRow = false;
                return;
            }
            
            const cells = row.querySelectorAll('td');
            if (cells.length >= 7) {
                const bill = {
                    date: cells[0].textContent.trim(),
                    current: parseFloat(cells[1].textContent.trim()) || 0,
                    previous: parseFloat(cells[2].textContent.trim()) || 0,
                    units: parseFloat(cells[3].textContent.trim()) || 0,
                    rate: parseFloat(cells[4].textContent.trim()) || 0,
                    total: parseFloat(cells[5].textContent.trim()) || 0,
                    totalAll: parseFloat(cells[6].textContent.trim()) || 0
                };
                
                // Validate bill data
                if (bill.date && !isNaN(bill.current) && !isNaN(bill.previous)) {
                    data.push(bill);
                } else {
                    console.warn('Skipping invalid bill:', bill);
                }
            }
        });
        
        console.log('Processed data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching sheet data:', error);
        throw new Error('ไม่สามารถดึงข้อมูลจาก Google Sheets ได้: ' + error.message);
    }
}

// Function to check if Firebase is initialized
function checkFirebaseInitialized() {
    if (!db) {
        throw new Error('Firebase is not initialized. Please check your Firebase configuration.');
    }
}

// Function to save data to Firebase
async function saveToFirebase(data) {
    try {
        console.log('Starting to save data to Firebase...');
        console.log('Raw data received:', data);

        // Check if Firebase is initialized
        if (!db) {
            throw new Error('Firebase is not initialized');
        }

        // Validate and convert data to array if needed
        let dataArray;
        if (Array.isArray(data)) {
            dataArray = data;
        } else if (typeof data === 'object' && data !== null) {
            dataArray = Object.values(data);
        } else {
            throw new Error('Invalid data format: Expected array or object');
        }

        // Validate each bill in the array
        dataArray = dataArray.filter(bill => {
            if (!bill || typeof bill !== 'object') {
                console.warn('Skipping invalid bill:', bill);
                return false;
            }
            
            // Check required fields
            const isValid = bill.date && 
                          typeof bill.current === 'number' && 
                          typeof bill.previous === 'number' &&
                          !isNaN(bill.current) && 
                          !isNaN(bill.previous);
            
            if (!isValid) {
                console.warn('Skipping bill with missing required fields:', bill);
            }
            
            return isValid;
        });

        if (dataArray.length === 0) {
            throw new Error('No valid bills to save');
        }

        console.log('Validated data array:', dataArray);

        // Clear existing data
        console.log('Clearing existing data...');
        await db.ref('electricityData').remove();
        console.log('Existing data cleared successfully');

        // Save new data
        console.log('Saving new data...');
        const timestamp = new Date().toISOString();
        const savePromises = dataArray.map((bill, index) => {
            return db.ref(`electricityData/${index}`).set({
                date: bill.date,
                current: bill.current,
                previous: bill.previous,
                units: bill.units || 0,
                rate: bill.rate || 0,
                total: bill.total || 0,
                totalAll: bill.totalAll || 0,
                timestamp: timestamp
            });
        });

        await Promise.all(savePromises);
        console.log('Data saved successfully to Firebase');
        return true;
    } catch (error) {
        console.error('Error in saveToFirebase:', error);
        if (error.message.includes('PERMISSION_DENIED')) {
            alert('ไม่สามารถบันทึกข้อมูลได้ กรุณาตรวจสอบการตั้งค่า Firebase Rules');
        } else {
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message);
        }
        return false;
    }
}

// Function to load data from Firebase
async function loadFromFirebase() {
    try {
        console.log('Loading data from Firebase...');
        if (!db) {
            throw new Error('Firebase is not initialized');
        }

        const snapshot = await db.ref('electricityData').once('value');
        const data = snapshot.val();
        console.log('Data loaded from Firebase:', data);

        if (data) {
            // Convert object to array and sort by date
            const billsArray = Object.values(data).sort((a, b) => {
                const dateA = new Date(a.date.split('/').reverse().join('-'));
                const dateB = new Date(b.date.split('/').reverse().join('-'));
                return dateB - dateA;
            });
            console.log('Processed bills array:', billsArray);
            return billsArray;
        }
        return [];
    } catch (error) {
        console.error('Error loading from Firebase:', error);
        if (error.message.includes('PERMISSION_DENIED')) {
            alert('ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบการตั้งค่า Firebase Rules');
        }
        return [];
    }
}

// Function to update electricity data
async function updateElectricityData() {
    try {
        console.log('Starting data update process...');
        const data = await fetchSheetData();
        console.log('Fetched data from sheets:', data);

        if (!data || data.length === 0) {
            console.warn('No data fetched from sheets');
            alert('ไม่พบข้อมูลจาก Google Sheets');
            return;
        }

        // Try to save to Firebase
        const saved = await saveToFirebase(data);
        console.log('Firebase save result:', saved);

        // Update local data regardless of Firebase save result
        electricityData = data;
        displayHistory();
        console.log('Local data updated successfully');
    } catch (error) {
        console.error('Error updating data:', error);
        alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล: ' + error.message);
    }
}

// Function to load initial data
async function loadInitialData() {
    try {
        console.log('Loading initial data...');
        
        // Check if Firebase is initialized
        if (!db) {
            throw new Error('Firebase is not initialized');
        }

        // Check if data already exists in Firebase
        const snapshot = await db.ref('electricityData').once('value');
        const existingData = snapshot.val();

        if (!existingData || Object.keys(existingData).length === 0) {
            console.log('No existing data found, saving initial data...');
            await saveToFirebase(initialData);
            console.log('Initial data saved successfully');
        } else {
            console.log('Data already exists in Firebase');
        }

        // Update local data
        electricityData = initialData;
        displayHistory();
    } catch (error) {
        console.error('Error loading initial data:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลเริ่มต้น: ' + error.message);
    }
}

// Add event listener for initial data load
document.addEventListener('DOMContentLoaded', () => {
    // Create refresh button
    const header = document.querySelector('.flex.justify-between.items-center.mb-8');
    const refreshButton = document.createElement('button');
    refreshButton.className = 'flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all';
    refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i><span>อัปเดตข้อมูล</span>';
    refreshButton.onclick = updateElectricityData;
    header.appendChild(refreshButton);

    // Load initial data
    loadInitialData();
});

// ฟังก์ชันลบข้อมูลทั้งหมดใน Firebase
async function clearFirebaseData() {
    try {
        if (!db) {
            throw new Error('Firebase is not initialized');
        }
        await db.ref('electricityData').remove();
        console.log('All data cleared from Firebase');
        return true;
    } catch (error) {
        console.error('Error clearing data:', error);
        throw error;
    }
}

// ฟังก์ชันดึงข้อมูลจาก Google Sheets และบันทึกลง Firebase
async function loadDataFromSheets() {
    try {
        // ลบข้อมูลเก่า
        await clearFirebaseData();
        
        // ดึงข้อมูลจาก Google Sheets
        const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vR38MDD2Xj9J7Iq7QnePSX081nZg3fyE7wzOPzrIRcnSNqS5qk4rMPSu42FsLW5RJ-ORuT2oYQ_8IIj/pubhtml');
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const rows = doc.querySelectorAll('table tr');

        const bills = [];
        rows.forEach((row, index) => {
            if (index <= 1) return; // ข้ามแถวหัวข้อและแถวว่าง
            const cells = row.querySelectorAll('td');
            if (cells.length >= 8) {
                // แปลงวันที่ให้อยู่ในรูปแบบ DD/MM/YYYY
                const dateStr = cells[1].textContent.trim();
                const [day, month, year] = dateStr.split('/');
                const formattedDate = `${day}/${month}/${year}`;

                // แปลงค่าตัวเลขและลบเครื่องหมาย ฿ และ ,
                const current = parseFloat(cells[2].textContent.trim());
                const previous = parseFloat(cells[3].textContent.trim());
                const units = parseFloat(cells[4].textContent.trim());
                const rate = parseFloat(cells[5].textContent.trim());
                const total = parseFloat(cells[6].textContent.trim().replace('฿', '').replace(',', ''));
                const totalAll = parseFloat(cells[7].textContent.trim().replace('฿', '').replace(',', ''));
                const difference = parseFloat(cells[8].textContent.trim().replace('฿', '').replace(',', '')) || 0;

                // ตรวจสอบความถูกต้องของข้อมูล
                if (!isNaN(current) && !isNaN(previous) && !isNaN(units) && !isNaN(rate) && !isNaN(total)) {
                    const bill = {
                        date: formattedDate,
                        current: current,
                        previous: previous,
                        units: units,
                        rate: rate,
                        total: total,
                        totalAll: totalAll || 0,
                        difference: difference
                    };
                    bills.push(bill);
                }
            }
        });

        // เรียงข้อมูลตามวันที่
        bills.sort((a, b) => {
            const [dayA, monthA, yearA] = a.date.split('/');
            const [dayB, monthB, yearB] = b.date.split('/');
            const dateA = new Date(yearA, monthA - 1, dayA);
            const dateB = new Date(yearB, monthB - 1, dayB);
            return dateA - dateB;
        });

        // บันทึกข้อมูลลง Firebase
        if (bills.length > 0) {
            await db.ref('electricityData').set(bills);
            console.log('Data loaded successfully:', bills.length, 'records');
            alert('โหลดข้อมูลสำเร็จ: ' + bills.length + ' รายการ');
            // รีเฟรชตารางแสดงผล
            renderHistoryTable();
            return true;
        } else {
            throw new Error('ไม่พบข้อมูลที่ถูกต้องใน Google Sheets');
        }
    } catch (error) {
        console.error('Error loading data:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message);
        throw error;
    }
}

// เพิ่มปุ่มโหลดข้อมูลใหม่
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.flex.justify-between.items-center.mb-8');
    const loadButton = document.createElement('button');
    loadButton.className = 'px-4 py-2 bg-success hover:bg-success/90 rounded-lg transition-all flex items-center gap-2';
    loadButton.innerHTML = '<i class="fas fa-sync-alt"></i> โหลดข้อมูลใหม่';
    loadButton.onclick = loadDataFromSheets;
    header.appendChild(loadButton);
}); 