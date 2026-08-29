import { CONCEPTION_STAGES } from '../data/conceptionStages.js';

/**
 * Scientific Breakdown Panel (Modal / Sidebar)
 * Deep scientific insights, key processes, and real-time telemetry.
 * Supports dynamic stage switching for multi-module architecture.
 */
export class ScientificPanel {
  constructor(container) {
    this.container = container;
    this.isOpen = false;
    this.currentStageIndex = 0;
    this.stages = CONCEPTION_STAGES;

    this.element = document.createElement('div');
    this.element.className = 'scientific-panel';
    this.container.appendChild(this.element);

    this.render();
  }

  /**
   * Switch the active stages array (for module switching)
   */
  setStages(stagesArray) {
    this.stages = stagesArray;
    this.currentStageIndex = 0;
    this.render();
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.element.classList.toggle('open', this.isOpen);
  }

  showStage(stageIndex) {
    this.currentStageIndex = stageIndex;
    this.render();
  }

  render() {
    const stage = this.stages[this.currentStageIndex] || this.stages[0];

    // Determine section titles based on content
    const hasTimeline = !!stage.timeline;
    const timelineDisplay = hasTimeline 
      ? `&nbsp;•&nbsp; <span style="color:#f43f5e;font-weight:700;">${stage.timeline}</span>` 
      : '';

    this.element.innerHTML = `
      <div class="panel-header">
        <div class="panel-title-group">
          <span class="panel-icon">${stage.icon}</span>
          <div>
            <h2 class="panel-title">${stage.name}</h2>
            <div class="panel-subtitle">${stage.subtitle}${timelineDisplay}</div>
          </div>
        </div>
        <button class="panel-close-btn" id="closeSciPanel">✕</button>
      </div>

      <div class="panel-body">
        <div class="equation-card">
          <div class="equation-label">Key Scientific Process</div>
          <div class="equation-math">${stage.equation}</div>
        </div>

        <div class="section-title">Scientific Description</div>
        <p class="panel-description">${stage.description}</p>

        <div class="section-title">Key Scientific Facts</div>
        <ul class="keypoints-list">
          ${stage.keyPoints.map(pt => `<li>${pt}</li>`).join('')}
        </ul>

        <div class="section-title">Real-Time Telemetry</div>
        <div class="telemetry-grid">
          ${Object.entries(stage.telemetry).map(([k, v]) => `
            <div class="telemetry-card">
              <div class="telemetry-label">${k.replace(/([A-Z])/g, ' $1')}</div>
              <div class="telemetry-value">${v}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const closeBtn = this.element.querySelector('#closeSciPanel');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.toggle());
    }
  }
}
