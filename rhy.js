// ========== CONFIG & STATE ==========
    const defaultConfig = {
      game_title: 'BEAT DROP',
      start_button_text: 'START',
      background_color: '#0f0f23',
      accent_color: '#06b6d4',
      text_color: '#ffffff',
      button_color: '#9333ea',
      secondary_color: '#1a1a3e'
    };
    
    let config = { ...defaultConfig };
    let highScores = [];
    
    // Game State
    let gameState = {
      isPlaying: false,
      isPaused: false,
      selectedSong: null,
      difficulty: 'normal',
      score: 0,
      combo: 0,
      maxCombo: 0,
      accuracy: 100,
      totalNotes: 0,
      hitNotes: 0,
      perfectCount: 0,
      greatCount: 0,
      goodCount: 0,
      missCount: 0,
      notes: [],
      audioContext: null,
      customAudioBuffer: null,
      customSongName: null,
      animationId: null,
      lastBeatTime: 0,
      noteSpeed: 3,
      laneCount: 4
    };
    
    // Song Definitions with beat patterns
    const songs = {
      'cyber-pulse': {
        name: 'Cyber Pulse',
        bpm: 120,
        duration: 45000,
        patterns: generatePattern(120, 45000)
      },
      'neon-dreams': {
        name: 'Neon Dreams',
        bpm: 100,
        duration: 50000,
        patterns: generatePattern(100, 50000)
      },
      'pixel-party': {
        name: 'Pixel Party',
        bpm: 140,
        duration: 40000,
        patterns: generatePattern(140, 40000)
      }
    };
    
    // Difficulty Settings
    const difficultySettings = {
      easy: { speed: 2.5, lanes: 3, noteFrequency: 0.4, timing: { perfect: 80, great: 150, good: 220 } },
      normal: { speed: 3.5, lanes: 4, noteFrequency: 0.6, timing: { perfect: 60, great: 120, good: 180 } },
      hard: { speed: 4.5, lanes: 4, noteFrequency: 0.8, timing: { perfect: 50, great: 100, good: 150 } },
      extreme: { speed: 5.5, lanes: 5, noteFrequency: 1.0, timing: { perfect: 40, great: 80, good: 120 } }
    };
    
    // Lane colors
    const laneColors = ['#06b6d4', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'];
    
    // Key bindings
    const keyBindings = {
      3: ['d', 'f', 'j'],
      4: ['d', 'f', 'j', 'k'],
      5: ['d', 'f', ' ', 'j', 'k']
    };
    
    // ========== PATTERN GENERATION ==========
    function generatePattern(bpm, duration) {
      const beatInterval = 60000 / bpm;
      const patterns = [];
      let time = 2000; // Start after 2 seconds
      
      while (time < duration - 2000) {
        patterns.push({ time, lane: -1 }); // Lane assigned dynamically
        time += beatInterval * (Math.random() > 0.3 ? 1 : 0.5);
      }
      
      return patterns;
    }
    
    // ========== AUDIO GENERATION ==========
    function initAudioContext() {
      if (!gameState.audioContext) {
        gameState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (gameState.audioContext.state === 'suspended') {
        gameState.audioContext.resume();
      }
    }
    
    function playTone(frequency, duration, type = 'sine') {
      if (!gameState.audioContext || gameState.isPaused) return;
      
      const oscillator = gameState.audioContext.createOscillator();
      const gainNode = gameState.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(gameState.audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.3, gameState.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, gameState.audioContext.currentTime + duration / 1000);
      
      oscillator.start();
      oscillator.stop(gameState.audioContext.currentTime + duration / 1000);
    }
    
    function playBeat() {
      if (!gameState.isPlaying || gameState.isPaused) return;
      playTone(200, 100, 'square');
    }
    
    function playHitSound(judgment) {
      const frequencies = {
        perfect: [523, 659, 784],
        great: [440, 554],
        good: [330],
        miss: [150]
      };
      
      const freqs = frequencies[judgment] || [330];
      freqs.forEach((f, i) => {
        setTimeout(() => playTone(f, 80, 'sine'), i * 30);
      });
    }
    
    // ========== SCREEN MANAGEMENT ==========
    function showScreen(screenId) {
      const screens = ['menu-screen', 'song-select', 'difficulty-select', 'game-screen', 'results-screen', 'highscores', 'how-to-play'];
      screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('hidden', id !== screenId);
      });
      
      if (screenId === 'highscores') {
        renderHighScores();
      }
    }
    
    // ========== SONG SELECTION ==========
    function selectSong(songId) {
      if (songId === 'custom' && gameState.customAudioBuffer) {
        gameState.selectedSong = {
          id: 'custom',
          name: gameState.customSongName,
          bpm: 120,
          duration: gameState.customAudioBuffer.duration * 1000,
          patterns: generatePattern(120, gameState.customAudioBuffer.duration * 1000)
        };
      } else if (songs[songId]) {
        gameState.selectedSong = { id: songId, ...songs[songId] };
      }
      
      document.getElementById('selected-song-name').textContent = gameState.selectedSong.name;
      showScreen('difficulty-select');
    }
    
    function handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // Validate file type
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4'];
      if (!validTypes.some(type => file.type.startsWith(type))) {
        alert('Please upload an audio file (MP3, WAV, OGG, or WebM)');
        return;
      }
      
      initAudioContext();
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          gameState.customAudioBuffer = await gameState.audioContext.decodeAudioData(arrayBuffer);
          gameState.customSongName = file.name.replace(/\.[^/.]+$/, '');
          
          // Estimate BPM from duration (simple approach)
          const duration = gameState.customAudioBuffer.duration * 1000;
          const estimatedBPM = Math.round(duration / 30000 * 120); // Normalize to ~30 second song at 120 BPM
          
          const customCard = document.getElementById('custom-song-card');
          customCard.classList.remove('hidden');
          customCard.onclick = () => selectSong('custom');
          document.getElementById('custom-song-name').textContent = gameState.customSongName;
          
          // Update file input feedback
          const fileInput = event.target;
          fileInput.parentElement.style.borderColor = '#06b6d4';
          fileInput.parentElement.style.backgroundColor = 'rgba(6, 182, 212, 0.1)';
        } catch (err) {
          console.error('Failed to decode audio:', err);
          alert('Failed to load audio file. Try a different format.');
        }
      };
      
      reader.onerror = () => {
        console.error('Failed to read file');
        alert('Failed to read file');
      };
      
      reader.readAsArrayBuffer(file);
    }
    
    // ========== DIFFICULTY ==========
    function selectDifficulty(diff) {
      gameState.difficulty = diff;
      const settings = difficultySettings[diff];
      gameState.noteSpeed = settings.speed;
      gameState.laneCount = settings.lanes;
      startGame();
    }
    
    // ========== GAME LOGIC ==========
    function startGame() {
      initAudioContext();
      resetGameState();
      setupGameArea();
      showScreen('game-screen');
      startCountdown();
    }
    
    function resetGameState() {
      gameState.isPlaying = false;
      gameState.isPaused = false;
      gameState.score = 0;
      gameState.combo = 0;
      gameState.maxCombo = 0;
      gameState.totalNotes = 0;
      gameState.hitNotes = 0;
      gameState.perfectCount = 0;
      gameState.greatCount = 0;
      gameState.goodCount = 0;
      gameState.missCount = 0;
      gameState.notes = [];
      gameState.lastBeatTime = 0;
      
      updateUI();
    }
    
    function setupGameArea() {
      const gameArea = document.getElementById('game-area');
      const touchControls = document.getElementById('touch-controls');
      const laneCount = gameState.laneCount;
      const keys = keyBindings[laneCount];
      
      // Create lanes
      gameArea.innerHTML = '';
      for (let i = 0; i < laneCount; i++) {
        const lane = document.createElement('div');
        lane.className = 'lane';
        lane.id = `lane-${i}`;
        lane.innerHTML = `
          <div class="hit-zone pulse-ring" style="border-color: ${laneColors[i]}; color: ${laneColors[i]}">
            <span class="font-game text-sm opacity-50">${keys[i].toUpperCase()}</span>
          </div>
          <div class="judgment" id="judgment-${i}"></div>
        `;
        gameArea.appendChild(lane);
      }
      
      // Create touch controls
      touchControls.innerHTML = '';
      touchControls.className = 'flex sm:hidden';
      for (let i = 0; i < laneCount; i++) {
        const btn = document.createElement('button');
        btn.className = 'flex-1 py-6 font-game text-2xl active:scale-95 transition-transform';
        btn.style.backgroundColor = laneColors[i] + '40';
        btn.style.color = laneColors[i];
        btn.textContent = keys[i].toUpperCase();
        btn.ontouchstart = (e) => { e.preventDefault(); handleHit(i); };
        btn.onmousedown = () => handleHit(i);
        touchControls.appendChild(btn);
      }
    }
    
    function startCountdown() {
      const overlay = document.getElementById('countdown-overlay');
      const numberEl = document.getElementById('countdown-number');
      overlay.classList.remove('hidden');
      
      let count = 3;
      numberEl.textContent = count;
      
      const countInterval = setInterval(() => {
        count--;
        if (count > 0) {
          numberEl.textContent = count;
          playTone(440, 100);
        } else if (count === 0) {
          numberEl.textContent = 'GO!';
          playTone(880, 200);
        } else {
          clearInterval(countInterval);
          overlay.classList.add('hidden');
          beginGameplay();
        }
      }, 1000);
    }
    
    function beginGameplay() {
      gameState.isPlaying = true;
      gameState.startTime = performance.now();
      
      // Generate notes based on pattern
      const settings = difficultySettings[gameState.difficulty];
      const pattern = gameState.selectedSong.patterns;
      
      pattern.forEach((beat, idx) => {
        if (Math.random() < settings.noteFrequency) {
          const lane = Math.floor(Math.random() * gameState.laneCount);
          gameState.notes.push({
            id: idx,
            lane: lane,
            targetTime: beat.time,
            y: -60,
            hit: false,
            missed: false
          });
          gameState.totalNotes++;
        }
      });
      
      // Play custom audio if available
      if (gameState.selectedSong.id === 'custom' && gameState.customAudioBuffer) {
        const source = gameState.audioContext.createBufferSource();
        source.buffer = gameState.customAudioBuffer;
        source.connect(gameState.audioContext.destination);
        source.start();
        gameState.audioSource = source;
      }
      
      // Start game loop
      gameLoop();
      
      // Generate beats
      startBeatGenerator();
    }
    
    function startBeatGenerator() {
      const beatInterval = 60000 / gameState.selectedSong.bpm;
      
      gameState.beatInterval = setInterval(() => {
        if (!gameState.isPaused) {
          playBeat();
        }
      }, beatInterval);
    }
    
    function gameLoop() {
      if (!gameState.isPlaying) return;
      if (gameState.isPaused) {
        gameState.animationId = requestAnimationFrame(gameLoop);
        return;
      }
      
      const currentTime = performance.now() - gameState.startTime;
      const gameArea = document.getElementById('game-area');
      const gameHeight = gameArea.offsetHeight;
      const hitZoneY = gameHeight * 0.9;
      const settings = difficultySettings[gameState.difficulty];
      
      // Update notes
      gameState.notes.forEach(note => {
        if (note.hit || note.missed) {
          // PENTING: Tetap render untuk menghapus element dari DOM!
          renderNote(note);
          return;
        }
        
        // Calculate position based on time until target
        const timeUntilHit = note.targetTime - currentTime;
        const travelTime = 2000 / gameState.noteSpeed;
        const progress = 1 - (timeUntilHit / travelTime);
        
        note.y = progress * hitZoneY;
        
        // Check for miss
        if (timeUntilHit < -settings.timing.good) {
          note.missed = true;
          handleMiss(note.lane);
        }
        
        // Render note
        renderNote(note);
      });
      
      // Check for game end
      if (currentTime > gameState.selectedSong.duration + 2000) {
        endGame();
        return;
      }
      
      gameState.animationId = requestAnimationFrame(gameLoop);
    }
    
    function renderNote(note) {
      let noteEl = document.getElementById(`note-${note.id}`);
      const lane = document.getElementById(`lane-${note.lane}`);
      
      if (!lane) return;
      
      // Create note if it doesn't exist and is within view
      if (!noteEl && !note.hit && !note.missed && note.y > -60 && note.y < 2000) {
        noteEl = document.createElement('div');
        noteEl.id = `note-${note.id}`;
        noteEl.className = 'note note-glow';
        noteEl.style.backgroundColor = laneColors[note.lane];
        noteEl.style.color = '#fff';
        noteEl.innerHTML = '●';
        lane.appendChild(noteEl);
      }
      
      if (noteEl) {
        // PENTING: Langsung remove element jika note sudah di-hit atau miss
        if (note.hit) {
          noteEl.classList.add('hit-flash');
          // Tunggu animasi selesai baru remove
          setTimeout(() => {
            if (noteEl && noteEl.parentNode) {
              noteEl.remove();
            }
          }, 300); // Sesuai durasi CSS animation hitFlash
          return; // JANGAN update style setelah ini
        }
        
        if (note.missed) {
          noteEl.style.opacity = '0.3';
          noteEl.style.pointerEvents = 'none';
          // Remove after delay
          setTimeout(() => {
            if (noteEl && noteEl.parentNode) {
              noteEl.remove();
            }
          }, 400);
          return; // JANGAN update style setelah ini
        }
        
        // Update position hanya jika belum di-hit atau miss
        if (note.y >= -60 && note.y <= 2000) {
          noteEl.style.top = `${note.y}px`;
        } else {
          // Remove jika keluar layar
          if (noteEl.parentNode) {
            noteEl.remove();
          }
        }
      }
    }
    
    function handleHit(laneIndex) {
      if (!gameState.isPlaying || gameState.isPaused) return;
      
      const currentTime = performance.now() - gameState.startTime;
      const settings = difficultySettings[gameState.difficulty];
      
      // Find closest note in this lane
      let closestNote = null;
      let closestDiff = Infinity;
      
      gameState.notes.forEach(note => {
        if (note.lane !== laneIndex || note.hit || note.missed) return;
        
        const diff = Math.abs(note.targetTime - currentTime);
        if (diff < closestDiff && diff < settings.timing.good + 50) {
          closestDiff = diff;
          closestNote = note;
        }
      });
      
      if (closestNote) {
        closestNote.hit = true;
        
        // Determine judgment
        let judgment, score, color;
        if (closestDiff <= settings.timing.perfect) {
          judgment = 'PERFECT';
          score = 300;
          color = '#06b6d4';
          gameState.perfectCount++;
        } else if (closestDiff <= settings.timing.great) {
          judgment = 'GREAT';
          score = 200;
          color = '#22c55e';
          gameState.greatCount++;
        } else {
          judgment = 'GOOD';
          score = 100;
          color = '#f59e0b';
          gameState.goodCount++;
        }
        
        gameState.hitNotes++;
        gameState.combo++;
        gameState.maxCombo = Math.max(gameState.maxCombo, gameState.combo);
        
        // Combo bonus
        const comboMultiplier = 1 + Math.floor(gameState.combo / 10) * 0.1;
        gameState.score += Math.floor(score * comboMultiplier);
        
        showJudgment(laneIndex, judgment, color);
        showHitEffect(laneIndex);
        playHitSound(judgment.toLowerCase());
        updateUI();
      }
    }
    
    function handleMiss(laneIndex) {
      gameState.missCount++;
      gameState.combo = 0;
      showJudgment(laneIndex, 'MISS', '#ef4444');
      playHitSound('miss');
      updateUI();
    }
    
    function showJudgment(laneIndex, text, color) {
      const judgment = document.getElementById(`judgment-${laneIndex}`);
      if (!judgment) return;
      
      judgment.textContent = text;
      judgment.style.color = color;
      judgment.className = 'judgment score-popup';
      
      setTimeout(() => {
        judgment.className = 'judgment';
        judgment.textContent = '';
      }, 600);
    }
    
    function showHitEffect(laneIndex) {
      const lane = document.getElementById(`lane-${laneIndex}`);
      if (!lane) return;
      
      const hitZone = lane.querySelector('.hit-zone');
      const effect = document.createElement('div');
      effect.className = 'absolute rounded-full hit-flash';
      effect.style.cssText = `
        width: 70px; height: 70px; bottom: 10%;
        background: ${laneColors[laneIndex]}40;
        border: 2px solid ${laneColors[laneIndex]};
      `;
      lane.appendChild(effect);
      
      setTimeout(() => effect.remove(), 300);
    }
    
    function updateUI() {
      document.getElementById('score-display').textContent = gameState.score.toLocaleString();
      document.getElementById('combo-display').textContent = gameState.combo;
      
      const accuracy = gameState.totalNotes > 0 
        ? Math.round((gameState.hitNotes / Math.max(gameState.hitNotes + gameState.missCount, 1)) * 100)
        : 100;
      gameState.accuracy = accuracy;
      document.getElementById('accuracy-display').textContent = accuracy + '%';
    }
    
    // ========== PAUSE/RESUME ==========
    function pauseGame() {
      gameState.isPaused = true;
      document.getElementById('pause-menu').classList.remove('hidden');
      
      if (gameState.audioSource) {
        gameState.audioContext.suspend();
      }
    }
    
    function resumeGame() {
      document.getElementById('pause-menu').classList.add('hidden');
      
      if (gameState.audioContext && gameState.audioContext.state === 'suspended') {
        gameState.audioContext.resume();
      }
      
      // Brief countdown before resume
      setTimeout(() => {
        gameState.isPaused = false;
      }, 500);
    }
    
    function restartGame() {
      document.getElementById('pause-menu').classList.add('hidden');
      cancelAnimationFrame(gameState.animationId);
      clearInterval(gameState.beatInterval);
      
      if (gameState.audioSource) {
        try { gameState.audioSource.stop(); } catch(e) {}
      }
      
      startGame();
    }
    
    function quitGame() {
      gameState.isPlaying = false;
      gameState.isPaused = false;
      cancelAnimationFrame(gameState.animationId);
      clearInterval(gameState.beatInterval);
      
      if (gameState.audioSource) {
        try { gameState.audioSource.stop(); } catch(e) {}
      }
      
      document.getElementById('pause-menu').classList.add('hidden');
      showScreen('menu-screen');
    }
    
    // ========== END GAME ==========
    async function endGame() {
      gameState.isPlaying = false;
      cancelAnimationFrame(gameState.animationId);
      clearInterval(gameState.beatInterval);
      
      if (gameState.audioSource) {
        try { gameState.audioSource.stop(); } catch(e) {}
      }
      
      // Calculate final stats
      const finalAccuracy = gameState.totalNotes > 0
        ? Math.round((gameState.hitNotes / gameState.totalNotes) * 100)
        : 0;
      
      // Determine rank
      let rank, rankColor;
      if (finalAccuracy >= 95) { rank = 'S'; rankColor = '#fbbf24'; }
      else if (finalAccuracy >= 90) { rank = 'A'; rankColor = '#e5e7eb'; }
      else if (finalAccuracy >= 80) { rank = 'B'; rankColor = '#fb923c'; }
      else if (finalAccuracy >= 70) { rank = 'C'; rankColor = '#22c55e'; }
      else if (finalAccuracy >= 60) { rank = 'D'; rankColor = '#3b82f6'; }
      else { rank = 'F'; rankColor = '#ef4444'; }
      
      // Update results screen
      document.getElementById('result-title').textContent = finalAccuracy >= 70 ? 'STAGE CLEAR!' : 'STAGE FAILED';
      document.getElementById('result-song').textContent = `${gameState.selectedSong.name} - ${gameState.difficulty.charAt(0).toUpperCase() + gameState.difficulty.slice(1)}`;
      document.getElementById('final-score').textContent = gameState.score.toLocaleString();
      document.getElementById('final-combo').textContent = gameState.maxCombo;
      document.getElementById('final-accuracy').textContent = finalAccuracy + '%';
      document.getElementById('final-rank').textContent = rank;
      document.getElementById('final-rank').style.color = rankColor;
      
      document.getElementById('perfect-count').textContent = gameState.perfectCount;
      document.getElementById('great-count').textContent = gameState.greatCount;
      document.getElementById('good-count').textContent = gameState.goodCount;
      document.getElementById('miss-count').textContent = gameState.missCount;
      
      // Save score
      if (window.dataSdk) {
        const scoreData = {
          song_id: gameState.selectedSong.id,
          difficulty: gameState.difficulty,
          score: gameState.score,
          max_combo: gameState.maxCombo,
          accuracy: finalAccuracy,
          played_at: new Date().toISOString()
        };
        
        if (highScores.length < 999) {
          await window.dataSdk.create(scoreData);
        }
      }
      
      showScreen('results-screen');
    }
    
    // ========== HIGH SCORES ==========
    function renderHighScores() {
      const container = document.getElementById('highscore-list');
      
      if (highScores.length === 0) {
        container.innerHTML = `
          <div class="text-center text-gray-500 py-8">
            <p class="text-4xl mb-4">🎮</p>
            <p>No scores yet!</p>
            <p class="text-sm">Play some songs to see your records here.</p>
          </div>
        `;
        return;
      }
      
      // Sort by score descending
      const sorted = [...highScores].sort((a, b) => b.score - a.score);
      
      container.innerHTML = sorted.slice(0, 20).map((record, idx) => {
        const songName = songs[record.song_id]?.name || record.song_id;
        const rankColors = { S: '#fbbf24', A: '#e5e7eb', B: '#fb923c', C: '#22c55e', D: '#3b82f6', F: '#ef4444' };
        let rank;
        if (record.accuracy >= 95) rank = 'S';
        else if (record.accuracy >= 90) rank = 'A';
        else if (record.accuracy >= 80) rank = 'B';
        else if (record.accuracy >= 70) rank = 'C';
        else if (record.accuracy >= 60) rank = 'D';
        else rank = 'F';
        
        return `
          <div class="glass rounded-xl p-4 mb-3 flex items-center gap-4">
            <div class="font-game text-2xl text-gray-500 w-8">#${idx + 1}</div>
            <div class="flex-1">
              <div class="font-bold">${songName}</div>
              <div class="text-sm text-gray-400">${record.difficulty} • ${record.accuracy}%</div>
            </div>
            <div class="text-right">
              <div class="font-game text-xl" style="color: ${rankColors[rank]}">${rank}</div>
              <div class="text-sm text-cyan-400">${record.score.toLocaleString()}</div>
            </div>
          </div>
        `;
      }).join('');
    }
    
    // ========== KEYBOARD CONTROLS ==========
    document.addEventListener('keydown', (e) => {
      if (!gameState.isPlaying || gameState.isPaused) {
        if (e.key === 'Escape' && gameState.isPaused) {
          resumeGame();
        }
        return;
      }
      
      if (e.key === 'Escape') {
        pauseGame();
        return;
      }
      
      const keys = keyBindings[gameState.laneCount];
      const laneIndex = keys.indexOf(e.key.toLowerCase());
      
      if (laneIndex !== -1) {
        e.preventDefault();
        handleHit(laneIndex);
      }
    });
    
    // ========== SDK INITIALIZATION ==========
    const dataHandler = {
      onDataChanged(data) {
        highScores = data;
        const hsScreen = document.getElementById('highscores');
        if (!hsScreen.classList.contains('hidden')) {
          renderHighScores();
        }
      }
    };
    
    function applyConfig(cfg) {
      document.getElementById('game-title').textContent = cfg.game_title || defaultConfig.game_title;
      document.getElementById('start-btn').innerHTML = `🎮 ${cfg.start_button_text || defaultConfig.start_button_text}`;
      
      document.body.style.setProperty('--bg-color', cfg.background_color || defaultConfig.background_color);
    }
    
    async function initApp() {
      // Initialize Element SDK
      if (window.elementSdk) {
        window.elementSdk.init({
          defaultConfig,
          onConfigChange: async (cfg) => {
            config = { ...defaultConfig, ...cfg };
            applyConfig(config);
          },
          mapToCapabilities: (cfg) => ({
            recolorables: [
              {
                get: () => cfg.background_color || defaultConfig.background_color,
                set: (v) => window.elementSdk.setConfig({ background_color: v })
              },
              {
                get: () => cfg.secondary_color || defaultConfig.secondary_color,
                set: (v) => window.elementSdk.setConfig({ secondary_color: v })
              },
              {
                get: () => cfg.text_color || defaultConfig.text_color,
                set: (v) => window.elementSdk.setConfig({ text_color: v })
              },
              {
                get: () => cfg.accent_color || defaultConfig.accent_color,
                set: (v) => window.elementSdk.setConfig({ accent_color: v })
              },
              {
                get: () => cfg.button_color || defaultConfig.button_color,
                set: (v) => window.elementSdk.setConfig({ button_color: v })
              }
            ],
            borderables: [],
            fontEditable: undefined,
            fontSizeable: undefined
          }),
          mapToEditPanelValues: (cfg) => new Map([
            ['game_title', cfg.game_title || defaultConfig.game_title],
            ['start_button_text', cfg.start_button_text || defaultConfig.start_button_text]
          ])
        });
      }
      
      // Initialize Data SDK
      if (window.dataSdk) {
        const result = await window.dataSdk.init(dataHandler);
        if (!result.isOk) {
          console.error('Failed to initialize data SDK');
        }
      }
      
      applyConfig(config);
    }
    
    initApp();