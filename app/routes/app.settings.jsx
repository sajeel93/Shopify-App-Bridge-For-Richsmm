import React, { useState } from "react";
import { Page, Card, FormLayout, TextField, Button } from "@shopify/polaris";

const CustomInput = ({ label, type, value, onChange, suffix }) => {
  return (
    <div>
      <label style={{ fontWeight: "bold" }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          style={{
            border: "1px solid #eee",
            width: "100%",
            borderRadius: "30px",
            padding: "10px 20px",
            outline: 'none',
            transition: 'border 0.2s ease, box-shadow 0.2s ease',
          }}
          className="custom-input"
        />
        {suffix && (
          <span style={{
            position: 'absolute',
            right: '20px',
            top: '10px',
            fontSize: '16px',
            color: 'gray'
          }}>
            {suffix}
          </span>
        )}
      </div>
      <style jsx>{`
        .custom-input:hover {
          border-color: #ccc; /* Change border on hover */
        }

        .custom-input:focus-visible {
          border-color: #999; /* Change border on focus */
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.2); /* Add shadow on focus */
        }

        /* Remove arrows from number input */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default function Settings() {
  const [quantityBonusEnabled, setQuantityBonusEnabled] = useState(true);
  const [bonusPercentage, setBonusPercentage] = useState("5");

  const handleToggleChange = () => {
    setQuantityBonusEnabled(!quantityBonusEnabled);
  };

  const handlePercentageChange = (newValue) => {
    setBonusPercentage(newValue);
  };

  const handleSubmit = () => {
    // Handle form submission logic
    console.log({
      quantityBonusEnabled,
      bonusPercentage,
    });
  };

  // Inline styles for the custom switch
  const switchContainerStyle = {
    width: "50px",
    height: "25px",
    backgroundColor: quantityBonusEnabled ? "#006dff" : "#303030",
    borderRadius: "15px",
    position: "relative",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  };

  const switchCircleStyle = {
    width: "20px",
    height: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "50%",
    position: "absolute",
    top: "2.5px",
    left: quantityBonusEnabled ? "26px" : "3px",
    transition: "left 0.3s ease",
  };

  return (
    <Page title="Settings">
      <div style={{background: "#fff", borderRadius: "30px", padding: "16px 24px"}}>
        <FormLayout>
          <FormLayout.Group>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <h1 style={{fontSize: "larger", fontWeight: "bold"}}>Quantity Bonus</h1>
              <div style={switchContainerStyle} onClick={handleToggleChange}>
                <div style={switchCircleStyle}></div>
              </div>
            </div>
          </FormLayout.Group>

          <p
            style={{
              color: "#637381",
              fontSize: "12px",
              background: "aliceblue",
              padding: "10px",
              borderRadius: "30px",
            }}
          >
            You can give your customers a custom quantity bonus. For example,
            with 5%, if a customer orders 100 followers, they will receive 105
            followers.
          </p>

          {quantityBonusEnabled && (
            <FormLayout.Group>
              <CustomInput
                label="Bonus Percentage"
                type="number"
                value={bonusPercentage}
                onChange={(e) => handlePercentageChange(e.target.value)}
                suffix="%"
              />
            </FormLayout.Group>
          )}

          <button 
            className="funds-button" 
            onClick={() => handleSubmit()}
            style={{
              background: "#fff",
              color: "#303030",
              border: "1px solid rgb(217 214 214)",
              borderRadius: "30px",
              padding: "6px 12px",
              fontSize: "14px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >Save Settings</button>
        </FormLayout>
      </div>
    </Page>
  );
}
