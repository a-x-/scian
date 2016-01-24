echo "{"
for i in {1..225}; do
    if [ "$(node -p "require('./output/collect-cian-metro.json')[$i - 1].trim()")" ];then
        echo "\"$i\":"
        ./scian.js -n5 --output=median "http://www.cian.ru/cat.php?currency=2&deal_type=rent&engine_version=2&mebel=1&mebel_k=1&metro[0]=$i&offer_type=flat&only_foot=2&rfgr=1&room1=1&type=-2&wm=1&wp=1"
        echo ','
    fi
done
echo "}"
