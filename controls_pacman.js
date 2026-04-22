// controls.js — Keyboard, D-pad button, and swipe gesture controls

/**
 * Wire up arrow keys / WASD → calls callback(direction).
 * Prevents default scroll behaviour while arrow keys are held.
 */
function setupKeyboardControls(callback) {
    document.addEventListener('keydown', function (e) {
        let dir = null;
        if (e.code === 'ArrowUp'    || e.code === 'KeyW') dir = 'U';
        else if (e.code === 'ArrowDown'  || e.code === 'KeyS') dir = 'D';
        else if (e.code === 'ArrowLeft'  || e.code === 'KeyA') dir = 'L';
        else if (e.code === 'ArrowRight' || e.code === 'KeyD') dir = 'R';

        if (dir) {
            e.preventDefault();
            callback(dir);
        }
    });
}

/**
 * Wire up the on-screen D-pad buttons.
 * Supports both touch and mouse, with a visual "pressed" class.
 */
function setupDpadControls(callback) {
    const map = {
        'btn-up':    'U',
        'btn-down':  'D',
        'btn-left':  'L',
        'btn-right': 'R'
    };

    for (const [id, dir] of Object.entries(map)) {
        const btn = document.getElementById(id);
        if (!btn) continue;

        function onPress(e) {
            e.preventDefault();
            btn.classList.add('pressed');
            callback(dir);
        }
        function onRelease() {
            btn.classList.remove('pressed');
        }

        // Touch events
        btn.addEventListener('touchstart', onPress,   { passive: false });
        btn.addEventListener('touchend',   onRelease, { passive: true  });
        btn.addEventListener('touchcancel',onRelease, { passive: true  });

        // Mouse events (fallback / desktop testing)
        btn.addEventListener('mousedown', onPress);
        btn.addEventListener('mouseup',   onRelease);
        btn.addEventListener('mouseleave',onRelease);
    }
}

/**
 * Detect swipe gestures on `element` and call callback(direction).
 * Only fires if the swipe is longer than `threshold` pixels.
 */
function setupSwipeControls(element, callback, threshold) {
    threshold = threshold || 28;
    let startX = 0;
    let startY = 0;

    element.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });

    element.addEventListener('touchend', function (e) {
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;

        if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;

        if (Math.abs(dx) > Math.abs(dy)) {
            callback(dx > 0 ? 'R' : 'L');
        } else {
            callback(dy > 0 ? 'D' : 'U');
        }
    }, { passive: true });
}
