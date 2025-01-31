export interface CreateBudgetaryOfferDto {
    tags: any;
    offerDate: string;
    toAuthority: string;
    subject: string;
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