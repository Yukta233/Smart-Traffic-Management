import heapq
import random
def get_vehicle_counts():
    return {
        "North": random.randint(10, 100),
        "South": random.randint(10, 100),
        "East": random.randint(10, 100),
        "West": random.randint(10, 100)
    }
# Use Max-Heap to determine which direction should get the green signal
def determine_signal_states():
    counts = get_vehicle_counts()
    heap = [(-count, direction) for direction, count in counts.items()]
    heapq.heapify(heap)
    # Get direction with the most vehicles
    _, green_direction = heapq.heappop(heap)
    status = {}
    for direction, count in counts.items():
        if direction == green_direction:
            signal = "green"
        else:
            # Assign red or yellow randomly to non-priority directions
            signal = "yellow" if random.random() > 0.5 else "red"

        status[direction] = {
            "signal": signal,
            "vehicles": count
        }

    return status
