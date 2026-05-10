import { auth } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// --- Toast Notification Helper ---
function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '9999';
        toastContainer.style.display = 'flex';
        toastContainer.style.flexDirection = 'column';
        toastContainer.style.gap = '10px';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.background = type === 'success' ? 'rgba(0, 255, 135, 0.1)' : 'rgba(255, 59, 48, 0.1)';
    toast.style.color = type === 'success' ? '#00FF87' : '#FF3B30';
    toast.style.border = `1px solid ${type === 'success' ? 'rgba(0, 255, 135, 0.3)' : 'rgba(255, 59, 48, 0.3)'}`;
    toast.style.backdropFilter = 'blur(10px)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.3s ease';

    const icon = type === 'success' ? '<i class="fa-solid fa-check-circle"></i>' : '<i class="fa-solid fa-triangle-exclamation"></i>';
    toast.innerHTML = `${icon} <span>${message}</span>`;

    toastContainer.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    }, 10);

    // Animate out
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- DOM Elements ---
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const googleBtn = document.getElementById('google-btn');

// --- Form Validation Helper ---
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// --- Sign Up Logic ---
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const submitBtn = signupForm.querySelector('button[type="submit"]');

        if (!username || !email || !password || !confirmPassword) {
            return showToast('All fields are required', 'error');
        }
        if (!validateEmail(email)) {
            return showToast('Please enter a valid email address', 'error');
        }
        if (password.length < 6) {
            return showToast('Password must be at least 6 characters', 'error');
        }
        if (password !== confirmPassword) {
            return showToast('Passwords do not match', 'error');
        }

        try {
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';
            submitBtn.disabled = true;

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Update profile with username
            await updateProfile(userCredential.user, {
                displayName: username
            });

            showToast('Account created successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            showToast(error.message.replace('Firebase: ', ''), 'error');
            submitBtn.innerHTML = 'Sign Up';
            submitBtn.disabled = false;
        }
    });
}

// --- Login Logic ---
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        if (!email || !password) {
            return showToast('Please enter email and password', 'error');
        }

        try {
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';
            submitBtn.disabled = true;

            await signInWithEmailAndPassword(auth, email, password);
            showToast('Logged in successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);

        } catch (error) {
            let msg = 'Invalid credentials';
            if(error.code === 'auth/user-not-found') msg = 'No account found with this email';
            if(error.code === 'auth/wrong-password') msg = 'Incorrect password';
            showToast(msg, 'error');
            submitBtn.innerHTML = 'Login';
            submitBtn.disabled = false;
        }
    });
}

// --- Google Sign-In Logic ---
if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            googleBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Connecting...';
            googleBtn.disabled = true;

            await signInWithPopup(auth, provider);
            showToast('Logged in with Google!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);

        } catch (error) {
            showToast(error.message.replace('Firebase: ', ''), 'error');
            googleBtn.innerHTML = '<img src="https://img.icons8.com/color/24/000000/google-logo.png" alt="Google"> Continue with Google';
            googleBtn.disabled = false;
        }
    });
}

// --- Logout Helper ---
window.logoutUser = async function() {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// --- Global Auth State Observer & Route Protection ---
// Export the current user so other scripts can access it
export let currentUser = null;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    const path = window.location.pathname;
    const isAuthPage = path.includes('login.html') || path.includes('signup.html');
    const profileContainer = document.querySelector('.user-profile');

    if (user) {
        // If user is logged in and trying to access login/signup, redirect to dashboard
        if (isAuthPage) {
            window.location.href = 'index.html';
        }
        
        // Update User Profile UI across all protected pages
        if (profileContainer) {
            const displayName = user.displayName || user.email.split('@')[0];
            const avatarUrl = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;
            
            profileContainer.innerHTML = `
                <div style="text-align: right; margin-right: 10px; display: none;" class="profile-text">
                    <div style="font-size: 0.7rem; color: var(--text-muted);">Welcome back,</div>
                    <div style="font-weight: 600; font-size: 0.9rem;">${displayName}</div>
                </div>
                <img src="${avatarUrl}" alt="Profile" class="avatar" style="cursor: pointer;" onclick="document.getElementById('profile-dropdown').classList.toggle('show')">
                <div id="profile-dropdown" class="dropdown-menu glass-panel" style="display: none; position: absolute; top: 100%; right: 0; margin-top: 10px; padding: 10px; min-width: 150px; flex-direction: column; gap: 5px;">
                    <button onclick="logoutUser()" class="btn-logout" style="width: 100%; text-align: left; background: rgba(255,59,48,0.1); border: 1px solid rgba(255,59,48,0.3); color: #ff3b30; padding: 10px 15px; border-radius: 8px; cursor: pointer; transition: all 0.3s ease;">
                        <i class="fa-solid fa-right-from-bracket"></i> Logout
                    </button>
                </div>
            `;

            // CSS for dropdown toggle and hover
            if(!document.getElementById('auth-custom-styles')) {
                const style = document.createElement('style');
                style.id = 'auth-custom-styles';
                style.innerHTML = `
                    .dropdown-menu.show { display: flex !important; animation: fadeIn 0.3s ease; }
                    .btn-logout:hover { background: rgba(255,59,48,0.2) !important; }
                    @media (min-width: 768px) { .profile-text { display: block !important; } }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                `;
                document.head.appendChild(style);
            }
        }
    } else {
        // Allow Guest Access: Update the header to show a Login button instead of redirecting
        if (profileContainer) {
            profileContainer.innerHTML = `
                <a href="login.html" class="btn-auth-primary" style="padding: 8px 20px; font-size: 0.9rem; margin-top: 0; text-decoration: none; border-radius: 20px; box-shadow: none;">Login</a>
            `;
        }
    }
});
