const POSITIONS = {
  'Centrale':      [13, 22], 'Roma Est':      [29, 12],
  'Ponte Lungo':   [45, 22], 'Colosseo':      [61, 22],
  'Testaccio':     [77, 22], 'Trastevere':    [29, 44],
  'Garbatella':    [45, 58], 'EUR Palasport': [61, 58],
  'Laurentina':    [77, 72], 'Ostiense':      [45, 72],
  'Magliana':      [29, 72], 'Acilia':        [13, 82],
  'Spinaceto':     [61, 82],
};

const W = 860, H = 500;
const p = ([x, y]) => ({ x: (x/100)*W, y: (y/100)*H });

const NetworkMap = ({ network, showLines = true }) => {
  if (!network) return null;
  const { lines, stations, segments } = network;

  const pos = {};
  for (const s of stations) {
    const c = POSITIONS[s.name];
    if (c) pos[s.id] = { ...p(c), name: s.name };
  }

  const lineCount = {};
  for (const seg of segments) {
    for (const id of [seg.from_station_id, seg.to_station_id]) {
      if (!lineCount[id]) lineCount[id] = new Set();
      lineCount[id].add(seg.line_id);
    }
  }

  const byLine = {};
  for (const seg of segments) {
    if (!byLine[seg.line_id]) byLine[seg.line_id] = { color: seg.line_color, segs: [] };
    byLine[seg.line_id].segs.push(seg);
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'auto', display:'block' }}>
      <rect width={W} height={H} fill="#0e1220" rx="12" />

      {/* Dot grid background */}
      {Array.from({length:20},(_,i) => Array.from({length:13},(_,j) => (
        <circle key={`${i}-${j}`} cx={i*46+10} cy={j*40+10} r="1" fill="rgba(255,255,255,0.035)" />
      )))}

      {/* Line tracks */}
      {showLines && Object.values(byLine).map(({ color, segs }) =>
        segs.map((seg, i) => {
          const a = pos[seg.from_station_id], b = pos[seg.to_station_id];
          if (!a || !b) return null;
          return (
            <g key={i}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth="10" strokeLinecap="round" opacity="0.12" />
              <line x1={a.x} y1={a.y+2} x2={b.x} y2={b.y+2} stroke="rgba(0,0,0,0.5)" strokeWidth="5" strokeLinecap="round" />
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth="4" strokeLinecap="round" opacity="0.95" />
            </g>
          );
        })
      )}

      {/* Planning phase faint dashes */}
      {!showLines && segments.map((seg, i) => {
        const a = pos[seg.from_station_id], b = pos[seg.to_station_id];
        if (!a || !b) return null;
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 6" />;
      })}

      {/* Station markers */}
      {stations.map(s => {
        const sp = pos[s.id];
        if (!sp) return null;
        const isInterchange = (lineCount[s.id]?.size ?? 0) > 1;
        const r = isInterchange ? 9 : 5;
        return (
          <g key={s.id}>
            {isInterchange && (
              <>
                <circle cx={sp.x} cy={sp.y} r={r+7} fill="rgba(200,255,0,0.05)" stroke="rgba(200,255,0,0.15)" strokeWidth="1" />
                <circle cx={sp.x} cy={sp.y} r={r+3} fill="#0e1220" stroke="rgba(200,255,0,0.35)" strokeWidth="1.5" />
              </>
            )}
            <circle cx={sp.x} cy={sp.y} r={r}
              fill={showLines ? '#080b14' : '#1a2035'}
              stroke={isInterchange ? '#c8ff00' : 'rgba(255,255,255,0.35)'}
              strokeWidth={isInterchange ? 2.5 : 1.5} />
            <text x={sp.x} y={sp.y-r-7} textAnchor="middle"
              fontSize={isInterchange ? '11.5' : '10'}
              fontFamily="'Space Grotesk', sans-serif"
              fontWeight={isInterchange ? '700' : '400'}
              fill={isInterchange ? '#f4f0ff' : 'rgba(255,255,255,0.5)'}>
              {s.name}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      {showLines && lines.map((line, i) => (
        <g key={line.id} transform={`translate(16,${H-14-(lines.length-1-i)*22})`}>
          <rect width="22" height="5" rx="2.5" fill={line.color} y="-2.5" filter={`drop-shadow(0 0 4px ${line.color}88)`} />
          <text x="30" fontSize="10.5" fill="rgba(255,255,255,0.45)" fontFamily="'Space Grotesk', sans-serif" dominantBaseline="middle">{line.name}</text>
        </g>
      ))}
    </svg>
  );
};

export default NetworkMap;