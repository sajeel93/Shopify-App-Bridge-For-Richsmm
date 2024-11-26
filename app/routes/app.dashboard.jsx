import { Page, Card, Button, TextContainer, Link } from "@shopify/polaris";
import OrdersStatistics from "../components/OrdersStatistics";
import { useState,useEffect } from "react";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import Cookies from "js-cookie";


// Utility function to calculate date ranges
const getDateRange = (rangeId) => {
  const today = new Date();
  const start = new Date();
  const end = new Date();

  switch (rangeId) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "yesterday":
      start.setDate(today.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(today.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case "7days":
      start.setDate(today.getDate() - 7);
      break;
    case "30days":
      start.setDate(today.getDate() - 30);
      break;
    case "90days":
      start.setDate(today.getDate() - 90);
      break;
    case "365days":
      start.setDate(today.getDate() - 365);
      break;
    default:
      break;
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
};

export const loader = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);

    // Shopify GraphQL API call with date filter
    const orderResponse = await admin.graphql(
      `#graphql
      query {
        orders(first: 10) {
          edges {
            node {
              id
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                }
              }
            }
          }
        }
      }`,
    );

    const orderData = await orderResponse.json();
    const totalOrders = orderData?.data?.orders?.edges?.length || 0;

    const totalSales = orderData.data?.orders.edges.reduce((total, order) => {
      return total + parseFloat(order.node.totalPriceSet.shopMoney.amount);
    }, 0);

    const totalSalesCost = totalSales.toFixed(2);

    return json({ orderData, totalOrders, totalSalesCost });
  } catch (error) {
    console.error("Loader error: ", error);
    return { error: "Failed to load orders", details: error.message };
  }
};

export default function DashboardPage() {
  const products = useLoaderData();
  const [selectedTab, setSelectedTab] = useState(5);
  const [apiKey_user, setApiKey_user] = useState("");
  const [richsmmData, setRichsmmData] = useState("");
  const [stats, setStats] = useState(products);

  const { orderData, totalOrders, totalSalesCost } = useLoaderData();

  const tabs = [
    { id: "today", content: "Today" },
    { id: "yesterday", content: "Yesterday" },
    { id: "7days", content: "Last 7 Days" },
    { id: "30days", content: "Last 30 Days" },
    { id: "90days", content: "Last 90 Days" },
    { id: "365days", content: "Last 365 Days" },
  ];

  const handleTabChange = (index) => {
    setSelectedTab(index);

    // Get the date range from the selected tab
    const timeRange = tabs[index].id;
    const { start, end } = getDateRange(timeRange);

    // Filter orders from orderData based on the selected date range
    const filteredOrders = orderData.data.orders.edges.filter((order) => {
      const createdAt = new Date(order.node.createdAt);
      return createdAt >= new Date(start) && createdAt <= new Date(end);
    });

    console.log(filteredOrders, "filteredOrders");
    

    // Update the stats with the filtered orders
    setStats(filteredOrders);
  };

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");;
    console.log(storedApiKey, "storedApiKey");

    if (storedApiKey) {
      setApiKey_user(storedApiKey)
      const richsmmHandler = async () => {
      const formData = new URLSearchParams();
      formData.append("key", storedApiKey );
      formData.append("action", "balance");

      const response = await fetch("https://richsmm.com/api/v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const richsmmRes = await response.json();
      setRichsmmData(richsmmRes)
    }

      richsmmHandler()
      
    } else {
      console.log("No API key found in cookies.");
    }
  }, []);

  return (
    <Page title="Statistics">
      <Card>
        {/* Custom Tabs */}
        <div className="custom-tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              className={`tab-button ${
                selectedTab === index ? "active-tab" : ""
              }`}
              onClick={() => handleTabChange(index)}
            >
              {tab.content}
            </button>
          ))}
        </div>

        <div style={{ padding: "20px" }}>
          <Statistics
            stats={stats}
            totalOrders={totalOrders}
            totalSales={totalSalesCost}
            richsmmData={richsmmData}
            apiKey_user={apiKey_user}
          />
        </div>
      </Card>

      {/* Internal CSS for custom tab styling */}
      <style jsx>{`
        .custom-tabs {
          display: flex;
          gap: 12px;
          padding: 16px;
          border-bottom: 2px solid #ccc;
        }

        .tab-button {
          background-color: transparent;
          border: none;
          padding: 10px 20px;
          cursor: pointer;
          font-size: 16px;
          color: #333;
          border-radius: 4px;
          transition:
            color 0.3s,
            background-color 0.3s;
        }

        .tab-button:hover {
          background-color: #f0f0f0;
        }

        .active-tab {
          background-color: #007bff;
          color: white;
          border-radius: 4px;
        }

        .status-button {
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 14px;
          cursor: default;
        }

        .status-button.success {
          background-color: #007bff;
        }
      `}</style>
    </Page>
  );
}

function Statistics({ stats, totalOrders, totalSales, richsmmData,apiKey_user }) {
  return (
    <>
      <TextContainer style={{ display: "flex", gap: 16 }}>
        <OrdersStatistics totalOrders={totalOrders} totalSales={totalSales} stats={stats} richsmmData={richsmmData} />
      </TextContainer>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "start",
            alignItems: "center",
            gap: 10,
          }}
        >
          <p>
            <strong>Balance:</strong> ${richsmmData?.balance || "0"}
          </p>
          <Button
            primary
            onClick={() =>
              window.open("https://richsmm.com/addfunds", "_blank")
            }
          >
            Add Funds
          </Button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p>
            <strong>Website:</strong>{" "}
            <Link url="https://richsmm.com">Richsmm.com</Link>
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p>
            <strong>Status:</strong> {/* Custom Status Button */}
            <button className="status-button success">Active</button>
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "start",
            alignItems: "center",
            gap: 10,
          }}
        >
          <p>
            <strong>API Key:</strong> {apiKey_user ? apiKey_user : ""}
          </p>
          <Button destructive>Delete</Button>
        </div>
      </div>
    </>
  );
}
