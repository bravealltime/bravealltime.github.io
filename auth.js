// Global variables
let currentUser = null;
let userRole = 'user'; // default role

// Role hierarchy: admin > user > 1 > 2
const ROLE_HIERARCHY = {
    'admin': 4,
    'user': 3,
    '1': 2,
    '2': 1
};

// Role permissions
const ROLE_PERMISSIONS = {
    'admin': {
        canManageUsers: true,
        canManageRoles: true,
        canViewAllRooms: true,
        canEditAllBills: true,
        canDeleteBills: true,
        canUploadEvidence: true,
        canViewReports: true,
        canAddNewBills: true,
        canGenerateQRCode: true,
        canViewHistory: true
    },
    'user': {
        canManageUsers: false,
        canManageRoles: false,
        canViewAllRooms: false,
        canEditAllBills: false,
        canDeleteBills: false,
        canUploadEvidence: false,
        canViewReports: false,
        canAddNewBills: false,
        canGenerateQRCode: true,
        canViewHistory: true
    },
    '1': {
        canManageUsers: false,
        canManageRoles: false,
        canViewAllRooms: false,
        canEditAllBills: false,
        canDeleteBills: false,
        canUploadEvidence: false,
        canViewReports: false,
        canAddNewBills: false,
        canGenerateQRCode: true,
        canViewHistory: true
    },
    '2': {
        canManageUsers: false,
        canManageRoles: false,
        canViewAllRooms: false,
        canEditAllBills: false,
        canDeleteBills: false,
        canUploadEvidence: false,
        canViewReports: false,
        canAddNewBills: false,
        canGenerateQRCode: true,
        canViewHistory: true
    }
};

// Check if user is authenticated. This should only be called once on page load.
function checkAuth() {
    return new Promise((resolve) => {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    // User is signed in. Fetch their data.
                    const snapshot = await db.ref('users/' + user.uid).once('value');
                    const userData = snapshot.val() || {}; // Ensure userData is an object
                    
                    // Construct the complete user object
                    const fullUser = {
                        uid: user.uid,
                        email: user.email,
                        name: userData.name || user.displayName,
                        photoURL: userData.photoURL || user.photoURL,
                        role: userData.role || 'user',
                        createdAt: user.metadata.creationTime,
                        metadata: { lastSignInTime: user.metadata.lastSignInTime },
                        ...userData // Add other db fields
                    };
                    
                    // Force 'admin' role and add demo data for specific email
                    if (user.email === 'admin@electricity.com') {
                        fullUser.role = 'admin';
                        // Add demo data if it doesn't exist from DB
                        if (!userData.name) fullUser.name = 'แอดมินทดสอบ';
                        if (!userData.phone) fullUser.phone = '081-234-5678';
                        if (!userData.address) fullUser.address = '123/456 ถนนพัฒนาการ กรุงเทพมหานคร 10250';
                    }

                    resolve(fullUser); // Resolve with the user object
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    resolve(null); // Resolve with null on error
                }
            } else {
                // User is not signed in.
                resolve(null);
            }
        });
    });
}

// Fetches all necessary user data from the database.
async function getUserData(uid) {
    try {
        const snapshot = await db.ref(`users/${uid}`).once('value');
        const userData = snapshot.val() || {};
        // Set a default role if none exists
        if (!userData.role) {
            userData.role = 'user';
        }
        return userData;
    } catch (error) {
        console.error('Error getting user data:', error);
        return { role: 'user' }; // Return default user object on error
    }
}

// Check if user has permission
function hasPermission(permission) {
    const userRole = window.currentUserRole;

    // Admin role has all permissions unconditionally.
    if (userRole === 'admin') {
        return true;
    }

    if (!userRole || !ROLE_PERMISSIONS[userRole]) {
        return false;
    }

    return !!ROLE_PERMISSIONS[userRole][permission];
}

// Redirect to login if not authenticated
function requireAuth() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
        // If no alert container exists, create one
        const container = document.createElement('div');
        container.id = 'alert-container';
        container.className = 'fixed top-4 right-4 z-50';
        document.body.appendChild(container);
    }
    
    const alertId = 'alert-' + Date.now();
    
    const alertDiv = document.createElement('div');
    alertDiv.id = alertId;
    alertDiv.className = `mb-4 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'warning' ? 'bg-yellow-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    
    alertDiv.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center">
                <i class="fas ${
                    type === 'success' ? 'fa-check-circle' :
                    type === 'error' ? 'fa-exclamation-circle' :
                    type === 'warning' ? 'fa-exclamation-triangle' :
                    'fa-info-circle'
                } mr-2"></i>
                <span>${message}</span>
            </div>
            <button onclick="removeAlert('${alertId}')" class="ml-4 text-white/70 hover:text-white">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.getElementById('alert-container').appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        removeAlert(alertId);
    }, 5000);
}

// Remove alert
function removeAlert(alertId) {
    const alert = document.getElementById(alertId);
    if (alert) {
        alert.style.transform = 'translateX(100%)';
        setTimeout(() => {
            alert.remove();
        }, 300);
    }
}

// Show/hide loading
function showLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

// Toggle password visibility
function togglePasswordVisibility(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Switch between forms
function showForm(formId) {
    // Hide all forms
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('forgot-form').classList.add('hidden');
    
    // Show target form
    document.getElementById(formId).classList.remove('hidden');
}

// Login function
async function loginUser(email, password) {
    try {
        showLoading();
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Get user role
        const userData = await getUserData(user.uid);
        
        showAlert('เข้าสู่ระบบสำเร็จ!', 'success');
        
        // Redirect based on role
        setTimeout(() => {
            if (userData.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'home.html';
            }
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'ไม่พบผู้ใช้นี้ในระบบ';
                break;
            case 'auth/wrong-password':
                errorMessage = 'รหัสผ่านไม่ถูกต้อง';
                break;
            case 'auth/invalid-email':
                errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
                break;
            case 'auth/user-disabled':
                errorMessage = 'บัญชีผู้ใช้ถูกระงับการใช้งาน';
                break;
        }
        
        showAlert(errorMessage, 'error');
    } finally {
        hideLoading();
    }
}

// Forgot password function
async function forgotPassword(email) {
    try {
        showLoading();
        await auth.sendPasswordResetEmail(email);
        showAlert('ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว', 'success');
        showForm('login-form');
    } catch (error) {
        console.error('Forgot password error:', error);
        let errorMessage = 'เกิดข้อผิดพลาดในการส่งอีเมล';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'ไม่พบอีเมลนี้ในระบบ';
                break;
            case 'auth/invalid-email':
                errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
                break;
        }
        
        showAlert(errorMessage, 'error');
    } finally {
        hideLoading();
    }
}

// Logout function
async function logout() {
    try {
        await auth.signOut();
        currentUser = null;
        userRole = 'user';
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
        showAlert('เกิดข้อผิดพลาดในการออกจากระบบ', 'error');
    }
}

// This is the single function to update all auth-related UI elements.
function updateAuthUI(user) {
    console.log("[Auth] Updating UI for user:", user);
    const authContainer = document.getElementById('auth-container');
    const adminToolsContainer = document.getElementById('admin-tools');

    // If no user is logged in, show the login button.
    if (!user) {
        if (authContainer) {
            authContainer.innerHTML = `
                <a href="login.html" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center shadow transition">
                    <i class="fas fa-sign-in-alt mr-2"></i>เข้าสู่ระบบ
                </a>
            `;
        }
        return;
    }

    // If a user is logged in, update the UI.
    try {
        const userDisplayName = user.name || user.email.split('@')[0];
        const profileImage = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userDisplayName)}&background=0D8ABC&color=fff`;
        
        let dropdownMenu = `
            <a href="profile.html" class="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-600 hover:text-white w-full text-left">
                <i class="fas fa-user-circle w-4 mr-2"></i>โปรไฟล์
            </a>
        `;

        if (user.role === 'admin') {
            dropdownMenu += `
                <a href="admin.html" class="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-600 hover:text-white w-full text-left">
                    <i class="fas fa-user-shield w-4 mr-2"></i>จัดการผู้ใช้
                </a>
            `;
        }

        dropdownMenu += `
            <button onclick="logout()" class="block px-4 py-2 text-sm text-red-400 hover:bg-slate-600 hover:text-white w-full text-left">
                <i class="fas fa-sign-out-alt w-4 mr-2"></i>ออกจากระบบ
            </button>
        `;

        authContainer.innerHTML = `
            <div class="relative" x-data="{ open: false }" @click.outside="open = false">
                <button @click="open = !open" class="flex items-center space-x-2">
                    <span class="text-white font-medium text-sm hidden sm:block">${userDisplayName}</span>
                    <img id="nav-user-img" src="${profileImage}" alt="Profile" class="w-10 h-10 rounded-full object-cover border-2 border-slate-600 hover:border-blue-500 transition">
                </button>

                <div x-show="open" x-transition 
                    class="absolute right-0 mt-2 w-48 bg-slate-700 rounded-lg shadow-xl z-50 overflow-hidden border border-slate-600 py-1"
                    style="display: none;">
                    ${dropdownMenu}
                </div>
            </div>
        `;
        
        // Update the admin-specific tools area (admin-tools)
        if (adminToolsContainer) {
            if (user.role === 'admin') {
                console.log("[Auth] User is admin, showing admin tools.");
                adminToolsContainer.innerHTML = `
                    <button onclick="migrateOldData()" class="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full font-bold text-lg shadow flex items-center gap-2 transition-all duration-200 border border-yellow-600">
                        <i class="fas fa-database"></i> อัปเดตข้อมูลเก่า
                    </button>`;
            } else {
                adminToolsContainer.innerHTML = ''; // Ensure non-admins see nothing.
            }
        }

    } catch (error) {
        console.error("Error updating UI:", error);
    }
}

// --- Profile Update Functions ---

async function updateUserProfile(data) {
    const user = auth.currentUser;
    if (!user) throw new Error("ไม่พบผู้ใช้งาน");

    const { displayName, ...customData } = data;

    // Update Firebase Auth profile (for displayName)
    if (displayName && displayName !== user.displayName) {
        await user.updateProfile({ displayName });
    }

    // Update custom data in Realtime Database
    await db.ref('users/' + user.uid).update(customData);
}

async function uploadProfilePhoto(file, onProgress) {
    const user = auth.currentUser;
    if (!user) throw new Error("ไม่พบผู้ใช้งาน");

    const filePath = `profile_images/${user.uid}/${Date.now()}_${file.name}`;
    const fileRef = storage.ref(filePath);
    
    const uploadTask = fileRef.put(file);

    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) onProgress(progress);
            },
            (error) => reject(error),
            async () => {
                const photoURL = await uploadTask.snapshot.ref.getDownloadURL();
                // Save URL to user's db record and auth profile
                await user.updateProfile({ photoURL });
                await db.ref(`users/${user.uid}`).update({ photoURL });
                resolve(photoURL);
            }
        );
    });
}

async function updateUserPassword(currentPassword, newPassword) {
    const user = auth.currentUser;
    if (!user) throw new Error("กรุณาเข้าสู่ระบบก่อนเปลี่ยนรหัสผ่าน");

    // Re-authenticate user before changing password
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
    await user.reauthenticateWithCredential(credential);

    // If re-authentication is successful, update the password
    await user.updatePassword(newPassword);
}

// Initialize authentication
document.addEventListener('DOMContentLoaded', async function() {
    if (document.body.classList.contains('requires-auth')) {
        const user = await checkAuth();
        window.currentUser = user; // Set global user object

        if (user) {
            const userData = await getUserData(user.uid);
            window.currentUserRole = user.role; // Set global role for hasPermission()
            
            // This is for profile.js
            window.auth = {
                currentUser: user,
                userData: userData,
                updateUserProfile: updateUserProfile,
                updateUserPassword: updateUserPassword,
                uploadProfilePhoto: uploadProfilePhoto,
            };

            updateAuthUI(user);
            
            if(typeof initializePageContent === 'function') {
                initializePageContent();
            }
            if(typeof initializeProfilePage === 'function') {
                initializeProfilePage();
            }
        } else {
            window.location.href = 'login.html';
        }
    }

    // This listener is for the login page specifically.
    if (document.getElementById('loginForm')) {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                // User is already logged in, redirect
                const { role } = await getUserData(user.uid);
                if (role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'home.html';
                }
            }
        });
    }

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            loginUser(email, password);
        });
    }

    // Forgot password form
    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('forgotEmail').value;
            forgotPassword(email);
        });
    }

    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            togglePasswordVisibility('loginPassword', 'togglePassword');
        });
    }

    // Show forgot password form
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', function() {
            showForm('forgot-form');
        });
    }

    // Back to login form
    const backToLoginBtn = document.getElementById('backToLoginBtn');
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', function() {
            showForm('login-form');
        });
    }
});

// Export functions for global use
window.loginUser = loginUser;
window.forgotPassword = forgotPassword;
window.logout = logout;
window.showAlert = showAlert;
window.removeAlert = removeAlert;
window.hasPermission = hasPermission;
window.checkAuth = checkAuth;
window.requireAuth = requireAuth; 