import axios from 'axios';

export interface AdvancedExportParams {
  locationId?: string;
  startDate?: string;
  endDate?: string;
  filter?: string;
}

export const exportStocksAdvanced = async (params: AdvancedExportParams) => {
  try {
    const token = localStorage.getItem("token");
    let role = localStorage.getItem("roles");
    
    if (role === "ad") role = role.toUpperCase();

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params.locationId) queryParams.append('locationId', params.locationId);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.filter) queryParams.append('filter', params.filter);

    const response = await axios.get(
      `https://uhs-backend.onrender.com/api/${role}/stock/export/advanced?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      }
    );

    // Create and download file
    const url = window.URL.createObjectURL(
      new Blob([response.data], {
        type: response.headers["Content-Type"]?.toString(),
      })
    );

    const a = document.createElement("a");
    a.href = url;
    a.download = `stocks_export_${Date.now()}.xlsx`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    return { success: true, message: "Export completed successfully" };
  } catch (error: any) {
    console.error("Advanced export failed:", error);
    throw new Error(error.response?.data?.message || "Export failed");
  }
};

// Get locations for dropdown
export const getLocations = async () => {
  try {
    const response = await axios.get("https://uhs-backend.onrender.com/api/location");
    return response.data;
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw error;
  }
};
