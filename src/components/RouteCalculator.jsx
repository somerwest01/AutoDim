import React, { useMemo, useState } from "react";
import { dijkstra } from "../utils/dijkstra";

export default function RouteCalculator({ lines }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [result, setResult] = useState(null);

  const graph = useMemo(() => {
    const g = {};
    lines.forEach(({ nombre_obj1, nombre_obj2, dimension_mm }) => {
      if (!nombre_obj1 || !nombre_obj2 || !dimension_mm) return;
      if (!g[nombre_obj1]) g[nombre_obj1] = {};
      if (!g[nombre_obj2]) g[nombre_obj2] = {};
      g[nombre_obj1][nombre_obj2] = Number(dimension_mm);
      g[nombre_obj2][nombre_obj1] = Number(dimension_mm);
    });
    return g;
  }, [lines]);

  const handleCalc = () => {
    const res = dijkstra(graph, start, end);
    setResult(res || { error: "No hay ruta o extremos inválidos" });
  };

  return (
    <div className="mt-3">
      <h4 className="text-center font-medium">Calcular ruta</h4>
      <div className="flex gap-2 mb-2">
        <input className="input flex-1" placeholder="Extremo 1" value={start} onChange={(e) => setStart(e.target.value)} />
        <input className="input flex-1" placeholder="Extremo 2" value={end} onChange={(e) => setEnd(e.target.value)} />
        <button className="btn" onClick={handleCalc}>Calcular</button>
      </div>
      {result && (
        <p className="text-sm mt-2">
          {result.error
            ? <span className="text-red-500">{result.error}</span>
            : <>📏 {result.distance.toFixed(2)} mm — 🧭 {result.path.join(" → ")}</>
          }
        </p>
      )}
    </div>
  );
}
