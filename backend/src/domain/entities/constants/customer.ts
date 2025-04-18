// domain/entities/constants/customer.ts
export type Customer = {
    id: string;
    name: string;
    headquarters: string;
  };
  
  export let CUSTOMERS: Customer[] = [
    {
      id: "CR",
      name: "Central Railway",
      headquarters: "Mumbai"
    },
    {
      id: "ER",
      name: "Eastern Railway",
      headquarters: "Kolkata"
    },
    {
      id: "ECR",
      name: "East Central Railway",
      headquarters: "Hajipur"
    },
    {
      id: "ECoR",
      name: "East Coast Railway",
      headquarters: "Bhubaneswar"
    },
    {
      id: "NR",
      name: "Northern Railway",
      headquarters: "New Delhi"
    },
    {
      id: "NCR",
      name: "North Central Railway",
      headquarters: "Allahabad"
    },
    {
      id: "NER",
      name: "North Eastern Railway",
      headquarters: "Gorakhpur"
    },
    {
      id: "NFR",
      name: "Northeast Frontier Railway",
      headquarters: "Guwahati"
    },
    {
      id: "NWR",
      name: "North Western Railway",
      headquarters: "Jaipur"
    },
    {
      id: "SR",
      name: "Southern Railway",
      headquarters: "Chennai"
    },
    {
      id: "SCR",
      name: "South Central Railway",
      headquarters: "Secunderabad"
    },
    {
      id: "SER",
      name: "South Eastern Railway",
      headquarters: "Kolkata"
    },
    {
      id: "SECR",
      name: "South East Central Railway",
      headquarters: "Bilaspur"
    },
    {
      id: "SWR",
      name: "South Western Railway",
      headquarters: "Hubli"
    },
    {
      id: "WR",
      name: "Western Railway",
      headquarters: "Mumbai"
    },
    {
      id: "WCR",
      name: "West Central Railway",
      headquarters: "Jabalpur"
    },
    {
      id: "MR",
      name: "Metro Railway",
      headquarters: "Kolkata"
    }
  ];
  
  // Helper functions
  export const getCustomerById = (customerId: string): Customer | undefined => {
    return CUSTOMERS.find(customer => customer.id === customerId);
  };
  
  export const getCustomerByName = (name: string): Customer | undefined => {
    return CUSTOMERS.find(customer => customer.name === name);
  };
  
  export const getAllCustomerIds = (): string[] => {
    return CUSTOMERS.map(customer => customer.id);
  };
  
  export const getAllCustomerNames = (): string[] => {
    return CUSTOMERS.map(customer => customer.name);
  };
  
  // Type for form selections
  export type CustomerOption = {
    label: string;
    value: string;
    headquarters: string;
  };
  
  // Helper function to convert customers to select options
  export const getCustomerOptions = (): CustomerOption[] => {
    return CUSTOMERS.map(customer => ({
      label: customer.name,
      value: customer.id,
      headquarters: customer.headquarters
    }));
  }; 