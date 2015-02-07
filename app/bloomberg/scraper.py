import requests, json, datetime
from pymongo import MongoClient

HISTORICAL_DATA = "https://http-api.openbloomberg.com/request/blp/refdata/HistoricalData"

TO_CURRENCIES = {
    "Argentina" : "ARS",
    "Australia" : "AUD",
    "Brazil" : "BRL",
    "Bahamas" : "BSD",
    "Canada" : "CAD",
    "Switzerland" : "CHF",
    "China" : "CNY",
    "EuroZone" : "EUR",
    "Great Britain" : "GBP",
    "India" : "INR",
    "Jamaica" : "JMD",
    "Japan" : "JPY",
    "South Korea" : "KRW",
    "Mexico" : "MXN",
    "New Zealand" : "NZD",
    "Russia" : "RUB",
    "Thailand" : "THB",
    "United States" : "USD"
}

FROM_CURRENCIES = {
    "Canada" : "CAD",
    "EuroZone" : "EUR",
    "United States" : "USD"   
}

DATABASE = 'currency'

def cacert():
    return 'bloomberg.crt'

def cert():
    return ('bloomberg_hack.crt', 'bloomberg_hack.key')

def default_json():
    return {
    "securities": [
    ],
    "fields": [
        "PX_MID"
    ],
    "startDate": "20130201",
    "endDate": "20150205",
    "periodicitySelection": "DAILY"
    }   

def currency_string(to_currency, from_currency):
    return to_currency + from_currency + " Curncy"

def currency_request(data, client):
    currency = client[DATABASE].points
    r = requests.post(HISTORICAL_DATA, verify=cacert(), cert=cert(), data=json.dumps(data)).json()
    print r
    for price in r['data'][0]['securityData']['fieldData']:
        price_point = {}
        price_point['date'] = datetime.datetime.strptime(price['date'], "%Y-%m-%dT%H:%M:%S.%fZ")
        currency_string = r['data'][0]['securityData']['security']
        price_point['from'] = currency_string[0:3]
        price_point['to'] = currency_string[3:6]
        price_point['price'] = price['PX_MID']
        print price_point
        currency.insert(price_point)
    print "Finished"

if __name__ == '__main__':
    client = MongoClient()
    for from_city, from_curr in FROM_CURRENCIES.iteritems():
        for to_city, to_curr in TO_CURRENCIES.iteritems():       
            data = default_json()
            data['securities'].append(currency_string(from_curr, to_curr))
            currency_request(data, client)


