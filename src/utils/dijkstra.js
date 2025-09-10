export function dijkstra(graph, start, end) {
  if (!graph[start] || !graph[end]) return null;
  const distances = {};
  const prev = {};
  const visited = new Set();
  const queue = [];

  for (const node in graph) distances[node] = Infinity;
  distances[start] = 0;
  queue.push({ node: start, dist: 0 });

  while (queue.length) {
    queue.sort((a, b) => a.dist - b.dist);
    const { node } = queue.shift();
    if (visited.has(node)) continue;
    visited.add(node);

    for (const neighbor in graph[node]) {
      const newDist = distances[node] + graph[node][neighbor];
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        prev[neighbor] = node;
        queue.push({ node: neighbor, dist: newDist });
      }
    }
  }

  if (distances[end] === Infinity) return null;

  const path = [];
  let current = end;
  while (current) {
    path.unshift(current);
    current = prev[current];
  }
  return { distance: distances[end], path };
}
