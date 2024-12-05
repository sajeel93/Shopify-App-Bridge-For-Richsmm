import React, { useEffect, useState } from "react";

const OrdersStatistics = ({ totalOrders, totalSales, stats, totalCosts }) => {

  const getTotalSales = (orders) => {
    return orders.reduce((total, order) => {
      const amount = parseFloat(order.node.totalPriceSet.shopMoney.amount);
      return total + amount;
    }, 0).toFixed(2);  // Returning total amount with 2 decimal places
  };

  const totalOrdersPrice = stats?.length ? getTotalSales(stats) : 0;

  return (
    <div style={{ display: "flex", gap: "32px", marginBottom: "20px" }}>
      {stats?.length === 0 || stats?.length > 0  ? 
      <> <p>
        <strong>Sales:</strong> ${totalOrdersPrice}
      </p>
      <p>
        <strong>Orders:</strong> {stats?.length}
      </p> 
      <p>
        <strong>Costs:</strong> ${parseFloat(totalCosts || "0.00").toFixed(2)}
      </p>
      <p>
        <strong>Profit:</strong> ${(totalCosts - totalOrdersPrice).toFixed(2)}
      </p>
      </>
      :
      <> 
      <p>
        <strong>Sales:</strong> ${totalSales}
      </p>
      <p>
        <strong>Orders:</strong> {totalOrders}
      </p>
      <p>
        <strong>Costs:</strong> ${parseFloat(totalCosts || "0.00").toFixed(2)}
      </p>
      <p>
        <strong>Profit:</strong> ${(totalCosts - totalSales).toFixed(2)}
      </p>
      </>
}
      
    </div>
  );
};

export default OrdersStatistics;
