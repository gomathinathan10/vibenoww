/**
 * VibeNoww Creator Profile Photo Cropper
 * Interactive touch & drag cropper for creator avatars.
 * Supports circular/square framing, zoom slider, 90° rotation, rule-of-thirds grid, and 512x512 HD export.
 * Engineered for 100% visible sticky submit button & full opaque background isolation.
 */

export function openImageCropper(imageSrc, onComplete, options = {}) {
  const {
    title = 'Crop Profile Picture',
    subtitle = 'Drag to position and adjust zoom for your verified creator avatar',
    defaultShape = 'circle', // 'circle' | 'square'
    exportSize = 512
  } = options;

  // Remove any existing cropper modal if present
  const existingModal = document.getElementById('vn-image-crop-modal');
  if (existingModal) existingModal.remove();

  // Create modal container - fully opaque backdrop so others/background elements are NOT visible
  const modal = document.createElement('div');
  modal.id = 'vn-image-crop-modal';
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 999999;
    background: rgba(3, 6, 16, 0.98);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    font-family: var(--font-sans, 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif);
    animation: vnCropFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  `;

  // Internal state
  let zoom = 1;
  let rotation = 0;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let currentShape = defaultShape;
  const CROP_SIZE = 260;

  modal.innerHTML = `
    <style>
      @keyframes vnCropFadeIn {
        from { opacity: 0; transform: scale(0.96); }
        to { opacity: 1; transform: scale(1); }
      }
      .vn-crop-card {
        background: #0d1326;
        border: 1.5px solid rgba(0, 210, 255, 0.5);
        border-radius: 22px;
        width: 100%;
        max-width: 440px;
        color: #ffffff;
        box-shadow: 0 25px 70px rgba(0,0,0,0.95), 0 0 50px rgba(0,210,255,0.28);
        box-sizing: border-box;
        max-height: min(94vh, 680px);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .vn-crop-scrollable {
        overflow-y: auto;
        overflow-x: hidden;
        padding: 20px 20px 10px;
        flex: 1;
        min-height: 0;
      }
      .vn-crop-btn-shape {
        background: transparent;
        border: 1px solid rgba(255,255,255,0.15);
        color: #94a3b8;
        padding: 6px 14px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
      }
      .vn-crop-btn-shape.active {
        background: rgba(0, 210, 255, 0.25);
        border-color: #00d2ff;
        color: #00d2ff;
        box-shadow: 0 0 12px rgba(0, 210, 255, 0.3);
      }
      .vn-crop-zoom-slider {
        flex: 1;
        accent-color: #00d2ff;
        cursor: pointer;
        height: 6px;
      }
      .vn-crop-grid-line {
        position: absolute;
        background: rgba(255,255,255,0.22);
        pointer-events: none;
      }
      .vn-crop-sticky-footer {
        position: sticky;
        bottom: 0;
        z-index: 30;
        background: #0d1326;
        border-top: 1px solid rgba(255,255,255,0.1);
        padding: 14px 20px 16px;
        margin-top: auto;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        align-items: center;
        box-shadow: 0 -10px 20px rgba(13, 19, 38, 0.85);
      }
      .vn-crop-submit-btn {
        background: linear-gradient(135deg, #00d2ff 0%, #0072ff 50%, #9333ea 100%);
        border: none;
        color: #ffffff;
        padding: 12px 24px;
        border-radius: 10px;
        font-size: 13.5px;
        font-weight: 800;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        box-shadow: 0 4px 20px rgba(0,210,255,0.5);
        transition: all 0.2s;
        letter-spacing: 0.2px;
      }
      .vn-crop-submit-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 26px rgba(0,210,255,0.7);
      }
      @media (max-height: 680px) {
        #vn-crop-viewport {
          width: 210px !important;
          height: 210px !important;
          margin-bottom: 10px !important;
        }
        .vn-crop-scrollable {
          padding: 14px 14px 8px !important;
        }
      }
    </style>

    <div class="vn-crop-card" id="vn-crop-card-inner">
      <div class="vn-crop-scrollable">
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              <img src="/images/vibenoww-symbol.png" alt="VibeNoww" style="height:22px; width:22px; object-fit:contain;" />
              <span style="color:#00d2ff; font-size:11.5px; font-weight:800; text-transform:uppercase; letter-spacing:1px;">
                Creator Studio
              </span>
              <span style="background:rgba(0,210,255,0.15); border:1px solid rgba(0,210,255,0.35); color:#00d2ff; padding:2px 8px; border-radius:10px; font-size:10.5px; font-weight:700;">
                Crop Avatar
              </span>
            </div>
            <h3 style="font-size:1.2rem; font-weight:800; margin:0; color:#ffffff;">
              ${title}
            </h3>
            <p style="color:#94a3b8; font-size:11.5px; margin:3px 0 0; line-height:1.4;">
              ${subtitle}
            </p>
          </div>
          <button id="vn-crop-close-btn" style="background:rgba(255,255,255,0.08); border:none; color:#ffffff; width:32px; height:32px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;" title="Cancel">
            ✕
          </button>
        </div>

        <!-- Crop Viewport Container -->
        <div id="vn-crop-viewport" style="position:relative; width:${CROP_SIZE}px; height:${CROP_SIZE}px; margin:0 auto 14px; border-radius:50%; overflow:hidden; border:2.5px solid #00d2ff; cursor:grab; user-select:none; touch-action:none; background:#000; box-shadow:0 0 25px rgba(0,210,255,0.45);">
          <canvas id="vn-crop-canvas" width="${CROP_SIZE}" height="${CROP_SIZE}" style="display:block; width:100%; height:100%;"></canvas>

          <!-- Rule-of-thirds grid -->
          <div id="vn-crop-grid" style="position:absolute; inset:0; pointer-events:none; border-radius:inherit;">
            <div class="vn-crop-grid-line" style="top:33.33%; left:0; right:0; height:1px;"></div>
            <div class="vn-crop-grid-line" style="top:66.66%; left:0; right:0; height:1px;"></div>
            <div class="vn-crop-grid-line" style="left:33.33%; top:0; bottom:0; width:1px;"></div>
            <div class="vn-crop-grid-line" style="left:66.66%; top:0; bottom:0; width:1px;"></div>
          </div>

          <!-- Floating Hint -->
          <div style="position:absolute; bottom:10px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.7); padding:3px 10px; border-radius:12px; font-size:11px; color:#cbd5e1; pointer-events:none; white-space:nowrap; border:1px solid rgba(255,255,255,0.15);">
            ✥ Drag image to adjust
          </div>
        </div>

        <!-- Live Preview & Shape Bar -->
        <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(15,23,42,0.7); border:1px solid rgba(255,255,255,0.08); padding:8px 12px; border-radius:12px; margin-bottom:14px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <canvas id="vn-crop-preview-canvas" width="40" height="40" style="width:40px; height:40px; border-radius:50%; border:2px solid #00d2ff; background:#181820; object-fit:cover;"></canvas>
            <div>
              <span style="font-size:11px; color:#94a3b8; display:block;">Preview</span>
              <strong style="font-size:12px; color:#fff;" id="vn-preview-label">Circular Avatar</strong>
            </div>
          </div>

          <div style="display:flex; gap:6px;">
            <button type="button" class="vn-crop-btn-shape active" id="vn-btn-shape-circle">Circle</button>
            <button type="button" class="vn-crop-btn-shape" id="vn-btn-shape-square">Square</button>
          </div>
        </div>

        <!-- Zoom & Rotate Controls -->
        <div style="margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
            <button type="button" id="vn-crop-zoom-out" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#cbd5e1; width:28px; height:28px; border-radius:8px; cursor:pointer; font-size:15px; display:flex; align-items:center; justify-content:center;">-</button>
            <input type="range" min="1" max="3" step="0.02" value="1" id="vn-crop-slider" class="vn-crop-zoom-slider" />
            <button type="button" id="vn-crop-zoom-in" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#cbd5e1; width:28px; height:28px; border-radius:8px; cursor:pointer; font-size:15px; display:flex; align-items:center; justify-content:center;">+</button>
            <span id="vn-crop-zoom-val" style="font-size:11.5px; color:#94a3b8; min-width:32px; text-align:right; font-weight:700;">1.0x</span>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; gap:8px;">
              <button type="button" id="vn-crop-rotate-btn" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#ffffff; padding:5px 10px; border-radius:8px; font-size:11.5px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:5px;">
                ↻ Rotate 90°
              </button>
              <button type="button" id="vn-crop-reset-btn" style="background:transparent; border:1px solid rgba(255,255,255,0.08); color:#94a3b8; padding:5px 10px; border-radius:8px; font-size:11.5px; cursor:pointer;">
                Reset
              </button>
            </div>
            <span style="font-size:10.5px; color:#64748b;">HD 512×512 Export</span>
          </div>
        </div>
      </div>

      <!-- STICKY ACTION FOOTER: Submit button is ALWAYS visible while cropping -->
      <div class="vn-crop-sticky-footer">
        <button type="button" id="vn-crop-cancel-btn" style="background:rgba(255,255,255,0.08); border:none; color:#ffffff; padding:10px 18px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer;">
          Cancel
        </button>
        <button type="button" id="vn-crop-apply-btn" class="vn-crop-submit-btn">
          ✓ Submit Cropped Photo
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Grab elements
  const viewport = modal.querySelector('#vn-crop-viewport');
  const canvas = modal.querySelector('#vn-crop-canvas');
  const previewCanvas = modal.querySelector('#vn-crop-preview-canvas');
  const slider = modal.querySelector('#vn-crop-slider');
  const zoomVal = modal.querySelector('#vn-crop-zoom-val');
  const zoomInBtn = modal.querySelector('#vn-crop-zoom-in');
  const zoomOutBtn = modal.querySelector('#vn-crop-zoom-out');
  const rotateBtn = modal.querySelector('#vn-crop-rotate-btn');
  const resetBtn = modal.querySelector('#vn-crop-reset-btn');
  const closeBtn = modal.querySelector('#vn-crop-close-btn');
  const cancelBtn = modal.querySelector('#vn-crop-cancel-btn');
  const applyBtn = modal.querySelector('#vn-crop-apply-btn');
  const circleBtn = modal.querySelector('#vn-btn-shape-circle');
  const squareBtn = modal.querySelector('#vn-btn-shape-square');
  const previewLabel = modal.querySelector('#vn-preview-label');
  const innerCard = modal.querySelector('#vn-crop-card-inner');

  // Prevent clicks inside card from closing
  innerCard.addEventListener('click', (e) => e.stopPropagation());

  // Load image
  const img = new Image();
  img.crossOrigin = 'anonymous';

  const getBaseScale = () => {
    if (!img.naturalWidth || !img.naturalHeight) return 1;
    const isRot = rotation % 180 !== 0;
    const w = isRot ? img.naturalHeight : img.naturalWidth;
    const h = isRot ? img.naturalWidth : img.naturalHeight;
    return Math.max(CROP_SIZE / w, CROP_SIZE / h);
  };

  const redraw = () => {
    if (!img.complete || !img.naturalWidth) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE);

    const baseScale = getBaseScale();
    const currentScale = baseScale * zoom;

    ctx.save();
    ctx.translate(CROP_SIZE / 2 + panX, CROP_SIZE / 2 + panY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(
      img,
      -(img.naturalWidth * currentScale) / 2,
      -(img.naturalHeight * currentScale) / 2,
      img.naturalWidth * currentScale,
      img.naturalHeight * currentScale
    );
    ctx.restore();

    // Update mini preview
    const pCtx = previewCanvas.getContext('2d');
    pCtx.clearRect(0, 0, 40, 40);
    pCtx.drawImage(canvas, 0, 0, 40, 40);
  };

  img.onload = () => {
    redraw();
  };
  img.src = imageSrc;

  // Drag handling
  const onPointerDown = (clientX, clientY) => {
    isDragging = true;
    dragStartX = clientX - panX;
    dragStartY = clientY - panY;
    viewport.style.cursor = 'grabbing';
  };

  const onPointerMove = (clientX, clientY) => {
    if (!isDragging) return;
    const newX = clientX - dragStartX;
    const newY = clientY - dragStartY;
    const maxPan = CROP_SIZE * 0.85 * zoom;
    panX = Math.max(-maxPan, Math.min(maxPan, newX));
    panY = Math.max(-maxPan, Math.min(maxPan, newY));
    redraw();
  };

  const onPointerUp = () => {
    isDragging = false;
    viewport.style.cursor = 'grab';
  };

  // Mouse events
  viewport.addEventListener('mousedown', (e) => {
    e.preventDefault();
    onPointerDown(e.clientX, e.clientY);
  });
  window.addEventListener('mousemove', (e) => {
    onPointerMove(e.clientX, e.clientY);
  });
  window.addEventListener('mouseup', onPointerUp);

  // Touch events
  viewport.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });
  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      e.preventDefault();
      onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });
  window.addEventListener('touchend', onPointerUp);

  // Wheel zoom
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    zoom = Math.max(1, Math.min(3, +(zoom + delta).toFixed(2)));
    slider.value = zoom;
    zoomVal.textContent = zoom.toFixed(1) + 'x';
    redraw();
  }, { passive: false });

  // Slider change
  slider.addEventListener('input', (e) => {
    zoom = parseFloat(e.target.value);
    zoomVal.textContent = zoom.toFixed(1) + 'x';
    redraw();
  });

  // Zoom in / out buttons
  zoomInBtn.addEventListener('click', () => {
    zoom = Math.min(3, +(zoom + 0.15).toFixed(2));
    slider.value = zoom;
    zoomVal.textContent = zoom.toFixed(1) + 'x';
    redraw();
  });
  zoomOutBtn.addEventListener('click', () => {
    zoom = Math.max(1, +(zoom - 0.15).toFixed(2));
    slider.value = zoom;
    zoomVal.textContent = zoom.toFixed(1) + 'x';
    redraw();
  });

  // Rotate button
  rotateBtn.addEventListener('click', () => {
    rotation = (rotation + 90) % 360;
    redraw();
  });

  // Reset button
  resetBtn.addEventListener('click', () => {
    zoom = 1;
    rotation = 0;
    panX = 0;
    panY = 0;
    slider.value = 1;
    zoomVal.textContent = '1.0x';
    redraw();
  });

  // Shape toggles
  circleBtn.addEventListener('click', () => {
    currentShape = 'circle';
    circleBtn.classList.add('active');
    squareBtn.classList.remove('active');
    viewport.style.borderRadius = '50%';
    previewCanvas.style.borderRadius = '50%';
    previewLabel.textContent = 'Circular Avatar';
  });
  squareBtn.addEventListener('click', () => {
    currentShape = 'square';
    squareBtn.classList.add('active');
    circleBtn.classList.remove('active');
    viewport.style.borderRadius = '18px';
    previewCanvas.style.borderRadius = '8px';
    previewLabel.textContent = 'Square Card';
  });

  // Cleanup helper
  const closeModal = () => {
    window.removeEventListener('mouseup', onPointerUp);
    window.removeEventListener('touchend', onPointerUp);
    modal.remove();
  };

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Keyboard Escape
  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      window.removeEventListener('keydown', onKeyDown);
    }
  };
  window.addEventListener('keydown', onKeyDown);

  // Apply button -> Produce high resolution 512x512 JPEG export
  applyBtn.addEventListener('click', () => {
    if (!img.complete || !img.naturalWidth) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportSize;
    exportCanvas.height = exportSize;
    const ctx = exportCanvas.getContext('2d');

    const exportRatio = exportSize / CROP_SIZE;
    const baseScale = getBaseScale();
    const currentScale = baseScale * zoom * exportRatio;

    ctx.save();
    ctx.translate(exportSize / 2 + panX * exportRatio, exportSize / 2 + panY * exportRatio);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(
      img,
      -(img.naturalWidth * currentScale) / 2,
      -(img.naturalHeight * currentScale) / 2,
      img.naturalWidth * currentScale,
      img.naturalHeight * currentScale
    );
    ctx.restore();

    const croppedDataUrl = exportCanvas.toDataURL('image/jpeg', 0.93);
    closeModal();

    if (typeof onComplete === 'function') {
      onComplete(croppedDataUrl);
    }
  });
}

// Attach globally for universal instant access
if (typeof window !== 'undefined') {
  window.__vnOpenImageCropper = openImageCropper;
}
