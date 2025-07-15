import requests

API_KEY = "D0V2Oifz5N4w2lDaXlrDjYVhVRKP9gJP"  # Replace this

def get_avg_traffic_speed():
    # Center of Delhi
    lat, lon = 28.6139, 77.2090
    url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point={lat},{lon}&key={API_KEY}"
    
    r = requests.get(url)
    r.raise_for_status()
    data = r.json()

    speed = data["flowSegmentData"]["currentSpeed"]
    free_flow = data["flowSegmentData"]["freeFlowSpeed"]
    confidence = data["flowSegmentData"]["confidence"]

    return {
        "currentSpeed": speed,
        "freeFlowSpeed": free_flow,
        "confidence": confidence
    }
