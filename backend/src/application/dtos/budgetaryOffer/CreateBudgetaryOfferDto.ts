export interface CreateBudgetaryOfferDto {
    tags: string[];
    offerDate: string;
    toAuthority: string;
    subject: string;
    customerId: string;
    workItems: {
      description: string;
      quantity: number;
      unitOfMeasurement: string;
      baseRate: number;
      taxRate: number;
    }[];
    termsConditions: string;
    approverId: string;
  }