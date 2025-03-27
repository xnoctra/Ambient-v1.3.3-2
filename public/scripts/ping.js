// Optimize ping checking
const pingCheck = {
  isRunning: false,
  timeout: null,
  
  async getPing() {
    const startTime = performance.now();
    try {
      const response = await fetch(window.location.href, { 
        method: 'HEAD',
        cache: 'no-store'
      });
      const endTime = performance.now();
      return Math.round(endTime - startTime);
    } catch (err) {
      console.warn('Ping check failed:', err);
      return null;
    }
  },

  updateDisplay(ping) {
    if (!ping) return;
    
    const pingValueElement = document.getElementById('pingValue');
    const pingDotElement = document.getElementById('pingDot');
    
    if (!pingValueElement || !pingDotElement) return;

    pingValueElement.textContent = `Ping: ${ping} ms`;

    // Use CSS classes instead of inline styles
    pingDotElement.className = 'dot ' + (
      ping < 50 ? 'good' :
      ping < 150 ? 'medium' :
      'poor'
    );
  },

  async check() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const ping = await this.getPing();
      if (document.visibilityState === 'visible') {
        this.updateDisplay(ping);
      }
    } finally {
      this.isRunning = false;
    }
  },

  start() {
    // Only run ping checks when page is visible
    if (document.visibilityState === 'visible') {
      this.check();
    }
    
    this.timeout = setTimeout(() => {
      this.start();
    }, 700);
  },

  stop() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
};

// Start ping checking when page becomes visible
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    pingCheck.start();
  } else {
    pingCheck.stop();
  }
}, { passive: true });

// Initial start
pingCheck.start();