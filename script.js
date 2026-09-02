// --- 1. INSTANT PRELOADER KILL SWITCH ---
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
    let staggerDelay = 0; 
    let delayTimer;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if(entry.target.classList.contains('service-card') || 
                   entry.target.classList.contains('precare-card') || 
                   entry.target.classList.contains('flash-card') ||
                   entry.target.tagName === 'VIDEO') {
                    
                    entry.target.style.transitionDelay = `${staggerDelay}s`;
                    staggerDelay += 0.15; 

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

    // --- 4. CONSULTATION WIZARD LOGIC ---
    const wizardModal = document.getElementById("consultationWizard");
    const closeWizardBtn = document.getElementById("closeWizard");
    const consultButtons = document.querySelectorAll(".btn-consult, .btn-book");
    
    let currentStep = 1;
    const formData = { artist: "", style: "", placement: "" };

    if (wizardModal && window.location.search.includes("book=true")) {
        setTimeout(() => {
            wizardModal.style.display = "flex";
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 150);
    }

    consultButtons.forEach(btn => {
        btn.addEventListener("click", function(e) {
            e.preventDefault(); 
            if (wizardModal) {
                wizardModal.style.display = "flex";
            } else {
                let path = window.location.pathname;
                let targetPage = "index.html"; 
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
        if (typeof gtag === "function") {
            gtag("event", "whatsapp_conversion", { "event_category": "Lead Generation", "event_label": target.href });
        }
        if (typeof fbq === "function") {
            fbq('track', 'Lead');
        }
    }
});

// --- 9. ULTRA-PERMISSIVE HAMBURGER MENU FIX ---
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

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
    });

    function renderRing() {
        ringX += (mouseX - ringX) * 0.15; 
        ringY += (mouseY - ringY) * 0.15;
        cursorRing.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
        requestAnimationFrame(renderRing);
    }
    requestAnimationFrame(renderRing);

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
if (window.matchMedia("(pointer: fine)").matches) {
    const tiltElements = document.querySelectorAll('.service-card, .precare-card, .flash-card');

    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left; 
            const y = e.clientY - rect.top;  
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10; 
            const rotateY = ((x - centerX) / centerX) * 10;
            
            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
}

// --- 12. FULL SCREEN IMAGE LIGHTBOX ---
(function initLightbox() {
    const flashImages = document.querySelectorAll('.flash-img-wrapper img');
    if (flashImages.length > 0) {
        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox-overlay';
        
        const lightboxImg = document.createElement('img');
        lightboxImg.id = 'lightbox-img';
        
        const closeBtn = document.createElement('span');
        closeBtn.id = 'lightbox-close';
        closeBtn.innerHTML = '&times;'; 
        
        lightbox.appendChild(lightboxImg);
        lightbox.appendChild(closeBtn);
        document.body.appendChild(lightbox);

        if (window.matchMedia("(pointer: fine)").matches) {
            lightboxImg.addEventListener('mousemove', (e) => {
                const rect = lightboxImg.getBoundingClientRect();
                const x = e.clientX - rect.left; 
                const y = e.clientY - rect.top;  
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -10; 
                const rotateY = ((x - centerX) / centerX) * 10;
                lightboxImg.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });

            lightboxImg.addEventListener('mouseleave', () => {
                lightboxImg.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });
        }

        flashImages.forEach(img => {
            img.addEventListener('click', (e) => {
                lightboxImg.src = e.target.src; 
                lightboxImg.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                lightbox.style.display = 'flex';
                setTimeout(() => { lightbox.classList.add('active'); }, 10);
            });
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target !== lightboxImg) { 
                lightbox.classList.remove('active');
                setTimeout(() => { lightbox.style.display = 'none'; }, 300);
            }
        });
    }
})();

// --- 13. MAGNETIC BUTTONS ---
(function initMagneticButtons() {
    if (window.matchMedia("(pointer: fine)").matches) {
        const magneticElements = document.querySelectorAll('.btn-book, .btn-consult, .floating-whatsapp, .btn-whatsapp, .btn-flash');

        magneticElements.forEach(elem => {
            elem.addEventListener('mousemove', function(e) {
                const rect = elem.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const distanceX = e.clientX - centerX;
                const distanceY = e.clientY - centerY;
                const pullX = distanceX * 0.3;
                const pullY = distanceY * 0.3;
                const scaleTarget = elem.classList.contains('floating-whatsapp') ? 1.1 : 1.05;

                elem.style.transform = `translate(${pullX}px, ${pullY}px) scale(${scaleTarget})`;
                elem.style.transition = 'transform 0.1s ease-out'; 
            });

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

    const israelNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
    const day = israelNow.getDay(); 
    const hour = israelNow.getHours();
    const minute = israelNow.getMinutes();
    const currentTime = hour + minute / 60;

    const schedule = {
        0: { open: 11, close: 19.5, name: { he: "ראשון", en: "Sunday", ru: "воскресенье" } },
        1: { open: 11, close: 19.5, name: { he: "שני", en: "Monday", ru: "понедельник" } },
        2: { open: 11, close: 15, name: { he: "שלישי", en: "Tuesday", ru: "вторник" } },
        3: { open: 11, close: 19.5, name: { he: "רביעי", en: "Wednesday", ru: "среду" } },
        4: { open: 11, close: 19.5, name: { he: "חמישי", en: "Thursday", ru: "четверг" } },
        5: { open: 11, close: 15, name: { he: "שישי", en: "Friday", ru: "пятницу" } },
        6: null 
    };

    const lang = document.documentElement.lang || 'he';

    function formatTime(decimalTime) {
        const h = Math.floor(decimalTime);
        const m = (decimalTime - h) * 60;
        return `${h}:${m === 0 ? '00' : m}`;
    }

    const todaySchedule = schedule[day];

    if (todaySchedule && currentTime >= todaySchedule.open && currentTime < todaySchedule.close) {
        if (lang === 'he') statusElement.innerHTML = '🟢 פתוח כעת • נסגר ב-' + formatTime(todaySchedule.close);
        else if (lang === 'ru') statusElement.innerHTML = '🟢 Открыто • Закроется в ' + formatTime(todaySchedule.close);
        else statusElement.innerHTML = '🟢 Open Now • Closes at ' + formatTime(todaySchedule.close);
        statusElement.style.color = '#4caf50';
        return;
    }

    let nextOpenDay = day;
    let daysAdded = 0;

    if (todaySchedule && currentTime < todaySchedule.open) {
        nextOpenDay = day;
        daysAdded = 0;
    } else {
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

    if (lang === 'he') statusElement.innerHTML = '🔴 סגור כעת • ייפתח ' + dayStr + ' בשעה ' + nextTimeStr;
    else if (lang === 'ru') statusElement.innerHTML = '🔴 Закрыто • Откроется ' + dayStr + ' в ' + nextTimeStr;
    else statusElement.innerHTML = '🔴 Closed • Opens ' + dayStr + ' at ' + nextTimeStr;
    
    statusElement.style.color = '#f44336';
}

document.addEventListener("DOMContentLoaded", updateStudioStatus);
setInterval(updateStudioStatus, 60000);