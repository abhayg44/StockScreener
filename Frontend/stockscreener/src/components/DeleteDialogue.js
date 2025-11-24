import React from "react";
import { useNavigate } from "react-router-dom";
import "./DeleteDialogue.css";

function DeleteDialogue({ setIsDelete, setOutsideTap, id }) {
  const [loading, setLoading] = React.useState(false);
  const deleteStockDiaryEntry = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_NODE_STOCKDIARY_URL}/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      if (!response.ok) {
        setLoading(false);
        console.log("error is ", response);
        throw new Error("Failed to delete stock diary entry");
      }
      const result = await response.json();
      setLoading(false);
      // console.log("Deleted stock diary entry:", result);
    } catch (err) {
      setLoading(false);
      console.error("Error deleting stock diary entry:", err);
    }
  };
  const navigate = useNavigate();
  if (!id) {
    navigate("/stockdiary", { replace: true });
    return null;
  }
  const handleDelete = async () => {
    setIsDelete(true);
    setOutsideTap(false);
    await deleteStockDiaryEntry();
    navigate("/stockdiary", { replace: true });
  };
  const handleCancel = () => {
    setIsDelete(false);
    setOutsideTap(false);
  };

  return (
    <div
      className="delete-dialogue"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dd-title"
    >
      {loading ? (
        <div className="dd-loading">{loading && <p>Deleting...</p>}</div>
      ) : (
        <div className="dd-inner">
          <h3 id="dd-title">Delete entry</h3>
          <p className="dd-desc">Are you sure you want to delete this entry?</p>

          <div className="dd-actions">
            <button
              className="btn cancel-btn"
              type="button"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="btn delete-btn"
              type="button"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeleteDialogue;
