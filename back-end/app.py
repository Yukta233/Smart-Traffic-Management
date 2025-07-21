from flask import Flask, jsonify, request
from flask_cors import CORS
import heapq
import random

# ✅ Custom utility modules
from tomtom_utils import get_avg_traffic_speed        # Real-time TomTom data
from signal_controller import determine_signal_states # For live signal display
from route_finder import dijkstra, get_route_coordinates  # Geo + shortest path

app = Flask(__name__)
CORS(app)

# Store emergency direction globally
EMERGENCY_DIRECTION = None

#  Max-Heap for traffic signal priority (with emergency override)
def get_priority_queue(traffic_data, emergency_dirs=[]):
    heap = []
    for direction, count in traffic_data.items():
        if direction in emergency_dirs:
            priority = -1000  # Highest priority
        else:
            priority = -count
        heapq.heappush(heap, (priority, direction))
    return heap

#  Route 1: Optimize signal (based on traffic + emergency)
@app.route('/api/optimize-signal', methods=['POST'])
def optimize_signal():
    global EMERGENCY_DIRECTION
    data = request.json
    traffic_data = data['traffic']
    emergency_mode = data.get('emergency_mode', False)

    # Pick a random direction if emergency mode is on
    if emergency_mode:
        EMERGENCY_DIRECTION = random.choice(list(traffic_data.keys()))
        emergency_dirs = [EMERGENCY_DIRECTION]
    else:
        EMERGENCY_DIRECTION = None
        emergency_dirs = []

    pq = get_priority_queue(traffic_data, emergency_dirs)
    best_priority, best_direction = heapq.heappop(pq)

    return jsonify({
        'green_signal': best_direction,
        'is_emergency': best_priority == -1000,
        'emergency_direction': EMERGENCY_DIRECTION,
        'message': f"{best_direction} has emergency vehicle" if best_priority == -1000 else "Normal priority"
    })

#  Route 2: Current signal status (for UI live feed)
@app.route('/api/signal-status')
def signal_status():
    return jsonify(determine_signal_states())

#  Route 3: Shortest path using Dijkstra's algorithm
@app.route('/api/route')
def route():
    from_node = request.args.get('from')
    to_node = request.args.get('to')

    if not from_node or not to_node:
        return jsonify({"error": "Missing from or to"}), 400

    path, total_cost = dijkstra(from_node, to_node)
    return jsonify({
        "path": path,
        "totalCost": total_cost
    })

#  Route 4: Real-time traffic speed from TomTom
@app.route('/api/traffic-speed')
def traffic_speed():
    try:
        return jsonify(get_avg_traffic_speed())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#  Route 5: Geo-coordinates route (for Leaflet)
@app.route('/api/geo-route')
def geo_route():
    source = request.args.get('source')
    destination = request.args.get('destination')

    if not source or not destination:
        return jsonify({"error": "Missing source or destination"}), 400

    try:
        route_coords = get_route_coordinates(source, destination)
        return jsonify({"route": route_coords})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, port=5000)
