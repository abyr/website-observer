(function () {
    var eventsConfig = window.wsoc || {},
        debug = 1,
        debugIframe,
        alleventsList = ['pageload', 'url_change', 'url_change_match', 'click', 'finish_article', 'scroll_depth'];

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

                if (eventName === 'click' && listedEvent && listedEvent.length) {
                    this.eventsHistory[eventName] = {};
                    listedEvent.forEach(function (eventItem) {
                        this.eventsHistory[eventName][eventItem.target] = [];
                    }, this);
                } else {
                    this.eventsHistory[eventName] = [];
                }
            }, this);
        };

    Observer.prototype.start = function () {
        this.fireEvent('pageload');

        if (this.eventsConfig.url_change_match) {
            this.observeUrlChange(this.eventsConfig.url_change_match);
        }

        if (Array.isArray(this.eventsConfig.click)) {
            this.observeclickList(this.eventsConfig.click);
        }

        if (this.eventsConfig.finish_article) {
            this.observeScrollToArticle();
        }

        if (this.eventsConfig.scroll_depth) {
            this.observeScrollDepth();
        }

        if (debug) {
            debugIframe = document.createElement('iframe');
            document.body.appendChild(debugIframe);
            debugIframe.contentDocument.body.innerHTML = this.printableEventsHistory();
        }
    };

    Observer.prototype.printableEventsHistory = function () {
        return Object.keys(this.eventsConfig).map(function (eventName, index) {
            var eventInHistory = this.eventsHistory[eventName];

            if (eventName === 'click') {
                return Object.keys(eventInHistory).map(function (itemName) {
                    return 'click ' + itemName + ': ' + eventInHistory[itemName].length;
                }).join('<br />');
            }

            if (typeof eventInHistory === 'undefined') {
                return '';
            } else {
                return eventName +
                    (typeof this.eventsConfig[eventName] === 'string' ? '[' + this.eventsConfig[eventName] + ']' : '') +
                    ': ' + eventInHistory.length;
            }
        }.bind(this)).concat(['...', JSON.stringify(eventsConfig)]).join('<br />');
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

    Observer.prototype.observeclickList = function (clickList) {
        clickList.forEach(function (clickEvObj) {
            this.observeClick(clickEvObj);
        }, this);
    };

    Observer.prototype.observeClick = function (clickEvObj) {
        var elements = document.querySelectorAll(clickEvObj.target);

        Array.prototype.forEach.call(elements, function (el) {
            el.addEventListener('click', function () {
                var data = {
                        cssSelector: clickEvObj.target
                    };

                if (Array.isArray(clickEvObj.attrs)) {
                    clickEvObj.attrs.forEach(function (attr) {
                        data[attr] = el.getAttribute(attr);
                    });
                }

                this.fireEvent('click', data);
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

    Observer.prototype.observeScrollDepth = function () {
        var screenHeight = "innerHeight" in window
               ? window.innerHeight
               : document.documentElement.offsetHeight,
            height = document.body.clientHeight,
            checkPointRatios = [0.25, 0.5, 0.75, 1],
            lastCheckPoint = -1;

        window.addEventListener("scroll", function () {
            var scrollTop = document.body.scrollTop,
                reachedNewCheckPoint = false;

            checkPointRatios.forEach(function (ratio) {
                var currentHeight = scrollTop + screenHeight * 0.5,
                    neededHeight = height * ratio - screenHeight * 0.5;

                if (reachedNewCheckPoint) {
                    return;
                }
                if (currentHeight > neededHeight && lastCheckPoint < neededHeight) {
                    lastCheckPoint = neededHeight;
                    reachedNewCheckPoint = true;
                    this.fireEvent('scroll_depth', { depth: (ratio * 100) + '%' });
                }
            }, this);
        }.bind(this));
    };

    /**
     * @private
     */
    Observer.prototype.fireEvent = function (eventName, data) {
        var eventInHistory = this.eventsHistory[eventName];

        if (eventName === 'click') {
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