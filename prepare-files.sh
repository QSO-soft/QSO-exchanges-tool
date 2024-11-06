#DIRS ===============================================================================================================
if [ ! -d src/_outputs ]
  then :
    mkdir src/_outputs
fi
if [ ! -d src/_outputs/csv ]
  then :
    mkdir src/_outputs/csv
fi
if [ ! -d src/_outputs/json ]
  then :
    mkdir src/_outputs/json
fi
if [ ! -d src/_outputs/csv/checkers ]
  then :
    mkdir src/_outputs/csv/checkers
fi
if [ ! -d src/_outputs/json/saved-modules ]
  then :
    mkdir src/_outputs/json/saved-modules
fi

#GENERAL ===============================================================================================================
if [ ! -s src/_inputs/settings/global.js ]
  then :
    echo "\nCreating global.js config in src/_inputs/settings/"
    cp src/_inputs/settings/global.example.js src/_inputs/settings/global.js
fi

if [ ! -s src/_inputs/csv/proxies.csv ]
  then :
    echo "\nCreating proxies.csv in src/_inputs/csv/"
    touch src/_inputs/csv/proxies.csv && echo "proxy" >> src/_inputs/csv/proxies.csv
fi

if [ ! -s src/_outputs/csv/checkers/balance-checker.csv ]
  then :
    echo "\nCreating balance-checker.csv in src/_outputs/csv/checkers/"
    touch src/_outputs/csv/checkers/balance-checker.csv && echo "id,walletAddress,amount,currency,network" >> src/_outputs/csv/checkers/balance-checker.csv
fi

#MAIN ===============================================================================================================
if [ ! -s src/_inputs/csv/wallets.csv ]
  then :
    echo "\nCreating wallets.csv in src/_inputs/csv/"
    cp src/_inputs/csv/wallets.example.csv src/_inputs/csv/wallets.csv
fi
if [ ! -s src/_outputs/json/wallets.json ]
  then :
    echo "\nCreating wallets.json in src/_outputs/json/"
    touch src/_outputs/json/wallets.json && echo "[]" >> src/_outputs/json/wallets.json
fi

if [ ! -s src/_outputs/csv/failed-wallets.csv ]
  then :
    echo "\nCreating failed-wallets.csv in src/_outputs/csv/"
    touch src/_outputs/csv/failed-wallets.csv && echo "id,walletAddress,privKey,mnemonic,failReason" >> src/_outputs/csv/failed-wallets.csv
fi

