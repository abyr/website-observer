(function () {
    var lastUrl = window.location.href;
    
    var eventListeners = {
            urlChanged: function () {
                if (lastUrl !== window.location.href) {
                    lastUrl = window.location.href;
                    return true;
                } 
                return false;
            }
        };
        
    var eventsHistory = {
            pageview: {
                onload: [],
                url_change: []
            }
        };
    
    var countEvent = function (name, type) {
            if (typeof eventsHistory[name] !== 'undefined' &&
                typeof eventsHistory[name][type] !== 'undefined') {
                eventsHistory[name][type].push(true);
                console.log('Event', name, type, 'count:', eventsHistory[name][type].length, eventsHistory);
            } else {
                console.log('Undefined event', name, type);
            }
        };
        
    var config = window.website_config || {
            pageview: {
                onload: true
            }
        };
    
    if (config.pageview.onload) {
        countEvent('pageview', 'onload');
    }
    
    if (config.pageview.url_change) {
        setInterval(function () { 
            if (eventListeners.urlChanged()) {
                countEvent('pageview', 'url_change');
            }
        }, 100);
    }
})();