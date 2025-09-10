import React, { useState, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import LineTable from "./components/LineTable";
import RouteCalculator from "./components/RouteCalculator";
import CanvasBoard from "./components/CanvasBoard";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

import { dijkstra } from "./utils/dijkstra";

function useLines(initial = []) {
  const [lines, setLines] = useState(initial);
  const addLine = (line) => setLines((prev) => [...prev, line]);
  const updateLine = (index, patch) =>
    setLines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  const removeLine = (index) => setLines((prev) => prev.filter((_, i) => i !== index));
  const reset = () => setLines([]);
  return { lines, addLine, updateLine, removeLine, setLines, reset };
}

export default function App() {
  const { lines, addLine, updateLine, removeLine, setLines, reset } = useLines([]);

  // estados UI
  const [mostrarExcel, setMostrarExcel] = useState(false);
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
  const [mostrarExtremos, setMostrarExtremos] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [procesandoExcel, setProcesandoExcel] = useState(false);
  const [totalCircuitos, setTotalCircuitos] = useState(0);
  const [circuitosProcesados, setCircuitosProcesados] = useState(0);
  const [pencilMode, setPencilMode] = useState(true);
  const [eraserMode, setEraserMode] = useState(false);
  const [modoAnguloRecto, setModoAnguloRecto] = useState(false);
  const [selector, setSelector] = useState(null);

  // Guardar JSON
  const handleSaveJSON = () => {
    const blob = new Blob([JSON.stringify(lines)], { type: "application/json" });
    saveAs(blob, "dibujo_guardado.json");
  };

  // Abrir JSON
  const handleOpenJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        setLines(data);
        setStatusMessage("✅ Archivo cargado.");
      } catch {
        setStatusMessage("❌ Error al leer JSON");
      }
    };
    reader.readAsText(file);
  };
  import { Helper } from "dxf";   // 👈 al inicio de App.jsx

// dentro del componente App
const handleImportDXF = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();

  reader.onload = (event) => {
    try {
      const content = event.target.result;
      const helper = new Helper(content);
      const dxf = helper.denormalised;

      // Filtrar entidades de tipo "LINE"
      const importedLines = (dxf.entities || [])
        .filter(ent => ent.type === "LINE")
        .map(ent => ({
          p1: { x: ent.vertices[0].x, y: ent.vertices[0].y },
          p2: { x: ent.vertices[1].x, y: ent.vertices[1].y },
          obj1: "Ninguno",
          obj2: "Ninguno",
          nombre_obj1: "",
          nombre_obj2: "",
          dimension_mm: null,
          deduce1: "",
          deduce2: "",
        }));

      setLines(importedLines);
      setStatusMessage(`✅ ${importedLines.length} líneas importadas de DXF`);
    } catch (err) {
      setStatusMessage("❌ Error al leer DXF");
      console.error(err);
    }
  };

  reader.readAsText(file);
};


  // Importar Excel (versión resumida)
  
  const handleImportExcel = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcesandoExcel(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const updated = [...jsonData];

        setTotalCircuitos(updated.length - 2);
        setCircuitosProcesados(0);

        const graph = {};
        lines.forEach(({ nombre_obj1, nombre_obj2, dimension_mm }) => {
          if (!nombre_obj1 || !nombre_obj2 || !dimension_mm) return;
          if (!graph[nombre_obj1]) graph[nombre_obj1] = {};
          if (!graph[nombre_obj2]) graph[nombre_obj2] = {};
          graph[nombre_obj1][nombre_obj2] = Number(dimension_mm);
          graph[nombre_obj2][nombre_obj1] = Number(dimension_mm);
        });

        let i = 2;
        const chunk = 200;
        const loop = () => {
          const end = Math.min(i + chunk, updated.length);
          for (; i < end; i++) {
            const row = updated[i] || [];
            const res = dijkstra(graph, row[15], row[8]);
            updated[i][22] = res ? res.distance.toFixed(2) : "Ruta no encontrada";
            updated[i][23] = res ? "Sí" : "No";
          }
          setCircuitosProcesados(i - 2);
          if (i < updated.length) setTimeout(loop, 0);
          else {
            const newWs = XLSX.utils.aoa_to_sheet(updated);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, newWs, sheetName);
            const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            saveAs(new Blob([buffer]), "archivo_validado.xlsx");
            setProcesandoExcel(false);
            setStatusMessage("✅ Procesado");
          }
        };
        loop();
      } catch {
        setProcesandoExcel(false);
        setStatusMessage("❌ Error Excel");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Exportar Excel
  const handleExportExcel = () => {
    const rows = lines.map((line, idx) => ({
      item: idx + 1,
      nombre_obj1: line.nombre_obj1,
      nombre_obj2: line.nombre_obj2,
      dimension_mm: Number(line.dimension_mm || 0).toFixed(2),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Líneas");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "resultado.xlsx");
    setStatusMessage("✅ Exportado");
  };

return (
  <div className="flex gap-6 p-4">
    <div className="flex flex-col gap-3">
      <Sidebar
        onImportDXF={handleImportDXF}   // ✅ ahora pasa la función real
        onImportExcel={handleImportExcel}
        onExportExcel={handleExportExcel}
        onSaveJSON={handleSaveJSON}
        onOpenJSON={handleOpenJSON}
        toggleExtremos={() => setMostrarExtremos((s) => !s)}
        toggleCalculadora={() => setMostrarCalculadora((s) => !s)}
        toggleExcelPanel={() => setMostrarExcel((s) => !s)}
        statusMessage={statusMessage}
        procesandoExcel={procesandoExcel}
        totalCircuitos={totalCircuitos}
        circuitosProcesados={circuitosProcesados}
      />

        {mostrarExtremos && (
          <div className="p-2 border rounded">
            <h4>Opciones</h4>
            <button
              className={`btn ${eraserMode ? "bg-red-300" : "bg-white"}`}
              onClick={() => setEraserMode((s) => !s)}
            >
              🧽 {eraserMode ? "Borrador ON" : "Borrador OFF"}
            </button>
            <button
              className={`btn ml-2 ${modoAnguloRecto ? "bg-blue-200" : "bg-white"}`}
              onClick={() => setModoAnguloRecto((s) => !s)}
            >
              {modoAnguloRecto ? "Ángulo recto" : "Ángulo libre"}
            </button>
          </div>
        )}

        <LineTable lines={lines} onUpdateLine={updateLine} />
        {mostrarCalculadora && <RouteCalculator lines={lines} />}
      </div>

      <div className="flex-1">
        <div className="flex gap-2 mb-2">
          <button
            className={`btn ${pencilMode ? "bg-green-200" : "bg-white"}`}
            onClick={() => setPencilMode((s) => !s)}
          >
            ✏️ {pencilMode ? "Lápiz ON" : "Lápiz OFF"}
          </button>
          <button
            className={`btn ${eraserMode ? "bg-red-300" : "bg-white"}`}
            onClick={() => setEraserMode((s) => !s)}
          >
            🧽 {eraserMode ? "Borrador ON" : "Borrador OFF"}
          </button>
          <button className="btn" onClick={reset}>🧹 Limpiar</button>
        </div>

        <CanvasBoard
          lines={lines}
          addLine={addLine}
          updateLine={updateLine}
          removeLine={removeLine}
          pencilMode={pencilMode}
          eraserMode={eraserMode}
          modoAnguloRecto={modoAnguloRecto}
          setSelector={setSelector}
        />

        {selector && (
          <div
            className="absolute bg-white border rounded p-2"
            style={{ left: selector.x, top: selector.y }}
          >
            <p className="text-sm mb-1">Cambiar tipo:</p>
            {["Conector", "BRK", "SPL"].map((tipo) => (
              <button
                key={tipo}
                className="btn mr-1"
                onClick={() => {
                  updateLine(selector.index, selector.end === "p1" ? { obj1: tipo } : { obj2: tipo });
                  setSelector(null);
                }}
              >
                {tipo}
              </button>
            ))}
            <button className="btn bg-gray-200" onClick={() => setSelector(null)}>Cerrar</button>
          </div>
        )}
      </div>
    </div>
  );
}

