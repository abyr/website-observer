# website-observer

[Demo](https://abyr.github.io/website-observer/demo.html)

## Events

* `onload`
* `url_change`
* `url_change_match` <String: regular expression>
* `finish_article`
* `click` <Array: objects>
    * `click[].target` <String: CSS selector>
    * `click[].attrs` <String: comma-separated list of attributes>

## Setup

Generate a code snippet on [setup](https://abyr.github.io/website-observer/setup.html) page.

```
<script>
	!function(e,c,a){ var r=document.getElementsByTagName(c)[0], s=document.createElement(c);
    e[a]={"pageload":true,"url_change":true,"url_change_match":"page","finish_article":true,"click":[{"target":"article"}]};
    s.async=!0,s.src="wso.js",r.parentNode.insertBefore(s,r); }(window,"script","wsoc");
</script>
```

Paste the code into HTML.

Subscribe to events

```
<script>
    document.addEventListener('wso-event', function (evnt) {
        console.log('WSO Event', evnt.detail);
    });
</script>
```