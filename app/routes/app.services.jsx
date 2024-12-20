import {
  Page,
  Card,
  DataTable,
  TextField,
  Button,
  Select,
} from "@shopify/polaris";
import { useState, useEffect } from "react";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// Removed static data for services

export const loader = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);

    // Shopify GraphQL API call
    const productsResponse = await admin.graphql(
      `#graphql
      query {
        products(first: 10) {
          edges {
            node {
              id
              title
              variants(first: 1) {
                edges {
                  node {
                    price
                  }
                }
              }
            }
          }
        }
      }`,
    );

    const productsData = await productsResponse.json();

    // Assuming richsmmData contains an array of services
    return json({
      orders: productsData?.data.products.edges,
    });
  } catch (error) {
    console.error("Loader error: ", error);
    return { error: "Failed to load orders", details: error.message };
  }
};

export default function Services() {
  const { orders } = useLoaderData();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1); // Current page state
  const [richsmmData, setRichsmmData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page

  const rowsOptions = [
    { label: "10 rows", value: 10 },
    { label: "50 rows", value: 50 },
    { label: "100 rows", value: 100 },
  ];

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");

    if (storedApiKey) {
      const richsmmHandler = async () => {
      const formData = new URLSearchParams();
      formData.append("key", storedApiKey );
      formData.append("action", "services");

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

  // Filter services based on the search query
  const filteredServices = richsmmData?.error ? [] : richsmmData?.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Calculate the rows to display based on pagination
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  // DataTable rows for the services
  const rows = paginatedServices.map((service, index) => {
    const shopifyProduct = orders[index]?.node || {}; // Get the corresponding Shopify product if available
    const shopifyVariant = shopifyProduct?.variants?.edges[0]?.node || {}; // Get the first variant for price

    const statusStyles = {
      backgroundColor: service.status === "Available" ? "green" : "orange",
      color: "white",
      padding: "5px 10px",
      borderRadius: "5px",
      textAlign: "center",
    };

    return [
      shopifyProduct.title || "", // First column: Shopify product name
      shopifyVariant.price || "", // Second column: Shopify product price
      service.id, // Third column: Service ID
      service.name, // Fourth column: Service Name
      <span>
        {service.min} - {service.max}
      </span>, // Fifth column: Quantity (min-max)
      service.rate, // Sixth column: Rate/Cost
      shopifyVariant.price > service.rate ? shopifyVariant.price - service.rate : "", // Seventh column: Duration
    ];
  });

  // Pagination: Total pages calculation
  const totalPages = Math.ceil(filteredServices.length / rowsPerPage);

  // Pagination change handler
  const handlePageChange = (newPage) => setPage(newPage);

  // Rows per page change handler
  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(Number(value)); // Update the rowsPerPage state correctly
    setPage(1); // Reset to the first page when rows per page change
  };

  // Internal CSS for heading and search box
  const headingStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    textDecoration: "none",
    color: "#303030",
    marginBottom: "10px",
  };

  const searchBoxStyle = {
    marginBottom: "15px",
    display: "flex",
    justifyContent: "center",
  };

  // Internal CSS for the search field
  const searchFieldStyle = {
    padding: "10px",
    borderRadius: "30px",
    border: "1px solid #ccc",
    width: "100%",
    marginBottom: "15px"
  };

  return (
    <Page>
      <div style={{ marginBottom: 10 }}>
        <a
          href="https://richsmm.com/services"
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
            Services
          </span>
        </a>
      </div>

      <Card>
        <div style={searchBoxStyle}>
          <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value || "")}
          placeholder="Search services"
          autoComplete="off"
          style={searchFieldStyle}
        />
        </div>

        {/* DataTable for displaying services */}
        <DataTable
          columnContentTypes={[
            "text",
            "numeric",
            "numeric",
            "text",
            "text",
            "numeric",
            "text",
            "text",
          ]}
          headings={[
            "Shopify Product",
            "Shopify Price",
            "Service ID",
            "Service Name",
            "Quantity",
            "Cost",
            "Profit",
          ]}
          rows={rows}
        />

        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
            marginTop: "10px",
          }}
        >
          {/* Dropdown for selecting rows per page */}
          <div style={{ textAlign: "right", width: "10%" }}>
            <Select
              options={rowsOptions}
              value={String(rowsPerPage)} // Make sure value is a string
              onChange={handleRowsPerPageChange}
            />
          </div>

          {/* Pagination Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Button
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              Prev
            </Button>

            {/* Display current page number */}
            <span>
              Page {page} of {totalPages}
            </span>

            <Button
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </Button>
          </div>
          {/* <div style={{ textAlign: "right" }}>
            Total: {filteredServices.length}
          </div> */}
        </div>
      </Card>
    </Page>
  );
}
