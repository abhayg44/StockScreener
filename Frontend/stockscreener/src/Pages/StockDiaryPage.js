import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import StockDiaryInput from "../components/StockDiaryInput";
import { Line, Bar, Pie } from "react-chartjs-2";
import { FiTrash2, FiEdit2 } from "react-icons/fi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from "chart.js";
import "./StockDiaryPage.css";
import DeleteDialogue from "../components/DeleteDialogue";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
);

function StockDiaryPage() {
  const [entryData, setEntryData] = useState(null);
  const [formData, setFormData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stockData, setStockData] = useState([]);
  const [isDelete, setIsDelete] = useState(false);
  const [outsideTap, setOutsideTap] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockLoadTimeoutReached, setStockLoadTimeoutReached] = useState(false);
  const location = useLocation();
  const { ticker, entry, exit } = location.state || {};
  const { id } = useParams();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    if (!id || !ticker || !entry || !exit) return;
    const load = async () => {
      await fetchStockDiaryEntryById(id);
      await fetchStockData(ticker, entry, exit);
    };
    load();
  }, [id, ticker, entry, exit]);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchStockData = async (ticker, entry, exit) => {
    const base = process.env.REACT_APP_FASTAPI_STOCKDATA_URL;
    const url = `${base}/${ticker}?entry=${encodeURIComponent(
      entry
    )}&exit=${encodeURIComponent(exit)}`;

    setStockLoading(true);
    setStockLoadTimeoutReached(false);

    try {
      await sleep(2000);
      const response = await fetch(url);
      const resp = await response.json().catch(() => null);

      if (!response.ok || !resp) {
        console.error("Error fetching stock data:", response.status, resp);
        setStockData([]);
        return;
      }

      const data = resp.data || resp;
      setStockData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching stock data:", err);
      setStockData([]);
    } finally {
      setStockLoading(false);
    }
  };

  const fetchStockDiaryEntryById = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const base = process.env.REACT_APP_NODE_STOCKDIARY_URL;
      const url = `${base}/${id}`;
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        credentials: "include",
      });
      const resp = await response.json().catch(() => null);

      if (!response.ok || !resp) {
        console.error(
          "Error fetching stock diary entry:",
          response.status,
          resp
        );
        setEntryData(null);
        return;
      }

      setEntryData(resp.data);
    } catch (err) {
      console.error("Error fetching stock diary entry by id:", err);
      setEntryData(null);
    }
  };

  const editStockDiaryEntry = async (data) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_NODE_STOCKDIARY_URL}/${entryData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) throw new Error("Failed to edit stock diary entry");

      const result = await response.json();
      console.log("Edited stock diary entry:", result);
      fetchStockDiaryEntryById(entryData.id);
      fetchStockData(entryData.stock_symbol, data.entry_time, data.exit_time);
    } catch (err) {
      console.error("Error editing stock diary entry:", err);
    }
  };

  const handleDelete = () => setIsDelete(true);

  const computeGain = (entryPrice, exitPrice) => {
    if (entryPrice == null || exitPrice == null)
      return { gain: null, pct: null };
    const gain = Number((Number(exitPrice) - Number(entryPrice)).toFixed(2));
    const pct =
      entryPrice && Number(entryPrice) !== 0
        ? Number(((gain / Number(entryPrice)) * 100).toFixed(2))
        : null;
    return { gain, pct };
  };

  const gainInfo = computeGain(entryData?.entry_price, entryData?.exit_price);

  const closePriceChartData = {
    labels: stockData.map((d) => {
      const t = new Date(d.datetime);
      return t.toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }),
    datasets: [
      {
        label: "Close Price",
        data: stockData.map((d) => d.close),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const handleDeleteDialogueOutsideClick = () => setOutsideTap(true);

  return (
    <div className="stock-diary-page">
      <div className="page-content" aria-hidden={isDelete}>
        <h1>Stock Diary Entry Details</h1>
        <div className="action-buttons" aria-hidden={false}>
          <button
            className="action-btn edit-btn"
            title="Edit entry"
            onClick={openModal}
          >
            <FiEdit2 size={18} />
          </button>
          <button
            className="action-btn delete-btn"
            title="Delete entry"
            onClick={handleDelete}
          >
            <FiTrash2 size={18} />
          </button>
        </div>

        {isModalOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={closeModal}>
                ✕
              </button>
              <StockDiaryInput
                onClose={closeModal}
                onFormSubmit={setFormData}
                submitHandler={editStockDiaryEntry}
                initialData={entryData}
              />
            </div>
          </div>
        )}
      </div>

      {isDelete && (
        <div
          className="backdrop-overlay"
          onClick={() => handleDeleteDialogueOutsideClick(false)}
        >
          <div className="backdrop-inner" onClick={(e) => e.stopPropagation()}>
            <DeleteDialogue
              setIsDelete={setIsDelete}
              setOutsideTap={setOutsideTap}
              id={entryData?.id || null}
            />
            {outsideTap && <p>Please confirm deletion by choosing an option</p>}
          </div>
        </div>
      )}

      {stockLoading ? (
        <div className="loading">Loading stock data...</div>
      ) : stockData.length > 0 ? (
        <div className="main-chart-wrap">
          <Line
            data={closePriceChartData}
            options={{
              responsive: true,
              scales: {
                x: {
                  title: { display: true, text: "Date & Time" },
                  ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 },
                },
                y: {
                  title: { display: true, text: "Price (₹)" },
                },
              },
            }}
          />
        </div>
      ) : (
        <p>
          No stock data available for the given Stock Symbol. (Please enter a
          valid stock symbol for yfinance)
        </p>
      )}

      {entryData ? (
        <div className="content-box">
          <div className="entry-details">
            <p>
              <strong>Stock Symbol:</strong> {entryData.stock_symbol}
            </p>
            <p>
              <strong>Entry Price:</strong> {entryData.entry_price}
            </p>
            <p>
              <strong>Exit Price:</strong> {entryData.exit_price}
            </p>
            <p>
              <strong>Gain/Loss:</strong> {gainInfo.gain}
            </p>
            <p>
              <strong>Percentage Gain/Loss:</strong> {gainInfo.pct}%
            </p>
            <p>
              <strong>Entry date/time:</strong> {entryData.entry_time}
            </p>
            <p>
              <strong>Exit date/time:</strong> {entryData.exit_time}
            </p>
            <p>
              <strong>Description:</strong> {entryData.description}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(entryData.created_at).toLocaleString()}
            </p>
            <p>
              <strong>Recently Updated At:</strong>{" "}
              {new Date(entryData.updated_at).toLocaleString()}
            </p>
          </div>
        </div>
      ) : (
        <p>Loading entry data...</p>
      )}
    </div>
  );
}

export default StockDiaryPage;
