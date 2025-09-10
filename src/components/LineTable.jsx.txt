import React from "react";

export default function LineTable({ lines, onUpdateLine }) {
  return (
    <div className="mt-3">
      <h4 className="text-center font-medium">Tabla de líneas</h4>
      <div className="max-h-64 overflow-y-auto border rounded">
        <table className="w-full text-xs border-collapse text-center">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th>#</th><th>Lado 1</th><th>D1</th><th>Lado 2</th><th>D2</th><th>Dim (mm)</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                <td>{idx + 1}</td>
                <td><input className="input" value={line.nombre_obj1} onChange={(e) => onUpdateLine(idx, { nombre_obj1: e.target.value })} /></td>
                <td><input className="input" value={line.deduce1} onChange={(e) => onUpdateLine(idx, { deduce1: e.target.value })} /></td>
                <td><input className="input" value={line.nombre_obj2} onChange={(e) => onUpdateLine(idx, { nombre_obj2: e.target.value })} /></td>
                <td><input className="input" value={line.deduce2} onChange={(e) => onUpdateLine(idx, { deduce2: e.target.value })} /></td>
                <td><input className="input" value={line.dimension_mm} onChange={(e) => onUpdateLine(idx, { dimension_mm: e.target.value })} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
