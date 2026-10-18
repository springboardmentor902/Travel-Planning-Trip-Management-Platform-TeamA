import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { budgetAPI } from "../utils/api";

function CreateTrip() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 1,
    budget: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Please enter a trip name.");
      return false;
    }

    if (!formData.destination.trim()) {
      setError("Please enter a destination.");
      return false;
    }

    if (!formData.startDate) {
      setError("Please select a start date.");
      return false;
    }

    if (!formData.endDate) {
      setError("Please select an end date.");
      return false;
    }

    if (formData.endDate < formData.startDate) {
      setError("End date cannot be before start date.");
      return false;
    }

    if (Number(formData.travelers) < 1) {
      setError("Number of travelers must be at least 1.");
      return false;
    }

    if (
      formData.budget !== "" &&
      Number(formData.budget) < 0
    ) {
      setError("Budget cannot be negative.");
      return false;
    }

    return true;
  };

  // =========================================================
  // CREATE TRIP + CREATE BUDGET
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    // Check login
    const token = localStorage.getItem("token");

    if (!token) {
      setError(
        "Your session has expired. Please login again."
      );

      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      // =================================================
      // STEP 1: CREATE TRIP
      // =================================================

      const tripPayload = {
        title: formData.title.trim(),

        destination:
          formData.destination.trim(),

        startDate:
          formData.startDate,

        endDate:
          formData.endDate,

        totalBudget:
          formData.budget === ""
            ? null
            : Number(formData.budget),

        status: "PLANNING",

        description: `${Number(
          formData.travelers
        )} traveler${Number(formData.travelers) === 1
            ? ""
            : "s"
          }`,
      };

      console.log(
        "Creating trip:",
        tripPayload
      );

      const response = await api.post(
        "/api/trips",
        tripPayload
      );

      const createdTrip = response.data;

      console.log(
        "Trip created successfully:",
        createdTrip
      );

      // =================================================
      // STEP 2: CREATE BUDGET
      // =================================================

      if (
        createdTrip?.id &&
        formData.budget !== "" &&
        Number(formData.budget) > 0
      ) {
        const budgetPayload = {
          totalAmount:
            Number(formData.budget),

          currency: "INR",

          transportationBudget: 0,

          hotelBudget: 0,

          foodBudget: 0,

          shoppingBudget: 0,

          entertainmentBudget: 0,

          miscBudget: 0,
        };

        console.log(
          "Creating budget:",
          budgetPayload
        );

        try {
          await budgetAPI.create(
            createdTrip.id,
            budgetPayload
          );

          console.log(
            "Budget created successfully."
          );
        } catch (budgetError) {
          console.error(
            "Budget creation error:",
            budgetError
          );

          console.error(
            "Budget backend response:",
            budgetError.response?.data
          );

          /*
           * Trip was already created successfully.
           * We don't delete the trip if budget creation
           * fails. User can configure the budget later
           * from the Budget page.
           */
        }
      }

      // =================================================
      // STEP 3: SAVE CURRENT TRIP
      // =================================================

      localStorage.setItem(
        "tripnest_current_trip",
        JSON.stringify(createdTrip)
      );

      // =================================================
      // SUCCESS
      // =================================================

      setSuccess(
        "Trip and budget created successfully! 🎉"
      );

      // Go to My Trips
      setTimeout(() => {
        navigate("/trips");
      }, 800);

    } catch (err) {
      console.error(
        "Create trip error:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      // =================================================
      // ERROR HANDLING
      // =================================================

      if (err.response) {
        const status =
          err.response.status;

        if (status === 401) {
          setError(
            "Your session has expired. Please login again."
          );

          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          setTimeout(() => {
            navigate("/login");
          }, 1000);

          return;
        }

        if (status === 403) {
          setError(
            "You are not authorized to create a trip."
          );

          return;
        }

        if (status === 400) {
          setError(
            err.response.data?.message ||
            "Invalid trip details. Please check your input."
          );

          return;
        }

        setError(
          err.response.data?.message ||
          "Unable to create trip. Please try again."
        );

      } else if (err.request) {
        setError(
          "Unable to connect to the backend. Make sure Spring Boot is running on port 8080."
        );

      } else {
        setError(
          "Something went wrong while creating the trip."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CALCULATE DAYS
  // =========================================================

  const calculateDays = () => {
    if (
      !formData.startDate ||
      !formData.endDate
    ) {
      return "--";
    }

    const start =
      new Date(formData.startDate);

    const end =
      new Date(formData.endDate);

    const difference =
      Math.ceil(
        (end - start) /
        (1000 * 60 * 60 * 24)
      ) + 1;

    return difference > 0
      ? difference
      : "--";
  };

  // =========================================================
  // STYLES
  // =========================================================

  const pageStyle = {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #eef4ff 0%, #f8faff 50%, #eef2ff 100%)",
    padding: "30px 20px 60px",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#172033",
    boxSizing: "border-box",
  };

  const containerStyle = {
    maxWidth: "1180px",
    margin: "0 auto",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "30px",
  };

  const brandStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const logoStyle = {
    width: "50px",
    height: "50px",
    borderRadius: "15px",
    background:
      "linear-gradient(135deg, #2563eb, #4f46e5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "24px",
    boxShadow:
      "0 10px 30px rgba(37, 99, 235, 0.25)",
  };

  const backButtonStyle = {
    border: "1px solid #dbe3ef",
    background: "white",
    color: "#1e293b",
    padding: "12px 18px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  };

  const cardStyle = {
    background: "white",
    borderRadius: "28px",
    overflow: "hidden",
    boxShadow:
      "0 25px 70px rgba(30, 41, 59, 0.12)",
    border: "1px solid #e5eaf2",
  };

  const heroStyle = {
    padding: "45px 50px",
    background:
      "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "white",
  };

  const formContainerStyle = {
    padding: "45px 50px 50px",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "22px",
  };

  const fullStyle = {
    gridColumn: "1 / -1",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#263449",
  };

  const inputStyle = {
    width: "100%",
    height: "54px",
    boxSizing: "border-box",
    border: "1px solid #dbe3ef",
    borderRadius: "14px",
    padding: "0 16px",
    fontSize: "15px",
    color: "#172033",
    background: "#f8fafc",
    outline: "none",
  };

  const messageStyle = {
    padding: "14px 16px",
    borderRadius: "12px",
    marginBottom: "22px",
    fontSize: "14px",
    fontWeight: "600",
  };

  const submitStyle = {
    width: "100%",
    height: "56px",
    marginTop: "25px",
    border: "none",
    borderRadius: "15px",
    background:
      "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "white",
    fontSize: "16px",
    fontWeight: "800",
    cursor: loading
      ? "not-allowed"
      : "pointer",
    opacity: loading ? 0.7 : 1,
    boxShadow:
      "0 12px 30px rgba(37, 99, 235, 0.25)",
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>

        {/* HEADER */}

        <div style={headerStyle}>

          <div style={brandStyle}>

            <div style={logoStyle}>
              ✈️
            </div>

            <div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "800",
                }}
              >
                TripNest
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#718096",
                  marginTop: "3px",
                }}
              >
                Plan · Explore · Remember
              </div>
            </div>

          </div>

          <button
            type="button"
            style={backButtonStyle}
            onClick={() =>
              navigate("/trips")
            }
          >
            ← My Trips
          </button>

        </div>

        {/* MAIN CARD */}

        <div style={cardStyle}>

          {/* HERO */}

          <div style={heroStyle}>

            <div
              style={{
                fontSize: "13px",
                fontWeight: "800",
                letterSpacing: "1.5px",
                marginBottom: "12px",
                opacity: 0.9,
              }}
            >
              ✨ YOUR NEXT ADVENTURE
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "36px",
                lineHeight: "1.15",
              }}
            >
              Plan memories,
              <br />
              not just trips.
            </h1>

            <p
              style={{
                margin: "15px 0 0",
                maxWidth: "650px",
                lineHeight: "1.6",
                opacity: 0.9,
              }}
            >
              Create your trip,
              organize your
              schedule and make
              every moment count.
            </p>

          </div>

          {/* FORM */}

          <div
            style={formContainerStyle}
          >

            <h2
              style={{
                marginTop: 0,
                marginBottom: "8px",
                fontSize: "27px",
              }}
            >
              Create New Trip
            </h2>

            <p
              style={{
                marginTop: 0,
                marginBottom: "28px",
                color: "#64748b",
              }}
            >
              Tell us where you're
              going and we'll help
              you organize the
              adventure.
            </p>

            {/* ERROR */}

            {error && (
              <div
                style={{
                  ...messageStyle,
                  background:
                    "#fff1f2",
                  border:
                    "1px solid #fecdd3",
                  color: "#be123c",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div
                style={{
                  ...messageStyle,
                  background:
                    "#ecfdf5",
                  border:
                    "1px solid #a7f3d0",
                  color: "#047857",
                }}
              >
                ✅ {success}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
            >

              <div style={gridStyle}>

                {/* TRIP NAME */}

                <div
                  style={fullStyle}
                >
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Trip Name *
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={
                      formData.title
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Goa Weekend Escape"
                    style={
                      inputStyle
                    }
                  />
                </div>

                {/* DESTINATION */}

                <div
                  style={fullStyle}
                >
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Destination *
                  </label>

                  <input
                    type="text"
                    name="destination"
                    value={
                      formData.destination
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Goa, India"
                    style={
                      inputStyle
                    }
                  />
                </div>

                {/* START DATE */}

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Start Date *
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={
                      formData.startDate
                    }
                    onChange={
                      handleChange
                    }
                    style={
                      inputStyle
                    }
                  />
                </div>

                {/* END DATE */}

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    End Date *
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    value={
                      formData.endDate
                    }
                    onChange={
                      handleChange
                    }
                    style={
                      inputStyle
                    }
                  />
                </div>

                {/* TRAVELERS */}

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Number of Travelers
                  </label>

                  <input
                    type="number"
                    name="travelers"
                    min="1"
                    value={
                      formData.travelers
                    }
                    onChange={
                      handleChange
                    }
                    style={
                      inputStyle
                    }
                  />
                </div>

                {/* BUDGET */}

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Budget (₹)
                  </label>

                  <input
                    type="number"
                    name="budget"
                    min="0"
                    value={
                      formData.budget
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. 30000"
                    style={
                      inputStyle
                    }
                  />
                </div>

              </div>

              {/* TRIP SUMMARY */}

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginTop: "25px",
                }}
              >

                <div
                  style={{
                    padding:
                      "10px 15px",
                    background:
                      "#f1f5ff",
                    borderRadius:
                      "10px",
                    color:
                      "#3730a3",
                    fontSize:
                      "13px",
                    fontWeight:
                      "700",
                  }}
                >
                  📅 {calculateDays()} day
                  {calculateDays() !==
                    1
                    ? "s"
                    : ""}
                </div>

                <div
                  style={{
                    padding:
                      "10px 15px",
                    background:
                      "#f8fafc",
                    borderRadius:
                      "10px",
                    color:
                      "#475569",
                    fontSize:
                      "13px",
                    fontWeight:
                      "700",
                  }}
                >
                  👥{" "}
                  {
                    formData.travelers
                  }{" "}
                  traveler
                  {Number(
                    formData.travelers
                  ) !== 1
                    ? "s"
                    : ""}
                </div>

                {/* BUDGET SUMMARY */}

                {formData.budget !==
                  "" && (
                    <div
                      style={{
                        padding:
                          "10px 15px",
                        background:
                          "#ecfdf5",
                        borderRadius:
                          "10px",
                        color:
                          "#047857",
                        fontSize:
                          "13px",
                        fontWeight:
                          "700",
                      }}
                    >
                      💰 ₹
                      {Number(
                        formData.budget
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </div>
                  )}

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                style={
                  submitStyle
                }
              >
                {loading
                  ? "Creating Trip..."
                  : "Create Trip & Start Planning ✨"}
              </button>

            </form>

          </div>

        </div>

      </div>
    </div>
  );
}

export default CreateTrip;