// --- 1. INSTANT PRELOADER KILL SWITCH ---
// This runs immediately and destroys the preloader to prevent blank screens.
(function() {
    function killPreloader() {
        const preloader = document.getElementById("preloader") || document.querySelector(".preloader");
        if (preloader) {
            preloader.style.display = "none";
            preloader.style.opacity = "0";
            preloader.style.visibility = "hidden";
            preloader.style.pointerEvents = "none";
            preloader.style.zIndex = "-9999";
        }
    }
    killPreloader();
    window.addEventListener("DOMContentLoaded", killPreloader);
    window.addEventListener("load", killPreloader);
})();

function initTalpuSite() {
    // --- 2. SLIDE-UP STAGGERED SCROLL OBSERVER ---
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    let staggerDelay = 0; // Tracks the delay for elements in the same row
    let delayTimer;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // If the element is part of a grid (cards, videos), add a cascading delay
                if(entry.target.classList.contains('service-card') || 
                   entry.target.classList.contains('precare-card') || 
                   entry.target.classList.contains('flash-card') ||
                   entry.target.tagName === 'VIDEO') {
                    
                    entry.target.style.transitionDelay = `${staggerDelay}s`;
                    staggerDelay += 0.15; // 150ms delay between each card

                    // Reset the delay back to 0 after the row finishes animating
                    clearTimeout(delayTimer);
                    delayTimer = setTimeout(() => { staggerDelay = 0; }, 300);
                }
                
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach((el) => {
        observer.observe(el);
    });

    // --- 4. CONSULTATION WIZARD LOGIC (WITH SMART ROUTING) ---
    const wizardModal = document.getElementById("consultationWizard");
    const closeWizardBtn = document.getElementById("closeWizard");
    const consultButtons = document.querySelectorAll(".btn-consult, .btn-book");
    
    let currentStep = 1;
    const formData = { artist: "", style: "", placement: "" };

    // Auto-open modal if redirected from a page without the window (FAQ, Flash, etc.)
    if (wizardModal && window.location.search.includes("book=true")) {
        setTimeout(() => {
            wizardModal.style.display = "flex";
            // Clean up the URL so it doesn't stay open if they refresh the page
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 150);
    }

    consultButtons.forEach(btn => {
        btn.addEventListener("click", function(e) {
            e.preventDefault(); // Stop normal scrolling/navigation
            
            if (wizardModal) {
                wizardModal.style.display = "flex";
            } else {
                // If the user clicks "Book Now" on a page without the window,
                // route them to the home page and force the window to open automatically.
                let path = window.location.pathname;
                let targetPage = "index.html"; // Default Hebrew
                
                if (path.includes("_en")) targetPage = "index_en.html";
                else if (path.includes("_ru")) targetPage = "index_ru.html";
                
                let prefix = path.includes("/Artists/") || path.includes("/Info/") ? "../" : "";
                window.location.href = prefix + targetPage + "?book=true";
            }
        });
    });

    if(closeWizardBtn && wizardModal) {
        closeWizardBtn.addEventListener("click", () => {
            wizardModal.style.display = "none";
        });
    }

    const optionButtons = document.querySelectorAll(".wizard-option-btn");
    optionButtons.forEach(btn => {
        btn.addEventListener("click", function() {
            const field = this.getAttribute("data-field");
            const value = this.getAttribute("data-value");
            formData[field] = value;

            const parentGrid = this.closest(".wizard-options-grid");
            parentGrid.querySelectorAll(".wizard-option-btn").forEach(b => b.classList.remove("selected"));
            this.classList.add("selected");

            setTimeout(() => {
                if(currentStep < 4) {
                    document.querySelector(`.wizard-step[data-step="${currentStep}"]`).classList.remove("active-step");
                    currentStep++;
                    document.querySelector(`.wizard-step[data-step="${currentStep}"]`).classList.add("active-step");
                    if(currentStep === 4) { updateSummary(); }
                }
            }, 300);
        });
    });

    function updateSummary() {
        const summaryBox = document.getElementById("wizardSummary");
        const waBtn = document.getElementById("whatsappSubmitBtn");
        if (summaryBox) {
            summaryBox.innerHTML = `<strong>אמן / Artist:</strong> ${formData.artist}<br><strong>סגנון / Style:</strong> ${formData.style}<br><strong>מיקום / Placement:</strong> ${formData.placement}`;
        }
        if (waBtn) {
            const message = `Hi Talpu Tattoo! I'd like to book a consultation.%0A- Artist: ${formData.artist}%0A- Style: ${formData.style}%0A- Placement: ${formData.placement}`;
            waBtn.href = `https://api.whatsapp.com/send?phone=972585766211&text=${message}`;
        }
    }

    // --- 5. BACKGROUND MUSIC PLAYER LOGIC ---
    const audioElem = document.getElementById("bgAudio");
    const musicToggleBtn = document.getElementById("musicToggleBtn");
    const musicIconSymbol = document.getElementById("musicIconSymbol");
    const musicWidget = document.getElementById("musicPlayerWidget");
    const musicStatusText = document.getElementById("musicStatusText");

    if (audioElem && musicToggleBtn) {
        let isPlaying = false;
        musicToggleBtn.addEventListener("click", () => {
            if (isPlaying) {
                audioElem.pause();
                isPlaying = false;
                if (musicIconSymbol) musicIconSymbol.textContent = "▶";
                if (musicStatusText) musicStatusText.textContent = "Paused";
                if (musicWidget) musicWidget.classList.remove("playing");
            } else {
                audioElem.play().then(() => {
                    isPlaying = true;
                    if (musicIconSymbol) musicIconSymbol.textContent = "❚❚";
                    if (musicStatusText) musicStatusText.textContent = "Playing";
                    if (musicWidget) musicWidget.classList.add("playing");
                }).catch(e => { console.error("Audio playback failed:", e); });
            }
        });
    }

    // --- 6. INTERACTIVE AFTERCARE TIMELINE LOGIC ---
    const timelineTabs = document.querySelectorAll(".timeline-tab");
    const timelineStages = document.querySelectorAll(".timeline-stage");

    if (timelineTabs.length > 0 && timelineStages.length > 0) {
        timelineTabs.forEach(tab => {
            tab.addEventListener("click", function() {
                const targetStage = this.getAttribute("data-stage");
                timelineTabs.forEach(t => t.classList.remove("active"));
                timelineStages.forEach(s => s.classList.remove("active"));
                this.classList.add("active");
                const targetElement = document.getElementById(`stage-${targetStage}`);
                if (targetElement) { targetElement.classList.add("active"); }
            });
        });
    }

    // --- 7. AUTOMATIC SMART LANGUAGE SWITCHER ---
    let path = window.location.pathname;
    let filename = path.split("/").pop() || "index.html";
    if (filename === "") filename = "index.html";

    let baseName = filename.replace(/(_en|_ru)\.html$/, ".html");
    let targetHe, targetEn, targetRu;

    if (path.includes("/Artists/") || path.includes("\\Artists\\") || path.includes("/Info/") || path.includes("\\Info\\")) {
        let baseWithoutExt = baseName.replace(".html", "");
        targetHe = baseWithoutExt + ".html";
        targetEn = baseWithoutExt + "_en.html";
        targetRu = baseWithoutExt + "_ru.html";
    } else {
        targetHe = baseName;
        targetEn = baseName.replace(".html", "_en.html");
        targetRu = baseName.replace(".html", "_ru.html");
    }

    const linkHe = document.getElementById("langHe");
    const linkEn = document.getElementById("langEn");
    const linkRu = document.getElementById("langRu");

    if (linkHe) linkHe.href = targetHe;
    if (linkEn) linkEn.href = targetEn;
    if (linkRu) linkRu.href = targetRu;
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTalpuSite);
} else {
    initTalpuSite();
}

// --- 8. WHATSAPP ANALYTICS & META PIXEL TRACKER ---
document.addEventListener("click", function(e) {
    const target = e.target.closest("a");
    if (target && target.href && target.href.includes("api.whatsapp.com")) {
        // Google Analytics Event
        if (typeof gtag === "function") {
            gtag("event", "whatsapp_conversion", {
                "event_category": "Lead Generation",
                "event_label": target.href
            });
        }
        // Meta Pixel Conversion Event
        if (typeof fbq === "function") {
            fbq('track', 'Lead');
        }
    }
});

// --- 9. ULTRA-PERMISSIVE HAMBURGER MENU ---
document.addEventListener("click", function(e) {
    const hamburgerBtn = e.target.closest(".hamburger-menu") || e.target.closest(".hamburger");
    
    if (hamburgerBtn) {
        e.preventDefault();
        const navRight = document.querySelector(".nav-right, .nav-menu, #mobileNav");
        if (navRight) {
            navRight.classList.toggle("active");
            hamburgerBtn.classList.toggle("active");
        }
        return;
    }

    const clickedLink = e.target.closest(".nav-right a, .nav-menu a");
    if (clickedLink && !clickedLink.closest(".dropdown")) {
        const navRight = clickedLink.closest(".nav-right, .nav-menu");
        if (navRight) {
            navRight.classList.remove("active");
            const hamburgerIcon = document.querySelector(".hamburger-menu") || document.querySelector(".hamburger");
            if (hamburgerIcon) hamburgerIcon.classList.remove("active");
        }
    }
});

// --- 10. CUSTOM ANIMATED CURSOR ---
// Only run on devices with a real mouse/pointer (ignores touch screens)
if (window.matchMedia("(pointer: fine)").matches) {
    const cursorDot = document.createElement("div");
    cursorDot.id = "cursor-dot";
    const cursorRing = document.createElement("div");
    cursorRing.id = "cursor-ring";
    
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorRing);

    cursorDot.style.display = "block";
    cursorRing.style.display = "block";

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    // Instantly snap the dot to the mouse
    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
    });

    // Add a slight delay to the ring for a smooth trailing effect
    function renderRing() {
        ringX += (mouseX - ringX) * 0.15; 
        ringY += (mouseY - ringY) * 0.15;
        cursorRing.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
        requestAnimationFrame(renderRing);
    }
    requestAnimationFrame(renderRing);

   // Expand the ring when hovering over anything clickable
    document.addEventListener("mouseover", (e) => {
        if(e.target.closest("a, button, .service-card, .precare-card, .flash-card, .timeline-tab, .hamburger-menu, .floating-whatsapp, #lightbox-close, .flash-img-wrapper img")) {
            cursorRing.classList.add("hover-active");
        }
    });
    document.addEventListener("mouseout", (e) => {
        if(e.target.closest("a, button, .service-card, .precare-card, .flash-card, .timeline-tab, .hamburger-menu, .floating-whatsapp, #lightbox-close, .flash-img-wrapper img")) {
            cursorRing.classList.remove("hover-active");
        }
    });
}

// --- 11. 3D PARALLAX TILT EFFECT ---
// Only run on devices with a real mouse
if (window.matchMedia("(pointer: fine)").matches) {
    const tiltElements = document.querySelectorAll('.service-card, .precare-card, .flash-card');

    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left; // X position within the card
            const y = e.clientY - rect.top;  // Y position within the card
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate tilt angle (max 10 degrees)
            const rotateX = ((y - centerY) / centerY) * -10; 
            const rotateY = ((x - centerX) / centerX) * 10;
            
            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        // Snap back to flat when the mouse leaves
        el.addEventListener('mouseleave', () => {
            el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
}

// --- 12. FULL SCREEN IMAGE LIGHTBOX (WITH 3D TILT) ---
(function initLightbox() {
    const flashImages = document.querySelectorAll('.flash-img-wrapper img');
    
    // Only run if we are on a page that actually has flash images
    if (flashImages.length > 0) {
        
        // 1. Build the Lightbox HTML inside the JS
        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox-overlay';
        
        const lightboxImg = document.createElement('img');
        lightboxImg.id = 'lightbox-img';
        
        const closeBtn = document.createElement('span');
        closeBtn.id = 'lightbox-close';
        closeBtn.innerHTML = '&times;'; // The "X" symbol
        
        lightbox.appendChild(lightboxImg);
        lightbox.appendChild(closeBtn);
        document.body.appendChild(lightbox);

        // 2. Add 3D Parallax Tilt directly to the Lightbox Image
        if (window.matchMedia("(pointer: fine)").matches) {
            lightboxImg.addEventListener('mousemove', (e) => {
                const rect = lightboxImg.getBoundingClientRect();
                const x = e.clientX - rect.left; 
                const y = e.clientY - rect.top;  
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Calculate tilt angle (max 10 degrees)
                const rotateX = ((y - centerY) / centerY) * -10; 
                const rotateY = ((x - centerX) / centerX) * 10;
                
                lightboxImg.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });

            // Snap back to flat when the mouse leaves the image
            lightboxImg.addEventListener('mouseleave', () => {
                lightboxImg.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });
        }

        // 3. Open Lightbox when an image is clicked
        flashImages.forEach(img => {
            img.addEventListener('click', (e) => {
                lightboxImg.src = e.target.src; 
                
                // Reset the transform before opening so it doesn't jump
                lightboxImg.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                lightbox.style.display = 'flex';
                
                setTimeout(() => {
                    lightbox.classList.add('active');
                }, 10);
            });
        });

        // 4. Close Lightbox when clicking the X or the dark background
        lightbox.addEventListener('click', (e) => {
            if (e.target !== lightboxImg) { 
                lightbox.classList.remove('active');
                setTimeout(() => {
                    lightbox.style.display = 'none';
                }, 300);
            }
        });
    }
})();

// --- 13. MAGNETIC BUTTONS ---
(function initMagneticButtons() {
    // Only run on desktop devices with a real mouse
    if (window.matchMedia("(pointer: fine)").matches) {
        
        // Grab the main interaction buttons
        const magneticElements = document.querySelectorAll('.btn-book, .btn-consult, .floating-whatsapp, .btn-whatsapp, .btn-flash');

        magneticElements.forEach(elem => {
            elem.addEventListener('mousemove', function(e) {
                const rect = elem.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                // Calculate distance from mouse to center of button
                const distanceX = e.clientX - centerX;
                const distanceY = e.clientY - centerY;

                // Move the button towards the mouse (0.3 is the pull strength)
                const pullX = distanceX * 0.3;
                const pullY = distanceY * 0.3;

                // Scale it up slightly while being pulled to match the hover effect
                const scaleTarget = elem.classList.contains('floating-whatsapp') ? 1.1 : 1.05;

                elem.style.transform = `translate(${pullX}px, ${pullY}px) scale(${scaleTarget})`;
                elem.style.transition = 'transform 0.1s ease-out'; // Fast tracking to mouse
            });

            // "Snap" back into original position with a bouncy spring effect
            elem.addEventListener('mouseleave', function() {
                elem.style.transform = 'translate(0px, 0px) scale(1)';
                elem.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'; 
            });
        });
    }
})();

// --- 14. DYNAMIC TIMEZONE STUDIO STATUS WIDGET ---
function updateStudioStatus() {
    const statusElement = document.getElementById("studioStatus");
    if (!statusElement) return;

    // Get current time locked to Israel timezone
    const israelNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
    const day = israelNow.getDay(); // 0 = Sunday, 1 = Monday...
    const hour = israelNow.getHours();
    const minute = israelNow.getMinutes();
    const currentTime = hour + minute / 60;

    // Real Talpu Hours: 11:00 to 19:30 = 19.5 | 11:00 to 15:00 = 15.0
    const schedule = {
        0: { open: 11, close: 19.5, name: { he: "ראשון", en: "Sunday", ru: "воскресенье" } },
        1: { open: 11, close: 19.5, name: { he: "שני", en: "Monday", ru: "понедельник" } },
        2: { open: 11, close: 15, name: { he: "שלישי", en: "Tuesday", ru: "вторник" } },
        3: { open: 11, close: 19.5, name: { he: "רביעי", en: "Wednesday", ru: "среду" } },
        4: { open: 11, close: 19.5, name: { he: "חמישי", en: "Thursday", ru: "четверг" } },
        5: { open: 11, close: 15, name: { he: "שישי", en: "Friday", ru: "пятницу" } },
        6: null // Saturday Closed
    };

    // Detect page language
    const lang = document.documentElement.lang || 'he';

    // Helper to format time properly
    function formatTime(decimalTime) {
        const h = Math.floor(decimalTime);
        const m = (decimalTime - h) * 60;
        return `${h}:${m === 0 ? '00' : m}`;
    }

    const todaySchedule = schedule[day];

    // 1. Are we currently OPEN?
    if (todaySchedule && currentTime >= todaySchedule.open && currentTime < todaySchedule.close) {
        if (lang === 'he') statusElement.innerHTML = '🟢 פתוח כעת • נסגר ב-' + formatTime(todaySchedule.close);
        else if (lang === 'ru') statusElement.innerHTML = '🟢 Открыто • Закроется в ' + formatTime(todaySchedule.close);
        else statusElement.innerHTML = '🟢 Open Now • Closes at ' + formatTime(todaySchedule.close);
        statusElement.style.color = '#4caf50';
        return;
    }

    // 2. If CLOSED, calculate exactly when we open next
    let nextOpenDay = day;
    let daysAdded = 0;

    // Check if it's early morning before opening time TODAY
    if (todaySchedule && currentTime < todaySchedule.open) {
        nextOpenDay = day;
        daysAdded = 0;
    } else {
        // Otherwise, find the next available open day
        for (let i = 1; i <= 7; i++) {
            nextOpenDay = (day + i) % 7;
            if (schedule[nextOpenDay] !== null) {
                daysAdded = i;
                break;
            }
        }
    }

    const nextSchedule = schedule[nextOpenDay];
    const nextTimeStr = formatTime(nextSchedule.open);
    
    // Dynamic text for "Today", "Tomorrow", or specific day
    let dayStr = nextSchedule.name[lang];
    if (daysAdded === 0) {
        if (lang === 'he') dayStr = 'היום';
        else if (lang === 'ru') dayStr = 'сегодня';
        else dayStr = 'today';
    } else if (daysAdded === 1) {
        if (lang === 'he') dayStr = 'מחר';
        else if (lang === 'ru') dayStr = 'завтра';
        else dayStr = 'tomorrow';
    } else {
         if (lang === 'he') dayStr = 'ביום ' + dayStr;
         else if (lang === 'ru') dayStr = 'в ' + dayStr;
         else dayStr = 'on ' + dayStr;
    }

    // Print final closed string
    if (lang === 'he') statusElement.innerHTML = '🔴 סגור כעת • ייפתח ' + dayStr + ' בשעה ' + nextTimeStr;
    else if (lang === 'ru') statusElement.innerHTML = '🔴 Закрыто • Откроется ' + dayStr + ' в ' + nextTimeStr;
    else statusElement.innerHTML = '🔴 Closed • Opens ' + dayStr + ' at ' + nextTimeStr;
    
    statusElement.style.color = '#f44336';
}

// Initialize on load and update every 60 seconds so it flips automatically
document.addEventListener("DOMContentLoaded", updateStudioStatus);
setInterval(updateStudioStatus, 60000);