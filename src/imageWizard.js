export async function averageHashFromUrl(imageUrl, retry = false) {
  try {
    // Step 1: Load the image from the URL
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Handle CORS for images from different origins
    img.src = imageUrl;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // Step 2: Draw the image on a canvas at a reduced size (8x8)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 8;
    canvas.height = 8;
    ctx.drawImage(img, 0, 0, 8, 8);

    // Step 3: Convert to grayscale and calculate the average brightness
    const imageData = ctx.getImageData(0, 0, 8, 8).data;
    const grayscaleValues = [];
    for (let i = 0; i < imageData.length; i += 4) {
      const [r, g, b] = [imageData[i], imageData[i + 1], imageData[i + 2]];
      const grayscale = Math.round(r * 0.3 + g * 0.59 + b * 0.11);
      grayscaleValues.push(grayscale);
    }
    const averageBrightness = grayscaleValues.reduce((sum, val) => sum + val, 0) / grayscaleValues.length;

    // Step 4: Create the hash by comparing each pixel's brightness to the average
    return grayscaleValues.map(value => (value > averageBrightness ? '1' : '0')).join('');
  } catch (error) {
    console.error(`Error processing image from ${imageUrl}:`, error);
    if (!retry) {
      // Retry with a proxy
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      return await averageHashFromUrl(proxyUrl + imageUrl, true);
    }
  }
}

export async function hammingDistance(hashA, hashB) {
  let distance = 0;
  for (let i = 0; i < hashA.length; i++) {
    if (hashA[i] !== hashB[i]) distance++;
  }
  return distance;
}
