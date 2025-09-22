import axios from "axios";
import { useState, useEffect, use } from "react";
import { useParams } from "react-router-dom";
import { Atom } from "react-loading-indicators";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function StockPage() {
  const { ticker } = useParams();
  console.log("ticker is ", ticker);
  const [isLoading, setIsLoading] = useState(false);
  const [hist_data, setHist_data] = useState([]);
  const [fiftyTwoWeekHigh, setFiftyTwoWeekHigh] = useState(NaN);
  const [fiftyTwoWeekLow, setFiftyTwoWeekLow] = useState(NaN);
  const [market_cap, setMarket_cap] = useState(NaN);
  const [pe_ratio, setPe_ratio] = useState(NaN);
  const [div_yield, setDiv_yield] = useState(NaN);
  const [market, setMarket] = useState(NaN);
  const [sector, setSector] = useState(NaN);
  const [industry, setIndustry] = useState(NaN);
  const [website, setWebsite] = useState(NaN);
  const [long_name, setLong_name] = useState(NaN);

  const [httpUrl, setHttpUrl] = useState(
    `${process.env.REACT_APP_GO_HISTORICAL_DATA_URL.replace(
      "{ticker}",
      ticker
    )}?period=6mo&interval=1d`
  );
  useEffect(() => {
    setIsLoading(true);
    console.log("url is ", httpUrl);
    axios
      .get(httpUrl)
      .then((response) => {
        console.log("historical data response is ", response.data);
        setHist_data(response.data.historic_data);
        setFiftyTwoWeekHigh(response.data["52w_high"]);
        setFiftyTwoWeekLow(response.data["52w_low"]);
        setMarket_cap(response.data.market_cap);
        setPe_ratio(response.data.pe_ratio);
        setDiv_yield(response.data.dividend_yield);
        setMarket(response.data.market);
        setSector(response.data.sector);
        setIndustry(response.data.industry);
        setWebsite(response.data.website);
        setLong_name(response.data.longName);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching historical data:", error);
        console.log(error.response, error.message, error.code);
        setIsLoading(false);
      });
  }, [httpUrl]);

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
    const newUrl = `${process.env.REACT_APP_GO_HISTORICAL_DATA_URL.replace(
      "{ticker}",
      ticker
    )}?period=${period}&interval=${interval}`;
    console.log("url is ", newUrl);
    setHttpUrl(newUrl);
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
    <div>
      <button onClick={() => handleTimeFrameChange("1Y")}>1 Year</button>
      <button onClick={() => handleTimeFrameChange("6M")}>6 Month</button>
      <button onClick={() => handleTimeFrameChange("3M")}>3 Month</button>
      <button onClick={() => handleTimeFrameChange("1M")}>1 Month</button>
      <button onClick={() => handleTimeFrameChange("5D")}>5 Day</button>
      <h2>Live Stock Data for {ticker}</h2>
      <Line data={closePriceChartData} />
      <Line data={volumeChartData} />
      <ul>
        <li>52 Week High: {fiftyTwoWeekHigh}</li>
        <li>52 Week Low: {fiftyTwoWeekLow}</li>
        <li>Market Cap: {market_cap}</li>
        <li>P/E Ratio: {pe_ratio}</li>
        <li>Dividend Yield: {div_yield}</li>
        <li>Market: {market}</li>
        <li>Sector: {sector}</li>
        <li>Industry: {industry}</li>
        <li>
          Website:{" "}
          {website !== "N/A" ? (
            <a href={website} target="_blank" rel="noopener noreferrer">
              {website}
            </a>
          ) : (
            "N/A"
          )}
        </li>
        <li>Long Name: {long_name}</li>
      </ul>
    </div>
  );
}

export default StockPage;
