from flask import Flask

app = Flask(__name__)

app.config.from_envvar('APP_SETTINGS')

@app.errorhandler(404)
def not_found(error):
  return "Page not found"

@app.errorhandler(500)
def internal_server_error(error):
  return "Something went wrong"
