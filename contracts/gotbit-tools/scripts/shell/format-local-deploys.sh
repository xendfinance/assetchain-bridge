{ 
    echo '{"31337":[';
    cat contracts.json;
    echo  ']}';
} > contracts.json.new

mv contracts.json.new contracts.json