import {
  Page,
  Card,
  DataTable,
  TextField,
  Link,
  Button,
} from "@shopify/polaris";
import { Icon } from '@iconify/react';
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
              name
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                }
              }
              displayFinancialStatus
              displayFulfillmentStatus
              lineItems(first: 1) {
                edges {
                  node {
                    title
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

    // Combine API results and return as loader data
    return json({
      orders: orderData?.data.orders.edges,
      totalOrders,
      totalSalesCost,
    });
  } catch (error) {
    console.error("Loader error: ", error);
    return { error: "Failed to load orders", details: error.message };
  }
};

export default function Orders() {
  const { orders } = useLoaderData();
  const [selectedTab, setSelectedTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  

  // Function to calculate order counts dynamically
  const getOrderCount = (status) => {
    if (status === "today") {
      // Filter based on today's date
      const today = new Date().toLocaleDateString();
      return orders?.filter(
        (order) =>
          new Date(order.node.createdAt).toLocaleDateString() === today,
      ).length;
    }

    return orders?.filter((order) => {
      switch (status) {
        case "all":
          return true;
        case "pending":
          return order.node.displayFinancialStatus === "PENDING";
        case "processing":
          return order.node.displayFulfillmentStatus === "PROCESSING";
        case "inProgress":
          return order.node.displayFulfillmentStatus === "IN_PROGRESS";
        case "completed":
          return order.node.displayFulfillmentStatus === "FULFILLED";
        case "partial":
          return order.node.displayFulfillmentStatus === "PARTIAL";
        case "cancelled":
          return order.node.displayFinancialStatus === "CANCELLED";
        default:
          return false;
      }
    }).length;
  };

  const tabData = [
    { id: "Today", label: `Today (${getOrderCount("today")})` },
    { id: "All", label: `All Orders (${getOrderCount("all")})` },
    { id: "Pending", label: `Pending (${getOrderCount("pending")})` },
    { id: "Processing", label: `Processing (${getOrderCount("processing")})` },
    { id: "InProgress", label: `In Progress (${getOrderCount("inProgress")})` },
    { id: "Completed", label: `Completed (${getOrderCount("completed")})` },
    { id: "Partial", label: `Partial (${getOrderCount("partial")})` },
    { id: "Cancelled", label: `Cancelled (${getOrderCount("cancelled")})` },
  ];

  // Handle tab change
  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  // Filter orders based on selected tab and search query
  const filteredOrders = orders?.filter((order) => {
    const productTitle =
      order.node.lineItems.edges[0]?.node.title.toLowerCase();
    const matchesSearch = productTitle.includes(searchQuery?.toLowerCase());

    if (selectedTab === "All") {
      return matchesSearch;
    } else if (selectedTab === "Today") {
      const today = new Date().toLocaleDateString();
      return (
        new Date(order.node.createdAt).toLocaleDateString() === today &&
        matchesSearch
      );
    } else if (selectedTab === "Pending") {
      return order.node.displayFinancialStatus === "PENDING" && matchesSearch;
    } else if (selectedTab === "Processing") {
      return (
        order.node.displayFulfillmentStatus === "PROCESSING" && matchesSearch
      );
    } else if (selectedTab === "InProgress") {
      return (
        order.node.displayFulfillmentStatus === "IN_PROGRESS" && matchesSearch
      );
    } else if (selectedTab === "Completed") {
      return (
        order.node.displayFulfillmentStatus === "FULFILLED" && matchesSearch
      );
    } else if (selectedTab === "Partial") {
      return order.node.displayFulfillmentStatus === "PARTIAL" && matchesSearch;
    } else if (selectedTab === "Cancelled") {
      return order.node.displayFinancialStatus === "CANCELLED" && matchesSearch;
    }

    return false;
  });

  const rows = filteredOrders.map((order) => {
    const status = order.node.displayFulfillmentStatus;

    // Assign background colors based on status
    const statusStyles = {
      backgroundColor:
        status === "FULFILLED"
          ? "green"
          : status === "PENDING"
            ? "orange"
            : status === "IN_PROGRESS"
              ? "blue"
              : status === "PROCESSING"
                ? "lightblue"
                : status === "PARTIAL"
                  ? "yellow"
                  : status === "CANCELLED"
                    ? "red"
                    : "grey", // Default color for unhandled statuses
      color: "white", // Set text color to white for better contrast
      padding: "5px 10px",
      borderRadius: "30px",
      textAlign: "center",
      height: "26px"
    };

    const cancelButtonStyle = {
      backgroundColor: "red",
      color: "white", // Set text color to white for better contrast
      padding: "5px 10px",
      borderRadius: "30px",
      textAlign: "center",
      border: "0px",
      cursor: "pointer",
      height: "26px",
      marginTop: "-3px"
    };

    return [
      <a 
        href={`https://admin.shopify.com/orders/${order.node.id.split("/").pop()}`} 
        target="_blank" 
        rel="noopener noreferrer"
      >
        {order.node.name}
      </a>,
      new Date(order.node.createdAt).toLocaleDateString(),
      order.node.lineItems.edges[0]?.node.title || "N/A",
      "Service Name",
      <Link url={`https://smm.link/${order.node.id}`} external>
        {order.node.id}
      </Link>,
      <Link url={`https://smm.link/${order.node.id}`} external>
        {order.node.id}
      </Link>,
      `$${order.node.totalPriceSet.shopMoney.amount}`,
      "$0.00",
      "$0.00",
      "$0.00",
      "$0.00",
      // Apply the status background color here
      <span style={statusStyles}>
        {status === "FULFILLED"
          ? "Completed"
          : status === "PENDING"
            ? "Pending"
            : status === "IN_PROGRESS"
              ? "In Progress"
              : status === "PROCESSING"
                ? "Processing"
                : status === "PARTIAL"
                  ? "Partial"
                  : status === "CANCELLED"
                    ? "Cancelled"
                    : "Unknown"}
      </span>,
      <button
        onClick={() => handleCancel(order.node.id)}
        style={cancelButtonStyle}
      >
        Cancel
      </button>,
    ];
  });

  const headingStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    textDecoration: "none", // Remove default underline
    color: "#303030", // Default color
    cursor: "pointer",
    marginBottom: "10px",
  };

  const searchContainerStyle = {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ccc",
    borderRadius: "30px",
    padding: "5px 10px",
    width: "100%",
    marginBottom: "15px",
  };

  const searchFieldStyle = {
    border: "none",
    outline: "none",
    flex: 1,
    padding: "10px",
    borderRadius: "30px",
  };

  return (
    <Page>
      {/* <div style={{ marginBottom: 10 }}>
        <a
          href="https://richsmm.com/orders"
          target="_blank"
          rel="noopener noreferrer"
          style={headingStyle}
        >
          <span
            style={{
              transition: "all 0.3s ease", // Smooth transition for hover effect
            }}
            onMouseEnter={(e) => {
              e.target.style.color = "blue"; // Change color on hover
              e.target.style.textDecoration = "underline"; // Underline on hover
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "black"; // Revert color when hover ends
              e.target.style.textDecoration = "none"; // Remove underline when hover ends
            }}
          >
            Orders
          </span>
        </a>
      </div> */}
      <br />
      <div style={{background: "#fff", borderRadius: "30px", padding: "16px 24px"}}>
        <h1 style={{padding: "10px 0px 20px 0px", fontSize: "large", fontWeight: "bold"}}>Orders</h1>
        
        <div style={searchContainerStyle}>
          <Icon icon="ri:search-line" width="24" height="24" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Orders"
            style={searchFieldStyle}
            autoComplete="off"
          />
        </div>
        
        {/* Custom Tabs */}
        <div style={{ 
          display: "flex", 
          marginTop: 1, 
          flexWrap: "nowrap", 
          overflowX: "auto", 
          whiteSpace: "nowrap", 
          gap: "5px",
          paddingBottom: "10px",
          scrollbarWidth: "thin",
          scrollbarColor: "rgb(0, 123, 255) rgb(241, 241, 241)"
        }}>
          {tabData.map((tab) => (
            <div
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                padding: "8px 15px",
                cursor: "pointer",
                backgroundColor: selectedTab === tab.id ? "#007bff" : "transparent",
                color: selectedTab === tab.id ? "white" : "#333",
                borderRadius: selectedTab === tab.id ? "30px" : "0px",
                border: "none",
                transition: "color 0.3s, background-color 0.3s",
                flexShrink: 0, // Prevent shrinking in small screens
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* DataTable */}
        <DataTable
          columnContentTypes={[
            "text",
            "text",
            "text",
            "text",
            "numeric",
            "text",
            "text",
            "text",
            "numeric",
            "numeric",
            "numeric",
            "text",
            "text",
          ]}
          headings={[
            "Order",
            "Date",
            "Shopify product name",
            "SMM Panel service name",
            "SMM Panel Order ID",
            "Link",
            "Shopify Total",
            "Costs",
            "Profit",
            "Start Count",
            "Remains",
            "Status",
            "Action",
          ]}
          rows={rows}
        />
      </div>
    </Page>
  );
}
