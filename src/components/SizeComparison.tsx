"use client";

// Сравнение размера пакета с привычными предметами.
// Размеры эталонных предметов в мм (примерные, для масштаба, не точные ГОСТ):
const REFERENCE_OBJECTS = [
  { name: "Бутылка вина", height: 300, width: 80, icon: "wine" },
  { name: "Коробка обуви", height: 130, width: 330, icon: "shoebox" },
  { name: "Лист А4", height: 297, width: 210, icon: "paper" },
  { name: "Гитара", height: 1000, width: 380, icon: "guitar" },
  { name: "Велосипед", height: 1050, width: 1700, icon: "bicycle" },
] as const;

function parseDimensions(dimensions: string): { w: number; h: number; d: number } | null {
  const match = dimensions.match(/(\d+)\s*[×x]\s*(\d+)\s*[×x]\s*(\d+)/);
  if (!match) return null;
  return { w: parseInt(match[1]), h: parseInt(match[2]), d: parseInt(match[3]) };
}

function pickReference(packageHeight: number) {
  // Основной эталон — всегда по близости высоты среди компактных предметов
  const compactRefs = REFERENCE_OBJECTS.filter(o => o.height <= 350);
  const primary = compactRefs.reduce((best, obj) =>
    Math.abs(obj.height - packageHeight) < Math.abs(best.height - packageHeight) ? obj : best
  );
  return primary;
}

function pickLargeAnchor(packageHeight: number) {
  // Дополнительный крупный ориентир — показываем только для XL/XXL пакетов (от 350мм),
  // чтобы было понятно "насколько пакет меньше по-настоящему крупных вещей"
  if (packageHeight < 350) return null;
  const largeRefs = REFERENCE_OBJECTS.filter(o => o.height > 350);
  return largeRefs.reduce((best, obj) =>
    Math.abs(obj.height - packageHeight) < Math.abs(best.height - packageHeight) ? obj : best
  );
}

function ReferenceIcon({ icon, className, style }: { icon: string; className?: string; style?: React.CSSProperties }) {
  if (icon === "wine") {
    return (
      <svg viewBox="0 0 24 60" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 2h6v8c0 2 2 3 2 6v40a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V16c0-3 2-4 2-6V2Z" />
        <line x1="9" y1="2" x2="15" y2="2" />
      </svg>
    );
  }
  if (icon === "shoebox") {
    return (
      <svg viewBox="0 0 60 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="6" width="56" height="16" rx="1" />
        <path d="M2 6 8 2h44l6 4" />
      </svg>
    );
  }
  if (icon === "guitar") {
    return (
      <svg viewBox="0 0 50 150" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2">
        <ellipse cx="20" cy="105" rx="16" ry="20" />
        <line x1="20" y1="70" x2="20" y2="2" />
        <line x1="14" y1="123" x2="8" y2="148" />
        <line x1="26" y1="123" x2="32" y2="148" />
      </svg>
    );
  }
  if (icon === "bicycle") {
    return (
      <svg viewBox="0 0 200 130" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="40" cy="95" r="30" />
        <circle cx="160" cy="95" r="30" />
        <line x1="40" y1="95" x2="100" y2="40" />
        <line x1="100" y1="40" x2="160" y2="95" />
        <line x1="100" y1="40" x2="75" y2="95" />
        <line x1="75" y1="95" x2="40" y2="95" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 42 60" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="38" height="56" rx="1" />
      <line x1="8" y1="14" x2="34" y2="14" />
      <line x1="8" y1="22" x2="34" y2="22" />
      <line x1="8" y1="30" x2="28" y2="30" />
    </svg>
  );
}

export function SizeComparison({ dimensions }: { dimensions: string }) {
  const parsed = parseDimensions(dimensions);
  if (!parsed) return null;

  const ref = pickReference(parsed.h);
  const largeAnchor = pickLargeAnchor(parsed.h);

  // Масштаб считаем относительно самого крупного объекта в ряду (бутылка/коробка/А4
  // или, если показываем крупный якорь, относительно него — чтобы пакет не "слипался"
  // с гитарой/велосипедом визуально, используем отдельный уменьшенный масштаб для якоря)
  const maxReal = Math.max(parsed.h, ref.height);
  const scale = 110 / maxReal;

  const bagH = parsed.h * scale;
  const bagW = parsed.w * scale;
  const refH = ref.height * scale;
  const refW = ref.width * scale;

  // Крупный якорь рисуем в отдельном, гораздо более сжатом масштабе —
  // только чтобы передать порядок величины, а не точные пропорции
  const anchorScale = largeAnchor ? 110 / largeAnchor.height : 0;
  const anchorH = largeAnchor ? largeAnchor.height * anchorScale : 0;
  const anchorW = largeAnchor ? largeAnchor.width * anchorScale : 0;

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Наглядно о размере</p>
      <div className="flex items-end justify-center gap-8 overflow-x-auto" style={{ height: 130 }}>
        <div className="flex flex-col items-center justify-end" style={{ height: 130 }}>
          <div
            className="flex items-center justify-center rounded-lg border-2 border-orange-400 bg-orange-50"
            style={{ width: Math.max(bagW, 28), height: bagH }}
          >
            <svg viewBox="0 0 24 28" className="h-1/2 w-1/2 text-orange-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 8h16l-1 16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 8Z" />
              <path d="M8 8V6a4 4 0 0 1 8 0v2" />
            </svg>
          </div>
          <span className="mt-2 text-xs font-semibold text-gray-700">Пакет</span>
        </div>

        <div className="flex flex-col items-center justify-end" style={{ height: 130 }}>
          <ReferenceIcon icon={ref.icon} className="text-gray-400" style={{ width: Math.max(refW, 24), height: refH }} />
          <span className="mt-2 text-xs text-gray-400">{ref.name}</span>
        </div>

        {largeAnchor && (
          <div className="flex flex-col items-center justify-end" style={{ height: 130 }}>
            <ReferenceIcon icon={largeAnchor.icon} className="text-gray-300" style={{ width: Math.max(anchorW, 24), height: anchorH }} />
            <span className="mt-2 text-xs text-gray-400">{largeAnchor.name}</span>
          </div>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-gray-400">{dimensions}</p>
      {largeAnchor && (
        <p className="mt-1 text-center text-[11px] text-gray-400">
          Для масштаба: этот пакет заметно компактнее {largeAnchor.name.toLowerCase()}
        </p>
      )}
    </div>
  );
}
