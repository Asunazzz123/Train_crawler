import requests
import json

url = "http://127.0.0.1:5001/api/receive_by_code"
params = {
    "date": "2026-01-19",
    "departure": "光明城",
    "destination": "广州南",
    "trainCode": "G6072",
    "studentTicket": "false",
    "askTime": 5
}

print(f"Connecting to {url} with params: {params}")

try:
    response = requests.get(url, params=params, stream=True)
    if response.status_code != 200:
        print(f"Failed to connect: {response.status_code}")
        print(response.text)
        exit(1)

    print("Connected! Listening for SSE events...")
    
    counter = 0
    for line in response.iter_lines():
        if not line:
            continue
            
        decoded_line = line.decode('utf-8')
        print(f"Received: {decoded_line}")
        
        if decoded_line.startswith("data:"):
            data_content = decoded_line[5:].strip()
            if data_content.startswith("{") or data_content.startswith("["):
                try:
                    data = json.loads(data_content)
                    print("Parsed JSON data length:", len(data))
                    if isinstance(data, list) and len(data) > 0:
                        print("First item:", data[0])
                        print("SUCCESS: Received filtered data!")
                        break # Success
                except:
                    pass
        
        counter += 1
        if counter > 100: # Safety break
            print("Stopped after 20 lines without data")
            break

except Exception as e:
    print(f"Error: {e}")
