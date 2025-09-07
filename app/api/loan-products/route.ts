// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET() {
  try {
    const myHeaders = new Headers();
    myHeaders.append("api-key", "SM161F4dmQvLYTYuH43gZl");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow" as RequestRedirect,
    };

    const response = await fetch(
      "https://lending.presta.co.ke/zohointegration/api/v1/loanproduct?tenantId=t25219",
      requestOptions,
    );

    // Check if response is not ok
    if (!response.ok) {
      // Try to get the response text to see what's being returned
      const responseText = await response.text();
      console.log("Error Response Body:", responseText);

      // Return a more detailed error
      return NextResponse.json(
        {
          error: "Failed to fetch loan products",
          status: response.status,
          statusText: response.statusText,
          responseBody: responseText.substring(0, 500), // Limit the size for logging
        },
        { status: 500 },
      );
    }

    // If we got here, the response was ok, so try to parse as JSON
    try {
      const data = await response.json();

      // Log the original response on the server side

      // Filter out "MELANIN FINANCE" loan from the response
      // No enrichment, just return the filtered raw data
      const filteredData = data.filter(
        (loan: never) => loan.name !== "MELANIN FINANCE",
      );

      return NextResponse.json(filteredData);
    } catch (jsonError) {
      console.error("Error parsing JSON response:", jsonError);

      // Try to get the response text again to see what's causing the JSON parse error
      const responseText = await response.text();
      console.log("JSON Parse Error - Response Body:", responseText);

      return NextResponse.json(
        {
          error: "Failed to parse JSON response",
          message: jsonError.message,
          responseBody: responseText.substring(0, 500), // Limit the size for logging
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error fetching loan products:", error);
    return NextResponse.json(
      { error: "Failed to fetch loan products", message: error.message },
      { status: 500 },
    );
  }
}
