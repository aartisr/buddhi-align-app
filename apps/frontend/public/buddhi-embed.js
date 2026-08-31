(function() {
  var containerId = 'buddhi-align-daily-prompt';
  var container = document.getElementById(containerId);
  
  if (container) {
    var iframe = document.createElement('iframe');
    // Using a relative path for the preview or absolute for production
    var scriptSrc = document.currentScript ? document.currentScript.src : 'https://buddhi-align.com/buddhi-embed.js';
    var baseUrl = scriptSrc.replace('/buddhi-embed.js', '');
    
    iframe.src = baseUrl + '/embed/daily-prompt';
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.minHeight = '160px';
    iframe.style.overflow = 'hidden';
    iframe.title = "Buddhi Align Daily Prompt";
    
    container.appendChild(iframe);
  } else {
    console.warn('Buddhi Align Embed: Container with id "' + containerId + '" not found.');
  }
})();
