// Tesseract.js configuration for CORS-free operation
// This file configures Tesseract to use local workers and avoid external requests

window.TesseractConfig = {
  workerPath: '/tesseract/worker.min.js',
  corePath: '/tesseract/tesseract-core.wasm.js',
  langPath: '/tesseract/lang-data',
  // Disable external CDN requests
  cachePath: '/tesseract/cache',
  // Use local resources only
  useLocalWorker: true,
  useLocalCore: true,
  useLocalLang: true
};
