import React, { useEffect, useState } from "react";
import StockDiaryInput from "../components/StockDiaryInput";
import "./StockDiary.css";
import { Link } from "react-router-dom";
import { Atom } from "react-loading-indicators";


function StockDiary() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(3);
  const [totalPages, setTotalPages] = useState(null);
  const [totalCount, setTotalCount] = useState(null);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  // console.log("rendering stock diary component");

  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      // console.log("Parent received form data:", formData);
    }
  }, [formData]);

  const formatDateTimeForData = (val) => {
    if (!val) return "";
    const [date, time] = val.split(" ");
    return `${date}T${time}`;
  };

  const fetchStockDiaryData = async (p = page, l = limit) => {
    setLoading(true);
    try {
      const base = process.env.REACT_APP_NODE_STOCKDIARY_URL;
      const url = `${base}?page=${p}&limit=${l}`;
      // console.log("fetchStockDiaryData url:", url);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        credentials: "include",
      });

      const text = await response.text();
      let resp = null;
      try {
        resp = text ? JSON.parse(text) : null;
      } catch (e) {
        console.warn("Failed to parse response JSON:", text);
      }
      if (!response.ok) {
        console.error("Backend returned error", response.status, resp || text);
        setData([]);
        setTotalPages(null);
        setTotalCount(null);
        return;
      }

      const list = (resp && resp.data && resp.data.entries) || resp || [];
      setData(Array.isArray(list) ? list : []);

      const tCount =
        resp &&
        resp.data &&
        (resp.data.total_count ||
          resp.data.total ||
          resp.data.totalItems ||
          resp.data.count);
      if (typeof tCount === "number") {
        setTotalCount(tCount);
        setTotalPages(Math.max(1, Math.ceil(tCount / l)));
      } else {
        if (Array.isArray(list) && list.length < l) {
          setTotalPages(p);
        } else {
          setTotalPages(null);
        }
        setTotalCount(null);
      }
    } catch (err) {
      console.error("Error fetching stock diary data:", err);
      setData([]);
      setTotalPages(null);
      setTotalCount(null);
    } finally {
      setLoading(false);
    }
  };

  const createStockDiaryEntry = async (data) => {
    try {
      const response = await fetch(process.env.REACT_APP_NODE_STOCKDIARY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(data),
      });
      // console.log("response is ", response);
      if (!response.ok) {
        throw new Error("Failed to create stock diary entry");
      }
      const result = await response.json();
      // console.log("Created stock diary entry:", result);
      fetchStockDiaryData(page, limit);
    } catch (err) {
      console.error("Error creating stock diary entry:", err);
    }
  };

  useEffect(() => {
    fetchStockDiaryData(page, limit);
  }, [page, limit]);

  const formatDateTime = (val) => {
    if (!val) return "-";
    if (typeof val === "string" && /^\d{2}\/\d{2}\/\d{4}/.test(val)) return val;
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(
      d.getMonth() + 1
    )}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

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

  const goToPage = (p) => {
    if (p < 1) p = 1;
    if (totalPages && p > totalPages) p = totalPages;
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    if (!totalPages) return null;
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  if (loading){
      return (
        <div className="loading-overlay">
          <Atom color="#2d35ccff" size="medium" text="" textColor="" />
        </div>
      );
  }

  return (
    <div className="stock-diary-page">
      <div className="sd-header">
        <h2>Stock Diary</h2>
        <button className="create-btn" onClick={openModal}>
          Create New +
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
              submitHandler={createStockDiaryEntry}
            />
          </div>
        </div>
      )}

      <div className="sd-container">
        {loading ? (
          <div className="sd-empty">Loading...</div>
        ) : data.length === 0 ? (
          <div className="sd-empty">No diary entries yet</div>
        ) : (
          <div className="sd-grid">
            {data.map((e) => {
              const { gain, pct } = computeGain(e.entry_price, e.exit_price);
              const key = e._id || e.id || `${e.stock_symbol}-${e.updated_at}`;
              return (
                <div className="sd-tile" key={key}>
                  <Link
                    to={`/stockdiary/${key}`}
                    state={{
                      ticker: e.stock_symbol,
                      entry: formatDateTimeForData(e.entry_time),
                      exit: formatDateTimeForData(e.exit_time),
                    }}
                  >
                    <div className="sd-row header">
                      <div className="symbol">{e.stock_symbol}</div>
                      <div
                        className={`gain ${
                          gain >= 0 ? "positive" : "negative"
                        }`}
                      >
                        {gain == null ? "-" : `${gain}`}
                      </div>
                    </div>

                    <div className="sd-row small">
                      <div className="label">Gain %</div>
                      <div className="value">
                        {pct == null ? "-" : `${pct}%`}
                      </div>
                    </div>

                    <div className="sd-row small">
                      <div className="label">Entry</div>
                      <div className="value">
                        {formatDateTime(e.entry_time)}
                      </div>
                    </div>
                    <div className="sd-row small">
                      <div className="label">Exit</div>
                      <div className="value">{formatDateTime(e.exit_time)}</div>
                    </div>
                    <div className="sd-row small">
                      <div className="label">Updated</div>
                      <div className="value">
                        {formatDateTime(e.updated_at)}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* pagination block */}
      <div className="sd-pagination">
        <div className="sd-pagination-info">
          Page {page}
          {totalPages ? ` of ${totalPages}` : ""}
          {totalCount ? ` • ${totalCount} items` : ""}
        </div>

        <div className="sd-pagination-controls">
          <button
            className="pg-btn"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
          >
            Prev
          </button>
          {getPageNumbers() &&
            getPageNumbers().map((p) => (
              <button
                key={p}
                className={`pg-btn ${p === page ? "active" : ""}`}
                onClick={() => goToPage(p)}
              >
                {p}
              </button>
            ))}

          <button
            className="pg-btn"
            onClick={() => goToPage(page + 1)}
            disabled={totalPages ? page >= totalPages : false}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default StockDiary;
