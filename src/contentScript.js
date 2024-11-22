'use strict';

import { averageHashFromUrl, hammingDistance } from './imageWizard';
import { getAllHashes, getHashFromStorage, setHashToStorage, removeHashFromStorage, clearAll } from './localStore';

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
      for (const key of Object.keys(hashes)) {
        if (await hammingDistance(hash, hashes[key]) <= 10) {
          console.log(`Image ${entry.target.src} is similar to ${key}`);
          entry.target.style.filter = 'blur(8px)'
          //entry.target.style.display = 'none';
        }
      }
      observer.unobserve(entry.target);
    }
  }
}, {
  root: null,
  rootMargin: '150px',
});

Array.from(document.getElementsByTagName('img')).forEach(img => observer.observe(img));

// 3. Set up MutationObserver to detect new images
const mutationObserver = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {
      // Find all new <img> elements in the added nodes
      const newImages = [...mutation.addedNodes].filter(node => node.tagName === 'IMG'); // Check if it's an <img>

      // Observe the new images
      newImages.forEach(img => observer.observe(img));
    }
  });
});

mutationObserver.observe(document.body, {
  childList: true, // Listen for added/removed nodes
  subtree: true,   // Monitor the entire subtree
});

// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'ADD_IMAGE') {
    let imageUrl = request.payload.src;
    let storageKey = `imageHash_${imageUrl}`;

    console.log(`Hidding ${imageUrl}`);

    // Check if the hash is already stored
    getHashFromStorage(storageKey).then(hash => {
      // If not, calculate and save it
      if (!hash) {
        console.log(`Calculating hash for ${imageUrl}`);
        averageHashFromUrl(imageUrl).then( newHash => {
         setHashToStorage(storageKey, newHash).then(r => console.log("New hash stored"));
        });
      } else {
        console.log(`Using stored hash for ${imageUrl}`);
      }
    });
  } else if (request.type === 'REMOVE_IMAGE') {
    console.log('removing :'+request.payload.key);
    removeHashFromStorage(request.payload.key).then(r => console.log('removed'));
  } else if (request.type === 'CLEAR_IMAGES') {
    console.log('clearing all images');
    clearAll().then(r => console.log('cleared'));
  }

  sendResponse({});
  return true;
});
