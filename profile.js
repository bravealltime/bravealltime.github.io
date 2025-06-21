/*
    This script handles the profile page functionality.
    It relies on auth.js for authentication, data fetching, and UI updates.
    initializeProfilePage() is called by auth.js after authentication is complete.
*/

// --- Initialization ---
// The DOMContentLoaded listener has been removed to prevent race conditions.
// auth.js will now call initializeProfilePage() directly.

function initializeProfilePage() {
    const { currentUser, userData } = window.auth;
    
    if (!currentUser || !userData) {
        console.error("Profile page loaded, but user data is not available.");
        // auth.js should have already redirected, but as a fallback:
        window.location.href = 'login.html';
        return;
    }

    displayUserData(currentUser, userData);
    setupEventListeners(currentUser, userData);
}

// --- UI Display ---
function displayUserData(user, data) {
    const { role, name, email, createdAt, metadata } = user;
    const { phone, address, photoURL } = data;
    
    // Header
    document.getElementById('user-name-display').textContent = name || 'ไม่มีชื่อ';
    document.getElementById('user-email-display').textContent = email || 'ไม่มีอีเมล';
    
    // Profile Image
    const profileImage = document.getElementById('profile-image');
    const profileIcon = document.getElementById('profile-icon');
    if (photoURL) {
        profileImage.src = photoURL;
        profileImage.classList.remove('hidden');
        profileIcon.classList.add('hidden');
    } else {
        profileImage.classList.add('hidden');
        profileIcon.classList.remove('hidden');
    }

    // Role and Joined Date
    const roleInfo = getRoleInfo(role);
    const roleDisplay = document.getElementById('user-role-display');
    roleDisplay.textContent = roleInfo.text;
    roleDisplay.className = `px-3 py-1 rounded-full text-sm font-medium border ${roleInfo.color}`;

    if (createdAt) {
        document.getElementById('user-joined-display').textContent = `เข้าร่วมเมื่อ: ${new Date(createdAt).toLocaleDateString('th-TH')}`;
    }

    // Sidebar
    document.getElementById('sidebar-email').textContent = email || 'N/A';
    document.getElementById('sidebar-role').textContent = roleInfo.text;
    if (metadata && metadata.lastSignInTime) {
        document.getElementById('sidebar-last-login').textContent = new Date(metadata.lastSignInTime).toLocaleString('th-TH');
    }
     if (createdAt) {
        document.getElementById('sidebar-joined').textContent = new Date(createdAt).toLocaleDateString('th-TH');
    }

    // Show Admin Panel link if user is admin
    if (role === 'admin') {
        document.getElementById('admin-panel-link').classList.remove('hidden');
    }

    // Form Fields
    document.getElementById('profile-name').value = name || '';
    document.getElementById('profile-phone').value = phone || '';
    document.getElementById('profile-address').value = address || '';
}

// --- Event Listeners Setup ---
function setupEventListeners(user) {
    // Profile form
    const profileForm = document.getElementById('profile-form');
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('profile-name').value.trim();
        const phone = document.getElementById('profile-phone').value.trim();
        const address = document.getElementById('profile-address').value.trim();

        if (!name) {
            showAlert('กรุณากรอกชื่อ-นามสกุล', 'error');
            return;
        }

        try {
            await window.auth.updateUserProfile({
                displayName: name,
                // Custom data goes to the database
                phone,
                address
            });
            showAlert('อัปเดตข้อมูลส่วนตัวสำเร็จ!', 'success');
             // Refresh displayed data
            document.getElementById('user-name-display').textContent = name;
        } catch (error) {
            console.error("Error updating profile:", error);
            showAlert(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
        }
    });

    // Password form
    const passwordForm = document.getElementById('password-form');
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-new-password').value;

        if (newPassword !== confirmPassword) {
            showAlert('รหัสผ่านใหม่ไม่ตรงกัน', 'error');
            return;
        }
        if (newPassword.length < 6) {
             showAlert('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร', 'error');
            return;
        }

        try {
            await window.auth.updateUserPassword(currentPassword, newPassword);
            showAlert('เปลี่ยนรหัสผ่านสำเร็จ!', 'success');
            passwordForm.reset();
        } catch (error) {
            console.error("Error changing password:", error);
            showAlert(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
        }
    });
    
    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            const icon = button.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    // Profile photo upload
    const photoUpload = document.getElementById('photo-upload');
    photoUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showAlert('กรุณาเลือกไฟล์รูปภาพเท่านั้น', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showAlert('ขนาดไฟล์ต้องไม่เกิน 5MB', 'error');
            return;
        }

        try {
            showAlert('กำลังประมวลผลรูปภาพ...', 'info');
            
            // Show progress indicator
            const progressIndicator = document.getElementById('upload-progress');
            if (progressIndicator) {
                progressIndicator.classList.remove('hidden');
            }
            
            const resizedFile = await resizeImage(file, 400, 400);
            
            showAlert('กำลังอัปโหลดรูปภาพ...', 'info');
            
            const photoURL = await window.auth.uploadProfilePhoto(resizedFile, (progress) => {
                console.log(`Upload progress: ${progress.toFixed(1)}%`);
                // You can add a progress bar here if needed
            });
            
            // Hide progress indicator
            if (progressIndicator) {
                progressIndicator.classList.add('hidden');
            }
            
            // Update UI immediately
            const profileImage = document.getElementById('profile-image');
            const profileIcon = document.getElementById('profile-icon');
            
            profileImage.src = photoURL;
            profileImage.classList.remove('hidden');
            profileIcon.classList.add('hidden');
            
            // Also update the navbar icon if it exists
            const navUserImg = document.getElementById('nav-user-img');
            if (navUserImg) {
                navUserImg.src = photoURL;
            }
            
            showAlert('อัปเดตรูปโปรไฟล์สำเร็จ!', 'success');
            
            // Clear the file input
            e.target.value = '';
            
        } catch (error) {
            console.error("Error uploading photo:", error);
            
            // Hide progress indicator on error
            const progressIndicator = document.getElementById('upload-progress');
            if (progressIndicator) {
                progressIndicator.classList.add('hidden');
            }
            
            // More specific error messages
            let errorMessage = 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ';
            if (error.code === 'storage/unauthorized') {
                errorMessage = 'ไม่มีสิทธิ์อัปโหลดรูปภาพ';
            } else if (error.code === 'storage/quota-exceeded') {
                errorMessage = 'พื้นที่เก็บข้อมูลเต็ม';
            } else if (error.code === 'storage/network-request-failed') {
                errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            showAlert(errorMessage, 'error');
            
            // Clear the file input on error
            e.target.value = '';
        }
    });
}


// --- Helpers ---

function getRoleInfo(role) {
    switch (role) {
        case 'admin':
            return { text: 'ผู้ดูแลระบบ', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
        case 'user':
            return { text: 'ผู้ใช้งาน', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
        default:
            return { text: role, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
    }
}

/**
 * Resizes an image file to the specified dimensions using a canvas.
 * @param {File} file The image file to resize.
 * @param {number} maxWidth The maximum width of the resized image.
 * @param {number} maxHeight The maximum height of the resized image.
 * @param {number} quality The quality of the output image (0 to 1).
 * @returns {Promise<File>} A promise that resolves with the resized image file.
 */
function resizeImage(file, maxWidth = 400, maxHeight = 400, quality = 0.9) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            if (width > height) {
                if (width > maxWidth) {
                    height = height * (maxWidth / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = width * (maxHeight / height);
                    height = maxHeight;
                }
            }
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas to Blob conversion failed'));
                    return;
                }
                const resizedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });
                resolve(resizedFile);
            }, 'image/jpeg', quality);
        };
        img.onerror = (error) => reject(error);
    });
} 