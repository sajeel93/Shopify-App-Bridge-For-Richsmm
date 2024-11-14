import { Page, Card, Button, TextContainer, Link } from "@shopify/polaris";
import OrdersStatistics from "../components/OrdersStatistics";
import { useState } from "react";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);

    // Shopify GraphQL API call
    const orderResponse = await admin.graphql(
      `#graphql
      query {
        orders(first: 10) {
          edges {
            node {
              id
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
    const totalOrders = orderData?.data?.orders?.edges?.length || 0; // Calculate the total number of orders

    // Calculate total sales by summing all order amounts
    const totalSales = orderData.data?.orders.edges.reduce((total, order) => {
      return total + parseFloat(order.node.totalPriceSet.shopMoney.amount);
    }, 0);

    // Format totalSales to two decimal places
    const totalSalesCost = totalSales.toFixed(2);

    // External API call
    const formData = new URLSearchParams();
    formData.append("key", "9bdec003037ce39b4f9336afdd3a931a");
    formData.append("action", "balance");

    const response = await fetch("https://richsmm.com/api/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const richsmmData = await response.json();

    // Combine both API results and return as loader data
    return json({ orderData, totalOrders, totalSalesCost, richsmmData });
  } catch (error) {
    console.error("Loader error: ", error);
    return { error: "Failed to load orders", details: error.message };
  }
};

export default function DashboardPage() {
  const products = useLoaderData();
  const [selectedTab, setSelectedTab] = useState(0);
  const [stats, setStats] = useState(products);

  const { orderData, totalOrders, totalSalesCost, richsmmData } =
    useLoaderData();

  const tabs = [
    { id: "today", content: "Today" },
    { id: "yesterday", content: "Yesterday" },
    { id: "7days", content: "Last 7 Days" },
    { id: "30days", content: "Last 30 Days" },
    { id: "90days", content: "Last 90 Days" },
    { id: "365days", content: "Last 365 Days" },
  ];

  const handleTabChange = async (index) => {
    setSelectedTab(index);

    const timeRange = tabs[index].id;
    const queryParams = new URLSearchParams({ timeRange });

    const response = await fetch(`/api?${queryParams.toString()}`);
    const data = await response.json();

    setStats(data);
  };

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

function Statistics({ stats, totalOrders, totalSales, richsmmData }) {
  return (
    <>
      <TextContainer style={{ display: "flex", gap: 16 }}>
        <OrdersStatistics totalOrders={totalOrders} totalSales={totalSales} />
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
            <strong>API Key:</strong> 9bdec003037ce39b4f9336afdd3a931a
          </p>
          <Button destructive>Delete</Button>
        </div>
      </div>
    </>
  );
}
