CONTRACTS=src/contracts/
if [ -d "$CONTRACTS" ]
then
    rm -rf $LOCAL
else
    mkdir $CONTRACTS
fi

cp -r ../contracts/typechain $CONTRACTS
cp ../contracts/contracts.json $CONTRACTS

echo "Contracts import successfuly!"