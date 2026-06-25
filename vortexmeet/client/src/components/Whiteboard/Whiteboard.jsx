// components/Whiteboard/Whiteboard.jsx
// Canvas-based collaborative whiteboard.
// Drawing events are broadcast via Socket.io so all room participants see changes instantly.

import { useRef, useState, useEffect, useCallback } from "react";
import "./Whiteboard.css";

const COLORS = ["#5b6ef5", "#12d4a0", "#f5a623", "#f04646", "#ec4899", "#a78bfa", "#ffffff", "#94a3b8"];

const Whiteboard = ({ socket, roomId, onClose }) => {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef(null);

  const [tool, setTool] = useState("pen"); // "pen" | "eraser"
  const [color, setColor] = useState("#5b6ef5");
  const [brushSize, setBrushSize] = useState(4);

  // ─── Canvas setup ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#080d1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // ─── Receive draw events from other users ─────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    socket.on("draw", (data) => {
      drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.size, data.tool);
    });

    socket.on("clear-board", () => {
      clearCanvas(false); // false = don't re-emit
    });

    return () => {
      socket.off("draw");
      socket.off("clear-board");
    };
  }, [socket]);

  // ─── Core drawing function ────────────────────────────────────────────────
  const drawLine = useCallback((x0, y0, x1, y1, lineColor, lineSize, lineTool) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = lineTool === "eraser" ? "#080d1a" : lineColor;
    ctx.lineWidth = lineTool === "eraser" ? lineSize * 4 : lineSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.closePath();
  }, []);

  // ─── Get normalized canvas coordinates ───────────────────────────────────
  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    lastPosRef.current = getCanvasPos(e);
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();

    const current = getCanvasPos(e);
    const last = lastPosRef.current;

    drawLine(last.x, last.y, current.x, current.y, color, brushSize, tool);

    // Broadcast to other users
    socket?.emit("draw", {
      roomId,
      drawData: { x0: last.x, y0: last.y, x1: current.x, y1: current.y, color, size: brushSize, tool },
    });

    lastPosRef.current = current;
  };

  const stopDraw = () => {
    isDrawingRef.current = false;
  };

  // ─── Clear board ──────────────────────────────────────────────────────────
  const clearCanvas = (broadcast = true) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#080d1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (broadcast && socket) {
      socket.emit("clear-board", { roomId });
    }
  };

  // ─── Save as PNG ──────────────────────────────────────────────────────────
  const saveBoard = () => {
    const link = document.createElement("a");
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="wb-overlay">
      <div className="wb-container fade-in">
        {/* Header */}
        <div className="wb-header">
          <span className="wb-title">🎨 Collaborative Whiteboard</span>
          <div className="wb-header-actions">
            <button className="btn btn-ghost" onClick={saveBoard}>💾 Save PNG</button>
            <button className="btn btn-ghost" onClick={() => clearCanvas(true)}>🗑️ Clear</button>
            <button className="btn-icon" onClick={onClose} style={{ fontSize: 18 }}>✕</button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="wb-toolbar">
          <button
            className={`wb-tool-btn ${tool === "pen" ? "active" : ""}`}
            onClick={() => setTool("pen")}
          >
            ✏️ Pen
          </button>
          <button
            className={`wb-tool-btn ${tool === "eraser" ? "active" : ""}`}
            onClick={() => setTool("eraser")}
          >
            🧹 Eraser
          </button>

          <div className="wb-sep" />

          {/* Color palette */}
          <div className="wb-colors">
            {COLORS.map((c) => (
              <button
                key={c}
                className={`wb-color-swatch ${color === c && tool === "pen" ? "selected" : ""}`}
                style={{ background: c }}
                onClick={() => { setColor(c); setTool("pen"); }}
              />
            ))}
          </div>

          <div className="wb-sep" />

          {/* Brush size */}
          <div className="wb-size-control">
            <span className="wb-size-label">Size: {brushSize}px</span>
            <input
              type="range"
              min="1"
              max="24"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="wb-size-slider"
            />
          </div>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={1280}
          height={680}
          className="wb-canvas"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>
    </div>
  );
};

export default Whiteboard;
