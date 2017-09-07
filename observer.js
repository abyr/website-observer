(function () {
    var eventsConfig = window.observer_events_config || { pageload: true, url_change: true },
        debug = 1,
        debugIframe,
        alleventsList = ['pageload', 'url_change', 'url_change_match', 'click'],
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

    var Observer = function (config, options) {
            this.eventsConfig = config || {};
            this.lastUrl = window.location.href;
            this.eventsList = alleventsList,
            this.eventsHistory = {};
            this.eventsList.forEach(function (eventName) {
                this.eventsHistory[eventName] = [];
            }.bind(this));
        };

    Observer.prototype.start = function () {
        this.fireEvent('pageload');
        this.observeUrlChange(this.eventsConfig.url_change_match);
        this.observeClick(this.eventsConfig.click);

        if (debug) {
            debugIframe = document.createElement('iframe');
            document.body.appendChild(debugIframe);
            debugIframe.contentDocument.body.innerHTML = observer.printableEventsHistory();
        }
    };

    Observer.prototype.printableEventsHistory = function () {
        return Object.keys(this.eventsConfig).map(function (eventName, index) {
            if (typeof this.eventsHistory[eventName] === 'undefined') {
                return '';
            } else {
                return eventName +
                    (typeof this.eventsConfig[eventName] === 'string' ? '[' + this.eventsConfig[eventName] + ']' : '') +
                    ': ' + this.eventsHistory[eventName].length;
            }
        }.bind(this)).join("<br />");
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

    Observer.prototype.observeClick = function (cssSelector) {
        var elements = document.querySelectorAll(cssSelector);

        Array.prototype.forEach.call(elements, function (el) {
            el.addEventListener('click', function () {
                this.fireEvent('click', { target: el });
            }.bind(this));
        }.bind(this));
    };

    /**
     * @private
     */
    Observer.prototype.fireEvent = function (eventName, data) {
        this.eventsHistory[eventName].push(true);
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