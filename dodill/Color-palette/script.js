// Generate random color in HSL
function generateRandomColor() {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 40) + 60; // 60-100%
    const l = Math.floor(Math.random() * 40) + 30; // 30-70%
    return { h, s, l };
}

// Convert HSL to HEX
function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

// Convert HSL to RGB
function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color);
    };
    return `rgb(${f(0)}, ${f(8)}, ${f(4)})`;
}

// Convert RGB to HSL
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

// Extract colors from image using k-means clustering
function extractColorsFromImage(imageData, numColors = 5) {
    const pixels = [];
    
    // Sample pixels (every 10th pixel for performance)
    for (let i = 0; i < imageData.data.length; i += 40) {
        pixels.push([
            imageData.data[i],
            imageData.data[i + 1],
            imageData.data[i + 2]
        ]);
    }

    // Simple k-means clustering
    let centroids = [];
    for (let i = 0; i < numColors; i++) {
        centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);
    }

    // Iterate to find centroids
    for (let iter = 0; iter < 10; iter++) {
        const clusters = Array(numColors).fill().map(() => []);
        
        pixels.forEach(pixel => {
            let minDist = Infinity;
            let cluster = 0;
            
            centroids.forEach((centroid, i) => {
                const dist = Math.sqrt(
                    Math.pow(pixel[0] - centroid[0], 2) +
                    Math.pow(pixel[1] - centroid[1], 2) +
                    Math.pow(pixel[2] - centroid[2], 2)
                );
                if (dist < minDist) {
                    minDist = dist;
                    cluster = i;
                }
            });
            
            clusters[cluster].push(pixel);
        });

        centroids = clusters.map(cluster => {
            if (cluster.length === 0) return centroids[0];
            const sum = cluster.reduce((acc, pixel) => [
                acc[0] + pixel[0],
                acc[1] + pixel[1],
                acc[2] + pixel[2]
            ], [0, 0, 0]);
            return [
                Math.round(sum[0] / cluster.length),
                Math.round(sum[1] / cluster.length),
                Math.round(sum[2] / cluster.length)
            ];
        });
    }

    return centroids.map(rgb => rgbToHsl(rgb[0], rgb[1], rgb[2]));
}

// Create color swatch element
function createColorSwatch(color) {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = hslToHex(color.h, color.s, color.l);
    swatch.dataset.hsl = JSON.stringify(color);
    swatch.dataset.locked = 'false';

    const hex = hslToHex(color.h, color.s, color.l);
    const rgb = hslToRgb(color.h, color.s, color.l);

    swatch.innerHTML = `
        <button class="lock-btn">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <rect x="4" y="7" width="8" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/>
                <path d="M6 7V5a2 2 0 114 0v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
        </button>
        <button class="remove-btn" onclick="removeColor(event)">×</button>
        <button class="edit-color-btn" title="Edit color">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
        </button>
        <input type="text" class="color-input" value="${hex}" data-coloris>
        <div class="color-info">
            <div class="color-hex">${hex.toUpperCase()}</div>
            <div class="color-rgb">${rgb}</div>
        </div>
    `;

    // Lock button click handler
    const lockBtn = swatch.querySelector('.lock-btn');
    lockBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        swatch.dataset.locked = swatch.dataset.locked === 'true' ? 'false' : 'true';
        swatch.classList.toggle('locked');
        
        // Update icon
        if (swatch.dataset.locked === 'true') {
            lockBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="4" y="7" width="8" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M6 7V5a2 2 0 114 0v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            `;
        } else {
            lockBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="4" y="7" width="8" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M10 7V5a2 2 0 00-4 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            `;
        }
    });

    // Edit color button - pick from image or open color picker
    const editBtn = swatch.querySelector('.edit-color-btn');
    const colorInput = swatch.querySelector('.color-input');
    
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        if (currentImageData) {
            // If image exists, use eyedropper
            const imagePreview = document.getElementById('imagePreview');
            if (!imagePreview.classList.contains('active')) {
                colorInput.click();
                return;
            }
            
            // Add picking mode
            imagePreview.classList.add('picking-mode');
            const img = document.getElementById('uploadedImage');
            
            // Add overlay message
            const overlay = document.createElement('div');
            overlay.className = 'picker-overlay';
            overlay.innerHTML = '<div class="picker-message">Click on the image to pick a color<br><small>Click outside to cancel</small></div>';
            imagePreview.appendChild(overlay);
            
            // Create color preview cursor
            const colorPreview = document.createElement('div');
            colorPreview.className = 'color-preview-cursor';
            imagePreview.appendChild(colorPreview);
            
            // Track mouse movement to update color preview
            const updatePreview = (event) => {
                const rect = img.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                
                // Position the preview cursor
                colorPreview.style.left = event.clientX + 'px';
                colorPreview.style.top = event.clientY + 'px';
                
                // Get color from canvas
                const canvas = document.getElementById('imageCanvas');
                const scaleX = canvas.width / img.width;
                const scaleY = canvas.height / img.height;
                const canvasX = Math.floor(x * scaleX);
                const canvasY = Math.floor(y * scaleY);
                
                if (canvasX >= 0 && canvasX < canvas.width && canvasY >= 0 && canvasY < canvas.height) {
                    const index = (canvasY * canvas.width + canvasX) * 4;
                    const r = currentImageData.data[index];
                    const g = currentImageData.data[index + 1];
                    const b = currentImageData.data[index + 2];
                    colorPreview.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
                }
            };
            
            img.addEventListener('mousemove', updatePreview);
            
            // Handle color picking on click
            const pickColor = (event) => {
                const rect = img.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                
                // Get color from canvas
                const canvas = document.getElementById('imageCanvas');
                const scaleX = canvas.width / img.width;
                const scaleY = canvas.height / img.height;
                const canvasX = Math.floor(x * scaleX);
                const canvasY = Math.floor(y * scaleY);
                
                if (canvasX >= 0 && canvasX < canvas.width && canvasY >= 0 && canvasY < canvas.height) {
                    const index = (canvasY * canvas.width + canvasX) * 4;
                    const r = currentImageData.data[index];
                    const g = currentImageData.data[index + 1];
                    const b = currentImageData.data[index + 2];
                    
                    const hsl = rgbToHsl(r, g, b);
                    const hexColor = hslToHex(hsl.h, hsl.s, hsl.l);
                    
                    // Update swatch
                    swatch.style.backgroundColor = hexColor;
                    swatch.dataset.hsl = JSON.stringify(hsl);
                    colorInput.value = hexColor;
                    
                    // Update displayed values
                    const hexDisplay = swatch.querySelector('.color-hex');
                    const rgbDisplay = swatch.querySelector('.color-rgb');
                    hexDisplay.textContent = hexColor.toUpperCase();
                    rgbDisplay.textContent = `rgb(${r}, ${g}, ${b})`;
                    
                    // Clean up
                    imagePreview.classList.remove('picking-mode');
                    overlay.remove();
                    colorPreview.remove();
                    img.removeEventListener('click', pickColor);
                    img.removeEventListener('mousemove', updatePreview);
                    document.removeEventListener('click', cancelPick);
                }
            };
            
            img.addEventListener('click', pickColor, { once: true });
            
            // Cancel on clicking outside
            const cancelPick = (e) => {
                if (e.target !== img && !img.contains(e.target)) {
                    imagePreview.classList.remove('picking-mode');
                    overlay.remove();
                    colorPreview.remove();
                    img.removeEventListener('click', pickColor);
                    img.removeEventListener('mousemove', updatePreview);
                    document.removeEventListener('click', cancelPick);
                }
            };
            
            setTimeout(() => {
                document.addEventListener('click', cancelPick, { once: true });
            }, 100);
        } else {
            // No image, open color picker
            colorInput.click();
        }
    });
    
    // Handle color input changes
    colorInput.addEventListener('input', (e) => {
        const hexColor = e.target.value;
        
        // Convert hex to RGB
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        
        if (isNaN(r) || isNaN(g) || isNaN(b)) return;
        
        // Convert RGB to HSL
        const hsl = rgbToHsl(r, g, b);
        
        // Update swatch
        swatch.style.backgroundColor = hexColor;
        swatch.dataset.hsl = JSON.stringify(hsl);
        
        // Update displayed values
        const hexDisplay = swatch.querySelector('.color-hex');
        const rgbDisplay = swatch.querySelector('.color-rgb');
        hexDisplay.textContent = hexColor.toUpperCase();
        rgbDisplay.textContent = `rgb(${r}, ${g}, ${b})`;
    });

    return swatch;
}

// Create add color button
function createAddColorSwatch() {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch add-color';
    swatch.innerHTML = '<div class="add-color-icon">+</div>';
    
    swatch.addEventListener('click', () => {
        const paletteContainer = document.getElementById('palette');
        const currentColors = paletteContainer.querySelectorAll('.color-swatch:not(.add-color)');
        
        if (currentColors.length < 10) {
            let color;
            // If image is loaded, extract more colors from it
            if (currentImageData) {
                const numColors = currentColors.length + 1;
                const colors = extractColorsFromImage(currentImageData, numColors);
                // Get the newest color (last one extracted)
                color = colors[colors.length - 1];
            } else {
                // Otherwise generate random color
                color = generateRandomColor();
            }
            
            const newSwatch = createColorSwatch(color);
            paletteContainer.insertBefore(newSwatch, swatch);
            
            // Show remove buttons if we now have more than 1 color
            if (currentColors.length === 1) {
                currentColors.forEach(cs => {
                    const removeBtn = cs.querySelector('.remove-btn');
                    if (removeBtn) removeBtn.style.display = 'flex';
                });
            }
            
            // Hide add button if we've reached 10 colors
            if (currentColors.length + 1 >= 10) {
                swatch.style.display = 'none';
            }
        }
    });
    
    return swatch;
}

// Remove color from palette
function removeColor(event) {
    event.stopPropagation();
    const swatch = event.target.closest('.color-swatch');
    const paletteContainer = document.getElementById('palette');
    const currentColors = paletteContainer.querySelectorAll('.color-swatch:not(.add-color)');
    
    if (currentColors.length > 1) {
        swatch.remove();
        
        // Show add button if we now have less than 10 colors
        const addButton = paletteContainer.querySelector('.add-color');
        if (addButton && currentColors.length - 1 < 10) {
            addButton.style.display = 'flex';
        }
        
        // Hide all remove buttons if only 1 color left
        if (currentColors.length - 1 === 1) {
            const remainingSwatch = paletteContainer.querySelector('.color-swatch:not(.add-color)');
            if (remainingSwatch) {
                const removeBtn = remainingSwatch.querySelector('.remove-btn');
                if (removeBtn) removeBtn.style.display = 'none';
            }
        }
    }
}

// Generate palette
function generatePalette(count = 5) {
    const paletteContainer = document.getElementById('palette');
    const existingSwatches = Array.from(paletteContainer.children);

    // Clear unlocked swatches (but not the add button)
    existingSwatches.forEach(swatch => {
        if (!swatch.classList.contains('add-color') && swatch.dataset.locked === 'false') {
            swatch.remove();
        }
    });

    const lockedCount = paletteContainer.querySelectorAll('.color-swatch:not(.add-color)').length;
    const newCount = Math.min(count - lockedCount, 10 - lockedCount);
    
    // Remove add button temporarily
    const addButton = paletteContainer.querySelector('.add-color');
    if (addButton) addButton.remove();

    for (let i = 0; i < newCount; i++) {
        const color = generateRandomColor();
        const swatch = createColorSwatch(color);
        paletteContainer.appendChild(swatch);
    }
    
    // Re-add the add button at the end
    const newAddButton = createAddColorSwatch();
    const totalColors = paletteContainer.querySelectorAll('.color-swatch:not(.add-color)').length;
    if (totalColors >= 10) {
        newAddButton.style.display = 'none';
    }
    paletteContainer.appendChild(newAddButton);
    
    // Hide remove buttons if only 1 color exists
    if (totalColors === 1) {
        const singleSwatch = paletteContainer.querySelector('.color-swatch:not(.add-color)');
        if (singleSwatch) {
            const removeBtn = singleSwatch.querySelector('.remove-btn');
            if (removeBtn) removeBtn.style.display = 'none';
        }
    }
}

// Copy colors to clipboard
function copyToClipboard(format) {
    const swatches = document.querySelectorAll('.color-swatch:not(.add-color)');
    const colors = Array.from(swatches).map(swatch => {
        const color = JSON.parse(swatch.dataset.hsl);
        switch(format) {
            case 'hex':
                return hslToHex(color.h, color.s, color.l);
            case 'rgb':
                return hslToRgb(color.h, color.s, color.l);
            case 'hsl':
                return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
        }
    });

    navigator.clipboard.writeText(colors.join('\n')).then(() => {
        alert(`${format.toUpperCase()} colors copied to clipboard!`);
    });
}

// Event listeners
document.getElementById('generateBtn').addEventListener('click', () => generatePalette(5));

document.getElementById('lockAllBtn').addEventListener('click', () => {
    document.querySelectorAll('.color-swatch:not(.add-color)').forEach(swatch => {
        swatch.dataset.locked = 'true';
        swatch.classList.add('locked');
    });
});

document.getElementById('unlockAllBtn').addEventListener('click', () => {
    document.querySelectorAll('.color-swatch:not(.add-color)').forEach(swatch => {
        swatch.dataset.locked = 'false';
        swatch.classList.remove('locked');
    });
});

document.getElementById('copyHex').addEventListener('click', () => copyToClipboard('hex'));
document.getElementById('copyRgb').addEventListener('click', () => copyToClipboard('rgb'));
document.getElementById('copyHsl').addEventListener('click', () => copyToClipboard('hsl'));

// Image upload handler
let currentImageData = null;

document.getElementById('imageUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            // Show preview
            document.getElementById('uploadedImage').src = event.target.result;
            document.getElementById('imagePreview').classList.add('active');
            document.getElementById('refreshImageBtn').style.display = 'inline-block';
            document.getElementById('clearImageBtn').style.display = 'inline-block';
            document.getElementById('clearImageBtn').style.display = 'inline-block';
            
            const canvas = document.getElementById('imageCanvas');
            const ctx = canvas.getContext('2d');
            
            // Resize image for processing
            const maxSize = 400;
            const scale = Math.min(maxSize / img.width, maxSize / img.height);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Extract colors
            const colors = extractColorsFromImage(currentImageData, 5);
            
            // Clear palette and add new colors
            const paletteContainer = document.getElementById('palette');
            paletteContainer.innerHTML = '';
            
            colors.forEach(color => {
                const swatch = createColorSwatch(color);
                paletteContainer.appendChild(swatch);
            });
            
            // Add the add-color button
            paletteContainer.appendChild(createAddColorSwatch());
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// Refresh palette from stored image
document.getElementById('refreshImageBtn').addEventListener('click', () => {
    if (currentImageData) {
        const colors = extractColorsFromImage(currentImageData, 5);
        const paletteContainer = document.getElementById('palette');
        paletteContainer.innerHTML = '';
        
        colors.forEach(color => {
            const swatch = createColorSwatch(color);
            paletteContainer.appendChild(swatch);
        });
        
        // Add the add-color button
        paletteContainer.appendChild(createAddColorSwatch());
    }
});

// Clear image and return to random palette mode
document.getElementById('clearImageBtn').addEventListener('click', () => {
    // Clear image data
    currentImageData = null;
    
    // Hide image preview
    document.getElementById('imagePreview').classList.remove('active');
    document.getElementById('uploadedImage').src = '';
    
    // Hide image-related buttons
    document.getElementById('refreshImageBtn').style.display = 'none';
    document.getElementById('clearImageBtn').style.display = 'none';
    
    // Clear file input
    document.getElementById('imageUpload').value = '';
    
    // Generate random palette
    generatePalette();
});

// Clear image and return to random palette mode
document.getElementById('clearImageBtn').addEventListener('click', () => {
    // Clear image data
    currentImageData = null;
    
    // Hide image preview
    document.getElementById('imagePreview').classList.remove('active');
    document.getElementById('uploadedImage').src = '';
    
    // Hide image-related buttons
    document.getElementById('refreshImageBtn').style.display = 'none';
    document.getElementById('clearImageBtn').style.display = 'none';
    
    // Clear file input
    document.getElementById('imageUpload').value = '';
    
    // Generate random palette
    generatePalette();
});

// Spacebar to generate
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        generatePalette(5);
    }
});

// Initial palette
generatePalette(5);

// Initialize Coloris
Coloris({
    theme: 'polaroid',
    themeMode: 'dark',
    alpha: false,
    format: 'hex',
    swatches: []
});
