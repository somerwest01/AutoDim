import React, { useState, useRef, useCallback } from "react";
import { Stage, Layer, Line, Text, Rect, Circle, RegularPolygon } from "react-konva";

export default function CanvasBoard({
  lines,
  addLine,
  updateLine,
  removeLine,
  pencilMode,
  eraserMode,
  modoAnguloRecto,
  setSelector,
}) {
  const [points, setPoints] = useState([]);
  const [mousePos, setMousePos] = useState(null);
  const [tempLine, setTempLine] = useState(null);
  const [dimensionInputPos, setDimensionInputPos] = useState(null);
  const [dimension, setDimension] = useState("");
  const [hoveredObj, setHoveredObj] = useState(null);

  const canvasRef = useRef();
  const proximityThreshold = 35;

  const getClosestEndpoint = useCallback(
    (pos) => {
      let closest = null;
      let minDist = Infinity;
      lines.forEach((line) => {
        ["p1", "p2"].forEach((end) => {
          const point = line[end];
          const dist = Math.hypot(pos.x - point.x, pos.y - point.y);
          if (dist < proximityThreshold && dist < minDist) {
            closest = { point, obj: line[end === "p1" ? "obj1" : "obj2"] };
            minDist = dist;
          }
        });
      });
      return closest;
    },
    [lines]
  );

  const handleStageClick = useCallback(
    (e) => {
      const stage = e.target.getStage();
      const pos = stage.getPointerPosition();
      if (!pencilMode || eraserMode) return;

      if (points.length === 0) {
        const snap = getClosestEndpoint(pos);
        if (snap) setPoints([snap.point]);
        else setPoints([pos]);
      } else {
        let adjustedPos = { ...pos };
        if (modoAnguloRecto) {
          const p1 = points[0];
          const dx = Math.abs(pos.x - p1.x);
          const dy = Math.abs(pos.y - p1.y);
          if (dx > dy) adjustedPos.y = p1.y;
          else adjustedPos.x = p1.x;
        }

        const newLine = {
          p1: points[0],
          p2: adjustedPos,
          obj1: "Ninguno",
          obj2: "Ninguno",
          nombre_obj1: "",
          nombre_obj2: "",
          dimension_mm: null,
          deduce1: "",
          deduce2: "",
        };

        setTempLine(newLine);
        setDimensionInputPos(pos);
        setPoints([]);
        setMousePos(null);
      }
    },
    [pencilMode, eraserMode, points, getClosestEndpoint, modoAnguloRecto]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!pencilMode || points.length !== 1 || eraserMode) return;
      const stage = e.target.getStage();
      const pos = stage.getPointerPosition();
      const p1 = points[0];
      let adjustedPos = { ...pos };
      if (modoAnguloRecto) {
        const dx = Math.abs(pos.x - p1.x);
        const dy = Math.abs(pos.y - p1.y);
        if (dx > dy) adjustedPos.y = p1.y;
        else adjustedPos.x = p1.x;
      }
      setMousePos(adjustedPos);
    },
    [pencilMode, points, eraserMode, modoAnguloRecto]
  );

  const confirmDimension = useCallback(() => {
    if (!tempLine) return;
    tempLine.dimension_mm = Number(dimension) || null;
    addLine(tempLine);
    setTempLine(null);
    setDimension("");
    setDimensionInputPos(null);
  }, [tempLine, dimension, addLine]);

  const renderObjeto = useCallback(
    (tipo, x, y, key, index, end) => {
      const common = {
        key,
        x,
        y,
        fill:
          hoveredObj === key
            ? "yellow"
            : tipo === "Conector"
            ? "orange"
            : tipo === "BRK"
            ? "red"
            : "green",
        onMouseEnter: () => setHoveredObj(key),
        onMouseLeave: () => setHoveredObj(null),
        onClick: () => setSelector({ x, y, index, end }),
      };
      switch (tipo) {
        case "Conector":
          return <Rect {...common} x={x - 5} y={y - 5} width={10} height={10} />;
        case "BRK":
          return <Circle {...common} radius={6} />;
        case "SPL":
          return <RegularPolygon {...common} sides={3} radius={7} />;
        default:
          return null;
      }
    },
    [hoveredObj, setSelector]
  );

  return (
    <div className="relative">
      <div
        id="canvas-wrap"
        className="w-[800px] h-[600px] bg-white border-2 border-gray-300 rounded-md shadow-md"
      >
        <Stage
          width={800}
          height={600}
          onClick={handleStageClick}
          onMouseMove={handleMouseMove}
          ref={canvasRef}
        >
          <Layer>
            {lines.map((line, i) => (
              <React.Fragment key={i}>
                <Line
                  points={[line.p1.x, line.p1.y, line.p2.x, line.p2.y]}
                  stroke="black"
                  strokeWidth={2}
                  onClick={() => removeLine(i)}
                />
                <Text
                  x={(line.p1.x + line.p2.x) / 2}
                  y={(line.p1.y + line.p2.y) / 2 - 10}
                  text={`${line.dimension_mm ?? ""}`}
                  fontSize={10}
                  fill="blue"
                />
                {line.nombre_obj1 && (
                  <Text
                    x={line.p1.x + 5}
                    y={line.p1.y - 15}
                    text={line.nombre_obj1}
                    fontSize={10}
                  />
                )}
                {line.nombre_obj2 && (
                  <Text
                    x={line.p2.x + 5}
                    y={line.p2.y - 15}
                    text={line.nombre_obj2}
                    fontSize={10}
                  />
                )}
                {renderObjeto(line.obj1, line.p1.x, line.p1.y, `obj1-${i}`, i, "p1")}
                {renderObjeto(line.obj2, line.p2.x, line.p2.y, `obj2-${i}`, i, "p2")}
              </React.Fragment>
            ))}

            {points.length === 1 && mousePos && !eraserMode && (
              <Line
                points={[points[0].x, points[0].y, mousePos.x, mousePos.y]}
                stroke="gray"
                dash={[4, 4]}
                strokeWidth={1}
              />
            )}
          </Layer>
        </Stage>
      </div>

      {dimensionInputPos && (
        <div
          className="absolute bg-white border border-gray-400 rounded-md p-2"
          style={{ left: dimensionInputPos.x, top: dimensionInputPos.y }}
        >
          <label className="text-xs">Dim (mm): </label>
          <input
            type="number"
            className="border px-1 w-20 text-sm"
            value={dimension}
            onChange={(e) => setDimension(e.target.value)}
          />
          <button
            className="ml-2 px-2 py-0.5 text-xs bg-blue-500 text-white rounded"
            onClick={confirmDimension}
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
}
