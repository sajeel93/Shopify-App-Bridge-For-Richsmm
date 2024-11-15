import React, { useState } from "react";
import { Page, Card, FormLayout, TextField, Button } from "@shopify/polaris";

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
    backgroundColor: quantityBonusEnabled ? "blue" : "#303030",
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
      <Card sectioned>
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
              <p>Quantity Bonus</p>
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
              borderRadius: "10px",
            }}
          >
            You can give your customers a custom quantity bonus. For example,
            with 5%, if a customer orders 100 followers, they will receive 105
            followers.
          </p>

          {quantityBonusEnabled && (
            <FormLayout.Group>
              <TextField
                label="Bonus Percentage"
                type="number"
                suffix="%"
                value={bonusPercentage}
                onChange={handlePercentageChange}
                helpText="Set the bonus percentage for the order."
              />
            </FormLayout.Group>
          )}

          <Button primary onClick={handleSubmit}>
            Save Settings
          </Button>
        </FormLayout>
      </Card>
    </Page>
  );
}
