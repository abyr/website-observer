# website-observer

[Demo](https://abyr.github.io/website-observer/demo.html)

## Events
Name | Type

`pageview: onload`

`pageview: url_changed`

`pageview: url_match <String: regular expression>`


## Subscribe

```
<script>
	document.addEventListener('wso-event', function (evnt) {
        console.log('WSO Event', evnt.detail);
    });
	window.observer_events_config = {
	    pageload':true,
	    url_change':true,
	    url_change_match':'second',
	    click: ''
	};
</script>
<script src="observer.js"></script>
```