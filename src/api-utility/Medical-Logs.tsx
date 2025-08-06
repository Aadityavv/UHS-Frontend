import axios from "axios";

// Type definitions
interface DailyLogData {
  stockId: string;
  locationId: string;
  date: string;
  openingBalance: number;
  medicineConsumed: number;
  medicineBalance: number;
  enteredBy: string;
}

interface DailyMedicineLog {
  id: string;
  stock: {
    id: string;
    medicineName: string;
    batchNumber: number;
    company: string;
    composition: string;
    medicineType: string;
    expirationDate: string;
    quantity: number;
  };
  location: {
    locId: string;
    locationName: string;
  };
  date: string;
  openingBalance: number;
  medicineConsumed: number;
  medicineBalance: number;
  enteredBy: string;
}

type FilterType = 'day' | 'week' | 'month' | 'year';

// Utility functions
const validateDateFormat = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date) && !isNaN(Date.parse(date));
};

const getAuthToken = (): string => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication token not found. Please login again.");
  }
  return token;
};

// API Functions
export const createOrUpdateDailyLog = async (logData: DailyLogData): Promise<DailyMedicineLog> => {
  try {
    // Validate input data
    if (!logData.stockId || !logData.locationId || !logData.date) {
      throw new Error("Required fields missing: stockId, locationId, and date are required");
    }

    if (!validateDateFormat(logData.date)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD format.");
    }

    if (logData.openingBalance < 0 || logData.medicineConsumed < 0 || logData.medicineBalance < 0) {
      throw new Error("Balance and consumption values cannot be negative");
    }

    const token = getAuthToken();

    const response = await axios.post(
      'https://uhs-backend.onrender.com/api/daily-log/log',
      logData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Failed to create/update daily log:', error);
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || `Server error: ${error.response.status}`;
      throw new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error("Network error: Unable to connect to server");
    } else {
      // Something else happened
      throw new Error(error.message || "Failed to create/update daily log");
    }
  }
};

export const fetchDailyLogs = async (
  locationId: string, 
  startDate: string, 
  endDate: string
): Promise<DailyMedicineLog[]> => {
  try {
    // Validate input parameters
    if (!locationId || !startDate || !endDate) {
      throw new Error("All parameters are required: locationId, startDate, and endDate");
    }

    if (!validateDateFormat(startDate) || !validateDateFormat(endDate)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD format.");
    }

    // Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      throw new Error("Start date cannot be later than end date");
    }

    const token = getAuthToken();

    const response = await axios.get(
      `https://uhs-backend.onrender.com/api/daily-log/logs?locationId=${locationId}&startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 15000 // 15 seconds timeout for data fetching
      }
    );

    return response.data || [];
  } catch (error: any) {
    console.error('Failed to fetch daily logs:', error);
    
    if (error.response) {
      const message = error.response.data?.message || `Server error: ${error.response.status}`;
      throw new Error(message);
    } else if (error.request) {
      throw new Error("Network error: Unable to connect to server");
    } else {
      throw new Error(error.message || "Failed to fetch daily logs");
    }
  }
};

export const exportDailyLogsToExcel = async (
  locationId: string, 
  filterType: FilterType
): Promise<void> => {
  try {
    // Validate input parameters
    if (!locationId) {
      throw new Error("Location ID is required");
    }

    if (!['day', 'week', 'month', 'year'].includes(filterType)) {
      throw new Error("Invalid filter type. Must be one of: day, week, month, year");
    }

    const token = getAuthToken();

    const response = await axios.get(
      `https://uhs-backend.onrender.com/api/daily-log/export?locationId=${locationId}&filterType=${filterType}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob',
        timeout: 30000 // 30 seconds timeout for file export
      }
    );

    // Check if response is actually a blob
    if (!(response.data instanceof Blob)) {
      throw new Error("Invalid response format from server");
    }

    // Check if the blob has content
    if (response.data.size === 0) {
      throw new Error("No data available for export");
    }

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `daily_logs_${filterType}_${currentDate}.xlsx`;

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);

    console.log(`Successfully exported daily logs: ${filename}`);
  } catch (error: any) {
    console.error('Failed to export daily logs:', error);
    
    if (error.response) {
      // Handle specific server errors
      if (error.response.status === 404) {
        throw new Error("No daily logs found for the specified criteria");
      } else if (error.response.status === 403) {
        throw new Error("You don't have permission to export daily logs");
      } else {
        const message = error.response.data?.message || `Server error: ${error.response.status}`;
        throw new Error(message);
      }
    } else if (error.request) {
      throw new Error("Network error: Unable to connect to server");
    } else {
      throw new Error(error.message || "Failed to export daily logs");
    }
  }
};

// Helper function for manual daily log entry
export const createDailyLogEntry = (
  stockId: string,
  locationId: string,
  date: string,
  openingBalance: number,
  medicineConsumed: number,
  medicineBalance: number,
  enteredBy?: string
): DailyLogData => {
  return {
    stockId,
    locationId,
    date,
    openingBalance,
    medicineConsumed,
    medicineBalance,
    enteredBy: enteredBy || 'system'
  };
};

// Helper function to get today's date in YYYY-MM-DD format
export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Helper function to validate daily log data
export const validateDailyLogData = (logData: DailyLogData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!logData.stockId) errors.push("Stock ID is required");
  if (!logData.locationId) errors.push("Location ID is required");
  if (!logData.date) errors.push("Date is required");
  if (!validateDateFormat(logData.date)) errors.push("Invalid date format (use YYYY-MM-DD)");
  if (logData.openingBalance < 0) errors.push("Opening balance cannot be negative");
  if (logData.medicineConsumed < 0) errors.push("Medicine consumed cannot be negative");
  if (logData.medicineBalance < 0) errors.push("Medicine balance cannot be negative");
  if (!logData.enteredBy) errors.push("Entered by field is required");

  return {
    isValid: errors.length === 0,
    errors
  };
};

export { type DailyLogData, type DailyMedicineLog, type FilterType };
