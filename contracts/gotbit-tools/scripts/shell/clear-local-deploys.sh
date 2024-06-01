LOCAL=deployments/localhost
HARDHAT=deployments/hardhat

if [ -d "$LOCAL" ]
then
    rm -rf $LOCAL
fi

if [ -d "$HARDHAT" ]
then
    cp -r $HARDHAT $LOCAL 
fi

