import React from "react";

export default function Sidebar({
  onImportDXF,
  onImportExcel,
  onExportExcel,
  onSaveJSON,
  onOpenJSON,
  toggleExtremos,
  toggleCalculadora,
  toggleExcelPanel,
  statusMessage,
  procesandoExcel,
  totalCircuitos,
  circuitosProcesados,
}) {
  return (
    <div className="w-[350px] p-4 bg-white rounded-xl shadow-md">
      <h3 className="text-center font-semibold text-lg mb-2">
        Calculadora de dimensiones
      </h3>

      <div className="flex flex-wrap gap-2 mb-3">
        <button className="btn" onClick={toggleExcelPanel}>📁 Excel</button>
        <button className="btn" onClick={toggleExtremos}>✏️ Diseño</button>
        <button className="btn" onClick={toggleCalculadora}>🧮 Calculadora</button>
      </div>

      <input type="file" accept=".dxf" id="importarDXF" className="hidden" onChange={onImportDXF} />
      <button className="btn w-full mb-2" onClick={() => document.getElementById("importarDXF").click()}>
        📐 Importar DXF
      </button>

      <div className="mb-2">
        <button className="btn mr-2" onClick={onSaveJSON}>💾 Guardar</button>
        <input type="file" accept="application/json" id="abrirArchivo" className="hidden" onChange={onOpenJSON} />
        <button className="btn" onClick={() => document.getElementById("abrirArchivo").click()}>📂 Abrir</button>
      </div>

      <hr className="my-2" />

      <input type="file" accept=".xlsx" onChange={onImportExcel} className="mb-2" />
      <button className="btn w-full mb-2" onClick={onExportExcel}>📤 Exportar Excel</button>

      <p className="text-blue-600 text-sm">{statusMessage}</p>

      {procesandoExcel && (
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto my-2"></div>
          <p className="text-sm">Procesando... {circuitosProcesados}/{totalCircuitos}</p>
        </div>
      )}
    </div>
  );
}
