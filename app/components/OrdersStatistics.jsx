import React, { useEffect, useState } from "react";

const OrdersStatistics = ({ totalOrders, totalSales }) => {
  const [stats, setStats] = useState({
    sales: 0,
    orders: 0,
    costs: 0,
    profit: 0,
  });

  return (
    <div style={{ display: "flex", gap: "32px", marginBottom: "20px" }}>
      <p>
        <strong>Sales:</strong> ${totalSales || 0}
      </p>
      <p>
        <strong>Orders:</strong> {totalOrders}
      </p>
      <p>
        <strong>Costs:</strong> ${stats.costs || "20.00"}
      </p>
      <p>
        <strong>Profit:</strong> ${stats.profit || "80.00"}
      </p>
    </div>
  );
};

export default OrdersStatistics;
