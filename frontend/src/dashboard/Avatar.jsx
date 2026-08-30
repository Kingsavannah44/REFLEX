// Illustrated person avatar - deliberately not a photo. We don't have real
// photos of anyone in this data (these are demo accounts), so a photographic
// image would be presenting a fake face as if it were a real specific
// person. A flat-illustration avatar reads as human without that claim,
// similar to the default avatars Slack, Notion, or Trello give an account
// before it has a real photo.
const BG_PALETTE = ["#16A34A", "#2563EB", "#D97706", "#7C3AED", "#DC2626", "#0891B2"];
const SKIN_TONES = ["#F1C27D", "#E0AC69", "#C68642", "#8D5524"];
const HAIR_COLORS = ["#1B1B1B", "#2C1B10", "#3B2314"];

function hashOf(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
}

function pick(list, hash, salt) {
  return list[(hash + salt) % list.length];
}

// Three simple hair silhouettes: short crop, full/rounded, and a side-parted
// style framing the face. Kept geometric and minimal on purpose.
function Hair({ style, color }) {
  if (style === 0) {
    return <path d="M 26 40 Q 26 14 50 14 Q 74 14 74 40 L 74 32 Q 74 20 50 20 Q 26 20 26 32 Z" fill={color} />;
  }
  if (style === 1) {
    return <circle cx="50" cy="30" r="26" fill={color} />;
  }
  return (
    <path
      d="M 24 46 Q 22 14 50 14 Q 78 14 76 46 L 76 34 Q 76 18 50 18 Q 24 18 24 34 Z M 24 34 L 24 52 L 30 52 L 30 36 Z M 76 34 L 76 52 L 70 52 L 70 36 Z"
      fill={color}
    />
  );
}

export default function Avatar({ name, size = 36 }) {
  const safeName = name || "?";
  const hash = hashOf(safeName);
  const bg = pick(BG_PALETTE, hash, 0);
  const skin = pick(SKIN_TONES, hash, 3);
  const hairColor = pick(HAIR_COLORS, hash, 5);
  const hairStyle = (hash + 7) % 3;

  return (
    <div
      className="rounded-full overflow-hidden shrink-0"
      style={{ width: size, height: size, backgroundColor: bg }}
      title={safeName}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        {/* shoulders / shirt */}
        <path d="M 12 100 Q 12 66 50 66 Q 88 66 88 100 Z" fill="#F5F5F4" />
        {/* neck */}
        <rect x="41" y="54" width="18" height="18" fill={skin} />
        {/* head */}
        <circle cx="50" cy="42" r="24" fill={skin} />
        {/* hair, drawn after the head so it sits on top */}
        <Hair style={hairStyle} color={hairColor} />
        {/* simple eyes */}
        <circle cx="42" cy="43" r="2.4" fill="#2b2b2b" />
        <circle cx="58" cy="43" r="2.4" fill="#2b2b2b" />
        {/* simple smile */}
        <path d="M 41 52 Q 50 58 59 52" stroke="#2b2b2b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}
