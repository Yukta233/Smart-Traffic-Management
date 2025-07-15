from flask import Flask, jsonify
from flask_cors import CORS
from traffic_utils import get_traffic_data
from tomtom_utils import get_avg_traffic_speed  # ✅ NEW import

app = Flask(__name__)
CORS(app)

# 🔵 Route for MapmyIndia traffic data (POIs etc.)
@app.route('/api/live-traffic')
def live_traffic():
    try:
        traffic = get_traffic_data()
        return jsonify(traffic)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 🔴 New route: TomTom traffic speed (real-time)
@app.route('/api/traffic-speed')
def traffic_speed():
    try:
        speed_data = get_avg_traffic_speed()
        return jsonify(speed_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

