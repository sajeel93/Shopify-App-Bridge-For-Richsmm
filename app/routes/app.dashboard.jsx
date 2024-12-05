import { Page, Card, Button, TextContainer, Link } from "@shopify/polaris";
import OrdersStatistics from "../components/OrdersStatistics";
import { useState,useEffect } from "react";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import Cookies from "js-cookie";
import { useNavigate } from "@remix-run/react";


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
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    variant {
                      id
                      price
                      compareAtPrice
                    }
                    quantity
                  }
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

    const totalCosts = orderData.data.orders.edges.reduce((total, order) => {
      const orderCost = order.node.lineItems.edges.reduce((lineItemTotal, lineItem) => {
        const cost = parseFloat(lineItem.node.variant.compareAtPrice || 0);
        const quantity = parseInt(lineItem.node.quantity, 10);
        return lineItemTotal + cost * quantity;
      }, 0);
      return total + orderCost;
    }, 0);
    
    return json({ orderData, totalOrders, totalSalesCost,totalCosts });
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
  const navigate = useNavigate();

  const { orderData, totalOrders, totalSalesCost, totalCosts } = useLoaderData();

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
    

    // Update the stats with the filtered orders
    setStats(filteredOrders);
  };

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");

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
            totalCosts={totalCosts}
            navigate={navigate}
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
          border-radius: 30px;
        }

        .active-tab {
          background-color: #007bff;
          color: white;
          border-radius: 30px;
        }

        .active-tab:hover {
          background-color: #007bff;
        }

        .status-button {
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 30px;
          padding: 6px 12px;
          font-size: 14px;
          cursor: default;
        }

        .status-button.success {
          background-color: #007bff;
        }

        .funds-button {
          background-color: #eee;
          color: black;
          border: 1px solid rgb(217 214 214);
          border-radius: 30px;
          padding: 6px 12px;
          font-size: 14px;
          cursor: pointer;
          
        }
        
        .delete-button {
          background-color: red;
          color: white;
          border: 1px solid rgb(217 214 214);
          border-radius: 30px;
          padding: 6px 12px;
          font-size: 14px;
          cursor: pointer;
        }

        .masked-api-key {
          position: relative;
          top: 2px
        }
      `}</style>
    </Page>
  );
}

function Statistics({ stats, totalOrders, totalSales, richsmmData,apiKey_user, totalCosts, navigate }) {

  const deleteHandler = () => {
    localStorage.clear();
      navigate("/app");
  }
  return (
    <>
      <TextContainer style={{ display: "flex", gap: 16 }}>
        <OrdersStatistics totalOrders={totalOrders} totalSales={totalSales} stats={stats} richsmmData={richsmmData} totalCosts={totalCosts} />
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
          <p><strong>Balance:</strong> ${parseFloat(richsmmData?.balance || "0").toFixed(2)}</p>
          
          <a href="https://richsmm.com" target="_blank" rel="noopener noreferrer">
              <button className="funds-button" onClick={() =>
              window.open("https://richsmm.com/addfunds", "_blank")
            }>Add Funds</button>
            </a>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p>
            <strong>Website:</strong>{" "}
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
            <strong>API Key:</strong> 
            {apiKey_user ? (
              <>
                {apiKey_user.slice(0, 6)}
                <span className="masked-api-key">*********************</span>
                {apiKey_user.slice(-6)}
              </>
            ) : ""}
          </p>
          <button className="delete-button" onClick={() => deleteHandler()}>Delete</button>
        </div>
      </div>
    </>
  );
}
