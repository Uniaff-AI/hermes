import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ru } from 'date-fns/locale';

registerLocale('ru', ru);

interface CalendarProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  onClose: () => void;
}

const CustomHeader = ({
  date,
  decreaseMonth,
  increaseMonth,
  changeYear,
  changeMonth,
}: {
  date: Date;
  decreaseMonth: () => void;
  increaseMonth: () => void;
  changeYear: (year: number) => void;
  changeMonth: (month: number) => void;
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const startYear = new Date().getFullYear() - 10;
  const years = Array.from({ length: 21 }, (_, i) => startYear + i);
  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i).toLocaleString('ru', { month: 'short' }).replace('.', '')
  );

  const handleMonthSelect = (monthIndex: number) => {
    changeMonth(monthIndex);
  };

  const handleYearSelect = (year: number) => {
    changeYear(year);
  };

  return (
    <div className="relative px-4 pt-4 pb-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-1 text-base font-semibold text-gray-800 hover:text-blue-600"
          onClick={() => setShowPicker(!showPicker)}
        >
          {date.toLocaleString('ru', { month: 'long', year: 'numeric' })}
          <motion.div animate={{ rotate: showPicker ? 180 : 0 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={decreaseMonth}
            className="p-1 rounded-md hover:bg-gray-100"
            aria-label="Previous Month"
          >
            <ChevronUp className="w-5 h-5 text-gray-600" />
          </button>
          <button
            type="button"
            onClick={increaseMonth}
            className="p-1 rounded-md hover:bg-gray-100"
            aria-label="Next Month"
          >
            <ChevronDown className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="absolute top-full left-0 right-0 z-10 bg-white shadow-lg rounded-b-lg p-4"
          >
            <div className="text-center font-semibold mb-2">{date.getFullYear()}</div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {months.map((month, index) => (
                <button
                  key={month}
                  type="button"
                  onClick={() => handleMonthSelect(index)}
                  className={`p-2 text-sm rounded-md ${index === date.getMonth()
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100'
                    }`}
                >
                  {month}
                </button>
              ))}
            </div>
            <div className="max-h-32 overflow-y-auto">
              {years.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => handleYearSelect(year)}
                  className={`w-full p-1 text-center text-sm rounded-md ${year === date.getFullYear()
                    ? 'bg-gray-200 font-semibold'
                    : 'hover:bg-gray-100'
                    }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Calendar = ({ selected, onChange, onClose }: CalendarProps) => {
  const handleClear = () => {
    onChange(null);
    onClose();
  };

  const handleToday = () => {
    const today = new Date();
    onChange(today);
    onClose();
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 shadow-lg"
      data-testid="calendar-container"
    >
      <DatePicker
        selected={selected}
        onChange={(date) => {
          onChange(date);
          if (date) {
            onClose();
          }
        }}
        inline
        locale="ru"
        calendarClassName="!border-none !shadow-none !bg-transparent"
        dayClassName={() => 'text-sm !w-9 !h-9 rounded-md hover:!bg-gray-100'}
        monthClassName={() => 'p-0'}
        className="w-full"
        renderCustomHeader={(props) => <CustomHeader {...props} />}
        weekDayClassName={() => 'text-gray-500 font-medium !w-9'}
        popperClassName="!z-30"
        calendarContainer={({ children }) => (
          <div className="p-0">
            <div className="react-datepicker__header bg-white rounded-t-lg" />
            <div className="flex w-full flex-col px-2">{children}</div>
          </div>
        )}
      />
      <div className="flex w-full justify-between items-center pt-2 pb-4 px-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleClear}
          className="flex text-sm font-medium text-blue-600 hover:underline px-3 py-1.5 rounded-md"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleToday}
          className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md"
        >
          Today
        </button>
      </div>
    </div>
  );
};