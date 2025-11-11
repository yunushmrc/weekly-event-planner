// src/utils/weekUtils.js

import { startOfWeek, addWeeks, addDays, format } from "date-fns";
import { tr } from "date-fns/locale";


// Kullanıcının sistem diline göre dinamik gün adları üret
export const daysOfWeek = (() => {
    const formatter = new Intl.DateTimeFormat("tr-TR", { weekday: "long" });
    // Haftanın Pazartesi'den başlaması için 2023-01-02 (Pazartesi) baz alınır
    const monday = new Date(2023, 0, 2);
    return Array.from({ length: 7 }, (_, i) =>
        formatter.format(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i))
    ).map(
        (d) => d.charAt(0).toUpperCase() + d.slice(1) // İlk harfi büyük yap
    );
})();

export function getWeekDates(weekOffset = 0) {
    const today = new Date();

    // Haftanın Pazartesi'sini bul (weekStartsOn: 1 → Pazartesi)
    const baseWeekStart = startOfWeek(today, { weekStartsOn: 1 });

    // weekOffset kadar hafta kaydır (negatif = geçmiş, pozitif = gelecek)
    const weekStart = addWeeks(baseWeekStart, weekOffset);

    return Array.from({ length: 7 }, (_, i) => {
        const date = addDays(weekStart, i);

        return {
            day: daysOfWeek[i],
            dateLabel: format(date, "d MMM", { locale: tr }), // örn: "11 Kas"
            year: date.getFullYear(),
            iso: format(date, "yyyy-MM-dd"), // 2025-11-03
        };
    });
}


