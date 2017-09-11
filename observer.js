(function () {
    var eventsConfig = window.observer_events_config || { pageload: true, url_change: true },
        debug = 1,
        debugIframe,
        alleventsList = ['pageload', 'url_change', 'url_change_match', 'clicks'],
        observer;

    var onReady = function (fn) {
            if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
                fn();
            } else {
                document.addEventListener('DOMContentLoaded', fn);
            }
        },
        updateDebugIframe = function () {
            if (debugIframe) {
                debugIframe.contentDocument.body.innerHTML = observer.printableEventsHistory();
            }
        };

    var Observer = function (config) {
            this.eventsConfig = config || {};
            this.lastUrl = window.location.href;
            this.eventsList = alleventsList,
            this.eventsHistory = {};

            alleventsList.forEach(function (eventName) {
                var listedEvent = this.eventsConfig[eventName];

                if (eventName === 'clicks') {
                    this.eventsHistory[eventName] = {};
                    listedEvent.forEach(function (eventItem) {
                        this.eventsHistory[eventName][eventItem] = [];
                    }, this);
                } else {
                    this.eventsHistory[eventName] = [];
                }
            }, this);
        };

    Observer.prototype.start = function () {
        this.fireEvent('pageload');
        this.observeUrlChange(this.eventsConfig.url_change_match);

        if (Array.isArray(this.eventsConfig.clicks)) {
            this.observeClicksList(this.eventsConfig.clicks);
        }

        if (debug) {
            debugIframe = document.createElement('iframe');
            document.body.appendChild(debugIframe);
            debugIframe.contentDocument.body.innerHTML = observer.printableEventsHistory();
        }
    };

    Observer.prototype.printableEventsHistory = function () {
        return Object.keys(this.eventsConfig).map(function (eventName, index) {
            var eventInHistory = this.eventsHistory[eventName];

            if (eventName === 'clicks') {
                return Object.keys(eventInHistory).map(function (itemName) {
                    return 'click ' + itemName + ':' + eventInHistory[itemName].length;
                }).join('<br />');
            }

            if (typeof eventInHistory === 'undefined') {
                return '';
            } else {
                return eventName +
                    (typeof this.eventsConfig[eventName] === 'string' ? '[' + this.eventsConfig[eventName] + ']' : '') +
                    ': ' + eventInHistory.length;
            }
        }.bind(this)).join('<br />');
    };

    Observer.prototype.observeUrlChange = function (urlPattern) {
        setInterval(function () {
            this.isUrlChanged(urlPattern);
        }.bind(this), 100);
    };

    /**
     * @private
     */
    Observer.prototype.isUrlChanged = function (urlPattern) {
        if (this.lastUrl === window.location.href) {
            return;
        }
        this.lastUrl = window.location.href;
        if (this.eventsConfig.url_change) {
            this.fireEvent('url_change');
        }
        if (urlPattern && !!this.lastUrl.match(urlPattern)) {
            this.fireEvent('url_change_match');
        }
    };

    Observer.prototype.observeClicksList = function (cssSelectorsList) {
        cssSelectorsList.forEach(function (cssSelector) {
            this.observeClick(cssSelector);
        }, this);
    };

    Observer.prototype.observeClick = function (cssSelector) {
        var elements = document.querySelectorAll(cssSelector);

        Array.prototype.forEach.call(elements, function (el) {
            el.addEventListener('click', function () {
                this.fireEvent('clicks', {
                    cssSelector: cssSelector
                });
            }.bind(this));
        }, this);
    };

    /**
     * @private
     */
    Observer.prototype.fireEvent = function (eventName, data) {
        var eventInHistory = this.eventsHistory[eventName];

        if (eventName === 'clicks') {
            eventInHistory = this.eventsHistory[eventName][data.cssSelector];
        }

        eventInHistory.push(true);
        if (debug) {
            updateDebugIframe();
        }
        this.triggerEvent(eventName, Object.assign({ name: eventName }, data));
    };

    /**
     * @private
     */
    Observer.prototype.triggerEvent = function (eventName, detail) {
        /* global CustomEvent */
        var observerEvent;

        if (window.CustomEvent) {
            observerEvent = new CustomEvent('wso-event', { detail: detail });
        } else {
            observerEvent = document.createEvent('CustomEvent');
            observerEvent.initCustomEvent('wso-event', true, true, {name: eventName});
        }
        document.dispatchEvent(observerEvent);
    };

    observer = new Observer(eventsConfig);
    onReady(function () { observer.start(); });

})();