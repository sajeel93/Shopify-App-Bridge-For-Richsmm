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
    if (actionData?.apiKey) {
      
      
      // Store the API key in cookies or localStorage upon successful action
      Cookies.set("apiKey", actionData?.apiKey); // Store for 7 days
      localStorage.setItem("apiKey", actionData?.apiKey);
      navigate("dashboard");
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
              <Link target="_blank" url="https://richsmm.com">
                Richsmm.com
              </Link>
            </TextContainer>

            <Form method="post">
              <TextField
                label="Enter API key"
                placeholder="e.g. 9bdec003037ce39b4f9336afdd3a931a"
                name="apiKey" // The name attribute will send this value in the form data
                value={apiKey}
                onChange={(value) => setApiKey(value)}
                autoComplete="off"
                error={errorMessage !== ""} // Display error style if there's an error
              />
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
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
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
                <Button
                  fullWidth
                  external
                  blue
                  target={"_blank"}
                  url="https://richsmm.com/account"
                >
                  View API key
                </Button>
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
                <Button
                  fullWidth
                  external
                  blue
                  target={"_blank"}
                  url="https://admin.shopify.com/apps/richsmm-two/app/dashboard"
                >
                  Go to Dashboard
                </Button>
              </TextContainer>
            )}
          </div>
        </Card>
      </div>
    </Page>
  );
}
