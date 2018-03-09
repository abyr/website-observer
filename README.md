# website-observer

Observe what is happening with your website using such events like page views, scroll depth, clicks.

[Quick Demo](https://abyr.github.io/website-observer/demo.html?debug=1)

## Setup

Step 1. Generate a code snippet on [setup](https://abyr.github.io/website-observer/setup.html) page.

A code snippet example:
```
<script>
	!function(e,c,a){ var r=document.getElementsByTagName(c)[0], s=document.createElement(c);
    e[a]={"pageload":true,"url_change":true,"url_change_match":"page","finish_article":{attrs:["data-id"]},"click":[{"target":"article"}]};
    s.async=!0,s.src="wso.js",r.parentNode.insertBefore(s,r); }(window,"script","wsoc");
</script>
```

Step 2. Paste the code into your HTML.

Now you can subscribe to events like this

```
<script>
    document.addEventListener('wso-event', function (evnt) {
        console.log('WSO Event', evnt.detail);
    });
</script>
```

## Events

### onload

`onload`

It fires once on page is loaded by default.

### url_change

`url_change`

It fires once URL is changed.

### url_change_match

`url_change_match` <String: regular expression>

It fires every time URL is changed and it includes the text.

### scroll_depth

`scroll_depth`

It fires once a user scrolled through 25%, 50%, 75%, 100% scroll points based on initial page height.

### finish_article

`finish_article`

It fires every time you scrolled to the end of `<article>`.

### click

`click` <Array: objects>

`click[].target` <String: CSS selector>

`click[].attrs` <String: comma-separated list of attributes>

It fires every time you click on an element with cssSelector. The fired event will have DOM element attributes passed as attrs.
