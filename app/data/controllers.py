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
  data_points = currency.find(
    {
      "to" : to_curr,
      "from" : from_curr
    }
  )
  return Response(unserialize(data_points), mimetype='application/json')

def unserialize(data_points):
  dthandler = lambda obj: (obj.isoformat() if isinstance(obj, datetime.datetime)
    or isinstance(obj, datetime.date)
    else None)
  return json.dumps(list(data_points), default=dthandler)