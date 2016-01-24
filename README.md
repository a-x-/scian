# scian
Simple cian.ru (ЦИАН) stat

```
    Usage
      $ scian [url]

    Options
      -p, --price-min       [30k] Min cian search price (for uri query)
      -f, --foot-time       [15]  Metro foot time
      -n, --pages-num       [10]  Number of pages to scan

    Examples
      $ ./scian
      $ ./scian -n10 -p10 -f5
      $ ./scian 'http://www.cian.ru/cat.php?deal_type=sale&district[0]=121&offer_type=flat&only_foot=2&room1=1'
```

### Example output
html loaded 704573
parser inited:  function

html loaded 713850
parser inited:  function

prices 35,35,40,...,45,45,47,50,49.5,50,50,50,50

* true max 90.00
* true min 48.70
* mean 63.46
* **median** 55.00

### simple in browser script for one page
https://gist.github.com/a-x-/5878942b1c77ac1d6fff

