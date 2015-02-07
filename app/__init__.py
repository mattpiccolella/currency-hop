from flask import Flask, jsonify, render_template, Response
from pymongo import MongoClient
import json, datetime

app = Flask(__name__)

app.config.from_envvar('APP_SETTINGS')

DATABASE = 'currency'

from data.controllers import data as data_module
app.register_blueprint(data_module)

@app.route("/")
def index():
  return render_template("index.html")

@app.route("/timedata/<to_curr>/<from_curr>/")
def timedata(to_curr, from_curr):
  client = MongoClient()
  currency = client[DATABASE].points
  data_points = currency.find(
    { 
      "to": to_curr,
      "from": from_curr
    }
  )
  dthandler = lambda obj: (obj.isoformat() if isinstance(obj, datetime.datetime)
    or isinstance(obj, datetime.date)
    else None)
  points = {}
  return Response(json.dumps(list(data_points), default=dthandler), mimetype='application/json')

@app.errorhandler(404)
def not_found(error):
  return "Page not found"

@app.errorhandler(500)
def internal_server_error(error):
  return "Something went wrong"
