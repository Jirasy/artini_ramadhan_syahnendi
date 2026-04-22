// ===== DATA KATA =====
const words = {
    easy: [
        "rumah", "meja", "kursi", "makan", "minum", "tidur", "buku", "pena",
        "kaki", "tangan", "kucing", "anjing", "air", "api", "emas", "pasar",
        "besar", "kecil", "cepat", "lambat", "hijau", "merah", "biru", "pohon",
        "bunga", "sungai", "gunung", "langit", "tanah", "buah", "daun", "batu",
        "jalan", "pintu", "malam", "pagi", "siang", "sore", "gelap", "terang"
    ],
    medium: [
        "sekolah", "belajar", "komputer", "kamera", "telepon", "gambar",
        "musik", "politik", "budaya", "internet", "layar", "proses",
        "kertas", "pensil", "barang", "ruangan", "kepala", "pintu", "jendela",
        "halaman", "pelajaran", "makanan", "minuman", "kendaraan", "pekerjaan",
        "perjalanan", "perasaan", "keluarga", "teman", "sahabat", "negara"
    ],
    hard: [
        "universitas", "lingkungan", "pendidikan", "pengalaman", "pertahanan",
        "keberhasilan", "keselamatan", "kebersihan", "persahabatan", "kepadatan",
        "perindustrian", "pertanian", "keuangan", "kesejahteraan", "kemiskinan",
        "kependudukan", "pembangunan", "pengetahuan", "kewarganegaraan",
        "perekonomian", "penghargaan", "ketidakpastian", "pemimpin", "kebijakan"
    ]
};

// ===== VARIABEL GLOBAL =====
let time = 60;
let score = 0;
let streak = 0;
let maxTime = 60;
let currentWordList = [];
let timerInterval = null;

// ===== ELEMEN DOM =====
const wordInput     = document.getElementById("word-input");
const currentWordEl = document.getElementById("current-word");
const scoreEl       = document.getElementById("score");
const timeEl        = document.getElementById("time");
const streakEl      = document.getElementById("streak");
const messageEl     = document.getElementById("message");
const timerBar      = document.getElementById("timer-bar");
const finalScoreEl  = document.getElementById("final-score");
const resultDetailEl= document.getElementById("result-detail");

// ===== FUNGSI TAMPILAN LAYAR =====
function showScreen(id) {
    document.querySelectorAll(".screen").forEach(function(s) {
        s.classList.remove("active");
    });
    document.getElementById(id).classList.add("active");
}

// ===== MULAI GAME =====
function startGame(level) {
    currentWordList = words[level];

    // Waktu disesuaikan per level
    if (level === "easy")        maxTime = 60;
    else if (level === "medium") maxTime = 75;
    else                         maxTime = 90;

    // Reset state
    score   = 0;
    streak  = 0;
    time    = maxTime;

    // Reset tampilan
    scoreEl.textContent  = score;
    timeEl.textContent   = time;
    streakEl.textContent = streak;
    wordInput.value      = "";
    wordInput.className  = "";
    messageEl.textContent = "";

    // Reset timer bar
    timerBar.style.width      = "100%";
    timerBar.style.background = "#639922";

    // Pindah ke layar game
    showScreen("game");
    showNewWord();

    // Mulai timer
    clearInterval(timerInterval);
    timerInterval = setInterval(countdown, 1000);

    // Fokus input
    setTimeout(function() { wordInput.focus(); }, 200);
}

// ===== TAMPILKAN KATA BARU =====
function showNewWord() {
    var idx = Math.floor(Math.random() * currentWordList.length);
    currentWordEl.textContent = currentWordList[idx];
}

// ===== CEK INPUT USER =====
wordInput.addEventListener("input", function() {
    var typed  = wordInput.value;
    var target = currentWordEl.textContent;

    if (typed === target) {
        // BENAR
        score++;
        streak++;
        scoreEl.textContent  = score;
        streakEl.textContent = streak;

        wordInput.value       = "";
        wordInput.className   = "correct";
        messageEl.textContent = "✓ Benar!";

        setTimeout(function() {
            wordInput.className   = "";
            messageEl.textContent = "";
        }, 400);

        showNewWord();

    } else if (target.startsWith(typed)) {
        // SEDANG MENGETIK (awalan benar)
        wordInput.className   = "";
        messageEl.textContent = "";

    } else {
        // SALAH
        streak = 0;
        streakEl.textContent  = streak;
        wordInput.className   = "wrong";
        messageEl.textContent = "✗ Coba lagi...";
    }
});

// ===== HITUNG MUNDUR =====
function countdown() {
    time--;
    timeEl.textContent = time;

    var pct = (time / maxTime) * 100;
    timerBar.style.width = pct + "%";

    // Warna timer bar berubah seiring waktu
    if (pct < 25)       timerBar.style.background = "#E24B4A";
    else if (pct < 50)  timerBar.style.background = "#BA7517";
    else                timerBar.style.background = "#639922";

    if (time <= 0) {
        clearInterval(timerInterval);
        endGame();
    }
}

// ===== AKHIRI GAME =====
function endGame() {
    finalScoreEl.textContent = score;

    var rating;
    if      (score >= 25) rating = "Luar biasa! 🏆";
    else if (score >= 15) rating = "Bagus sekali! 🎉";
    else if (score >= 8)  rating = "Cukup baik! 👍";
    else                  rating = "Terus berlatih! 💪";

    resultDetailEl.textContent = rating + " Kamu mengetik " + score + " kata dengan benar.";
    showScreen("game-over");
}

// ===== KEMBALI KE MENU =====
function showMenu() {
    clearInterval(timerInterval);
    showScreen("menu");
}
