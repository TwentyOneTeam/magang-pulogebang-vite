import { useState } from 'react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value: string; // Format: YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pilih tanggal',
  disabled = false,
  minDate
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(value ? new Date(value) : new Date());
  
  const date = value ? new Date(value) : undefined;
  const displayDate = date ? format(date, 'dd-MM-yyyy', { locale: id }) : placeholder;
  const currentYear = month.getFullYear();

  const handleSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const formattedDate = format(newDate, 'yyyy-MM-dd');
      onChange(formattedDate);
      setOpen(false);
    }
  };

  const handlePrevYear = (e: React.MouseEvent) => {
    e.preventDefault();
    const newDate = new Date(month);
    newDate.setFullYear(newDate.getFullYear() - 1);
    setMonth(newDate);
  };

  const handleNextYear = (e: React.MouseEvent) => {
    e.preventDefault();
    const newDate = new Date(month);
    newDate.setFullYear(newDate.getFullYear() + 1);
    setMonth(newDate);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="w-full justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayDate}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevYear}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-default hover:bg-transparent text-base font-semibold"
          >
            {currentYear}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextYear}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={(date) => {
            if (!minDate) return false;
            return date < minDate;
          }}
          month={month}
          onMonthChange={setMonth}
          locale={id}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
