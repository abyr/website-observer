(function () {
    var eventsConfig = window.website_observer_config || { pageload: true, url_change: true },
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

        if (debug) {
            debugIframe = document.createElement('iframe');
            document.body.appendChild(debugIframe);
            debugIframe.contentDocument.body.innerHTML = observer.printableEventsHistory();
        }
    };

    Observer.prototype.printableEventsHistory = function () {
        var res = {};

        Object.keys(this.eventsConfig).forEach(function (eventName, index) {
            if (typeof this.eventsHistory[eventName] !== 'undefined') {
                res[eventName] = this.eventsHistory[eventName].length;
            }
        }.bind(this));
        return JSON.stringify(res);
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

    Observer.prototype.clickListener = function () {

    };

    /**
     * @private
     */
    Observer.prototype.triggerEvent = function (eventName) {
        /* global CustomEvent */
        var observerEvent;

        if (window.CustomEvent) {
            observerEvent = new CustomEvent('wso-event', {detail: {name: eventName}});
        } else {
            observerEvent = document.createEvent('CustomEvent');
            observerEvent.initCustomEvent('wso-event', true, true, {name: eventName});
        }
        document.dispatchEvent(observerEvent);
    };

    /**
     * @private
     */
    Observer.prototype.fireEvent = function (eventName) {
        this.eventsHistory[eventName].push(true);
        if (debug) {
            updateDebugIframe();
        }
        this.triggerEvent(eventName);
    };

    observer = new Observer(eventsConfig);
    onReady(function () { observer.start(); });

})();