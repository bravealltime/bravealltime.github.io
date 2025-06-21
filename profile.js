/*
    This script handles the profile page functionality.
    It relies on auth.js for authentication, data fetching, and UI updates.
*/

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // auth.js handles the initial auth check via the 'requires-auth' class on the body.
    // We just need to set up the page-specific listeners once the user is confirmed.
    
    // Add a delay to ensure auth.js has fetched user data
    setTimeout(initializeProfilePage, 100); 
});

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

        try {
            const resizedFile = await resizeImage(file, 400, 400);
            showAlert('กำลังอัปโหลดรูปภาพ...', 'info', 2000);
            const photoURL = await window.auth.uploadProfilePhoto(resizedFile, (progress) => {
                console.log(`Upload is ${progress}% done`);
            });
            
            // Update UI immediately
            document.getElementById('profile-image').src = photoURL;
            document.getElementById('profile-image').classList.remove('hidden');
            document.getElementById('profile-icon').classList.add('hidden');
            
            // Also update the navbar icon if it exists
            const navUserImg = document.getElementById('nav-user-img');
            if (navUserImg) navUserImg.src = photoURL;
            
            showAlert('อัปเดตรูปโปรไฟล์สำเร็จ!', 'success');
            
        } catch (error) {
             console.error("Error uploading photo:", error);
             showAlert(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
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

function resizeImage(file, maxWidth = 400, maxHeight = 400) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
                resolve(new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                }));
            }, 'image/jpeg', 0.8);
        };
        img.onerror = (error) => reject(error);
    });
} 