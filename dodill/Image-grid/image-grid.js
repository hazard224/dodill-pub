// Global variables
let canvas, ctx;
let originalImage = null;
let currentImage = null;

// DOM Elements
const imageUpload = document.getElementById('imageUpload');
const canvasWidth = document.getElementById('canvasWidth');
const canvasHeight = document.getElementById('canvasHeight');
const dpi = document.getElementById('dpi');
const imageWidth = document.getElementById('imageWidth');
const imageHeight = document.getElementById('imageHeight');
const imageX = document.getElementById('imageX');
const imageY = document.getElementById('imageY');
const gridColumns = document.getElementById('gridColumns');
const gridRows = document.getElementById('gridRows');
const gridColor = document.getElementById('gridColor');
const lineWidth = document.getElementById('lineWidth');
const maintainAspect = document.getElementById('maintainAspect');
const fitToCanvas = document.getElementById('fitToCanvas');
const applyBtn = document.getElementById('applyBtn');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const imageInfo = document.getElementById('imageInfo');

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    // Update color preview
    const colorPreview = document.getElementById('colorPreview');
    const updateColorPreview = () => {
        colorPreview.style.backgroundColor = gridColor.value;
    };
    updateColorPreview();
    gridColor.addEventListener('change', updateColorPreview);
    
    // Event listeners
    imageUpload.addEventListener('change', handleImageUpload);
    applyBtn.addEventListener('click', applyChanges);
    saveBtn.addEventListener('click', saveImage);
    resetBtn.addEventListener('click', resetImage);
    
    // Maintain aspect ratio handler
    maintainAspect.addEventListener('change', () => {
        if (maintainAspect.checked && originalImage) {
            updateAspectRatio();
        }
    });
    
    imageWidth.addEventListener('input', () => {
        if (fitToCanvas.checked) return;
        if (maintainAspect.checked && originalImage) {
            const ratio = originalImage.height / originalImage.width;
            imageHeight.value = Math.round(imageWidth.value * ratio);
        }
    });
    
    imageHeight.addEventListener('input', () => {
        if (fitToCanvas.checked) return;
        if (maintainAspect.checked && originalImage) {
            const ratio = originalImage.width / originalImage.height;
            imageWidth.value = Math.round(imageHeight.value * ratio);
        }
    });
    
    fitToCanvas.addEventListener('change', () => {
        toggleImageControls();
        if (fitToCanvas.checked && originalImage) {
            fitImageToCanvas();
        }
    });
    
    canvasWidth.addEventListener('input', () => {
        if (fitToCanvas.checked && originalImage) {
            fitImageToCanvas();
        }
    });
    
    canvasHeight.addEventListener('input', () => {
        if (fitToCanvas.checked && originalImage) {
            fitImageToCanvas();
        }
    });
    
    dpi.addEventListener('input', () => {
        if (fitToCanvas.checked && originalImage) {
            fitImageToCanvas();
        }
    });
});

// Handle image upload
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Display file name
    const fileName = document.getElementById('fileName');
    fileName.textContent = file.name;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            currentImage = img;
            
            // Set initial dimensions
            imageWidth.value = img.width;
            imageHeight.value = img.height;
            
            // Enable buttons
            applyBtn.disabled = false;
            saveBtn.disabled = false;
            resetBtn.disabled = false;
            
            // Display info
            imageInfo.textContent = `Original size: ${img.width} x ${img.height}px`;
            
            // Draw initial image
            drawImage();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// Update aspect ratio
function updateAspectRatio() {
    if (!originalImage) return;
    const ratio = originalImage.height / originalImage.width;
    imageHeight.value = Math.round(imageWidth.value * ratio);
}

// Toggle image controls based on fit to canvas
function toggleImageControls() {
    const shouldDisable = fitToCanvas.checked;
    imageWidth.disabled = shouldDisable;
    imageHeight.disabled = shouldDisable;
    imageX.disabled = shouldDisable;
    imageY.disabled = shouldDisable;
}

// Fit image to canvas
function fitImageToCanvas() {
    if (!originalImage) return;
    
    const dpiValue = parseInt(dpi.value);
    const cWidth = Math.round(parseFloat(canvasWidth.value) * dpiValue);
    const cHeight = Math.round(parseFloat(canvasHeight.value) * dpiValue);
    
    if (maintainAspect.checked) {
        // Calculate which dimension to fit - fill canvas completely
        const imageRatio = originalImage.width / originalImage.height;
        const canvasRatio = cWidth / cHeight;
        
        if (imageRatio > canvasRatio) {
            // Image is wider - fit to height (so width overflows)
            imageHeight.value = cHeight;
            imageWidth.value = Math.round(cHeight * imageRatio);
        } else {
            // Image is taller - fit to width (so height overflows)
            imageWidth.value = cWidth;
            imageHeight.value = Math.round(cWidth / imageRatio);
        }
        
        // Center the image
        imageX.value = Math.round((cWidth - parseInt(imageWidth.value)) / 2);
        imageY.value = Math.round((cHeight - parseInt(imageHeight.value)) / 2);
    } else {
        // Stretch to fill canvas
        imageWidth.value = cWidth;
        imageHeight.value = cHeight;
        imageX.value = 0;
        imageY.value = 0;
    }
}

// Draw image on canvas
function drawImage() {
    if (!currentImage) return;
    
    const dpiValue = parseInt(dpi.value);
    const cWidth = Math.round(parseFloat(canvasWidth.value) * dpiValue);
    const cHeight = Math.round(parseFloat(canvasHeight.value) * dpiValue);
    const imgWidth = parseInt(imageWidth.value);
    const imgHeight = parseInt(imageHeight.value);
    const x = parseInt(imageX.value);
    const y = parseInt(imageY.value);
    
    // Set canvas size
    canvas.width = cWidth;
    canvas.height = cHeight;
    
    // Fill background
    ctx.fillStyle = canvasBgColor.value;
    ctx.fillRect(0, 0, cWidth, cHeight);
    
    // Draw image at position
    ctx.drawImage(currentImage, x, y, imgWidth, imgHeight);
}

// Apply changes (resize + grid)
function applyChanges() {
    if (!originalImage) return;
    
    // Apply fit to canvas if checked
    if (fitToCanvas.checked) {
        fitImageToCanvas();
    }
    
    const dpiValue = parseInt(dpi.value);
    const cWidth = Math.round(parseFloat(canvasWidth.value) * dpiValue);
    const cHeight = Math.round(parseFloat(canvasHeight.value) * dpiValue);
    const imgWidth = parseInt(imageWidth.value);
    const imgHeight = parseInt(imageHeight.value);
    const x = parseInt(imageX.value);
    const y = parseInt(imageY.value);
    
    // Set canvas size
    canvas.width = cWidth;
    canvas.height = cHeight;
    
    // Draw resized image at position
    ctx.drawImage(originalImage, x, y, imgWidth, imgHeight);
    
    // Draw grid
    drawGrid();
    
    // Update info
    imageInfo.textContent = `Canvas: ${canvasWidth.value}" x ${canvasHeight.value}" (${cWidth} x ${cHeight}px at ${dpi.value} DPI) | Image: ${imgWidth} x ${imgHeight}px at (${x}, ${y}) | Grid: ${gridColumns.value} x ${gridRows.value}`;
}

// Draw grid lines
function drawGrid() {
    const width = canvas.width;
    const height = canvas.height;
    const cols = parseInt(gridColumns.value);
    const rows = parseInt(gridRows.value);
    const color = gridColor.value;
    const lWidth = parseInt(lineWidth.value);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lWidth;
    
    // Draw vertical lines
    const colWidth = width / cols;
    for (let i = 1; i < cols; i++) {
        const x = i * colWidth;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // Draw horizontal lines
    const rowHeight = height / rows;
    for (let i = 1; i < rows; i++) {
        const y = i * rowHeight;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

// Save image
function saveImage() {
    if (!canvas) return;
    
    // Create download link
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `grid-image-${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    });
}

// Reset to original image
function resetImage() {
    if (!originalImage) return;
    
    currentImage = originalImage;
    const dpiValue = parseInt(dpi.value);
    imageWidth.value = originalImage.width;
    imageHeight.value = originalImage.height;
    imageX.value = 0;
    imageY.value = 0;
    canvasWidth.value = (originalImage.width / dpiValue).toFixed(2);
    canvasHeight.value = (originalImage.height / dpiValue).toFixed(2);
    
    drawImage();
    
    imageInfo.textContent = `Original size: ${originalImage.width} x ${originalImage.height}px`;
}
