'use strict';

import { averageHashFromUrl } from './fetchImage';

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Log `title` of current active web page
console.log("contentScript.js is running");

const pageTitle = document.head.getElementsByTagName('title')[0].innerHTML;
console.log(`Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`);

const hashes = await getAllHashes();
const observer = new IntersectionObserver(async (entries, observer) => {
  for (const entry of entries) {
    if (entry.intersectionRatio > 0) {
      console.log('Image will be displayed soon:', entry.target.src);
      let hash = await averageHashFromUrl(entry.target.src);
      Object.keys(hashes).forEach(key => {
        if (hammingDistance(hash, hashes[key]) <= 10) {
          console.log(`Image ${entry.target.src} is similar to ${key}`);
          entry.target.style.display = 'none';
        }
      });
      observer.unobserve(entry.target);
    }
  }
}, {
  root: null,
  rootMargin: '100px',
});

Array.from(document.getElementsByTagName('img')).forEach(img => observer.observe(img));

/*
// 3. Set up MutationObserver to detect new images
const mutationObserver = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {
      // Find all new <img> elements in the added nodes
      const newImages = [...mutation.addedNodes].filter(node => node.tagName === 'IMG'); // Check if it's an <img>

      // Observe the new images
      observeImages(newImages);
    }
  });
});

const imageContainer = document.querySelector('#image-container'); // Replace with your container
mutationObserver.observe(imageContainer, {
  childList: true, // Listen for added/removed nodes
  subtree: true,   // Monitor the entire subtree
});
*/

// Listen for message
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === 'ADD_IMAGE') {
    let imageUrl = request.payload.src;
    let storageKey = `imageHash_${imageUrl}`;

    console.log(`Hidding ${imageUrl}`);

    // Check if the hash is already stored
    let hash = await getHashFromStorage(storageKey);

    // If not, calculate and save it
    if (!hash) {
      console.log(`Calculating hash for ${imageUrl}`);
      hash = await averageHashFromUrl(imageUrl);
      await saveHashToStorage(storageKey, hash);
    } else {
      console.log(`Using stored hash for ${imageUrl}`);
    }
  }

  sendResponse({});
  return true;
});

// Helper function to save data to Chrome's local storage
function saveHashToStorage(key, value) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve();
    });
  });
}

// Helper function to retrieve data from Chrome's local storage
function getHashFromStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(result[key]);
    });
  });
}

function getAllHashes() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(null, (items) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      resolve(items);
    });
  });
}

function hammingDistance(hashA, hashB) {
  let distance = 0;
  for (let i = 0; i < hashA.length; i++) {
    if (hashA[i] !== hashB[i]) distance++;
  }
  return distance;
}
