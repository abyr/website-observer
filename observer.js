(function () {
    var lastUrl = window.location.href;

    var config = window.website_observer_config || { pageview: { onload: true } };

    var triggerEvent = function (name, type) {
            /* global CustomEvent */
            var event;

            if (window.CustomEvent) {
                event = new CustomEvent('wso-event', {detail: {name: name, type: type}});
            } else {
                event = document.createEvent('CustomEvent');
                event.initCustomEvent('wso-event', true, true, {name: name, type: type});
            }

            document.dispatchEvent(event);
        };

    var countEvent = function (name, type) {
            if (typeof eventsHistory[name] !== 'undefined' &&
                typeof eventsHistory[name][type] !== 'undefined') {
                eventsHistory[name][type].push(true);
                console.log('Event', name, type, 'count:', eventsHistory[name][type].length, eventsHistory);
                triggerEvent(name, type);
            } else {
                console.log('Undefined event', name, type);
            }
            debug && updateDebugIframe();
        };

    var eventListeners = {
            urlChanged: function (urlPattern) {
                if (lastUrl !== window.location.href) {
                    lastUrl = window.location.href;

                    if (config.pageview.url_change) {
                        countEvent('pageview', 'url_change');
                    }

                    if (urlPattern && !!lastUrl.match(urlPattern)) {
                        countEvent('pageview', 'url_match');
                    }
                }
            }
        };

    var eventsHistory = {
            pageview: {}
        };

    var printableEventsHistory = function () {
            var res = {},
                configuredEvents = window.website_observer_config;

            Object.keys(configuredEvents).forEach(function (eventName, index) {
                res[eventName] = {};
                Object.keys(configuredEvents[eventName]).forEach(function (eventType, index) {
                    if (typeof eventsHistory[eventName][eventType] !== 'undefined') {
                        res[eventName][eventType] = eventsHistory[eventName][eventType].length;
                    }
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

    // todo: init configured keys
    eventsHistory['pageview'] = {};

    if (config.pageview.onload) {
        eventsHistory['pageview']['onload'] = [];
        countEvent('pageview', 'onload');
    }

    if (config.pageview.url_change || config.pageview.url_match) {
        if (config.pageview.url_change) {
            eventsHistory['pageview']['url_change'] = [];
        }
        if (config.pageview.url_match) {
            eventsHistory['pageview']['url_match'] = [];
        }
        setInterval(function () {
            eventListeners.urlChanged(config.pageview.url_match);
        }, 100);
    }
})();