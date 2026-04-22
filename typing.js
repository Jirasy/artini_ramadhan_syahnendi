        // --- DATA KATA-KATA ---
        const words = {
            easy: [
                "rumah", "meja", "kursi", "makan", "minum", "tidur", "buku", "pena", 
                "kaki", "tangan", "kucing", "anjing", "air", "api", "emas", "pasar",
                "besar", "kecil", "cepat", "lambat", "hijau", "merah", "biru"
            ],
            medium: [
                "sekolah", "belajar", "komputer", "kamera", "telepon", "gambar", 
                "musik", "politik", "budaya", "internet", "layar", "proses",
                "kertas", "pensil", "barang", "ruangan", "kepala", "pintu", "jendela"
            ],
            hard: [
                "universitas", "lingkungan", "pendidikan", "pengalaman", "pertahanan",
                "keberhasilan", "keselamatan", "kebersihan", "persahabatan", "kepadatan",
                "perindustrian", "pertanian", "keuangan", "kesejahteraan", "kemiskinan"
            ]
        };

        // --- VARIABEL GLOBAL ---
        let time = 60;
        let score = 0;
        let isPlaying;
        let currentWordList = [];
        let timerInterval;

        // --- ELEMEN DOM ---
        const wordInput = document.querySelector("#word-input");
        const currentWord = document.querySelector("#current-word");
        const scoreDisplay = document.querySelector("#score");
        const timeDisplay = document.querySelector("#time");
        const message = document.querySelector("#message");
        const seconds = document.querySelector("#seconds");
        
        const menuScreen = document.getElementById("menu");
        const gameScreen = document.getElementById("game");
        const gameOverScreen = document.getElementById("game-over");
        const finalScore = document.getElementById("final-score");

        // --- FUNGSI UTAMA ---

        // 1. Memulai Game
        function startGame(level) {
            // Atur level
            if(level === "easy") currentWordList = words.easy;
            else if(level === "medium") currentWordList = words.medium;
            else currentWordList = words.hard;

            // Reset variabel
            score = 0;
            time = 60; // Waktu 60 detik
            isPlaying = true;
            scoreDisplay.innerHTML = score;
            timeDisplay.innerHTML = time;
            wordInput.value = "";

            // Tampilkan layar game
            menuScreen.classList.add("hidden");
            gameOverScreen.classList.add("hidden");
            gameScreen.classList.remove("hidden");

            // Mulai fungsi
            showNewWord();
            
            // Mulai Timer
            clearInterval(timerInterval);
            timerInterval = setInterval(countdown, 1000);

            // Fokus ke input agar langsung bisa mengetik
            setTimeout(() => wordInput.focus(), 100);
        }

        // 2. Menampilkan Kata Baru
        function showNewWord() {
            const randIndex = Math.floor(Math.random() * currentWordList.length);
            currentWord.innerHTML = currentWordList[randIndex];
        }

        // 3. Mengecek Input
        wordInput.addEventListener("input", () => {
            const typedWord = wordInput.value;
            const targetWord = currentWord.innerHTML;

            if (typedWord === targetWord) {
                message.innerHTML = "Benar!";
                score++;
                scoreDisplay.innerHTML = score;
                wordInput.value = "";
                showNewWord();
            } else {
                // Optional: Beri tanda merah jika salah (bisa dikembangkan)
                message.innerHTML = "";
            }
        });

        // 4. Hitung Mundur (Timer)
        function countdown() {
            if (time > 0) {
                time--;
            } else if (time === 0) {
                isPlaying = false;
            }
            timeDisplay.innerHTML = time;

            if (!isPlaying) {
                endGame();
            }
        }

        // 5. Akhiri Game
        function endGame() {
            clearInterval(timerInterval);
            gameScreen.classList.add("hidden");
            gameOverScreen.classList.remove("hidden");
            finalScore.innerHTML = score;
        }

        // 6. Kembali ke Menu
        function showMenu() {
            gameOverScreen.classList.add("hidden");
            menuScreen.classList.remove("hidden");
        }