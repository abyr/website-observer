# website-observer

[Demo](https://abyr.github.io/website-observer/demo.html)

## Events
Name | Type

`pageview: onload`

`pageview: url_changed`

`pageview: url_match <String: regular expression>`


## Subscribe

```
document.addEventListener('wso-event', function (evnt) {
    console.log('WSO Event', evnt.detail);
});
```