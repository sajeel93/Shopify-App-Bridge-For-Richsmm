import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";

const EXTERNAL_API_URL = "https://richsmm.com/api";

export const loader = async () => {
  const formData = new URLSearchParams();
  formData.append("key", "9bdec003037ce39b4f9336afdd3a931a");
  formData.append("action", "services");

  const response = await fetch("https://richsmm.com/api/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });
  console.log(response, "response");

  return response.status;
};

export default function ExternalPage() {
  const products = useLoaderData();
  console.log(products, "Products");
}
