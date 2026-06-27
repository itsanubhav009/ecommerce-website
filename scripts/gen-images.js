const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "public", "uploads");
fs.mkdirSync(OUT, { recursive: true });

function svg({ bg, accent, accent2, label, shape }) {
  const shapes = {
    tee: `<path d="M150 150 L210 120 L256 150 L302 120 L362 150 L342 220 L312 210 L312 400 L200 400 L200 210 L170 220 Z"/>`,
    hoodie: `<path d="M150 170 L210 130 Q256 100 302 130 L362 170 L340 240 L312 228 L312 410 L200 410 L200 228 L172 240 Z"/><path d="M236 150 q20 30 40 0 l-6 70 -28 0 Z" fill="${bg}"/>`,
    bomber: `<path d="M160 150 L210 125 L256 150 L302 125 L352 150 L336 215 L312 206 L312 400 L256 400 L256 206 L256 400 L200 400 L200 206 L176 215 Z"/><line x1="256" y1="160" x2="256" y2="400" stroke="${bg}" stroke-width="6"/>`,
    pants: `<path d="M200 130 L312 130 L320 250 L300 410 L268 410 L256 270 L244 410 L212 410 L192 250 Z"/>`,
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="2" fill="${accent2}" opacity="0.35"/>
    </pattern>
  </defs>
  <rect width="512" height="512" fill="${bg}"/>
  <rect width="512" height="512" fill="url(#dots)"/>
  <g transform="translate(0,8)" fill="${accent}" stroke="#0A0A0F" stroke-width="6" stroke-linejoin="round">
    ${shapes[shape]}
  </g>
  <g transform="translate(372,372)">
    <polygon points="50,0 61,32 95,32 68,53 78,86 50,66 22,86 32,53 5,32 39,32"
      fill="#FFD400" stroke="#0A0A0F" stroke-width="5"/>
    <text x="50" y="58" font-family="Arial Black, Arial" font-size="20" font-weight="900"
      text-anchor="middle" fill="#0A0A0F">POW</text>
  </g>
  <text x="40" y="470" font-family="Arial Black, Arial" font-size="30" font-weight="900"
    fill="#F5F1E8" stroke="#0A0A0F" stroke-width="1">${label}</text>
</svg>`;
}

const items = [
  { file: "sample-hoodie.svg", bg: "#1B6FE0", accent: "#F5F1E8", accent2: "#0A0A0F", label: "HOODIE", shape: "hoodie" },
  { file: "sample-tee.svg", bg: "#E62429", accent: "#F5F1E8", accent2: "#0A0A0F", label: "TEE", shape: "tee" },
  { file: "sample-bomber.svg", bg: "#0A0A0F", accent: "#FFD400", accent2: "#E62429", label: "BOMBER", shape: "bomber" },
  { file: "sample-pants.svg", bg: "#FF2D95", accent: "#0A0A0F", accent2: "#F5F1E8", label: "CARGO", shape: "pants" },
  { file: "placeholder.svg", bg: "#11121a", accent: "#F5F1E8", accent2: "#E62429", label: "NO IMAGE", shape: "tee" },
];

for (const it of items) {
  fs.writeFileSync(path.join(OUT, it.file), svg(it));
  console.log("wrote", it.file);
}
