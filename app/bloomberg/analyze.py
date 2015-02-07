from pymongo import MongoClient
import math

DATABASE = 'currency'

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


if __name__ == '__main__':
  client = MongoClient()
  for from_city, from_curr in FROM_CURRENCIES.iteritems():
    for to_city, to_curr in TO_CURRENCIES.iteritems():
      if from_curr != to_curr:
        stat = {}
        stat['to'] = to_curr
        stat['from'] = from_curr
        currency = client[DATABASE].points
        data_points = currency.find(
          { 
            "to": to_curr,
            "from": from_curr
          }
        )
        count = 0
        total_price = 0
        for data_point in data_points:
          total_price += data_point['price']
          count += 1
        mean = total_price / count
        stat['mean'] = mean
        sample_square = 0
        data_points = currency.find(
          { 
            "to": to_curr,
            "from": from_curr
          }
        )
        for data_point in data_points:
          sample_square += math.pow(data_point['price']-mean,2)
        variation = sample_square / (count-1)
        stdev = math.sqrt(variation)
        stat['stdev'] = stdev
        statistics = client[DATABASE].statistics
        statistics.insert(stat)

