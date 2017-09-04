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
        
    var printableEventsHistory = function () {
            var res = {};
            
            Object.keys(eventsHistory).forEach(function (eventName, index) {
                res[eventName] = {};
                Object.keys(eventsHistory[eventName]).forEach(function (eventType, index) {
                    res[eventName][eventType] = eventsHistory[eventName][eventType].length;
                });
            });
            return JSON.stringify(res);
        };
        
    var debug = true, 
        debugIframe;
        
    var onReady = function (fn) {
        if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    };
    
    debug && onReady(function () {
        debugIframe = document.createElement('iframe');
        document.body.appendChild(debugIframe);
        debugIframe.contentDocument.body.innerHTML = printableEventsHistory();
    });
    
    var updateDebugIframe = function () {
            if (debugIframe) {
                debugIframe.contentDocument.body.innerHTML = printableEventsHistory();
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
            debug && updateDebugIframe();
        };
        
    var config = window.website_observer_config || {
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