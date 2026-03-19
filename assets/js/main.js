// ================================================
// RECHAIN OIL - RESPONSIVE WEBSITE JAVASCRIPT
// ================================================

// ================================================
// 1. INITIALIZATION
// ================================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS Animation
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100
        });
    }
    
    // Initialize all components
    initializeNavbar();
    initializeBackToTop();
    initializeCharts();
    initializeCounters();
    initializeForms();
    initializeSmoothScroll();
});

// ================================================
// 2. NAVBAR FUNCTIONALITY
// ================================================
function initializeNavbar() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled', 'shadow');
        } else {
            navbar.classList.remove('scrolled', 'shadow');
        }
    });
    
    // Close mobile menu on link click
    const navLinks = document.querySelectorAll('.nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                    toggle: false
                });
                bsCollapse.hide();
            }
        });
    });
}

// ================================================
// 3. BACK TO TOP BUTTON
// ================================================
function initializeBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
        
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ================================================
// 4. CHART INITIALIZATION
// ================================================
function initializeCharts() {
    const chartCanvas = document.getElementById('tokenChart');
    
    if (chartCanvas && typeof Chart !== 'undefined') {
        const ctx = chartCanvas.getContext('2d');
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Airdrops', 'Liquidity', 'Team', 'Foundation'],
                datasets: [{
                    data: [60, 20, 12, 8],
                    backgroundColor: [
                        '#28a745',
                        '#20c997',
                        '#17a2b8',
                        '#ffc107'
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        },
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        }
                    }
                },
                cutout: '70%',
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 2000
                }
            }
        });
    }
}

// ================================================
// 5. COUNTER ANIMATION
// ================================================
function initializeCounters() {
    const counters = document.querySelectorAll('.counter');
    let hasAnimated = false;
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current).toLocaleString('id-ID');
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString('id-ID');
            }
        };
        
        updateCounter();
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                counters.forEach(counter => animateCounter(counter));
            }
        });
    }, { threshold: 0.5 });
    
    if (counters.length > 0) {
        observer.observe(counters[0].parentElement.parentElement);
    }
}

// ================================================
// 6. SMOOTH SCROLL
// ================================================
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ================================================
// 7. FORM HANDLING
// ================================================
let currentStep = 1;
const totalSteps = 4;
let registrationData = {};

function initializeForms() {
    // Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Registration Form
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistrationSubmit);
        updateProgressBar();
    }
    
    // Partner Registration Form
    const partnerForm = document.getElementById('partnerRegistrationForm');
    if (partnerForm) {
        partnerForm.addEventListener('submit', handlePartnerRegistrationSubmit);
    }
    
    // Form validation styling
    initializeFormValidation();
}

function initializeFormValidation() {
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() && this.checkValidity()) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid') && this.value.trim()) {
                this.classList.remove('is-invalid');
            }
        });
    });
}

// ================================================
// 8. CONTACT FORM HANDLER
// ================================================
function handleContactSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    
    if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
    }
    
    const formData = {
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        phone: document.getElementById('contactPhone').value,
        location: document.getElementById('contactLocation').value,
        purpose: document.getElementById('contactPurpose').value,
        message: document.getElementById('contactMessage').value,
        timestamp: new Date().toISOString()
    };
    
    showLoading('Mengirim pesan Anda...');
    
    setTimeout(() => {
        hideLoading();
        console.log('Contact Form Data:', formData);
        saveToLocalStorage('contactSubmissions', formData);
        showNotification('Pesan Anda berhasil dikirim!', 'success');
        
        setTimeout(() => {
            window.location.href = 'success.html';
        }, 1500);
    }, 1500);
}

// ================================================
// 9. REGISTRATION FORM HANDLER
// ================================================
function nextStep() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const inputs = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');
    
    let isValid = true;
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('is-invalid');
        } else {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        }
    });
    
    if (!isValid) {
        showNotification('Mohon lengkapi semua field yang wajib diisi', 'error');
        return;
    }

    // KODE BARU: Validasi Password hanya di Langkah 1
    if (currentStep === 1) {
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        if (password.length < 6) {
             document.getElementById('regPassword').classList.add('is-invalid');
             showNotification('Password minimal 6 karakter.', 'error');
             return;
        }

        if (password !== confirmPassword) {
            document.getElementById('regConfirmPassword').classList.add('is-invalid');
            document.getElementById('passwordMatchFeedback').textContent = 'Konfirmasi password harus sama';
            showNotification('Password dan konfirmasi password tidak cocok!', 'error');
            return;
        }
    }
    // AKHIR KODE BARU

    saveCurrentStepData();
    // ... lanjutkan dengan logika pindah step
    
    if (currentStep < totalSteps) {
        currentStepElement.classList.remove('active');
        currentStep++;
        document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('active');
        updateProgressBar();
        
        if (currentStep === 4) {
            populateReview();
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function prevStep() {
    if (currentStep > 1) {
        document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');
        currentStep--;
        document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('active');
        updateProgressBar();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function updateProgressBar() {
    const progress = (currentStep / totalSteps) * 100;
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    if (progressBar && progressText) {
        progressBar.style.width = progress + '%';
        progressText.textContent = `Langkah ${currentStep} dari ${totalSteps}`;
    }
}

function saveCurrentStepData() {
    switch(currentStep) {
        case 1:
            // Menggunakan akses langsung untuk memastikan nilai terbaca
            registrationData.name = document.getElementById('regName').value;
            registrationData.email = document.getElementById('regEmail').value;
            registrationData.phone = document.getElementById('regPhone').value;
            registrationData.password = document.getElementById('regPassword').value; // Perbaikan sebelumnya
            registrationData.confirmPassword = document.getElementById('regConfirmPassword').value; // Perbaikan sebelumnya
            break;
        case 2:
            // PERBAIKAN: Mengganti ?.value || '' menjadi .value
            registrationData.address = document.getElementById('regAddress').value;
            registrationData.identity = document.getElementById('regIdentity').value;
            break;
        case 3:
            // PERBAIKAN: Mengganti ?.value || '' menjadi .value
            registrationData.emergency = document.getElementById('regEmergency').value;
            registrationData.notes = document.getElementById('regNotes').value;
            break;
    }
}

function populateReview() {
    const reviewElements = {
        reviewName: registrationData.name,
        reviewEmail: registrationData.email,
        reviewPhone: registrationData.phone,
        reviewAddress: registrationData.address,
        reviewIdentity: registrationData.identity,
        reviewEmergency: registrationData.emergency
    };
    
    Object.keys(reviewElements).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.textContent = reviewElements[key] || '-';
        }
    });
}

function handleRegistrationSubmit(e) {
    e.preventDefault();
    
    registrationData.timestamp = new Date().toISOString();
    registrationData.status = 'active';
    registrationData.balance = 0;
    
    showLoading('Memproses registrasi Anda...');
    
    setTimeout(() => {
            hideLoading();
            console.log('Registration Data:', registrationData);
            saveToLocalStorage('registrations', registrationData);
            showNotification('Registrasi berhasil!', 'success');
            
            setTimeout(() => {
                // PERBAIKAN: Langsung arahkan ke halaman login
                window.location.href = 'login.html'; 
            }, 1500);
        }, 2000);
}

// ================================================
// 10. PARTNER REGISTRATION FORM HANDLER
// ================================================
function handlePartnerRegistrationSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    
    // Validasi Radio Button PIC
    const isPICSelected = document.querySelector('input[name="isPIC"]:checked');
    const isPICError = document.getElementById('isPICError');
    
    if (!isPICSelected) {
        if (isPICError) isPICError.style.display = 'block';
        return;
    } else {
        if (isPICError) isPICError.style.display = 'none';
    }

    // Validasi Password Match
    const password = document.getElementById('partnerPassword').value;
    const confirmPassword = document.getElementById('partnerConfirmPassword').value;

    if (password !== confirmPassword) {
        alert('Password dan Konfirmasi Password tidak sama!');
        return;
    }
    
    if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
    }
    
    const formData = {
        companyName: document.getElementById('companyName').value,
        picName: document.getElementById('picName').value,
        email: document.getElementById('partnerEmail').value, // Simpan Email
        whatsappNumber: document.getElementById('whatsappNumber').value,
        password: password, // Simpan Password
        isPIC: isPICSelected.value,
        oilAmount: document.getElementById('oilAmount').value,
        oilPeriod: document.getElementById('oilPeriod').value,
        address: document.getElementById('address').value,
        notes: document.getElementById('notes')?.value || '',
        timestamp: new Date().toISOString(),
        type: 'partner',
        status: 'active'
    };
    
    showLoading('Memproses pendaftaran mitra...');
    
    setTimeout(() => {
        hideLoading();
        console.log('Partner Registration Data:', formData);
        
        // Simpan ke localStorage 'partnerRegistrations'
        saveToLocalStorage('partnerRegistrations', formData);
        
        showNotification('Pendaftaran mitra berhasil!', 'success');
        
        setTimeout(() => {
            // Arahkan ke Login Page
            window.location.href = 'login.html';
        }, 1500);
    }, 1500);
}

// ================================================
// 11. UTILITY FUNCTIONS
// ================================================
function showLoading(message = 'Memproses data...') {
    const loadingHTML = `
        <div id="loadingOverlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
            <div class="text-center">
                <div class="spinner mb-3"></div>
                <p class="text-white fs-5">${message}</p>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

function showNotification(message, type = 'info') {
    const alertClass = type === 'error' ? 'alert-danger' : 'alert-success';
    const icon = type === 'error' ? 'bi-x-circle-fill' : 'bi-check-circle-fill';
    
    const notificationHTML = `
        <div class="alert ${alertClass} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3 shadow-lg" role="alert" style="z-index: 9999; min-width: 300px; max-width: 500px;">
            <i class="bi ${icon} me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', notificationHTML);
    
    setTimeout(() => {
        const alert = document.querySelector('.alert');
        if (alert) {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 150);
        }
    }, 3000);
}

function saveToLocalStorage(key, data) {
    try {
        let existingData = JSON.parse(localStorage.getItem(key) || '[]');
        existingData.push(data);
        localStorage.setItem(key, JSON.stringify(existingData));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

// ================================================
// 12. EXPORT FUNCTIONS FOR HTML
// ================================================
window.nextStep = nextStep;
window.prevStep = prevStep;

// ================================================
// 13. PAGE LOAD ANIMATION
// ================================================
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// ================================================
// 14. PREVENT FORM RESUBMISSION
// ================================================
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}
