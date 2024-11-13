'use strict';

import compare from 'odiff-bin';

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
console.log(
  `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
);

// Communicate with background file by sending a message
// Function to collect all images on page load
function getAllImages() {
  return Array.from(document.getElementsByTagName('img')).map(img => img.src);
}



// Send the image URLs to the background script
const imageUrls = getAllImages();
chrome.runtime.sendMessage(
  {
    type: 'IMAGE_LIST',
    payload: { images: imageUrls },
  },
  (response) => {
    console.log(response.message || 'Image URLs sent to background script.');
  }
);
// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'COUNT') {
    console.log(`Current count is ${request.payload.count}`);
  }

  sendResponse({});
  return true;
});
