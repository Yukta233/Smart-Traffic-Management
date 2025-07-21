import heapq
road_graph = {
    'A': [('B', 2), ('C', 5)],
    'B': [('C', 1), ('D', 4)],
    'C': [('D', 1)],
    'D': []
}

# ---------------------- Dijkstra Algorithm ----------------------
def dijkstra(start, end, graph=road_graph):
    pq = [(0, start)] 
    distances = {node: float('inf') for node in graph}
    previous = {node: None for node in graph}
    distances[start] = 0

    while pq:
        current_cost, current_node = heapq.heappop(pq)

        if current_node == end:
            break

        for neighbor, weight in graph.get(current_node, []):
            distance = current_cost + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous[neighbor] = current_node
                heapq.heappush(pq, (distance, neighbor))

    path = []
    node = end
    while node:
        path.insert(0, node)
        node = previous[node]

    return path, distances[end] if distances[end] != float('inf') else None
def get_route_coordinates(source, destination):
    """
    Simulated geographic route for demo (can use TomTom routing API later).
    Source/destination should be [lat, lng] lists.
    """
    if not source or not destination:
        return []

    return [source, destination]
