# website-observer

[Demo](https://abyr.github.io/website-observer/demo.html)

## Events

* `onload`
* `url_change`
* `url_change_match` <String: regular expression>
* `clicks` <Array: comma-separated list of CSS selectors>


## Subscribe

```
<script>
    document.addEventListener('wso-event', function (evnt) {
        console.log('WSO Event', evnt.detail);
    });
    window.observer_events_config = {
        pageload: true,
        url_change: true,
        url_change_match: 'second',
        click: 'a'
    };
</script>
<script src="observer.js"></script>
```