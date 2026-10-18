type Palette = { base: string; light: string; shadow: string };

const ink = "#342d29";
const cream = "#f5e4c5";

const gaits = [
  { back: [11, 25, 5, 4], front: [30, 25, 5, 4], farBack: [18, 24, 3, 4], farFront: [26, 24, 3, 4] },
  { back: [13, 24, 5, 4], front: [28, 25, 5, 4], farBack: [16, 25, 3, 4], farFront: [31, 24, 3, 4] },
  { back: [16, 25, 5, 4], front: [25, 24, 5, 4], farBack: [12, 24, 3, 4], farFront: [29, 25, 3, 4] },
  { back: [13, 25, 5, 4], front: [29, 25, 5, 4], farBack: [18, 24, 3, 4], farFront: [25, 24, 3, 4] },
] as const;

function Leg({ shape, fill, far = false }: { shape: readonly number[]; fill: string; far?: boolean }) {
  const [x, y, width, height] = shape;
  return <g opacity={far ? .76 : 1}>
    <rect x={x - 1} y={y - 3} width={width + 1} height={height + 3} fill={ink} />
    <rect x={x} y={y - 2} width={width - 1} height={height + 1} fill={fill} />
    <rect x={x - 1} y={y + height - 1} width={width + 2} height="2" fill={ink} />
    <rect x={x} y={y + height - 1} width={width} height="1" fill={cream} />
  </g>;
}

export default function PixelDogSprite({ coat, sleeping }: { coat: Palette; sleeping: boolean }) {
  return <svg className={`pixel-roamer-svg pixel-dog-art ${sleeping ? "is-sleeping" : ""}`} viewBox="0 0 48 32" shapeRendering="crispEdges" aria-hidden="true">
    <rect x="6" y="30" width="39" height="1" fill={ink} opacity=".17" />
    <g className="pixel-dog-tail">
      <path d="M10 15H7V14H5V12H4V9H2V13H3V16H5V18H7V19H11Z" fill={ink}/>
      <path d="M9 16H7V15H5V12H4V14H5V16H7V17H10Z" fill={coat.base}/>
      <path d="M3 9H5V12H3Z" fill={coat.light}/>
    </g>
    {gaits.map((gait, index) => <g key={index} className={`pixel-dog-frame frame-${index}`}>
      <Leg shape={gait.farBack} fill={coat.shadow} far />
      <Leg shape={gait.farFront} fill={coat.shadow} far />
      <Leg shape={gait.back} fill={coat.base} />
      <Leg shape={gait.front} fill={coat.base} />
    </g>)}
    <path d="M9 13H11V11H16V10H27V11H30V13H32V21H30V23H12V22H9V20H8V15H9Z" fill={ink}/>
    <path d="M10 14H12V12H16V11H27V12H30V14H31V20H29V22H12V21H10V19H9V15H10Z" fill={coat.base}/>
    <path d="M12 12H17V11H26V12H29V13H13V14H11V13H12Z" fill={coat.light}/>
    <path d="M12 19H15V20H27V19H30V21H28V22H13V21H11V20H12Z" fill={coat.shadow}/>
    <path d="M17 18H29V20H17Z" fill={cream}/>
    <rect x="13" y="15" width="3" height="1" fill={coat.shadow}/>
    <rect x="19" y="14" width="2" height="1" fill={coat.shadow}/>
    <rect x="25" y="15" width="2" height="1" fill={coat.shadow}/>
    <path d="M29 8H31V5H32V2H35V7H37V5H38V4H40V9H42V11H44V13H46V17H45V19H41V21H32V20H29Z" fill={ink}/>
    <path d="M32 6H33V3H34V10H32Z" fill={coat.shadow}/>
    <path d="M38 6H39V5H40V11H38Z" fill={coat.shadow}/>
    <path d="M30 9H32V8H36V10H40V11H42V13H43V18H41V20H32V19H30Z" fill={coat.base}/>
    <path d="M32 9H35V10H39V11H32Z" fill={coat.light}/>
    <path d="M37 15H43V14H45V17H44V18H38V17H36V16H37Z" fill={cream}/>
    <path d="M44 13H46V15H45V16H43V14H44Z" fill={ink}/>
    {sleeping ? <rect x="38" y="12" width="3" height="1" fill={ink}/> : <><rect x="37" y="11" width="3" height="3" fill={cream}/><rect x="39" y="12" width="1" height="2" fill={ink}/></>}
    <path d="M30 17H32V20H33V21H31V20H30Z" fill="#c44d37"/>
    <rect x="32" y="20" width="2" height="2" fill="#e7ba5f"/>
    <rect x="33" y="21" width="1" height="1" fill="#fff5d7"/>
  </svg>;
}
