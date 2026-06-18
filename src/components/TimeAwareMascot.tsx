"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type TimeSlot = "morning" | "day" | "evening" | "night";

function getTimeSlot(hour: number): TimeSlot {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 18) return "day";
  if (hour >= 18 && hour < 23) return "evening";
  return "night";
}

const GREETINGS: Record<TimeSlot, string> = {
  morning: "Доброе утро! Самое время собрать заказ на сегодня",
  day: "Привет! Чем поможем сегодня?",
  evening: "Добрый вечер! Загляните в каталог перед закрытием дня",
  night: "Работаем и ночью — заявка попадёт к менеджеру с утра",
};

// На данный момент используется единственный доступный арт маскота.
// Когда дизайнер подготовит варианты для разных состояний (зевает утром,
// бодрый днём, в пижаме вечером/ночью) — подставить пути сюда:
const MASCOT_IMAGES: Record<TimeSlot, string> = {
  morning: "/brand/mascot-wink.png",
  day: "/brand/mascot-wink.png",
  evening: "/brand/mascot-wink.png",
  night: "/brand/mascot-wink.png",
};

export function TimeAwareMascot({ className }: { className?: string }) {
  const [slot, setSlot] = useState<TimeSlot | null>(null);

  useEffect(() => {
    setSlot(getTimeSlot(new Date().getHours()));
  }, []);

  if (!slot) return null;

  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <Image src={MASCOT_IMAGES[slot]} alt="Пакетыч" width={56} height={56} className="shrink-0" />
        <p className="text-sm text-gray-600">{GREETINGS[slot]}</p>
      </div>
    </div>
  );
}
