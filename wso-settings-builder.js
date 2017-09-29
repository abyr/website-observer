(function () {
    var eventsList;

    class ObserverEvent {
        constructor(name, initialAttrs) {
            this.name = name;
            this.init(Object.assign({}, initialAttrs));
        }

        init(attrs) {
            if (attrs.alias) {
                this.setAlias(attrs.alias);
            }
            if (attrs.target) {
                this.setTarget(attrs.target);
            }
            if (attrs.attrs) {
                this.setAttrs(attrs.attrs);
            }
        }

        setAlias(alias) {
            this.alias = alias;
            return this;
        }

        setTarget(target) {
            this.target = target;
            return this;
        }

        setAttrs(attrs) {
            this.attrs = attrs;
            return this;
        }

        toString() {
            return JSON.stringify(this);
        }
    }

    class EventsList {
        constructor() {
            this.events = [];
        }

        push(item) {
            this.events.push(item);
        }

        toString() {
            return '[' + this.events.map(function (item) {
                return item.toString();
            }).join(', ') + ']';
        }
    }

    eventsList = new EventsList();

    eventsList.push(new ObserverEvent('pageload'));

    eventsList.push(new ObserverEvent('click', {
        target: 'h1',
        attrs: ['data-id', 'data-tags']
    }));

    console.log(eventsList.toString());

})();