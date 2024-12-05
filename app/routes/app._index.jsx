import { Page, Card, TextField, Button, TextContainer } from "@shopify/polaris";
import { useEffect, useState } from "react";
import { TitleBar } from "@shopify/app-bridge-react";
import { useActionData } from "@remix-run/react";
import { Form, Link } from "@remix-run/react";
import Cookies from "js-cookie";
import { useNavigate } from "@remix-run/react";

// Action to handle the form submission
export const action = async ({ request }) => {
  const formData = await request.formData();
  const apiKey = formData.get("apiKey");

  if (!apiKey || !/^[a-f0-9]{32}$/.test(apiKey)) {
    return {
      errorMessage: "Invalid API key. Must be 32 characters in hex format.",
    };
  }

  try {
    const requestData = new URLSearchParams();
    requestData.append("key", apiKey);
    requestData.append("action", "balance");

    const response = await fetch("https://richsmm.com/api/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: requestData.toString(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || "Failed to fetch API balance");
    }

    // Check for success status
    if (response.status === 200 && result?.balance) {
      return { successMessage: "API Key Connected successfully!", apiKey };
    } else {
      return { errorMessage: result?.error };
    }
  } catch (error) {
    console.log("Error:", error.message);
    return { errorMessage: error.message };
  }
};

export default function ApiSetup() {
  const actionData = useActionData();
  const [apiKey, setApiKey] = useState("");
  const [errorMessage, setErrorMessage] = useState(
    actionData?.errorMessage || ""
  );
  const navigate = useNavigate();
  

  useEffect(() => {
    // Check if code is running in the browser
    if (typeof window !== "undefined") {
      const storedApiKey = localStorage.getItem("apiKey");

      if (actionData?.apiKey) {
        // Store the API key in cookies or localStorage upon successful action
        Cookies.set("apiKey", actionData?.apiKey); // Store for 7 days
        localStorage.setItem("apiKey", actionData?.apiKey);
        navigate("dashboard");
      } else if (storedApiKey) {
        navigate("dashboard");
      }
    }
  }, [actionData?.apiKey]);

  useEffect(() => {
    if (apiKey && !/^[a-f0-9]{32}$/.test(apiKey)) {
      setErrorMessage(
        "Invalid API key. The key must be 32 characters long and contain only letters (a-f) and numbers."
      );
    } else {
      setErrorMessage(""); // Clear error message if the key is valid
    }
  }, [apiKey]);

  return (
    <Page>
      <TitleBar title="API Setup" />
      <div style={{ width: "60%", borderRadius: "10px" }}>
        <Card sectioned>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <TextContainer>
              <h1>API Setup</h1>
              <h5>Website</h5>
              <a
                href="https://richsmm.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#006dff",
                  textDecoration: "none",
                }}
                onMouseOver={(e) => (e.target.style.textDecoration = "underline")}
                onMouseOut={(e) => (e.target.style.textDecoration = "none")}
              >
                Richsmm.com
              </a>
            </TextContainer>

            <Form method="post">
              <div style={{ marginBottom: "15px" }}>
                <label
                  htmlFor="apiKey"
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    marginBottom: "5px",
                  }}
                >
                  Enter API key
                </label>
                <input
                  type="text"
                  id="apiKey" // Connects label with input field
                  placeholder="e.g. 9bdec003037ce39b4f9336afdd3a931a"
                  name="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  autoComplete="off"
                  style={{
                    border: errorMessage ? "1px solid red" : "1px solid #ccc",
                    padding: "10px",
                    borderRadius: "30px",
                    width: "100%",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                  marginTop: 10,
                }}
              >
                <button
                  style={{
                    backgroundColor: "#006dff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "30px",
                    padding: "0.8rem",
                    fontSize: "1rem",
                    cursor: "pointer",
                    width: "100%",
                    fontWeight: "500",
                  }}
                  type="submit" // Triggers the form submission
                >
                  Connect API key
                </button>
                <button 
                style={{
                  backgroundColor: "#ddd",
                    color: "#444",
                    border: "1px solid #eee",
                    borderRadius: "30px",
                    padding: "0.8rem",
                    fontSize: "1rem",
                    cursor: "pointer",
                    width: "100%",
                    fontWeight: "500"
                  }}
                  onClick={() =>
                    window.open("https://richsmm.com/account", "_blank")
                  }
                  >View API key</button>
              </div>
            </Form>

            {errorMessage && (
              <TextContainer>
                <p style={{ textAlign: "center", color: "red" }}>
                  {errorMessage}
                </p>
              </TextContainer>
            )}

            {actionData?.successMessage && (
              <TextContainer>
                <p style={{ textAlign: "center", color: "green" }}>
                  {actionData.successMessage}
                </p>
              </TextContainer>
            )}
          </div>
        </Card>
      </div>
    </Page>
  );
}
