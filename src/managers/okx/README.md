
Initializes an `Okx` object for working with the OKX exchange API.

* `walletAddress` (string): Wallet address.
* `token` (string): The token for interaction.
* `network` (string): The network for interaction (e.g., "mainnet").
* `walletId` (string): Wallet identifier.
* `random` (OkxRandom): Configuration for random values.

### `getInstance(props: OkxConstructor): Okx`

Static method to get a single instance of the `Okx` class. Ensures only one instance exists throughout the application.

* `props` (OkxConstructor): Constructor properties.

### Private Methods

* `okxLogger(type: string, action: string, status: string, message?: unknown)`: Logs OKX-related actions.
* `getChainName()`: Constructs the chain name from the token and network.
* `getWithdrawAmount(): string`: Generates a random withdrawal amount.
* `setOkxController()`: Sets up the OKX controller instance.
* `authGuard()`: Performs authentication checks.

### Public Methods

* `checkNetConnection(sleepTime: number = 300000)`: Checks the availability of the OKX exchange network.
* `getWithdrawFee(): Promise<number>`: Retrieves withdrawal fees.
* `execWithdraw()`: Executes a withdrawal operation.

### Singleton Pattern

The class implements the Singleton pattern, ensuring that only one instance of `Okx` is created and used throughout the application.

---

 **Note** : This class serves as an API client for interacting with the OKX exchange and includes methods for network availability checks, withdrawal fee retrieval, and withdrawal execution. The Singleton pattern ensures a single instance of the class is used across the application.


OKX instance contains - [ccxt doc](https://docs.ccxt.com/#/)

```
{
    'id':   'exchange'                   // lowercase string exchange id
    'name': 'Exchange'                   // human-readable string
    'countries': [ 'US', 'CN', 'EU' ],   // array of ISO country codes
    'urls': {
        'api': 'https://api.example.com/data',  // string or dictionary of base API URLs
        'www': 'https://www.example.com'        // string website URL
        'doc': 'https://docs.example.com/api',  // string URL or array of URLs
    },
    'version':         'v1',             // string ending with digits
    'api':             { ... },          // dictionary of api endpoints
    'has': {                             // exchange capabilities
        'CORS': false,
        'cancelOrder': true,
        'createDepositAddress': false,
        'createOrder': true,
        'fetchBalance': true,
        'fetchCanceledOrders': false,
        'fetchClosedOrder': false,
        'fetchClosedOrders': false,
        'fetchCurrencies': false,
        'fetchDepositAddress': false,
        'fetchMarkets': true,
        'fetchMyTrades': false,
        'fetchOHLCV': false,
        'fetchOpenOrder': false,
        'fetchOpenOrders': false,
        'fetchOrder': false,
        'fetchOrderBook': true,
        'fetchOrders': false,
        'fetchStatus': 'emulated',
        'fetchTicker': true,
        'fetchTickers': false,
        'fetchBidsAsks': false,
        'fetchTrades': true,
        'withdraw': false,
    },
    'timeframes': {                      // empty if the exchange.has['fetchOHLCV'] !== true
        '1m': '1minute',
        '1h': '1hour',
        '1d': '1day',
        '1M': '1month',
        '1y': '1year',
    },
    'timeout':           10000,          // number in milliseconds
    'rateLimit':         2000,           // number in milliseconds
    'userAgent':        'ccxt/1.1.1 ...' // string, HTTP User-Agent header
    'verbose':           false,          // boolean, output error details
    'markets':          { ... }          // dictionary of markets/pairs by symbol
    'symbols':          [ ... ]          // sorted list of string symbols (traded pairs)
    'currencies':       { ... }          // dictionary of currencies by currency code
    'markets_by_id':    { ... },         // dictionary of array of dictionaries (markets) by id
    'currencies_by_id': { ... },         // dictionary of dictionaries (markets) by id
    'apiKey':   '92560ffae9b8a0421...',  // string public apiKey (ASCII, hex, Base64, ...)
    'secret':   '9aHjPmW+EtRRKN/Oi...'   // string private secret key
    'password': '6kszf4aci8r',           // string password
    'uid':      '123456',                // string user id
    'options':          { ... },         // exchange-specific options
    // ... other properties here ...
}
```

## Rate limits Errors

* `DDoSProtection`
* `ExchangeNotAvailable`
* `ExchangeError`
* `InvalidNonce`

### [ExchangeError](https://docs.ccxt.com/#/?id=exchangeerror)

This exception is thrown when an exchange server replies with an error in JSON. Possible reasons:

* endpoint is switched off by the exchange
* symbol not found on the exchange
* required parameter is missing
* the format of parameters is incorrect
* an exchange replies with an unclear answer

Other exceptions derived from ExchangeError:

* `NotSupported`: This exception is raised if the endpoint is not offered/not supported by the exchange API.
* AuthenticationError: Raised when an exchange requires one of the API credentials that you've missed to specify, or when there's a mistake in the keypair or an outdated nonce. Most of the time you need apiKey and secret, sometimes you also need uid and/or password.
* PermissionDenied: Raised when there's no access for specified action or insufficient permissions on the specified apiKey.
* `InsufficientFunds`: This exception is raised when you don't have enough currency on your account balance to place an order.
* InvalidAddress: This exception is raised upon encountering a bad funding address or a funding address shorter than .minFundingAddressLength (10 characters by default) in a call to fetchDepositAddress, createDepositAddress or withdraw.
* `InvalidOrder`: This exception is the base class for all exceptions related to the unified order API.
* `OrderNotFound`: Raised when you are trying to fetch or cancel a non-existent order.

## Currency structure

```
{
    'id':       'btc',       // string literal for referencing within an exchange
    'code':     'BTC',       // uppercase unified string literal code the currency
    'name':     'Bitcoin',   // string, human-readable name, if specified
    'active':    true,       // boolean, currency status (tradeable and withdrawable)
    'fee':       0.123,      // withdrawal fee, flat
    'precision': 8,          // number of decimal digits "after the dot" (depends on exchange.precisionMode)
    'deposit':   true        // boolean, deposits are available
    'withdraw':  true        // boolean, withdraws are available
    'limits': {              // value limits when placing orders on this market
        'amount': {
            'min': 0.01,     // order amount should be > min
            'max': 1000,     // order amount should be < max
        },
        'withdraw': { ... }, // withdrawal limits
        'deposit': {...},
    },
    'networks': {...}        // network structures indexed by unified network identifiers (ERC20, TRC20, BSC, etc)
    'info': { ... },         // the original unparsed currency info from the exchange
}
```

## Network structure

```
{
    'id':       'tron',         // string literal for referencing within an exchange
    'network':  'TRC20'         // unified network
    'name':     'Tron Network', // string, human-readable name, if specified
    'active':    true,          // boolean, currency status (tradeable and withdrawable)
    'fee':       0.123,         // withdrawal fee, flat
    'precision': 8,             // number of decimal digits "after the dot" (depends on exchange.precisionMode)
    'deposit':   true           // boolean, deposits are available
    'withdraw':  true           // boolean, withdraws are available
    'limits': {                 // value limits when placing orders on this market
        'amount': {
            'min': 0.01,        // order amount should be > min
            'max': 1000,        // order amount should be < max
        },
        'withdraw': { ... },    // withdrawal limits
        'deposit': {...},       // deposit limits
    },
    'info': { ... },            // the original unparsed currency info from the exchange
}
```

## withdraw


```
// JavaScript
withdraw (code, amount, address, tag = undefined, params = {})
```



```
{
    'info':      { ... },    // the JSON response from the exchange as is
    'id':       '123456',    // exchange-specific transaction id, string
    'txid':     '0x68bfb29821c50ca35ef3762f887fd3211e4405aba1a94e448a4f218b850358f0',
    'timestamp': 1534081184515,             // timestamp in milliseconds
    'datetime': '2018-08-12T13:39:44.515Z', // ISO8601 string of the timestamp
    'addressFrom': '0x38b1F8644ED1Dbd5DcAedb3610301Bf5fa640D6f', // sender
    'address':  '0x02b0a9b7b4cDe774af0f8e47cb4f1c2ccdEa0806', // "from" or "to"
    'addressTo': '0x304C68D441EF7EB0E2c056E836E8293BD28F8129', // receiver
    'tagFrom', '0xabcdef', // "tag" or "memo" or "payment_id" associated with the sender
    'tag':      '0xabcdef' // "tag" or "memo" or "payment_id" associated with the address
    'tagTo': '0xhijgklmn', // "tag" or "memo" or "payment_id" associated with the receiver
    'type':     'deposit',   // or 'withdrawal', string
    'amount':    1.2345,     // float (does not include the fee)
    'currency': 'ETH',       // a common unified currency code, string
    'status':   'pending',   // 'ok', 'failed', 'canceled', string
    'updated':   undefined,  // UTC timestamp of most recent status change in ms
    'comment':  'a comment or message defined by the user if any',
    'fee': {                 // the entire fee structure may be undefined
        'currency': 'ETH',   // a unified fee currency code
        'cost': 0.1234,      // float
        'rate': undefined,   // approximately, fee['cost'] / amount, float
    },
}
```


## fetchWithdrawal ():

- checks withdraw execution

```
fetchWithdrawal (id, code = undefined, params = {})
```

## Fecth existing OKX addresses or create new

!!!!check out how it works

```
fetchDepositAddressesByNetwork (code, params = {})
fetchDepositAddress (code, params = {})
createDepositAddress (code, params = {})

{
    'currency': currency, // currency code
    'network': network,   // a list of deposit/withdraw networks, ERC20, TRC20, BSC20 (see below)
    'address': address,   // address in terms of requested currency
    'tag': tag,           // tag / memo / paymentId for particular currencies (XRP, XMR, ...)
    'info': response,     // raw unparsed data as returned from the exchange
}

```
