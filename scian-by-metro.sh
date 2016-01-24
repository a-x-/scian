echo "{"
for i in {1..225}; do
    if [ "$(node -p "require('./collect-cian-metro.json')[$i]")" ];then
        echo "$i:"
        ./scian.js -n50 --median "http://www.cian.ru/cat.php?currency=2&deal_type=rent&engine_version=2&mebel=1&mebel_k=1&metro[0]=$i&offer_type=flat&only_foot=2&rfgr=1&room1=1&type=-2&wm=1&wp=1"
        echo ','
    fi
done
echo "}"
