import React, { useState } from "react";
import DateTimePicker from "./DateTimePicker";
import "./StockDiaryInput.css";

function StockDiaryInput({ onClose, onFormSubmit, submitHandler }) {
  const [name, setName] = useState("");
  const [tempEntryPrice, setTempEntryPrice] = useState("");
  const [tempExitPrice, setTempExitPrice] = useState("");
  const [tempEntryDateTime, setTempEntryDateTime] = useState("");
  const [tempExitDateTime, setTempExitDateTime] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleDateTime = (d) => {
    //Wed Nov 05 2025 14:05:00 GMT+0530

    if (!d) return "";
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt.getTime())) return String(d);

    const pad = (n) => String(n).padStart(2, "0");

    const yyyy = dt.getFullYear();
    const mm = pad(dt.getMonth() + 1);
    const dd = pad(dt.getDate());
    const hh = pad(dt.getHours());
    const min = pad(dt.getMinutes());

    //format: "DD/MM/YYYYTHH:MM:SS"
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  };

  const handleSubmit = (e) => {
    // console.log("Submitting form");
    e.preventDefault();
    setErrorMessage("");
    const entryDateTime = handleDateTime(tempEntryDateTime);
    const exitDateTime = handleDateTime(tempExitDateTime);
    const entryDt =
      tempEntryDateTime instanceof Date
        ? tempEntryDateTime
        : new Date(tempEntryDateTime);
    const exitDt =
      tempExitDateTime instanceof Date
        ? tempExitDateTime
        : new Date(tempExitDateTime);
    if (isNaN(entryDt.getTime()) || isNaN(exitDt.getTime())) {
      setErrorMessage("*Please provide valid entry and exit date/time*");
      return;
    }
    if (exitDt < entryDt) {
      setErrorMessage("*Exit time cannot be earlier than entry time*");
      return;
    }
    let entryPrice = parseFloat(tempEntryPrice);
    let exitPrice = parseFloat(tempExitPrice);
    const data = {
      stock_symbol: name,
      entry_price: entryPrice,
      exit_price: exitPrice,
      entry_time: entryDateTime,
      exit_time: exitDateTime,
      description: description,
    };
    if (submitHandler) {
      submitHandler(data);
    }
    if (onFormSubmit) {
      onFormSubmit(data);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <form className="stock-diary-form" onSubmit={handleSubmit}>
      <h3>Stock Trade Diary</h3>
      <label>
        Stock/Option Name
        <input
          placeholder="Stock name (Mention in yfinance format ex:RELIANCE.NS)"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <label>
        Entry Price
        <input
          placeholder="Enter entry price"
          type="number"
          value={tempEntryPrice}
          onChange={(e) => setTempEntryPrice(e.target.value)}
          required
        />
      </label>

      <label>
        Exit Price
        <input
          placeholder="Enter exit price"
          type="number"
          value={tempExitPrice}
          onChange={(e) => setTempExitPrice(e.target.value)}
          required
        />
      </label>
      {errorMessage && (
        <div className="form-error" role="alert">
          {errorMessage}
        </div>
      )}
      <label>
        Entry Date & Time
        <div className="circular-time-picker">
          <DateTimePicker
            value={tempEntryDateTime}
            selected={tempEntryDateTime}
            onChange={setTempEntryDateTime}
            required
          />
        </div>
      </label>

      <label>
        Exit Date & Time
        <div className="circular-time-picker">
          <DateTimePicker
            value={tempExitDateTime}
            selected={tempExitDateTime}
            onChange={setTempExitDateTime}
            required
          />
        </div>
      </label>

      <label>
        Description
        <textarea
          placeholder="Add notes or trade reasoning..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <button type="submit">Save</button>
    </form>
  );
}

export default StockDiaryInput;
