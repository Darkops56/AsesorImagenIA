import { decode } from 'jpeg-js';
import { Buffer } from 'buffer'; // Buffer comes globally in many RN environments or we need to import it if available, expo has it globally usually, but let's be safe.

// Convert RGB to Grayscale
const getGrayscale = (data: Uint8Array, width: number, height: number): Float32Array => {
  const grayscale = new Float32Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Luminance formula
    grayscale[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b;
  }
  return grayscale;
};

// Calculate Average Luminance (Brightness)
export const calculateBrightness = (grayscale: Float32Array): number => {
  let sum = 0;
  for (let i = 0; i < grayscale.length; i++) {
    sum += grayscale[i];
  }
  return sum / grayscale.length;
};

// Calculate Laplacian Variance (Blur)
export const calculateLaplacianVariance = (grayscale: Float32Array, width: number, height: number): number => {
  const laplacian = new Float32Array(width * height);
  let sum = 0;

  // Apply Laplacian kernel
  // [ 0,  1,  0 ]
  // [ 1, -4,  1 ]
  // [ 0,  1,  0 ]
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const val =
        grayscale[(y - 1) * width + x] + // Top
        grayscale[(y + 1) * width + x] + // Bottom
        grayscale[y * width + (x - 1)] + // Left
        grayscale[y * width + (x + 1)] - // Right
        4 * grayscale[idx];              // Center

      laplacian[idx] = val;
      sum += val;
    }
  }

  // Calculate Variance
  const mean = sum / (width * height);
  let varianceSum = 0;
  for (let i = 0; i < laplacian.length; i++) {
    const diff = laplacian[i] - mean;
    varianceSum += diff * diff;
  }

  return varianceSum / laplacian.length;
};

export const validateImageQuality = async (base64Data: string) => {
  try {
    const buffer = Buffer.from(base64Data, 'base64');
    const rawImageData = decode(buffer, { useTArray: true });
    
    const { width, height, data } = rawImageData;
    const grayscale = getGrayscale(data, width, height);

    const brightness = calculateBrightness(grayscale);
    const laplacianVariance = calculateLaplacianVariance(grayscale, width, height);

    return {
      brightness,
      laplacianVariance,
      isDark: brightness < 40, // Thresholds can be adjusted
      isOverexposed: brightness > 240,
      isBlurry: laplacianVariance < 50 // Thresholds can be adjusted
    };
  } catch (error) {
    console.error("Error validating image quality:", error);
    // If validation fails for some reason (e.g. decoding error), 
    // we return safe defaults so it doesn't block the user entirely, or throw.
    return {
      brightness: 128,
      laplacianVariance: 1000,
      isDark: false,
      isOverexposed: false,
      isBlurry: false
    };
  }
};
