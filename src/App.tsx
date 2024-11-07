import React, { useState } from "react";
import "./App.css";

interface Point {
  x: number;
  y: number;
}

interface DataSet {
  [key: string]: Point[];
}

interface GraphData {
  data: Array<{
    [key: string]: [number, number][];
  }>;
}

const randomValue = (base: number) => Math.floor(base + Math.random() * 40);

const generateData = (): GraphData => {
  const sets = 3;
  const dataPoints = 25;

  return {
    data: Array.from({ length: sets }, (_, i) => ({
      [`set${i + 1}`]: Array.from({ length: dataPoints }, (_, j): [number, number] => [
        j + 1,
        randomValue(Math.floor(Math.random() * 90)),
      ]),
    })),
  };
};

const data: GraphData = generateData();

const colors = ["#FF5733", "#4287f5", "#A9A9A9"];

const App: React.FC = () => {
  const [activeSet, setActiveSet] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    value: string;
  } | null>(null);

  const normalize = (
    val: number,
    max: number,
    min: number = 0,
    size: number = 200
  ) => ((val - min) / (max - min)) * size;

  const parseData = (data: GraphData, maxX: number, maxY: number) => {
    const normalizedData: DataSet[] = [];
    const xFactor = 600 / (maxX - 1);
    const yFactor = 200 / maxY;

    data.data.forEach((set) => {
      const [name, points] = Object.entries(set)[0];
      const normalizedPoints: Point[] = [];

      for (const [x, y] of points) {
        normalizedPoints.push({
          x: x * xFactor + 60,
          y: y * yFactor,
        });
      }

      normalizedData.push({ [name]: normalizedPoints });
    });

    return normalizedData;
  };

  const parsedData = parseData(data, 25, 90);  

  const renderLines = () => {
    const lines = parsedData.map((set, index) => {
      const [name, points] = Object.entries(set)[0];
      const pathD = points.reduce(
        (acc, point, idx) =>
          `${acc} ${idx === 0 ? "M" : "L"}${point.x},${200 - point.y}`,
        ""
      );
  
      return (
        <path
          key={name}
          d={pathD}
          className={activeSet === index ? "active" : ""}
          fill="none"
          stroke={colors[index]}
          strokeWidth={activeSet === index ? 3 : 2}
          onClick={() => setActiveSet(index)}
          style={{ cursor: "pointer" }}
        />
      );
    });

    if (activeSet !== null && lines[activeSet]) {
      const activeLine = lines[activeSet];
      lines.splice(activeSet, 1); 
      lines.push(activeLine);   
    }
  
    return lines;
  };

  const renderPoints = () => {
    return parsedData.map((set, setIndex) => {
      const [name, points] = Object.entries(set)[0];
      return points.map((point, pointIndex) => (
        <circle
          key={`${name}-${pointIndex}`}
          cx={point.x}
          cy={200 - point.y}
          r={6}
          fill={colors[setIndex]}
          onClick={() => setActiveSet(setIndex)}
          onMouseOver={(e) => {
            setTooltip({
              x: e.clientX,
              y: e.clientY,
              value: `x: ${point.x}, y: ${point.y}`,
            });
            e.currentTarget.setAttribute("r", "8");
          }}
          onMouseOut={(e) => {
            setTooltip(null);
            e.currentTarget.setAttribute("r", "6");
          }}
        />
      ));
    });
  };

  const findMaxCoordinate = (data: DataSet[], axis: 'x' | 'y') => {
    const yValues = data?.flatMap((set) => {
        return Object.values(set).flatMap((points) =>
          points.map((point) => point[axis]) 
        );
      });
  
    return Math.max(...yValues);
  };

  const renderYAxisLabels = () => {
    const maxY = findMaxCoordinate(parsedData, 'y')
    const yLabels = Array.from({ length: 10 }, (_, i) => {
      const value = Math.floor(i * (maxY - 0) / 9);
      const roundedValue = Math.floor(value / 5) * 5;
      
      return roundedValue;
    });
    
    return yLabels.map((label, index) => (
      <text
        key={index}
        x="20"
        y={200 - normalize(label, maxY, 0, 260)}
        fill="#000"
        fontSize="12"
        textAnchor="end"
      >
        {label}
      </text>
    ));
  };

  const renderXAxisLabels = () => {
    const maxX = findMaxCoordinate(parsedData, 'x')
    const xLabels = Array.from({ length: 25 }, (_, i) => {
      const value = Math.floor(i * (maxX - 0) / 24);
      const roundedValue = Math.floor(value / 5) * 5;
      
      return roundedValue;
    });
    
    return xLabels.map((label, index) => (
      <text
        key={index}
        x={normalize(label, maxX, 0, 660) + 30}
        y="220"
        fill="#000"
        fontSize="12"
        textAnchor="middle"
      >
        {label}
      </text>
    ));
  };

  return (
    <div className="graph">
      <div style={{ position: "relative", height: "500px" }}>
        <svg width="800" height="400" style={{ overflow: "visible" }}>
          {renderLines()}
          {renderPoints()}
          {renderYAxisLabels()}
          {renderXAxisLabels()}
          <line x1="30" y1="-100" x2="30" y2="200" stroke="#000" />
          <line x1="30" y1="200" x2="700" y2="200" stroke="#000" />
        </svg>
      </div>
      {tooltip && (
        <div
          className="tooltip active"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 30,
          }}
        >
          {tooltip.value}
        </div>
      )}
    </div>
  );
};

export default App;
