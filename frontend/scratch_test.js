const fs = require('fs');

// Dummy test to check if we can write the algorithm
function calculateBrightnessAndBlur(rgbaData, width, height) {
    let totalLuminance = 0;
    const grayscale = new Float32Array(width * height);

    for (let i = 0; i < width * height; i++) {
        const r = rgbaData[i * 4];
        const g = rgbaData[i * 4 + 1];
        const b = rgbaData[i * 4 + 2];
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        grayscale[i] = luminance;
        totalLuminance += luminance;
    }

    const brightness = totalLuminance / (width * height);

    // Laplacian filter:
    // 0  1  0
    // 1 -4  1
    // 0  1  0
    let laplacianSum = 0;
    let laplacianSqSum = 0;
    let count = 0;

    const laplacianValues = new Float32Array((width - 2) * (height - 2));

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            const top = (y - 1) * width + x;
            const bottom = (y + 1) * width + x;
            const left = y * width + (x - 1);
            const right = y * width + (x + 1);

            const value = 
                grayscale[top] +
                grayscale[bottom] +
                grayscale[left] +
                grayscale[right] -
                4 * grayscale[idx];

            laplacianValues[count] = value;
            laplacianSum += value;
            count++;
        }
    }

    const mean = laplacianSum / count;
    let variance = 0;
    for (let i = 0; i < count; i++) {
        const diff = laplacianValues[i] - mean;
        variance += diff * diff;
    }
    variance = variance / count;

    return { brightness, blur: variance };
}

console.log("Algorithm ready");
