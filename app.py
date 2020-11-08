from flask import Flask, request
from parser import processImg

app = Flask(__name__, static_url_path='/static')

@app.route('/')
def root():
    return app.send_static_file('index.html')

@app.route('/index.min.js')
def js():
    return app.send_static_file('index.js')

@app.route('/style.css')
def css():
    return app.send_static_file('style.css')

@app.route('/image.png')
def img():
    return app.send_static_file('image.png')

@app.route('/spinner.png')
def spinner():
    return app.send_static_file('spinner.png')

@app.route('/privacypolicy.html')
def privacypolicy():
    return app.send_static_file('privacypolicy.html')

@app.route('/imagedata', methods=['POST'])
def getjson():
    data = request.get_json()
    number = data['number']
    imgfile = data['imgfile']
    return processImg(number, imgfile)

if __name__ == '__main__':
  app.run()