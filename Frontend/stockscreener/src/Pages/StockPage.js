import axios from "axios";
import { useState, useEffect, use } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Atom } from "react-loading-indicators";
import { Line } from "react-chartjs-2";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "./StockPage.css";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Bar } from "react-chartjs-2";
import { FaInfoCircle } from "react-icons/fa";
import { SlArrowDown } from "react-icons/sl";
import { CiBookmark } from "react-icons/ci";
import { FaBookmark } from "react-icons/fa";
import {
  FaMoneyBillWave,
  FaChartBar,
  FaBalanceScale,
  FaPiggyBank,
  FaCoins,
  FaWallet,
  FaCashRegister,
} from "react-icons/fa";
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
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

function StockPage() {
  const { ticker } = useParams();
  const navigate = useNavigate();
  console.log("ticker is ", ticker);
  const [isLoading, setIsLoading] = useState(false);
  const [hist_data, setHist_data] = useState([]);
  const [yst_data, setYst_data] = useState({});
  const [fiftyTwoWeekHigh, setFiftyTwoWeekHigh] = useState(NaN);
  const [fiftyTwoWeekLow, setFiftyTwoWeekLow] = useState(NaN);
  const [market_cap, setMarket_cap] = useState(NaN);
  const [pe_ratio, setPe_ratio] = useState(NaN);
  const [div_yield, setDiv_yield] = useState(NaN);
  const [sector, setSector] = useState(NaN);
  const [industry, setIndustry] = useState(NaN);
  const [website, setWebsite] = useState(NaN);
  const [growth_data, setGrowth_data] = useState({});
  const [name, setName] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds
  const MAX_CLICKS_PER_WINDOW = 5; // Maximum 5 clicks per minute

  // Helper function to check if user exceeded rate limit
  const isRateLimited = () => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;

    if (timeSinceLastClick > RATE_LIMIT_WINDOW) {
      // Reset counter if window has passed
      setClickCount(1);
      setLastClickTime(now);
      return false;
    }

    if (clickCount >= MAX_CLICKS_PER_WINDOW) {
      return true; // Rate limited
    }

    setClickCount(clickCount + 1);
    return false;
  };

  const [httpUrl, setHttpUrl] = useState(
    `${process.env.REACT_APP_PYTHON_HISTORICAL_DATA_URL.replace(
      "{ticker}",
      ticker
    )}?period=6mo&interval=1d`
  );

  const currentPrice = yst_data.close;
  const percentagePosition =
    fiftyTwoWeekHigh && fiftyTwoWeekLow && currentPrice
      ? ((currentPrice - fiftyTwoWeekLow) /
          (fiftyTwoWeekHigh - fiftyTwoWeekLow)) *
        100
      : 0;

  const fetchIsWishlisted = async (ticker) => {
    if (unauthorized) return;
    try {
      const userString = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      console.log(
        "inside fetchiswishlist ticker is ",
        ticker,
        "user id is ",
        userString,
        " token is ",
        token
      );
      if (!userString || !token) {
        console.log("User not logged in");
        setUnauthorized(true);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return;
      }

      const user = JSON.parse(userString);
      const userId = user.id;

      const response = await axios.get(
        process.env.REACT_APP_NODE_ISWISHLIST_URL +
          `?user_id=${userId}&ticker=${ticker}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Is wishlisted response:", response.data);

      // Check the actual response structure from your backend
      if (response.data.message == "is wishlisted") {
        setIsBookmarked(true);
        console.log("ticker is wishlisted already");
      } else {
        setIsBookmarked(false);
        console.log("ticker is not wishlisted");
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error);

      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        setUnauthorized(true);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      setIsBookmarked(false);
    }
  };

  useEffect(() => {
    fetchIsWishlisted(ticker);
    setIsLoading(true);
    console.log("url is ", httpUrl);
    axios
      .get(httpUrl)
      .then((response) => {
        console.log("historical data response is ", response.data);
        setName(response.data.name);
        setHist_data(response.data.historic_data);
        setFiftyTwoWeekHigh(response.data["52w_high"]);
        setFiftyTwoWeekLow(response.data["52w_low"]);
        setMarket_cap(response.data.market_cap);
        setPe_ratio(response.data.pe_ratio);
        setDiv_yield(response.data.dividend_yield);
        setSector(response.data.sector);
        setIndustry(response.data.industry);
        setWebsite(response.data.website);
        setYst_data(response.data.yesterday_data);
        setGrowth_data(response.data.growth_data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching historical data:", error);
        console.log(error.response, error.message, error.code);
        setIsLoading(false);
      });
  }, [httpUrl]);

  const getBarData = (dataArr, label) => {
    if (!dataArr || dataArr.length === 0) {
      return null;
    }
    return {
      labels: dataArr.map((data) => data.date),
      datasets: [
        {
          label: label,
          data: dataArr.map((data) => data.value),
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const handleRemoveFromWatchlist = async (ticker) => {
    if (isBookmarkLoading) return;
    setIsBookmarkLoading(true);
    const userString = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (userString && token) {
      try {
        const userId = JSON.parse(userString).id;
        const response = await axios.delete(
          process.env.REACT_APP_NODE_WISHLIST_URL +
            `?user_id=${userId}&ticker=${ticker}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Remove from watchlist response:", response);
        setIsBookmarked(false);
        setShowSplash(true);
        setTimeout(() => setShowSplash(false), 600);
      } catch (error) {
        console.error("Error removing from watchlist:", error);
      }
    } else {
      console.log("User not logged in");
      setUnauthorized(true);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    setTimeout(() => setIsBookmarkLoading(false), 3500);
  };

  const handleAddToWatchlist = async (ticker, name, close_price, change) => {
    if (isBookmarkLoading) return;
    setIsBookmarkLoading(true);
    const userId = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")).id
      : null;
    if (userId || ticker === "") {
      try {
        const response = await axios.post(
          process.env.REACT_APP_NODE_WISHLIST_URL + `?user_id=${userId}`,
          {
            user_id: userId,
            ticker: ticker,
            name: name,
            close_price: close_price,
            change: change,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("Add to watchlist response:", response);
        setIsBookmarked(true);
        setShowSplash(true);
        setTimeout(() => setShowSplash(false), 600);
      } catch (error) {
        console.error("Error adding to watchlist:", error);
      }
    } else {
      setUnauthorized(true);
      navigate("/register");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      console.log("User not logged in");
    }
    setTimeout(() => setIsBookmarkLoading(false), 3500);
  };

  const handleTimeFrameChange = (timeFrame) => {
    setIsLoading(true);
    let period = "90d";
    let interval = "1d";
    if (timeFrame === "1Y") {
      period = "1y";
      interval = "1wk";
    } else if (timeFrame === "6M") {
      period = "6mo";
      interval = "1d";
    } else if (timeFrame === "3M") {
      period = "3mo";
      interval = "1d";
    } else if (timeFrame === "1M") {
      period = "1mo";
      interval = "1d";
    } else if (timeFrame === "5D") {
      period = "5d";
      interval = "1d";
    }
    const newUrl = `${process.env.REACT_APP_PYTHON_HISTORICAL_DATA_URL.replace(
      "{ticker}",
      ticker
    )}?period=${period}&interval=${interval}`;
    console.log("url is ", newUrl);
    setHttpUrl(newUrl);
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "N/A";
    return Number(num).toLocaleString("en-IN");
  };

  const InfoTooltip = ({ text }) => {
    return (
      <span className="tooltip-container">
        <FaInfoCircle className="info-icon" />
        <span className="tooltip-text">{text}</span>
      </span>
    );
  };

  const closePriceChartData = {
    labels: hist_data.map((data) => data.date),
    datasets: [
      {
        label: "Close Price",
        data: hist_data.map((data) => data.price),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: false,
      },
    ],
  };

  const volumeChartData = {
    labels: hist_data.map((data) => data.date),
    datasets: [
      {
        label: "Volume",
        data: hist_data.map((data) => data.volume),
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        fill: false,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <Atom color="#2d35ccff" size="medium" text="" textColor="" />
      </div>
    );
  }

  return (
    <div className="stock-page-container">
      <div className="header-controls">
        <div className="timeframe-buttons">
          <button onClick={() => handleTimeFrameChange("1Y")}>1 Year</button>
          <button onClick={() => handleTimeFrameChange("6M")}>6 Month</button>
          <button onClick={() => handleTimeFrameChange("3M")}>3 Month</button>
          <button onClick={() => handleTimeFrameChange("1M")}>1 Month</button>
          <button onClick={() => handleTimeFrameChange("5D")}>5 Day</button>
        </div>
        <div className="bookmark-container">
          Save to Watchlist
          <div
            className={`bookmark-icon ${isBookmarked ? "bookmarked" : ""} ${
              showSplash ? "splash" : ""
            } ${isBookmarkLoading ? "loading" : ""}`}
            onClick={() => {
              if (isBookmarkLoading) return;

              // Check rate limit before processing
              if (!isBookmarked && isRateLimited()) {
                alert(
                  "Too many requests. Please wait a moment before trying again."
                );
                return;
              }

              if (isBookmarked) {
                handleRemoveFromWatchlist(ticker);
              } else {
                const change = Number(
                  (hist_data[0].price - hist_data[1].price).toFixed(2)
                );
                console.log("Price change:", change);
                handleAddToWatchlist(ticker, name, hist_data[0].price, change);
              }
            }}
            style={{
              cursor: isBookmarkLoading ? "not-allowed" : "pointer",
              opacity: isBookmarkLoading ? 0.6 : 1,
            }}
          >
            {isBookmarked ? (
              <FaBookmark className="bookmark-filled" />
            ) : (
              <CiBookmark className="bookmark-outline" />
            )}
          </div>
        </div>
      </div>
      <h2>Live Stock Data for {name}</h2>
      <div className="chart-container">
        <Line data={closePriceChartData} />
      </div>
      <div className="chart-container">
        <Line data={volumeChartData} />
      </div>
      <Swiper
        spaceBetween={30}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        modules={[Navigation, Pagination]}
      >
        <SwiperSlide>
          <h3>
            <FaMoneyBillWave style={{ color: "#2d35cc", marginRight: 8 }} />
            Net Income
          </h3>
          {growth_data.net_income && (
            <Bar data={getBarData(growth_data.net_income, "Net Income")} />
          )}
        </SwiperSlide>
        <SwiperSlide>
          <h3>
            <FaChartBar style={{ color: "#2d35cc", marginRight: 8 }} />
            EBITDA
          </h3>
          {growth_data.ebitda && (
            <Bar data={getBarData(growth_data.ebitda, "EBITDA")} />
          )}
        </SwiperSlide>
        <SwiperSlide>
          <h3>
            <FaBalanceScale style={{ color: "#2d35cc", marginRight: 8 }} />
            Operating Income
          </h3>
          {growth_data.operating_income && (
            <Bar
              data={getBarData(
                growth_data.operating_income,
                "Operating Income"
              )}
            />
          )}
        </SwiperSlide>
        <SwiperSlide>
          <h3>
            <FaPiggyBank style={{ color: "#2d35cc", marginRight: 8 }} />
            Total Assets
          </h3>
          {growth_data.total_assets && (
            <Bar data={getBarData(growth_data.total_assets, "Total Assets")} />
          )}
        </SwiperSlide>
        <SwiperSlide>
          <h3>
            <FaCoins style={{ color: "#2d35cc", marginRight: 8 }} />
            Total Liabilities
          </h3>
          {growth_data.total_liabilities && (
            <Bar
              data={getBarData(
                growth_data.total_liabilities,
                "Total Liabilities"
              )}
            />
          )}
        </SwiperSlide>
        <SwiperSlide>
          <h3>
            <FaWallet style={{ color: "#2d35cc", marginRight: 8 }} />
            Net Worth
          </h3>
          {growth_data.networth && (
            <Bar data={getBarData(growth_data.networth, "Net Worth")} />
          )}
        </SwiperSlide>
        <SwiperSlide>
          <h3>
            <FaCashRegister style={{ color: "#2d35cc", marginRight: 8 }} />
            Free Cash Flow
          </h3>
          {growth_data.free_cash_flow && (
            <Bar
              data={getBarData(growth_data.free_cash_flow, "Free Cash Flow")}
            />
          )}
        </SwiperSlide>
      </Swiper>
      <ul>
        <div className="yesterday-data info-box">
          <h3>Stock Data</h3>
          <li>
            <label>Date:</label>
            {yst_data.date}
          </li>
          <li>
            <label>Close Price: </label>
            Rs.{formatNumber(yst_data.close)}
          </li>
          <li>
            <label>Today's High: </label>
            Rs.{formatNumber(yst_data.high)}
          </li>
          <li>
            <label>Today's Low: </label>
            Rs.{formatNumber(yst_data.low)}
          </li>
          <li>
            <label>Opened At: </label>
            Rs.{formatNumber(yst_data.open)}
          </li>
          <li>
            <label>Volume: </label>
            {formatNumber(yst_data.volume)}
          </li>
        </div>
        <div className="stock-info-header info-box">
          <h3>52 Week Range</h3>
          <div className="week-high-low-bar">
            <div className="bar-line"></div>
            <div
              className="price-marker"
              style={{ left: `${percentagePosition}%` }}
            >
              <div className="price-top">
                <span className="price-text">
                  Rs.{formatNumber(currentPrice)}
                </span>
                <InfoTooltip text="Current price" className="price-tooltip" />
              </div>
              <SlArrowDown className="price-arrow" />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            <span style={{ color: "#ff6b6b", fontWeight: 600 }}>
              Rs.{formatNumber(fiftyTwoWeekLow)}
              <InfoTooltip text="Lowest price over the last 52 weeks" />
            </span>
            <span style={{ color: "#4caf50", fontWeight: 600 }}>
              Rs.{formatNumber(fiftyTwoWeekHigh)}
              <InfoTooltip text="Highest price over the last 52 weeks" />
            </span>
          </div>
        </div>
        <div className="fundamental-info info-box">
          <h3>Fundamental Information</h3>
          <li>
            <label>
              Market Cap:
              <InfoTooltip text="The current market value of all of a company's outstanding stock shares" />
            </label>
            Rs.{formatNumber(market_cap)}
          </li>
          <li>
            <label>
              P/E Ratio:
              <InfoTooltip text="It is the ratio that measures a company's share price relative to its earnings per share (EPS)" />
            </label>
            {pe_ratio}
          </li>
          <li>
            <label>
              Dividend Yield:
              <InfoTooltip text="A financial ratio that shows how much a company pays out in dividends each year to its investors relative to its stock price" />
            </label>
            {div_yield}
          </li>
          <li>
            <label>
              Sector:
              <InfoTooltip text="The sector to which the company belongs" />
            </label>
            {sector}
          </li>
          <li>
            <label>Industry: </label>
            {industry}
          </li>
          <li>
            <label>Website: </label>
            {website !== "N/A" ? (
              <a href={website} target="_blank" rel="noopener noreferrer">
                {website}
              </a>
            ) : (
              "N/A"
            )}
          </li>
        </div>
      </ul>
    </div>
  );
}

export default StockPage;
