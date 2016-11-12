import DiffPanel from './diff-panel/DiffPanel.jsx'
require("!style!css!./node_modules/jsondiffpatch/public/formatters-styles/html.css")

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/jsondiff/sw.js').then(function(registration) {
    console.log('ServiceWorker registration successful with scope: ', registration.scope);
  }).catch(function(err) {
    console.error('ServiceWorker registration failed: ', err);
  })
}
