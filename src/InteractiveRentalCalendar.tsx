import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Info, ShieldCheck, Check } from 'lucide-react';
import { RentalDuration } from '../types';

interface InteractiveRentalCalendarProps {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  selectedDuration: RentalDuration;
  onChangeDates: (start: string, end: string, duration: RentalDuration) => void;
  fourDaysPrice: number;
  tenDaysPrice: number;
  monthlyPrice: number;
}

export const InteractiveRentalCalendar: React.FC<InteractiveRentalCalendarProps> = ({
  startDate,
  endDate,
  selectedDuration,
  onChangeDates,
  fourDaysPrice,
  tenDaysPrice,
  monthlyPrice
}) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Blackout dates simulation (e.g. dates reserved for sanitization)
  const blackoutDates: string[] = [
    new Date(today.getTime() + 86400000 * 12).toISOString().split('T')[0],
    new Date(today.getTime() + 86400000 * 13).toISOString().split('T')[0],
    new Date(today.getTime() + 86400000 * 14).toISOString().split('T')[0],
  ];

  // Helper formatting
  const formatDateString = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDateString = (str: string): Date => {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const calcEndDateForDuration = (startStr: string, dur: RentalDuration): string => {
    const start = parseDateString(startStr);
    let days = 4;
    if (dur === '10_days') days = 10;
    if (dur === 'monthly') days = 30;
    const end = new Date(start.getTime() + 86400000 * days);
    return formatDateString(end);
  };

  const handleSelectStartDate = (dateStr: string) => {
    if (blackoutDates.includes(dateStr)) return;
    const newEnd = calcEndDateForDuration(dateStr, selectedDuration);
    onChangeDates(dateStr, newEnd, selectedDuration);
  };

  const handleSelectDurationPreset = (dur: RentalDuration) => {
    const newEnd = calcEndDateForDuration(startDate, dur);
    onChangeDates(startDate, newEnd, dur);
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Calendar rendering math
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray: (string | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dObj = new Date(year, month, d);
    daysArray.push(formatDateString(dObj));
  }

  const startObj = parseDateString(startDate);
  const endObj = parseDateString(endDate);
  const todayStr = formatDateString(today);

  // Calculate rental price based on current duration
  const currentPrice = selectedDuration === '4_days' 
    ? fourDaysPrice 
    : selectedDuration === '10_days' 
    ? tenDaysPrice 
    : monthlyPrice;

  const durationDays = selectedDuration === '4_days' ? 4 : selectedDuration === '10_days' ? 10 : 30;

  return (
    <div className="bg-[#111111] border border-white/10 p-5 rounded-2xl space-y-4 text-white">
      {/* Header & Duration Quick Switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-white/80" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-white">ปฏิทินเลือกระยะเวลาการเช่า</h3>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 bg-[#0A0A0A] p-1 border border-white/10 rounded-lg">
          <button
            type="button"
            onClick={() => handleSelectDurationPreset('4_days')}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
              selectedDuration === '4_days'
                ? 'bg-white text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            4 วัน (฿{fourDaysPrice.toLocaleString()})
          </button>
          <button
            type="button"
            onClick={() => handleSelectDurationPreset('10_days')}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
              selectedDuration === '10_days'
                ? 'bg-white text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            10 วัน (฿{tenDaysPrice.toLocaleString()})
          </button>
          <button
            type="button"
            onClick={() => handleSelectDurationPreset('monthly')}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
              selectedDuration === 'monthly'
                ? 'bg-white text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            30 วัน (฿{monthlyPrice.toLocaleString()})
          </button>
        </div>
      </div>

      {/* Month Switcher Bar */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1.5 text-white/60 hover:text-white border border-white/10 bg-[#0A0A0A] rounded hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs font-bold uppercase tracking-widest text-white">{monthName}</span>

        <button
          type="button"
          onClick={nextMonth}
          className="p-1.5 text-white/60 hover:text-white border border-white/10 bg-[#0A0A0A] rounded hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div>
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => (
            <span key={day} className="text-[9px] font-bold uppercase tracking-widest text-white/40">
              {day}
            </span>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {daysArray.map((dateStr, idx) => {
            if (!dateStr) {
              return <div key={`empty_${idx}`} className="h-9" />;
            }

            const isPast = dateStr < todayStr;
            const isBlackout = blackoutDates.includes(dateStr);
            const isStart = dateStr === startDate;
            const isEnd = dateStr === endDate;
            const isInRange = dateStr >= startDate && dateStr <= endDate;

            let cellClass = "h-9 flex items-center justify-center text-xs font-semibold rounded transition-all relative ";

            if (isPast || isBlackout) {
              cellClass += "text-white/20 bg-white/5 cursor-not-allowed line-through ";
            } else if (isStart || isEnd) {
              cellClass += "bg-white text-black font-extrabold shadow-md z-10 ";
            } else if (isInRange) {
              cellClass += "bg-white/20 text-white font-bold ";
            } else {
              cellClass += "bg-[#0A0A0A] text-white/80 hover:bg-white/10 cursor-pointer border border-white/5 ";
            }

            const dayNum = parseInt(dateStr.split('-')[2], 10);

            return (
              <button
                key={dateStr}
                type="button"
                disabled={isPast || isBlackout}
                onClick={() => handleSelectStartDate(dateStr)}
                onMouseEnter={() => setHoveredDate(dateStr)}
                onMouseLeave={() => setHoveredDate(null)}
                className={cellClass}
                title={isBlackout ? 'ปิดปรับปรุงทำความสะอาด' : isPast ? 'วันที่ผ่านมาแล้ว' : `เริ่มเช่าวันที่ ${dateStr}`}
              >
                <span>{dayNum}</span>

                {isBlackout && (
                  <span className="absolute bottom-0.5 w-1 h-1 bg-rose-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Dates Summary & Return Cutoff Banner */}
      <div className="p-3.5 bg-[#0A0A0A] border border-white/10 rounded-xl space-y-2 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">ช่วงเวลาการเช่า ({durationDays} วัน)</p>
            <p className="text-xs font-bold text-white uppercase tracking-wider">
              {startDate} <span className="text-white/40">ถึง</span> {endDate}
            </p>
          </div>

          <div className="text-right sm:text-right">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">กำหนดคืนรองเท้าภายใน</p>
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1 justify-end sm:justify-end">
              <Clock className="w-3 h-3" />
              <span>วันที่ {endDate} เวลา 17:00 น.</span>
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/60 uppercase tracking-wider">
          <span>ค่าเช่า: <strong>฿{currentPrice.toLocaleString()}</strong></span>
          <span>รวมลาเบลส่งคืนพัสดุล่วงหน้าส่งฟรี ✔</span>
        </div>
      </div>
    </div>
  );
};
