(function () {
    // http://lisperator.net/uglifyjs/
    var eventsConfig = window.wsoc || {},
        debug = window.location.search.indexOf("debug=1") > 0,
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
            this.setScrollDepth('0%');

            this.statesHistory = [];

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

        if (this.eventsConfig.url_change || this.eventsConfig.url_change_match) {
            this.observeUrlChange(this.eventsConfig.url_change_match);
        }
        if (Array.isArray(this.eventsConfig.click)) {
            this.observeclickList(this.eventsConfig.click);
        }
        if (this.eventsConfig.scroll_depth) {
            this.observeScrollDepth();
        }
        if (typeof this.eventsConfig.finish_article === 'object') {
            this.observeScrollToArticle();
        }
    };

    Observer.prototype.printableEventsHistory = function () {
        if (eventsConfig.printByAliases) {
            return this.printableAliasesHistory();
        }
        return Object.keys(this.eventsConfig).map(function (eventName, index) {
            var eventInHistory = this.eventsHistory[eventName];

            if (eventName === 'click') {
                return Object.keys(eventInHistory).map(function (itemName) {
                    return this.formatEventReport('click ' + itemName, eventInHistory[itemName].length);
                }, this).join('<br />');
            }
            if (eventName === 'scroll_depth') {
                return this.formatEventReport(eventName, this.getScrollDepth());
            }

            if (typeof eventInHistory !== 'undefined') {
                return this.formatEventReport(eventName,
                    (typeof this.eventsConfig[eventName] === 'string' ? '[' + this.eventsConfig[eventName] + ']' : '') + eventInHistory.length);
            } else {
                return '';
            }
        }.bind(this)).concat(['...', JSON.stringify(eventsConfig)]).join('<br />');
    };

    Observer.prototype.printableAliasesHistory = function () {
        return Object.keys(window.wsoc).map(function (eventName, index) {
            var eventInHistory = window.wso.eventsHistory[eventName];

            if (eventName === 'click') {
                return Object.keys(eventInHistory).map(function (itemName) {
                    return this.formatEventReport(this.eventsConfig[eventName].find(function (evnt) {
                        return evnt.target === itemName;
                    }).alias, eventInHistory[itemName].length);
                }, this).join('<br />');
            }
            if (eventName === 'scroll_depth') {
                return this.formatEventReport(eventName, this.getScrollDepth());
            }

            if (typeof eventInHistory !== 'undefined') {
                return this.formatEventReport(this.eventsConfig[eventName].alias, eventInHistory.length);
            } else {
                return '';
            }
        }.bind(this))/*.concat(['...', JSON.stringify(this.eventsConfig)])*/.join('<br />');
    };

    Observer.prototype.formatEventReport = function (eventName, value) {
        return eventName + ': ' + value;
    };

    Observer.prototype.observeUrlChange = function (urlPattern) {
        this.urlChangeInterval = setInterval(function () {
            this.isUrlChanged(urlPattern);
        }.bind(this), 10);
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
                        target: clickEvObj.target
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
        var elements = document.querySelectorAll('article'),
            eventConfigObject = this.eventsConfig.finish_article;

        this.resetReadArticles();

        Array.prototype.forEach.call(elements, function (el, iter) {
            var offset = el.getBoundingClientRect(),
                articleId = el.getAttribute('id');

            window.addEventListener('scroll', function () {
                var scrollTop = document.body.scrollTop || window.pageYOffset;

                if (scrollTop > offset.top && iter > this.lastArticleIter) {
                    var data = {
                        id: articleId || iter
                    };

                    if (Array.isArray(eventConfigObject.attrs)) {
                        eventConfigObject.attrs.forEach(function (attr) {
                            data[attr] = el.getAttribute(attr);
                        });
                    }

                    this.fireEvent('finish_article', data);
                    this.lastArticleIter = iter;
                } else if (scrollTop === 0) {
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
            var scrollTop = document.body.scrollTop || window.pageYOffset,
                reachedNewCheckPoint = false;

            checkPointRatios.forEach(function (ratio) {
                var currentHeight = scrollTop + screenHeight * 0.5,
                    neededHeight = height * ratio - screenHeight * 0.5;

                if (reachedNewCheckPoint) {
                    return;
                }
                console.log('scroll', lastCheckPoint, currentHeight, neededHeight);
                if (currentHeight > neededHeight && lastCheckPoint < neededHeight) {
                    lastCheckPoint = neededHeight;
                    reachedNewCheckPoint = true;
                    this.setScrollDepth((ratio * 100) + '%');
                    this.fireEvent('scroll_depth', { depth: this.getScrollDepth() });
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
            eventInHistory = this.eventsHistory[eventName][data.target];
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
            data = {
                alias: this.getAlias(eventName, detail)
            };

        data = Object.assign(data, detail, { name: eventName });

        this.pushState(data);

        if (window.CustomEvent) {
            observerEvent = new CustomEvent('wso-event', { detail: data });
        } else {
            observerEvent = document.createEvent('CustomEvent');
            observerEvent.initCustomEvent('wso-event', true, true, data);
        }
        document.dispatchEvent(observerEvent);
    };

    Observer.prototype.pushState = function (stateObj) {
        this.statesHistory.push(stateObj);
    };

    Observer.prototype.getAlias = function (eventName, detail) {
        var eventObj;

        if (eventName === 'click' && detail && detail.target) {
            eventObj = this.eventsConfig[eventName].find(function (ev) {
                    return ev.target === detail.target;
                });

            return eventObj.alias || eventName + ':' + detail.target;
        } else {
            return this.eventsConfig[eventName].alias || eventName;
        }
    };

    Observer.prototype.getScrollDepth = function () {
        return this.scrollDepth;
    };

    Observer.prototype.setScrollDepth = function (value) {
        this.scrollDepth = value;
    };

    window.wso = new Observer(eventsConfig);
    onReady(function () {
        if (debug) {
            debugIframe = document.createElement('iframe');
            document.body.appendChild(debugIframe);
            debugIframe.contentDocument.body.innerHTML = window.wso.printableEventsHistory();
        }
        window.wso.start();
    });

})();