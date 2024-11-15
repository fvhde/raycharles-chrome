'use strict';

import { averageHashFromUrl } from './fetchImage';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

// Event listeners
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed or reloaded, applying saved image setting");
});

chrome.runtime.onStartup.addListener(() => {
  console.log("Browser startup, applying saved image setting");
});

let images;
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === 'GREETINGS') {
    const message = `Hi ${sender.tab ? 'Con' : 'Pop'}, my name is Bac. I am from Background. It's great to hear from you.`;
    sendResponse({ message });
  }
  return true;
});

