// Optimize shortcuts loading
const shortcutsManager = {
  container: null,
  shortcuts: null,
  observer: null,

  async init() {
    this.container = document.getElementById("shortcutsContain");
    if (!this.container) return;

    // Setup intersection observer for lazy loading
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadShortcuts();
            this.observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    this.observer.observe(this.container);
  },

  async loadShortcuts() {
    try {
      const response = await fetch("/scripts/json/shortcuts.json");
      if (!response.ok) throw new Error('Failed to fetch shortcuts');
      
      this.shortcuts = await response.json();
      this.shortcuts.sort((a, b) => a.name.localeCompare(b.name));
      
      requestIdleCallback(() => {
        this.renderShortcuts();
      });
    } catch (error) {
      console.error("Error loading shortcuts:", error);
    }
  },

  renderShortcuts() {
    if (!this.container || !this.shortcuts) return;

    const fragment = document.createDocumentFragment();

    this.shortcuts.forEach((shortcut) => {
      const shortcutDiv = document.createElement("div");
      shortcutDiv.className = "shortcut";
      
      // Use event delegation instead of individual listeners
      shortcutDiv.dataset.link = shortcut.link;

      const img = document.createElement("img");
      img.src = shortcut.img;
      img.alt = shortcut.name;
      img.title = shortcut.name;
      img.loading = "lazy"; // Enable lazy loading for images
      
      shortcutDiv.appendChild(img);
      fragment.appendChild(shortcutDiv);
    });

    // Add single event listener using event delegation
    this.container.addEventListener('click', (e) => {
      const shortcut = e.target.closest('.shortcut');
      if (shortcut) {
        const link = shortcut.dataset.link;
        if (link) launch(link);
      }
    }, { passive: true });

    this.container.appendChild(fragment);
  }
};

// Initialize shortcuts when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => shortcutsManager.init());
} else {
  shortcutsManager.init();
}