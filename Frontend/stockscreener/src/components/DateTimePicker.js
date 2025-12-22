import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./DateTimePicker.css";

function DateTimePicker({ selected, onChange }) {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Show only times between 9 AM and 4 PM
  const filterTime = (time) => {
    const totalMinutes = time.getHours() * 60 + time.getMinutes();
    const startMinutes = 9 * 60 + 15;
    const endMinutes = 15 * 60 + 30;
    return totalMinutes > startMinutes && totalMinutes < endMinutes;
  };

  return (
    <div className="datetime-picker-container">
      <DatePicker
        selected={selected}
        onChange={onChange}
        showTimeSelect
        timeIntervals={5}
        timeFormat="hh:mm aa"
        dateFormat="dd/MM/yyyy hh:mm aa"
        placeholderText="DD/MM/YYYY hh:mm"
        className="custom-datepicker-input"
        calendarClassName="custom-calendar"
        filterTime={filterTime}
      />
    </div>
  );
}

export default DateTimePicker;
