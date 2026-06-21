/* --- PRELOADER REMOVAL --- */
function removeLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
    }
}

// Ensures loader disappears reliably even on very rapid local filesystem page loads
if (document.readyState === 'complete') {
    removeLoader();
} else {
    window.addEventListener('load', removeLoader);
}

/* --- STICKY NAV, ACTIVE LINKS & BACK-TO-TOP BUTTON --- */
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (header) {
        header.classList.toggle('scrolled', window.scrollY > 50);
    }
    
    // Toggle Back-To-Top floating button visibility
    if (backToTopBtn) {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }
    
    // Smooth Active Link Tracking
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');
    
    let currentSectionId = 'home';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 220; // Calibrated for centered logo header height
        if (window.scrollY >= sectionTop) {
            currentSectionId = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
            link.classList.add('active');
        }
    });
});

/* --- SCROLL TO TOP FUNCTION --- */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/* --- MOBILE NAVIGATION PANEL --- */
const menuBtn = document.getElementById('menuBtn');
const navMenu = document.getElementById('navMenu');

if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        const icon = menuBtn.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        }
    });

    // Close menu when clicking link
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            const icon = menuBtn.querySelector('i');
            if (icon) {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        });
    });
}

/* --- HERO INTERACTIVE BACKGROUND SLIDER & TEXT SLIDER --- */
const heroSlides = document.querySelectorAll('.hero-slide');
const textSlides = document.querySelectorAll('.text-slide');
let currentHeroSlideIndex = 0;

function nextHeroSlide() {
    if (heroSlides.length > 0 && textSlides.length > 0) {
        // Deactivate current slide image and current slide text
        heroSlides[currentHeroSlideIndex].classList.remove('active');
        textSlides[currentHeroSlideIndex].classList.remove('active');
        
        // Cycle to next index
        currentHeroSlideIndex = (currentHeroSlideIndex + 1) % heroSlides.length;
        
        // Activate next slide image and next slide text
        heroSlides[currentHeroSlideIndex].classList.add('active');
        textSlides[currentHeroSlideIndex].classList.add('active');
    }
}

// Fade background images and text slides synchronously every 6.5 seconds
if (heroSlides.length > 0 && textSlides.length > 0) {
    setInterval(nextHeroSlide, 6500);
}

/* --- STATS COUNTER ACTION --- */
const statSection = document.querySelector('.stats');
const counters = document.querySelectorAll('.counter');
let counterStarted = false;

const startCounter = () => {
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'), 10);
        let count = 0;
        const speed = target / 50; // controls incremental duration
        
        const updateCount = () => {
            if (count < target) {
                count += Math.ceil(speed);
                if (count > target) count = target;
                counter.innerText = count;
                setTimeout(updateCount, 30);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
};

const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !counterStarted) {
            startCounter();
            counterStarted = true;
        }
    });
}, { threshold: 0.5 });

if (statSection) {
    countObserver.observe(statSection);
}

/* --- ABOUT SECTION TABBING --- */
function openTab(evt, tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));

    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));

    const activeContent = document.getElementById(tabName);
    if (activeContent) {
        activeContent.classList.add('active');
    }
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add('active');
    }
}

/* --- COMPREHENSIVE PROJECT ESTIMATOR & REALTIME CONVERTER --- */
const calcType = document.getElementById('calc-type');
const calcArea = document.getElementById('calc-area');
const areaVal = document.getElementById('area-val');

// Realtime dynamic outputs
const costMinGhsSpan = document.getElementById('cost-min-ghs');
const costMaxGhsSpan = document.getElementById('cost-max-ghs');
const costMinUsdSpan = document.getElementById('cost-min-usd');
const costMaxUsdSpan = document.getElementById('cost-max-usd');

// Custom override fields
const customRateInput = document.getElementById('calc-custom-rate');
const customFlatInput = document.getElementById('calc-custom-flat');

// Realtime indicative exchange rate in Ghana (1 USD = 15.5 GHS)
const exchangeRateBenchmark = 15.5;

// Base rates per square meter mapped in Ghana Cedis (GHS)
const serviceBaseRatesGHS = {
    civil: 1200,          // Drainage, concrete works, paving
    residential: 3500,    // Residential block-work construction
    commercial: 5000,     // Office complexes, warehouses
    renovation: 1800,     // Modernizations, repairs
    finishes: 600,        // Premium protective paints
    interior: 800,        // Gypsum board layout & features
    architecture: 500     // Concepts, bills of quantities
};

function performCalculations() {
    if (!calcType || !calcArea) return;

    const type = calcType.value;
    const area = parseInt(calcArea.value, 10);
    if (areaVal) {
        areaVal.innerText = area;
    }

    // Detect and process override configurations
    const customRate = customRateInput ? parseFloat(customRateInput.value) : NaN;
    const customFlat = (customFlatInput && customFlatInput.value) ? parseFloat(customFlatInput.value) : 0;

    // Determine baseline rate per m²
    let finalBaseRateGHS = serviceBaseRatesGHS[type] || 0;
    if (!isNaN(customRate) && customRate >= 0) {
        finalBaseRateGHS = customRate; // Use custom input
    }

    // Determine Quality Spec Modifier
    const selectedGradeEl = document.querySelector('input[name="calc-grade"]:checked');
    const grade = selectedGradeEl ? selectedGradeEl.value : 'standard';
    
    let gradeMultiplier = 1.0;
    if (grade === 'premium') gradeMultiplier = 1.5;
    if (grade === 'luxury') gradeMultiplier = 2.2;

    // Calculate core cost structure in GHS
    const rawCostGHS = (finalBaseRateGHS * area * gradeMultiplier) + (isNaN(customFlat) ? 0 : customFlat);
    
    // Variance margin (+/- 12%) representing material cost fluctuations
    const minCostGHS = Math.round(rawCostGHS * 0.88);
    const maxCostGHS = Math.round(rawCostGHS * 1.12);

    // Dynamic realtime conversion to USD
    const minCostUSD = Math.round(minCostGHS / exchangeRateBenchmark);
    const maxCostUSD = Math.round(maxCostGHS / exchangeRateBenchmark);

    // Print calculated numbers in GHS
    if (costMinGhsSpan && costMaxGhsSpan) {
        costMinGhsSpan.innerText = `₵ ${minCostGHS.toLocaleString()}`;
        costMaxGhsSpan.innerText = `₵ ${maxCostGHS.toLocaleString()}`;
    }

    // Print calculated numbers in USD
    if (costMinUsdSpan && costMaxUsdSpan) {
        costMinUsdSpan.innerText = `$ ${minCostUSD.toLocaleString()}`;
        costMaxUsdSpan.innerText = `$ ${maxCostUSD.toLocaleString()}`;
    }
}

// Bind active dynamic listeners to all elements in calculator box with existence guards
if (calcType && calcArea) {
    calcType.addEventListener('change', performCalculations);
    calcArea.addEventListener('input', performCalculations);
    
    if (customRateInput) {
        customRateInput.addEventListener('input', performCalculations);
    }
    if (customFlatInput) {
        customFlatInput.addEventListener('input', performCalculations);
    }
    
    document.querySelectorAll('input[name="calc-grade"]').forEach(elem => {
        elem.addEventListener('change', performCalculations);
    });
    
    // Run initial budget generation
    performCalculations();
}

/* --- PORTFOLIO FILTER WORKFLOW --- */
const filterButtons = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filterVal = btn.getAttribute('data-filter');
        
        portfolioItems.forEach(item => {
            if (filterVal === 'all' || item.classList.contains(filterVal)) {
                item.style.display = 'block';
                setTimeout(() => item.style.opacity = '1', 50);
            } else {
                item.style.opacity = '0';
                setTimeout(() => item.style.display = 'none', 300);
            }
        });
    });
});

/* --- PORTFOLIO IMAGE LIGHTBOX --- */
function openLightbox(imgSrc, title, desc) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');
    
    if (lightbox && lightboxImg) {
        lightboxImg.src = imgSrc;
        lightboxImg.onerror = function() {
            this.style.display = 'none';
        };
        lightboxImg.style.display = 'block';
        
        if (lightboxTitle) lightboxTitle.innerText = title;
        if (lightboxDesc) lightboxDesc.innerText = desc;
        lightbox.style.display = 'flex';
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
    }
}

/* --- TESTIMONIALS SLIDER --- */
let activeSlideIndex = 0;
const slides = document.querySelectorAll('.testimonial-slide');
const dots = document.querySelectorAll('.dot');

function setSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    if (slides[index] && dots[index]) {
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        activeSlideIndex = index;
    }
}

// Auto transition slide interval
setInterval(() => {
    if (slides.length > 0) {
        let nextIndex = activeSlideIndex + 1;
        if (nextIndex >= slides.length) nextIndex = 0;
        setSlide(nextIndex);
    }
}, 8000);

/* --- PORTAL MODALS CONTROL --- */
function toggleModal(modalId, isVisible) {
    const targetModal = document.getElementById(modalId);
    if (targetModal) {
        targetModal.style.display = isVisible ? 'flex' : 'none';
    }
}

// Close modals when clicking outside contents
window.addEventListener('click', (event) => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

/* --- FORM HANDLERS & NOTIFICATIONS --- */
const toast = document.getElementById('toast');

function triggerToastNotification(message) {
    if (toast) {
        toast.innerText = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    triggerToastNotification("Consultation inquiry sent! Our QS team will contact you shortly.");
    event.target.reset();
}

function handlePortalSubmit(event, modalId) {
    event.preventDefault();
    toggleModal(modalId, false);
    triggerToastNotification("Profile submitted. Thank you for registering with PIER EXCELLA!");
    event.target.reset();
}

/* --- ACCORDION FUNCTIONALITY --- */
const accButtons = document.querySelectorAll('.accordion-btn');

accButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        this.classList.toggle('active');
        const panel = this.nextElementSibling;
        if (panel) {
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        }
    });
});