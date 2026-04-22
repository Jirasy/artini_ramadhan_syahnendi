 // Default configuration
    const defaultConfig = {
      app_title: "🎨 Drawing Canvas",
      clear_btn_text: "Clear",
      save_btn_text: "Save",
      background_color: "#4c1d95",
      canvas_bg_color: "#ffffff",
      accent_color: "#8b5cf6",
      text_color: "#ffffff",
      button_color: "#3b82f6"
    };

    // State
    let config = { ...defaultConfig };
    let canvas, ctx;
    let isDrawing = false;
    let currentColor = "#000000";
    let brushSize = 5;
    let currentTool = "brush"; // brush, eraser, fill
    let undoStack = [];
    let redoStack = [];
    let score = 0;
    let tapCount = 0;
    let strokeCount = 0;
    let startTime = null;
    let timerInterval = null;
    let lastX = 0, lastY = 0;
    let strokeLength = 0;

    // Canvas sizes
    const canvasSizes = {
      small: { width: 400, height: 300 },
      medium: { width: 600, height: 450 },
      large: { width: 800, height: 600 }
    };

    // Reference SVGs
    const referenceSVGs = {
      heart: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 88 C20 60 5 40 5 25 C5 10 20 0 35 5 C45 10 50 20 50 20 C50 20 55 10 65 5 C80 0 95 10 95 25 C95 40 80 60 50 88Z" fill="none" stroke="#000" stroke-width="2"/></svg>`,
      star: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" fill="none" stroke="#000" stroke-width="2"/></svg>`,
      tree: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 80,45 65,45 90,75 60,75 60,95 40,95 40,75 10,75 35,45 20,45" fill="none" stroke="#000" stroke-width="2"/></svg>`,
      house: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M10 50 L50 15 L90 50 L90 90 L10 90 Z M40 90 L40 65 L60 65 L60 90" fill="none" stroke="#000" stroke-width="2"/><rect x="65" y="55" width="15" height="15" fill="none" stroke="#000" stroke-width="2"/></svg>`,
      cat: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="55" rx="30" ry="25" fill="none" stroke="#000" stroke-width="2"/><polygon points="25,35 20,10 40,30" fill="none" stroke="#000" stroke-width="2"/><polygon points="75,35 80,10 60,30" fill="none" stroke="#000" stroke-width="2"/><circle cx="40" cy="50" r="3" fill="#000"/><circle cx="60" cy="50" r="3" fill="#000"/><ellipse cx="50" cy="60" rx="4" ry="3" fill="#000"/><path d="M50 63 Q45 70 40 65 M50 63 Q55 70 60 65" fill="none" stroke="#000" stroke-width="1.5"/></svg>`,
      flower: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="40" r="10" fill="none" stroke="#000" stroke-width="2"/><ellipse cx="50" cy="20" rx="8" ry="12" fill="none" stroke="#000" stroke-width="2"/><ellipse cx="65" cy="30" rx="8" ry="12" fill="none" stroke="#000" stroke-width="2" transform="rotate(60 65 30)"/><ellipse cx="65" cy="50" rx="8" ry="12" fill="none" stroke="#000" stroke-width="2" transform="rotate(120 65 50)"/><ellipse cx="50" cy="60" rx="8" ry="12" fill="none" stroke="#000" stroke-width="2"/><ellipse cx="35" cy="50" rx="8" ry="12" fill="none" stroke="#000" stroke-width="2" transform="rotate(-120 35 50)"/><ellipse cx="35" cy="30" rx="8" ry="12" fill="none" stroke="#000" stroke-width="2" transform="rotate(-60 35 30)"/><path d="M50 55 Q45 75 50 95" fill="none" stroke="#000" stroke-width="2"/></svg>`
    };

    // Initialize
    function init() {
      canvas = document.getElementById("drawCanvas");
      ctx = canvas.getContext("2d");
      
      setCanvasSize("medium");
      setupEventListeners();
      saveState();
      startTimer();
    }

    function setCanvasSize(size) {
      let width, height;
      if (size === "custom") {
        width = parseInt(document.getElementById("customWidth").value) || 600;
        height = parseInt(document.getElementById("customHeight").value) || 450;
      } else {
        width = canvasSizes[size].width;
        height = canvasSizes[size].height;
      }
      
      // Adjust for mobile
      const maxWidth = window.innerWidth - 40;
      const maxHeight = window.innerHeight * 0.5;
      
      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = Math.floor(height * ratio);
      }
      if (height > maxHeight) {
        const ratio = maxHeight / height;
        height = maxHeight;
        width = Math.floor(width * ratio);
      }
      
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      
      // Fill with white
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      
      undoStack = [];
      redoStack = [];
      updateUndoRedoButtons();
      saveState();
    }

    function setupEventListeners() {
      // Canvas events
      canvas.addEventListener("mousedown", startDrawing);
      canvas.addEventListener("mousemove", draw);
      canvas.addEventListener("mouseup", stopDrawing);
      canvas.addEventListener("mouseout", stopDrawing);
      
      // Touch events
      canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
      canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
      canvas.addEventListener("touchend", handleTouchEnd);
      
      // Color palette
      document.querySelectorAll(".color-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          currentColor = btn.dataset.color;
          document.getElementById("customColor").value = currentColor;
          if (currentTool === "eraser") {
            setTool("brush");
          }
        });
      });
      
      // Custom color
      document.getElementById("customColor").addEventListener("input", (e) => {
        currentColor = e.target.value;
        document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
        if (currentTool === "eraser") {
          setTool("brush");
        }
      });
      
      // Brush size
      document.getElementById("brushSize").addEventListener("input", (e) => {
        brushSize = parseInt(e.target.value);
        document.getElementById("brushSizeValue").textContent = brushSize;
      });
      
      // Canvas size
      document.getElementById("canvasSize").addEventListener("change", (e) => {
        if (e.target.value === "custom") {
          document.getElementById("customSizeInputs").classList.remove("hidden");
          document.getElementById("customSizeInputs").classList.add("flex");
        } else {
          document.getElementById("customSizeInputs").classList.add("hidden");
          document.getElementById("customSizeInputs").classList.remove("flex");
          setCanvasSize(e.target.value);
        }
      });
      
      document.getElementById("applyCustomSize").addEventListener("click", () => {
        setCanvasSize("custom");
      });
      
      // Tools
      document.getElementById("eraserBtn").addEventListener("click", () => setTool("eraser"));
      document.getElementById("brushBtn").addEventListener("click", () => setTool("brush"));
      document.getElementById("fillBtn").addEventListener("click", () => setTool("fill"));
      
      // Actions
      document.getElementById("undoBtn").addEventListener("click", undo);
      document.getElementById("redoBtn").addEventListener("click", redo);
      document.getElementById("clearBtn").addEventListener("click", showClearConfirm);
      document.getElementById("saveBtn").addEventListener("click", saveImage);
      document.getElementById("referenceBtn").addEventListener("click", showReferenceModal);
      document.getElementById("newCanvasBtn").addEventListener("click", newCanvas);
      
      // Help modal
      document.getElementById("helpBtn").addEventListener("click", () => {
        document.getElementById("helpModal").classList.remove("hidden");
        document.getElementById("helpModal").classList.add("flex");
      });
      document.getElementById("closeHelp").addEventListener("click", () => {
        document.getElementById("helpModal").classList.add("hidden");
        document.getElementById("helpModal").classList.remove("flex");
      });
      
      // Clear confirm
      document.getElementById("cancelClear").addEventListener("click", hideClearConfirm);
      document.getElementById("confirmClear").addEventListener("click", () => {
        clearCanvas();
        hideClearConfirm();
      });
      
      // Reference modal
      document.getElementById("closeReference").addEventListener("click", hideReferenceModal);
      document.getElementById("applyReference").addEventListener("click", applyReference);
      document.getElementById("removeReference").addEventListener("click", removeReference);
      document.getElementById("referenceOpacity").addEventListener("input", (e) => {
        const refImg = document.getElementById("referenceImage");
        if (!refImg.classList.contains("hidden")) {
          refImg.style.opacity = e.target.value / 100;
        }
      });
      
      // Preset references
      document.querySelectorAll(".ref-preset").forEach(btn => {
        btn.addEventListener("click", () => {
          const refType = btn.dataset.ref;
          applyPresetReference(refType);
        });
      });
      
      // Close modals on overlay click
      document.getElementById("helpModal").addEventListener("click", (e) => {
        if (e.target === e.currentTarget) {
          document.getElementById("helpModal").classList.add("hidden");
          document.getElementById("helpModal").classList.remove("flex");
        }
      });
      document.getElementById("clearConfirm").addEventListener("click", (e) => {
        if (e.target === e.currentTarget) hideClearConfirm();
      });
      document.getElementById("referenceModal").addEventListener("click", (e) => {
        if (e.target === e.currentTarget) hideReferenceModal();
      });
      
      // Window resize
      window.addEventListener("resize", () => {
        const currentSize = document.getElementById("canvasSize").value;
        if (currentSize !== "custom") {
          // Preserve canvas content
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          setCanvasSize(currentSize);
          ctx.putImageData(imageData, 0, 0);
        }
      });
    }

    function setTool(tool) {
      currentTool = tool;
      document.getElementById("eraserBtn").classList.remove("bg-blue-500/50");
      document.getElementById("eraserBtn").classList.add("bg-white/20");
      document.getElementById("brushBtn").classList.remove("bg-blue-500/50");
      document.getElementById("brushBtn").classList.add("bg-white/20");
      document.getElementById("fillBtn").classList.remove("bg-blue-500/50");
      document.getElementById("fillBtn").classList.add("bg-white/20");
      
      if (tool === "eraser") {
        document.getElementById("eraserBtn").classList.add("bg-blue-500/50");
        document.getElementById("eraserBtn").classList.remove("bg-white/20");
        canvas.style.cursor = "cell";
      } else if (tool === "brush") {
        document.getElementById("brushBtn").classList.add("bg-blue-500/50");
        document.getElementById("brushBtn").classList.remove("bg-white/20");
        canvas.style.cursor = "crosshair";
      } else if (tool === "fill") {
        document.getElementById("fillBtn").classList.add("bg-blue-500/50");
        document.getElementById("fillBtn").classList.remove("bg-white/20");
        canvas.style.cursor = "pointer";
      }
    }

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      if (e.touches) {
        return {
          x: (e.touches[0].clientX - rect.left) * scaleX,
          y: (e.touches[0].clientY - rect.top) * scaleY
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }

    function startDrawing(e) {
      if (currentTool === "fill") {
        const pos = getPos(e);
        floodFill(Math.floor(pos.x), Math.floor(pos.y), currentColor);
        saveState();
        addScore(50);
        tapCount++;
        updateStats();
        return;
      }
      
      isDrawing = true;
      const pos = getPos(e);
      lastX = pos.x;
      lastY = pos.y;
      strokeLength = 0;
      
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = currentTool === "eraser" ? "#ffffff" : currentColor;
      
      // Draw a dot for single click
      ctx.lineTo(pos.x + 0.1, pos.y + 0.1);
      ctx.stroke();
      
      tapCount++;
      addScore(10);
    }

    function draw(e) {
      if (!isDrawing) return;
      e.preventDefault();
      
      const pos = getPos(e);
      
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      
      // Calculate stroke length for scoring
      const dx = pos.x - lastX;
      const dy = pos.y - lastY;
      strokeLength += Math.sqrt(dx * dx + dy * dy);
      lastX = pos.x;
      lastY = pos.y;
    }

    function stopDrawing() {
      if (isDrawing) {
        isDrawing = false;
        ctx.beginPath();
        saveState();
        
        // Score based on stroke length
        const strokeScore = Math.floor(strokeLength / 10);
        addScore(strokeScore);
        
        strokeCount++;
        updateStats();
      }
    }

    function handleTouchStart(e) {
      e.preventDefault();
      startDrawing(e);
    }

    function handleTouchMove(e) {
      e.preventDefault();
      draw(e);
    }

    function handleTouchEnd(e) {
      stopDrawing();
    }

    function saveState() {
      if (undoStack.length > 50) {
        undoStack.shift();
      }
      undoStack.push(canvas.toDataURL());
      redoStack = [];
      updateUndoRedoButtons();
    }

    function undo() {
      if (undoStack.length > 1) {
        redoStack.push(undoStack.pop());
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = undoStack[undoStack.length - 1];
        updateUndoRedoButtons();
      }
    }

    function redo() {
      if (redoStack.length > 0) {
        const state = redoStack.pop();
        undoStack.push(state);
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = state;
        updateUndoRedoButtons();
      }
    }

    function updateUndoRedoButtons() {
      document.getElementById("undoBtn").disabled = undoStack.length <= 1;
      document.getElementById("redoBtn").disabled = redoStack.length === 0;
    }

    function clearCanvas() {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveState();
    }

    function newCanvas() {
      score = 0;
      tapCount = 0;
      strokeCount = 0;
      startTime = new Date();
      updateScore();
      updateStats();
      clearCanvas();
    }

    function saveImage() {
      const link = document.createElement("a");
      link.download = "drawing-" + Date.now() + ".png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      addScore(100);
    }

    function showClearConfirm() {
      document.getElementById("clearConfirm").classList.remove("hidden");
      document.getElementById("clearConfirm").classList.add("flex");
    }

    function hideClearConfirm() {
      document.getElementById("clearConfirm").classList.add("hidden");
      document.getElementById("clearConfirm").classList.remove("flex");
    }

    function showReferenceModal() {
      document.getElementById("referenceModal").classList.remove("hidden");
      document.getElementById("referenceModal").classList.add("flex");
    }

    function hideReferenceModal() {
      document.getElementById("referenceModal").classList.add("hidden");
      document.getElementById("referenceModal").classList.remove("flex");
    }

    function applyPresetReference(refType) {
      const svg = referenceSVGs[refType];
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      
      const refImg = document.getElementById("referenceImage");
      refImg.src = url;
      refImg.style.opacity = document.getElementById("referenceOpacity").value / 100;
      refImg.classList.remove("hidden");
      
      hideReferenceModal();
      addScore(20);
    }

    function applyReference() {
      const url = document.getElementById("referenceUrl").value.trim();
      if (url) {
        const refImg = document.getElementById("referenceImage");
        refImg.src = url;
        refImg.style.opacity = document.getElementById("referenceOpacity").value / 100;
        refImg.classList.remove("hidden");
        refImg.onerror = () => {
          refImg.classList.add("hidden");
        };
      }
      hideReferenceModal();
    }

    function removeReference() {
      const refImg = document.getElementById("referenceImage");
      refImg.classList.add("hidden");
      refImg.src = "";
      document.getElementById("referenceUrl").value = "";
      hideReferenceModal();
    }

    function floodFill(startX, startY, fillColor) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;
      
      const targetColor = getPixelColor(data, startX, startY, width);
      const fillRGB = hexToRgb(fillColor);
      
      if (targetColor.r === fillRGB.r && targetColor.g === fillRGB.g && targetColor.b === fillRGB.b) {
        return;
      }
      
      const stack = [[startX, startY]];
      const visited = new Set();
      
      while (stack.length > 0) {
        const [x, y] = stack.pop();
        const key = `${x},${y}`;
        
        if (visited.has(key)) continue;
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        
        const currentColor = getPixelColor(data, x, y, width);
        if (!colorsMatch(currentColor, targetColor, 30)) continue;
        
        visited.add(key);
        setPixelColor(data, x, y, width, fillRGB);
        
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
      
      ctx.putImageData(imageData, 0, 0);
    }

    function getPixelColor(data, x, y, width) {
      const idx = (y * width + x) * 4;
      return { r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] };
    }

    function setPixelColor(data, x, y, width, color) {
      const idx = (y * width + x) * 4;
      data[idx] = color.r;
      data[idx + 1] = color.g;
      data[idx + 2] = color.b;
      data[idx + 3] = 255;
    }

    function colorsMatch(c1, c2, tolerance) {
      return Math.abs(c1.r - c2.r) <= tolerance &&
             Math.abs(c1.g - c2.g) <= tolerance &&
             Math.abs(c1.b - c2.b) <= tolerance;
    }

    function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    }

    function addScore(points) {
      score += points;
      updateScore();
    }

    function updateScore() {
      const scoreEl = document.getElementById("scoreDisplay");
      scoreEl.textContent = score;
      scoreEl.classList.remove("score-animate");
      void scoreEl.offsetWidth;
      scoreEl.classList.add("score-animate");
    }

    function updateStats() {
      document.getElementById("tapCount").textContent = tapCount;
      document.getElementById("strokeCount").textContent = strokeCount;
    }

    function startTimer() {
      startTime = new Date();
      timerInterval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now - startTime) / 1000);
        const mins = Math.floor(diff / 60).toString().padStart(2, "0");
        const secs = (diff % 60).toString().padStart(2, "0");
        document.getElementById("timeDisplay").textContent = `${mins}:${secs}`;
      }, 1000);
    }

    // Element SDK Integration
    async function onConfigChange(cfg) {
      const title = cfg.app_title || defaultConfig.app_title;
      const clearText = cfg.clear_btn_text || defaultConfig.clear_btn_text;
      const saveText = cfg.save_btn_text || defaultConfig.save_btn_text;
      
      document.getElementById("appTitle").textContent = title;
      document.getElementById("clearBtnText").textContent = clearText;
      document.getElementById("saveBtnText").textContent = saveText;
    }

    function mapToCapabilities(cfg) {
      return {
        recolorables: [],
        borderables: [],
        fontEditable: undefined,
        fontSizeable: undefined
      };
    }

    function mapToEditPanelValues(cfg) {
      return new Map([
        ["app_title", cfg.app_title || defaultConfig.app_title],
        ["clear_btn_text", cfg.clear_btn_text || defaultConfig.clear_btn_text],
        ["save_btn_text", cfg.save_btn_text || defaultConfig.save_btn_text]
      ]);
    }

    // Initialize SDK
    if (window.elementSdk) {
      window.elementSdk.init({
        defaultConfig,
        onConfigChange,
        mapToCapabilities,
        mapToEditPanelValues
      });
    }

    // Initialize app
    init();
