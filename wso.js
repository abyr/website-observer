(function () {
    var eventsConfig = window.wsoc || {},
        debug = 1,
        debugIframe,
        alleventsList = ['pageload', 'url_change', 'url_change_match', 'clicks', 'finish_article'];

    var onReady = function (fn) {
            if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
                fn();
            } else {
                document.addEventListener('DOMContentLoaded', fn);
            }
        },
        updateDebugIframe = function () {
            if (debugIframe) {
                debugIframe.contentDocument.body.innerHTML = window.wso.printableEventsHistory();
            }
        };

    var Observer = function (config) {
            this.eventsConfig = config || {};
            this.lastUrl = window.location.href;
            this.eventsList = alleventsList,
            this.eventsHistory = {};

            this.urlChangeInterval = null;

            alleventsList.forEach(function (eventName) {
                var listedEvent = this.eventsConfig[eventName];

                if (eventName === 'clicks' && listedEvent && listedEvent.length) {
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

        this.observeScrollToArticle();

        if (debug) {
            debugIframe = document.createElement('iframe');
            document.body.appendChild(debugIframe);
            debugIframe.contentDocument.body.innerHTML = this.printableEventsHistory();
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
        this.urlChangeInterval = setInterval(function () {
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

    Observer.prototype.observeScrollToArticle = function () {
        var elements = document.querySelectorAll('article');

        this.resetReadArticles();

        Array.prototype.forEach.call(elements, function (el, iter) {
            var offset = el.getBoundingClientRect(),
                articleId = el.getAttribute('id');

            window.addEventListener("scroll", function () {
                if (document.body.scrollTop > offset.top && iter > this.lastArticleIter) {
                    this.fireEvent('finish_article', { id: articleId });
                    this.lastArticleIter = iter;
                } else if (document.body.scrollTop === 0) {
                    this.resetReadArticles();
                }
            }.bind(this));
        }, this);
    };

    Observer.prototype.resetReadArticles = function () {
        this.lastArticleIter = -1;
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
        var observerEvent,
            data = {};

        data = Object.assign(data, detail, { name: eventName });

        if (window.CustomEvent) {
            observerEvent = new CustomEvent('wso-event', { detail: data });
        } else {
            observerEvent = document.createEvent('CustomEvent');
            observerEvent.initCustomEvent('wso-event', true, true, data);
        }
        document.dispatchEvent(observerEvent);
    };

    window.wso = new Observer(eventsConfig);
    onReady(function () {
        window.wso.start();
    });

})();