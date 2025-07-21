from collections import deque
import requests

speed_window = deque(maxlen=10)

def get_avg_traffic_speed():
    api_key = 'D0V2Oifz5N4w2lDaXlrDjYVhVRKP9gJP'
    url = f'https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key={api_key}&point=28.6139,77.2090'

    res = requests.get(url)
    data = res.json()

    current_speed = data['flowSegmentData']['currentSpeed']
    speed_window.append(current_speed)

    avg_speed = sum(speed_window) / len(speed_window)

    return {
        "currentSpeed": current_speed,
        "avgSpeed": round(avg_speed, 2),
        "freeFlowSpeed": data['flowSegmentData']['freeFlowSpeed'],
        "confidence": data['flowSegmentData']['confidence']
    }
