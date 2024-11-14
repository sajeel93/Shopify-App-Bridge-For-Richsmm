import {
  Page,
  Card,
  DataTable,
  TextField,
  Link,
  Button,
} from "@shopify/polaris";
import { useState } from "react";

// Dummy Data for Services
const servicesData = [
  {
    id: "1",
    name: "Social Media Boost",
    description: "Boost your social media presence with our service.",
    price: "$29.99",
    duration: "7 Days",
    status: "Available",
  },
  {
    id: "2",
    name: "SEO Optimization",
    description: "Enhance your website's search engine ranking.",
    price: "$99.99",
    duration: "30 Days",
    status: "Limited",
  },
  // Add more services as needed...
];

export default function Services() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter services based on the search query
  const filteredServices = servicesData.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // DataTable rows for the services
  const rows = filteredServices.map((service) => {
    const statusStyles = {
      backgroundColor: service.status === "Available" ? "green" : "orange",
      color: "white",
      padding: "5px 10px",
      borderRadius: "5px",
      textAlign: "center",
    };

    return [
      service.id,
      service.name,
      service.description,
      service.price,
      service.duration,
      <span style={statusStyles}>{service.status}</span>,
    ];
  });

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

  return (
    <Page>
      <div style={{ marginBottom: 10 }}>
        <h1 style={headingStyle}>Services</h1>
      </div>

      <Card>
        <div style={searchBoxStyle}>
          <TextField
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search services"
            label="Search"
            labelHidden
          />
        </div>

        {/* DataTable for displaying services */}
        <DataTable
          columnContentTypes={[
            "text",
            "text",
            "text",
            "numeric",
            "text",
            "text",
          ]}
          headings={[
            "ID",
            "Service Name",
            "Description",
            "Price",
            "Duration",
            "Status",
          ]}
          rows={rows}
        />
      </Card>
    </Page>
  );
}
