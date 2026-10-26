"use strict";

// =========================================================
// SISTEM UNDANGAN DIGITAL - PEBRIN & HANNA
// Semua fungsi diorganisir dengan komentar rapi & terstruktur.
// =========================================================


// =========================================================
// 1. AMBIL NAMA TAMU DARI PARAMETER URL
// Contoh URL: website.com/?to=Keluarga%20Budi
// =========================================================
function dapatkanNamaTamu() {
  const params = new URLSearchParams(window.location.search);
  const nama = params.get("to");
  const namaTamu = document.getElementById("namaTamu");

  if (namaTamu) {
    namaTamu.textContent = nama && nama.trim() ? nama.trim() : "Tamu Undangan";
  }
}


// =========================================================
// 2. KONTROL COVER UNDANGAN & AUDIO MUSIK LATAR
// =========================================================
const coverPage = document.getElementById("coverPage");
const openBtn = document.getElementById("openBtn");
const musicBtn = document.getElementById("musicBtn");
const musik = document.getElementById("weddingMusic");

let undanganDibuka = false;
let countdownAnimationFinished = false;

function inisialisasiCountdownReveal() {
  const countdownBoxes = document.querySelectorAll(
    ".main-content.content-opened .countdown-box"
  );

  const sacredQuote = document.querySelector(
    ".sacred-quote-section"
  );

  if (!countdownBoxes.length || !sacredQuote) return;

  const lastCountdownBox = countdownBoxes[countdownBoxes.length - 1];

  
  const finishCountdownAnimation = () => {
    countdownAnimationFinished = true;

    // Beri izin Sacred Quote untuk mulai reveal.
    sacredQuote.classList.add("countdown-animation-finished");

    // Coba aktifkan animasi kata setelah countdown selesai.
    aktifkanAnimasiTeksSacredQuote();
  };


  // Hormati pengaturan reduced motion.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finishCountdownAnimation();
    return;
  }

  // Jika animasi sudah selesai sebelum listener dipasang.
  if (
    getComputedStyle(lastCountdownBox).animationName === "none" ||
    lastCountdownBox.dataset.animationFinished === "true"
  ) {
    finishCountdownAnimation();
    return;
  }

  lastCountdownBox.addEventListener(
    "animationend",
    (event) => {
      if (event.animationName !== "countdownBoxEnter") return;

      lastCountdownBox.dataset.animationFinished = "true";
      finishCountdownAnimation();
    },
    { once: true }
  );
}



function aktifkanAnimasiTeksSacredQuote() {
  const sacredQuote = document.querySelector(
    ".sacred-quote-section"
  );

  if (!sacredQuote) return;

  // Tunggu sampai section terlihat dan countdown selesai.
  if (
    !sacredQuote.classList.contains("is-visible") ||
    !sacredQuote.classList.contains(
      "countdown-animation-finished"
    )
  ) {
    return;
  }

  // Jangan mulai ulang animasi yang sudah dimulai.
  if (
    sacredQuote.classList.contains(
      "text-animation-ready"
    )
  ) {
    return;
  }

  const words = sacredQuote.querySelectorAll(
    ".sacred-quote-text .word-span"
  );

  if (!words.length) return;

  // Siapkan kondisi awal setiap kata.
  words.forEach((word) => {
    word.style.opacity = "0";
    word.style.transform = "translateY(12px)";
    word.style.filter = "blur(5px)";
  });

  // Pastikan browser menerapkan kondisi awal.
  void sacredQuote.offsetHeight;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      sacredQuote.classList.add(
        "text-animation-ready"
      );

      // Kembalikan kontrol animasi ke CSS.
      words.forEach((word) => {
        word.style.removeProperty("opacity");
        word.style.removeProperty("transform");
        word.style.removeProperty("filter");
      });
    });
  });
}



// Mengubah status visual tombol musik (Play / Pause)
function aturStatusMusik(isPlaying) {
  if (!musicBtn) return;

  if (isPlaying) {
    musicBtn.classList.add("playing");
    musicBtn.setAttribute("aria-pressed", "true");
    musicBtn.setAttribute("aria-label", "Jeda musik");
    return;
  }

  musicBtn.classList.remove("playing");
  musicBtn.setAttribute("aria-pressed", "false");
  musicBtn.setAttribute("aria-label", "Putar musik");
}

// Fungsi utama membuka cover undangan
async function bukaUndangan() {
  if (undanganDibuka) return;

  undanganDibuka = true;
  openBtn.disabled = true;
  openBtn.textContent = "Membuka Undangan...";

  coverPage.classList.add("opened");
  document.body.classList.remove("lock-scroll");

  musicBtn.hidden = false;
  musicBtn.classList.add("visible");

  // Aktifkan kontainer utama untuk memicu animasi konten
 const mainContent = document.getElementById("mainContent");

if (mainContent) {
  mainContent.classList.add("content-opened");

  // Tunggu animasi countdown selesai sebelum mengizinkan quote reveal.
  inisialisasiCountdownReveal();
}

  // 👉 TARO DI SINI AGAR TEKS LANGSUNG TER-SPLIT SAAT TOMBOL DIBUKA
  inisialisasiSequentialText();

  inisialisasiReveal();

  try {
    await musik.play();
    aturStatusMusik(true);
  } catch (error) {
    aturStatusMusik(false);
  }

  window.setTimeout(() => {
    if (mainContent) {
      mainContent.setAttribute("tabindex", "-1");
      mainContent.focus({ preventScroll: true });
    }
  }, 1200);
}

// Toggle manual putar/jeda musik dari tombol floating
async function toggleMusik() {
  if (!musik) return;

  if (musik.paused) {
    try {
      await musik.play();
      aturStatusMusik(true);
    } catch (error) {
      musicBtn.setAttribute("aria-label", "Musik tidak tersedia");
    }
    return;
  }

  musik.pause();
  aturStatusMusik(false);
}

// Event listener tombol cover dan audio
if (openBtn) {
  openBtn.addEventListener("click", bukaUndangan);
}

if (musicBtn) {
  musicBtn.addEventListener("click", toggleMusik);
}

if (musik) {
  musik.addEventListener("ended", () => aturStatusMusik(false));
  musik.addEventListener("error", () => aturStatusMusik(false));
}

// =========================================================
// 3. COUNTDOWN HITUNG MUNDUR PERNIKAHAN (WIB / UTC+7)
// =========================================================
const tanggalTarget = new Date("2026-12-05T08:00:00+07:00").getTime();
const countdownIds = ["days", "hours", "minutes", "seconds"];

function perbaruiCountdown() {
  const sekarang = Date.now();
  const selisih = tanggalTarget - sekarang;

  if (selisih <= 0) {
    countdownIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = "00";
      }
    });

    window.clearInterval(countdownTimer);
    return;
  }

  const hari = Math.floor(selisih / (1000 * 60 * 60 * 24));
  const jam = Math.floor((selisih % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const menit = Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60));
  const detik = Math.floor((selisih % (1000 * 60)) / 1000);

  const elHari = document.getElementById("days");
  const elJam = document.getElementById("hours");
  const elMenit = document.getElementById("minutes");
  const elDetik = document.getElementById("seconds");

  if (elHari) elHari.textContent = String(hari).padStart(2, "0");
  if (elJam) elJam.textContent = String(jam).padStart(2, "0");
  if (elMenit) elMenit.textContent = String(menit).padStart(2, "0");
  if (elDetik) elDetik.textContent = String(detik).padStart(2, "0");
}

const countdownTimer = window.setInterval(perbaruiCountdown, 1000);


// =========================================================
// 4. PEMISAH TEKS KATA DEMI KATA (WORD-BY-WORD ANIMATION)
// Memecah kalimat menjadi elemen <span class="word-span">
// =========================================================
function inisialisasiSequentialText() {
  const targetSelector = ".slider-overlay h1, .slider-overlay .eyebrow-verse, .sacred-quote-text, .salutation-text, .closing-text, .section-heading h2, .section-heading .eyebrow-verse, .story-card p, .story-card h3";
  const textElements = document.querySelectorAll(targetSelector);

  textElements.forEach((el) => {
    // Cek apakah sudah pernah di-split atau belum ada teksnya
    if (el.dataset.textSplit === "true") return;
    
    const text = el.textContent.trim();
    if (!text) return;
    
    el.dataset.textSplit = "true";
    const words = text.split(/\s+/);
    el.innerHTML = "";

    words.forEach((word, index) => {
      const wordSpan = document.createElement("span");
      wordSpan.className = "word-span";
      wordSpan.textContent = word;
      
      // Masukkan variabel index untuk kalkulasi delay CSS
      wordSpan.style.setProperty("--word-index", index);
      
      el.appendChild(wordSpan);

      if (index < words.length - 1) {
        el.appendChild(document.createTextNode(" "));
      }
    });
  });
}


// =========================================================
// 5. ANIMASI SCROLL REVEAL (INTERSECTION OBSERVER)
// Memicu elemen .reveal-section beranimasi saat di-scroll
// =========================================================
function inisialisasiReveal() {
  const revealSections = document.querySelectorAll(".reveal-section");
  if (!revealSections.length) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    revealSections.forEach((section) => section.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");

        if (entry.target.matches(".sacred-quote-section")) {
          aktifkanAnimasiTeksSacredQuote();
        }
      } else {
          // TAMBAHKAN INI JIKA MAU ANIMASI BERULANG KETIKA DI-SCROLL NAIK-TURUN
          entry.target.classList.remove("is-visible");
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -30px 0px"
    }
  );

  revealSections.forEach((section) => revealObserver.observe(section));
}


// =========================================================
// 6A. SLIDER FOTO UTAMA & BRIDE (FADE / OVERLAY)
// =========================================================
function inisialisasiSlider(opsi) {
  const { slides, dots, interval, startDelay = 0 } = opsi;

  if (!slides || !slides.length) return;

  let activeIndex = 0;

  function tampilkanSlide(index) {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, idx) => {
      slide.classList.toggle("active", idx === activeIndex);
    });

    if (dots && dots.length) {
      dots.forEach((dot, idx) => {
        dot.classList.toggle("active", idx === activeIndex);
      });
    }
  }

  if (dots && dots.length) {
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => tampilkanSlide(index));
    });
  }

  const jalankanRotasi = () => {
    tampilkanSlide(activeIndex + 1);
    return window.setInterval(() => {
      tampilkanSlide(activeIndex + 1);
    }, interval);
  };

  if (startDelay > 0) {
    return window.setTimeout(() => {
      jalankanRotasi();
    }, startDelay);
  }

  return jalankanRotasi();
}


// =========================================================
// 6B. SLIDER FOTO GROOM (GESER HORISONTAL KANAN KE KIRI)
// =========================================================
function inisialisasiGroomSlideHorisontal(carousel, interval = 5000) {
  const slides = Array.from(carousel.querySelectorAll(".groom-slide"));
  if (!slides.length) return;

  let currentIndex = 0;
  const totalSlides = slides.length;
  let direction = 1;

  function updateSlidePosition() {
    slides.forEach((slide) => {
      slide.style.transform = `translateX(-${currentIndex * 100}%)`;
    });
  }

  function nextSlide() {
    if (currentIndex === totalSlides - 1) {
      direction = -1;
    } else if (currentIndex === 0) {
      direction = 1;
    }

    currentIndex += direction;
    updateSlidePosition();
  }

  window.setInterval(nextSlide, interval);
}


// =========================================================
// 6C. SLIDER FOTO BRIDE (GESER HORISONTAL KIRI KE KANAN)
// =========================================================
function inisialisasiBrideSlideHorisontal(carousel, interval = 5000) {
  const slides = Array.from(carousel.querySelectorAll(".bride-slide"));
  if (!slides.length) return;

  const track = document.createElement("div");
  track.className = "bride-track";

  slides.forEach((slide) => {
    slide.style.removeProperty("transform");
    track.appendChild(slide);
  });

  track.style.flexDirection = "row-reverse";
  carousel.appendChild(track);

  let currentIndex = 0;
  const totalSlides = slides.length;
  let direction = 1;
  let slideTimer;

  function updateSlidePosition() {
    track.style.transform = `translateX(${currentIndex * 100}%)`;

    slides.forEach((slide, index) => {
      slide.classList.toggle("active", index === currentIndex);
    });
  }

  function nextSlide() {
    if (currentIndex === totalSlides - 1) {
      direction = -1;
    } else if (currentIndex === 0) {
      direction = 1;
    }

    currentIndex += direction;
    updateSlidePosition();
  }

  function startSlider() {
    window.clearInterval(slideTimer);
    slideTimer = window.setInterval(nextSlide, interval);
  }

  updateSlidePosition();
  startSlider();
}


// =========================================================
// 6D. GALERI PING-PONG (SLIDER GALERI INTERAKTIF)
// =========================================================
function inisialisasiGalleryPingPong() {
  const rows = Array.from(document.querySelectorAll(".gallery-row"));

  rows.forEach((row) => {
    if (row.dataset.sliderInitialized === "true") return;

    const track = row.querySelector(".gallery-track");
    if (!track) return;

    const slides = Array.from(track.querySelectorAll(".gallery-slide"));
    if (slides.length < 2) return;

    row.dataset.sliderInitialized = "true";

    const totalSlides = slides.length;
    const direction = row.dataset.direction || "left";
    const delay = Number(row.dataset.delay || 0);

    let currentIndex = direction === "right" ? totalSlides - 1 : 0;
    let movement = direction === "right" ? -1 : 1;
    let intervalId = null;
    let startTimeout = null;
    let paused = false;
    const interval = 4500;

    function updatePosition() {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    function nextSlide() {
      if (paused) return;

      if (currentIndex === totalSlides - 1) {
        movement = -1;
      } else if (currentIndex === 0) {
        movement = 1;
      }

      currentIndex += movement;
      updatePosition();
    }

    function stopSlider() {
      paused = true;
      window.clearInterval(intervalId);
      window.clearTimeout(startTimeout);
    }

    function startSlider() {
      window.clearInterval(intervalId);
      window.clearTimeout(startTimeout);

      paused = false;

      startTimeout = window.setTimeout(() => {
        if (paused) return;

        intervalId = window.setInterval(nextSlide, interval);
      }, delay);
    }

    updatePosition();
    startSlider();

    row.gallerySliderCleanup = () => {
      window.clearInterval(intervalId);
      window.clearTimeout(startTimeout);
      row.removeEventListener("mouseenter", stopSlider);
      row.removeEventListener("mouseleave", startSlider);
      delete row.dataset.sliderInitialized;
    };
  });
}


// =========================================================
// 7. SISTEM RSVP & WISHES (INTEGRASI GOOGLE SHEETS)
// =========================================================
function inisialisasiRSVP() {
  const rsvpForm = document.getElementById("rsvpForm");
  const wishesList = document.getElementById("wishesList");
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwQ_3bacO9cCHQ3j0l1Ba-sYE7yG0KQkOVjwO5d3jafXRwnjiUdc0dCEhGe6uFu9cyF/exec";

  if (!wishesList) return;

  let dataUcapanAll = [];
  let currentPage = 1;
  const itemsPerPage = 5; // Dikembalikan ke 5 ucapan per halaman sesuai ekspektasi

  function formatNamaKapital(str) {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .filter((word) => word.trim().length > 0)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function formatWaktu(dateString) {
    let date = dateString ? new Date(dateString) : new Date();
    if (isNaN(date.getTime())) {
      date = new Date();
    }
    const options = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    };
    return date.toLocaleDateString('id-ID', options).replace('.', ':');
  }

  function renderWishesPage(page) {
    wishesList.innerHTML = "";
    
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const wishesToShow = dataUcapanAll.slice(startIndex, endIndex);

    wishesToShow.forEach((item) => {
      const isHadir = item.attendance === "Hadir";
      const tagClass = isHadir ? "wish-tag--hadir" : "wish-tag--tidak";
      const nameFormatted = formatNamaKapital(item.name);
      const waktuKirim = formatWaktu(item.timestamp || item.time || item.tanggal);

      const wishCard = document.createElement("div");
      wishCard.className = "wish-card";
      wishCard.innerHTML = `
        <div class="wish-header">
          <span class="wish-author">${escapeHTML(nameFormatted)}</span>
          <span class="wish-tag ${tagClass}">${escapeHTML(item.attendance)}</span>
        </div>
        <p class="wish-text">${escapeHTML(item.message)}</p>
        <span class="wish-time">${escapeHTML(waktuKirim)}</span>
      `;
      wishesList.appendChild(wishCard);
    });

    renderPaginationControls();
  }

  // Fungsi Render Kontrol Navigasi Lengkap dengan Tombol Panah & 5 Item
  function renderPaginationControls() {
    let navContainer = document.getElementById("wishesPagination");
    
    if (!navContainer) {
      navContainer = document.createElement("div");
      navContainer.id = "wishesPagination";
      navContainer.className = "wishes-pagination";
      wishesList.parentNode.insertBefore(navContainer, wishesList.nextSibling);
    }

    const totalPages = Math.ceil(dataUcapanAll.length / itemsPerPage);
    
    // Jika hanya ada 1 halaman atau kurang, sembunyikan navigasi
    if (totalPages <= 1) {
      navContainer.innerHTML = "";
      return;
    }

    let paginationHTML = "";

    // Tombol Panah Kiri (‹)
    const prevDisabled = currentPage === 1 ? "disabled" : "";
    paginationHTML += `<button type="button" class="page-btn" data-page="${currentPage - 1}" ${prevDisabled}>‹</button>`;

    // Tombol Angka Halaman
    for (let i = 1; i <= totalPages; i++) {
      const activeClass = i === currentPage ? "active" : "";
      paginationHTML += `<button type="button" class="page-btn ${activeClass}" data-page="${i}">${i}</button>`;
    }

    // Tombol Panah Kanan (›)
    const nextDisabled = currentPage === totalPages ? "disabled" : "";
    paginationHTML += `<button type="button" class="page-btn" data-page="${currentPage + 1}" ${nextDisabled}>›</button>`;

    navContainer.innerHTML = paginationHTML;

    // Event Listener untuk Navigasi (Angka & Panah)
    navContainer.querySelectorAll(".page-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        if (this.hasAttribute("disabled")) return;
        const targetPage = parseInt(this.getAttribute("data-page"));
        if (targetPage >= 1 && targetPage <= totalPages) {
          currentPage = targetPage;
          renderWishesPage(currentPage);
          // Optional: Scroll sedikit ke atas list ucapan agar pas dilihat
          wishesList.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });
  }

  function muatUcapanDariSheets() {
    fetch(GOOGLE_SCRIPT_URL)
      .then((response) => response.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        
        // Filter data yang valid (nama & pesan ada)
        const validData = data.filter((item) => item.name && item.message);

        // Sorting manual berdasarkan timestamp / waktu terbaru di atas
        validData.sort((a, b) => {
          let timeA = new Date(a.timestamp || a.time || a.tanggal || 0).getTime();
          let timeB = new Date(b.timestamp || b.time || b.tanggal || 0).getTime();
          
          // Jika waktu sama atau invalid, fallback ke urutan asli
          if (isNaN(timeA)) timeA = 0;
          if (isNaN(timeB)) timeB = 0;

          // Urutkan dari yang terbesar (terbaru) ke terkecil (terlama)
          return timeB - timeA;
        });

        dataUcapanAll = validData;

        currentPage = 1; // Reset ke halaman 1 agar langsung nampak di atas
        renderWishesPage(currentPage);
      })
      .catch((err) => console.error("Gagal memuat ucapan:", err));
  }

  muatUcapanDariSheets();

  if (!rsvpForm) return;

  rsvpForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const submitBtn = rsvpForm.querySelector(".btn-submit-rsvp");
    const originalBtnText = submitBtn.innerHTML;

    const rawNameInput = document.getElementById("rsvpName").value.trim();
    const nameInput = formatNamaKapital(rawNameInput);
    const attendanceInput = document.querySelector('input[name="attendance"]:checked').value;
    const guestsInput = document.getElementById("rsvpGuests") ? document.getElementById("rsvpGuests").value : "1";
    const messageInput = document.getElementById("rsvpMessage").value.trim();

    if (!nameInput || !messageInput) {
      alert("Mohon isi nama dan ucapan terlebih dahulu.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = "<span>Sending... ✦</span>";

    const waktuSekarang = new Date().toISOString();

    const payloadData = {
      name: nameInput,
      attendance: attendanceInput,
      guests: guestsInput,
      message: messageInput,
      timestamp: waktuSekarang
    };

    dataUcapanAll.unshift({
      name: nameInput,
      attendance: attendanceInput,
      message: messageInput,
      timestamp: waktuSekarang
    });

    currentPage = 1;
    renderWishesPage(currentPage);

    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadData)
    })
      .then(() => {
        submitBtn.innerHTML = "<span>Terkirim! Terima Kasih ✓</span>";
        submitBtn.style.background = "linear-gradient(135deg, #2e7d32, #1b5e20)";
        submitBtn.style.color = "#ffffff";

        rsvpForm.reset();

        window.setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
          submitBtn.style.background = "";
          submitBtn.style.color = "";
        }, 1200);

        window.setTimeout(muatUcapanDariSheets, 800);
      })
      .catch((err) => {
        console.error("Gagal menyimpan ke Google Sheets:", err);
        submitBtn.innerHTML = "<span>Gagal Mengirim ✕</span>";

        window.setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }, 1200);
      });
  });

  function escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}


// =========================================================
// 7. END SISTEM RSVP & WISHES (INTEGRASI GOOGLE SHEETS)
// =========================================================

// =========================================================
// 8. FUNGSI SALIN TEKS KE CLIPBOARD (REKENING / ALAMAT)
// =========================================================
function copyToClipboard(elementId, buttonElement) {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) return;

  const textToCopy = targetElement.innerText || targetElement.textContent;

  navigator.clipboard.writeText(textToCopy).then(() => {
    const originalText = buttonElement.innerHTML;

    buttonElement.style.background = "#3b080a";
    buttonElement.style.color = "#f4d58a";
    buttonElement.style.borderColor = "#3b080a";
    buttonElement.innerHTML = "<span>✓ Berhasil Disalin</span>";

    window.setTimeout(() => {
      buttonElement.style.background = "";
      buttonElement.style.color = "";
      buttonElement.style.borderColor = "";
      buttonElement.innerHTML = originalText;
    }, 2000);
  }).catch((err) => {
    console.error("Gagal menyalin teks: ", err);
    alert("Gagal menyalin. Silakan salin secara manual.");
  });
}

/**
 * Fungsi toggle kemunculan kartu gift
 */
function toggleGiftCards() {
  const container = document.getElementById("giftGridContainer");
  const button = document.getElementById("toggleGiftBtn");
  
  if (!container || !button) return;

  container.classList.toggle("is-open");

  const isOpen = container.classList.contains("is-open");
  
  if (isOpen) {
    button.innerHTML = "<span>Tutup Kembali ✕</span>";
    button.style.background = "rgba(195, 145, 62, 0.15)";
    button.style.color = "#210304";
  } else {
    // Samakan teksnya dengan tampilan awal kamu
    button.innerHTML = "<span>✦ Klik Disini ✦</span>";
    button.style.background = "linear-gradient(135deg, #f4d58a 0%, #c3913e 100%)";
    button.style.color = "#210304";
  }
}

// =========================================================
// 9. INISIALISASI UTAMA SAAT HALAMAN DIMUAT (DOM CONTENT LOADED)
// =========================================================
function inisialisasiSemuaKomponen() {
  const sliderSlides = Array.from(document.querySelectorAll(".slider-slide"));
  const sliderDots = Array.from(document.querySelectorAll(".slider-dot"));
  const groomCarousels = Array.from(document.querySelectorAll(".groom-carousel"));
  const brideCarousels = Array.from(document.querySelectorAll(".bride-carousel"));

  // 1. Pecah teks menjadi elemen kata-demi-kata
  inisialisasiSequentialText();
  
  // 2. Jalankan observer scroll reveal
  // inisialisasiReveal();
  
  // 3. Jalankan fitur galeri dan RSVP
  inisialisasiGalleryPingPong();
  inisialisasiRSVP();

  // 4. Jalankan slider foto
  inisialisasiSlider({
    slides: sliderSlides,
    dots: sliderDots,
    interval: 5000
  });

  groomCarousels.forEach((carousel) => inisialisasiGroomSlideHorisontal(carousel, 5000));
  brideCarousels.forEach((carousel) => inisialisasiBrideSlideHorisontal(carousel, 5000));
}

// Menjalankan inisialisasi awal saat dokumen HTML selesai dibaca
document.addEventListener("DOMContentLoaded", () => {
  dapatkanNamaTamu();
  perbaruiCountdown();
  inisialisasiSemuaKomponen();
});
