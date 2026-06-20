document.addEventListener("DOMContentLoaded", () => {
  // Elements selection
  const textInput = document.getElementById("text-input");
  const generateBtn = document.getElementById("generate-btn");
  const downloadBtn = document.getElementById("download-btn");
  const qrDisplay = document.getElementById("qr-display");
  const qrPlaceholder = document.getElementById("qr-placeholder");
  
  // Customization elements
  const fgColorInput = document.getElementById("fg-color");
  const bgColorInput = document.getElementById("bg-color");
  const sizeSelect = document.getElementById("qr-size");
  const errorLevelSelect = document.getElementById("error-level");
  
  // Help/Status elements
  const inputFeedback = document.getElementById("input-feedback");

  let currentCanvas = null;

  // Initialize defaults
  textInput.value = "https://digitalheroesco.com";
  generateQRCode();

  // Event Listeners
  generateBtn.addEventListener("click", () => {
    generateQRCode();
  });

  downloadBtn.addEventListener("click", () => {
    downloadQRCode();
  });

  // Real-time responsive updates for colors and options once a code is visible
  fgColorInput.addEventListener("input", () => {
    if (textInput.value.trim()) generateQRCode();
  });
  bgColorInput.addEventListener("input", () => {
    if (textInput.value.trim()) generateQRCode();
  });
  sizeSelect.addEventListener("change", () => {
    if (textInput.value.trim()) generateQRCode();
  });
  errorLevelSelect.addEventListener("change", () => {
    if (textInput.value.trim()) generateQRCode();
  });

  // Clean empty validation trigger
  textInput.addEventListener("input", () => {
    if (textInput.value.trim()) {
      inputFeedback.classList.add("hidden");
    }
  });

  /**
   * Generates a QR Code on canvas and renders it in the display area
   */
  function generateQRCode() {
    const text = textInput.value.trim();
    
    // Validate Input
    if (!text) {
      inputFeedback.classList.remove("hidden");
      textInput.focus();
      // Add modern shaking effect to input wrapper
      const inputWrapper = textInput.parentElement;
      inputWrapper.classList.add("animate-shake");
      setTimeout(() => {
        inputWrapper.classList.remove("animate-shake");
      }, 500);
      return;
    }

    inputFeedback.classList.add("hidden");

    try {
      // Configuration
      const ecLevel = errorLevelSelect.value || "M";
      const qrSize = parseInt(sizeSelect.value, 10) || 512;
      const fgColor = fgColorInput.value || "#0f172a"; // default slate-900
      const bgColor = bgColorInput.value || "#ffffff"; // default white

      // 0 = auto type selection based on data amount
      const qr = qrcode(0, ecLevel);
      qr.addData(text);
      qr.make();

      const moduleCount = qr.getModuleCount();
      
      // Create Canvas to draw crisp pixelated elements
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Calculate the size of each block/cell inside the target boundaries
      const padding = 24; // clean margin around the code
      const drawableSize = qrSize - padding * 2;
      const cellSize = drawableSize / moduleCount;
      
      canvas.width = qrSize;
      canvas.height = qrSize;

      // Draw Background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, qrSize, qrSize);

      // Draw QR Code cells
      ctx.fillStyle = fgColor;
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (qr.isDark(r, c)) {
            // Draw square module with crisp borders
            const x = padding + c * cellSize;
            const y = padding + r * cellSize;
            // Prevent decimal rounding spacing artifacts by taking ceil/floor or adding tiny overlay
            ctx.fillRect(
              Math.floor(x), 
              Math.floor(y), 
              Math.ceil(cellSize), 
              Math.ceil(cellSize)
            );
          }
        }
      }

      // Render onto Document
      const imageURL = canvas.toDataURL("image/png");
      
      // Update the display area
      qrDisplay.innerHTML = "";
      const qrImg = document.createElement("img");
      qrImg.src = imageURL;
      qrImg.alt = "Generated QR Code";
      qrImg.className = "w-full aspect-square border border-slate-100 rounded-lg shadow-sm animate-fade-in";
      qrDisplay.appendChild(qrImg);

      // Save canvas state for immediate local downloading
      currentCanvas = canvas;

      // Swap view states
      qrPlaceholder.classList.add("hidden");
      qrDisplay.classList.remove("hidden");
      downloadBtn.removeAttribute("disabled");
      downloadBtn.classList.remove("opacity-40", "cursor-not-allowed");
      downloadBtn.classList.add("hover:-translate-y-0.5", "active:translate-y-0");

    } catch (error) {
      console.error("QR Code generation failed: ", error);
      qrDisplay.innerHTML = `<p class="text-sm text-red-500 font-medium">QR code generation failed. Try shorter text or URL.</p>`;
    }
  }

  /**
   * Triggers file download of the generated QR code image
   */
  function downloadQRCode() {
    if (!currentCanvas) return;

    try {
      const formatExt = "png";
      const dataURL = currentCanvas.toDataURL(`image/${formatExt}`);
      
      // Sanitize input content for a elegant descriptive filename
      let rawVal = textInput.value.trim();
      let cleanName = rawVal
        .toLowerCase()
        .replace(/https?:\/\//g, "")
        .replace(/[^a-z0-9]/g, "-")
        .substring(0, 24);

      if (!cleanName) cleanName = "qr-code";
      
      const filename = `${cleanName}-${Date.now()}.${formatExt}`;

      // Create a virtual anchor element
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = filename;
      
      // Append, trigger click, and cleanup
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Failed to download image: ", error);
    }
  }
});
