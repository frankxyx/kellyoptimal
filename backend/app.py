# backend/app.py
import os
from flask import Flask, jsonify, send_from_directory
from quiz.generator import generate_question

# Point static_folder at your Vite dist output
app = Flask(
    __name__,
    static_folder=os.path.join(os.path.dirname(__file__), '../frontend/dist'),
    static_url_path=''  # serve static files at the root
)

# API endpoint
@app.route('/api/question')
def question():
    return jsonify(generate_question())


# Catch-all to serve index.html for any non-/api routes (SPA fallback)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_vue_app(path):
    dist = app.static_folder
    # If the requested file exists, serve it directly
    if path and os.path.exists(os.path.join(dist, path)):
        return send_from_directory(dist, path)
    # Otherwise, serve index.html
    return send_from_directory(dist, 'index.html')


if __name__ == '__main__':
    # In production you’d use a WSGI server; this is fine for dev/demo
    app.run(debug=True, host='0.0.0.0', port=5001)

