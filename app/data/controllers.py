from flask import Blueprint, Response, jsonify, url_for
from pymongo import MongoClient
import json, datetime

DATABASE = 'currency'

data = Blueprint('data', __name__, url_prefix='/data')

@data.route("/series/<to_curr>/<from_curr>")
def series(to_curr, from_curr):
  client = MongoClient()
  currency = client[DATABASE].points
  data_points = currency.find(
    { 
      "to" : to_curr,
      "from" : from_curr
    }
  )
  dthandler = lambda obj: (obj.isoformat() if isinstance(obj, datetime.datetime)
    or isinstance(obj, datetime.date)
    else None)
  points = {}
  return Response(json.dumps(list(data_points), default=dthandler), mimetype='application/json')

@data.route("/statistics/<to_curr>/<from_curr>")
def statistics(to_curr, from_curr):
  client = MongoClient()
  currency = client[DATABASE].statistics
  response = {}
  statistics = currency.find(
    {
      "to": to_curr,
      "from": from_curr
  })
  response['statistics'] = list(statistics)
  data_points = client[DATABASE].points.find(
    {
      "to" : to_curr,
      "from" : from_curr
    }
  ).sort("date", -1).limit(1)
  response['latest'] = list(data_points)
  print response
  return Response(unserialize(response), mimetype='application/json')

def unserialize(data_points):
  dthandler = lambda obj: (obj.isoformat() if isinstance(obj, datetime.datetime)
    or isinstance(obj, datetime.date)
    else None)
  return json.dumps(data_points, default=dthandler)
