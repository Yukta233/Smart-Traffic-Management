import requests

# Replace with your actual values
CLIENT_ID = "96dHZVzsAutn85MJ94tdd0M2TmD_VjEuF7uhhXMTGs-FS3-q_eyfsU5rSFqY5P1iFI86BAK8SLvqwi4aG9j5dUyE0Lu3CNLs"
CLIENT_SECRET = "lrFxI-iSEg_raAqtroKAnAJsUUu0Th6ZkgARMz2lj4QJ-hs_niXym2swkzJBcB-x6W6CjF80h-D3faO1sjcezeCUiOo4DQYrTO3no2rJSn0="

def get_access_token():
    url = "https://outpost.mapmyindia.com/api/security/oauth/token"
    payload = {
        "grant_type": "client_credentials",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET
    }

    response = requests.post(url, data=payload)
    response.raise_for_status()
    return response.json().get("access_token")

def get_traffic_data():
    token = get_access_token()
    headers = {
        "Authorization": f"Bearer {token}"
    }

    lat, lng = 28.6139, 77.2090  # Central Delhi
    url = f"https://atlas.mapmyindia.com/api/places/nearby/json?keywords=traffic&refLocation={lat},{lng}"

    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()
