// src/modules/budgetary-offer/utils/dummyData.ts

import { BudgetaryOfferStatus } from '@emprise/shared/src/types/budgetary-offer';

export const dummyBudgetaryOffers = [
  {
    id: 'bo-001',
    fromAuthority: 'ABC Construction Company Ltd.',
    toAuthority: 'Municipal Corporation of Delhi',
    subject: 'Construction of Public Park and Recreation Facilities in Sector-15',
    workItems: [
      {
        description: 'Site preparation and ground leveling work including removal of debris',
        basicRate: 250000,
        unit: 'Sq. Meter',
        taxRate: 18
      },
      {
        description: 'Supply and installation of outdoor gym equipment with weather-resistant coating',
        basicRate: 450000,
        unit: 'Set',
        taxRate: 12
      },
      {
        description: 'Landscaping work including plantation of trees and irrigation system',
        basicRate: 350000,
        unit: 'Acre',
        taxRate: 18
      }
    ],
    emdDetails: {
      amount: 50000,
      paymentMode: 'BG',
      validityPeriod: 180,
      remarks: 'Bank Guarantee from State Bank of India, Branch: Delhi Main'
    },
    termsAndConditions: `
      <h2>Terms and Conditions</h2>
      <ol>
        <li><strong>Validity:</strong> This budgetary offer is valid for 60 days from the date of submission.</li>
        <li><strong>Payment Terms:</strong>
          <ul>
            <li>30% advance payment</li>
            <li>40% on completion of 50% work</li>
            <li>30% on completion of work</li>
          </ul>
        </li>
        <li><strong>Timeline:</strong> The project will be completed within 120 days from the date of work order.</li>
        <li><strong>Warranty:</strong> 12 months warranty on installed equipment from the date of completion.</li>
      </ol>
    `,
    status: BudgetaryOfferStatus.SUBMITTED,
    createdById: 'user-001',
    createdBy: {
      name: 'John Doe',
      email: 'john.doe@example.com'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'bo-002',
    fromAuthority: 'XYZ Power Solutions Pvt. Ltd.',
    toAuthority: 'State Electricity Board',
    subject: 'Installation of Solar Panels and Power Backup Systems for Government Buildings',
    workItems: [
      {
        description: 'Supply and installation of 500KW solar panels with mounting structures',
        basicRate: 750000,
        unit: 'KW',
        taxRate: 12
      },
      {
        description: 'Installation of power conditioning units and inverters',
        basicRate: 280000,
        unit: 'Unit',
        taxRate: 18
      },
      {
        description: 'Battery bank setup with monitoring system',
        basicRate: 420000,
        unit: 'Set',
        taxRate: 18
      }
    ],
    emdDetails: {
      amount: 75000,
      paymentMode: 'DD',
      validityPeriod: 90,
      remarks: 'Demand Draft from HDFC Bank'
    },
    termsAndConditions: `
      <h2>Terms and Conditions</h2>
      <ol>
        <li><strong>Scope:</strong> Supply, installation, testing, and commissioning of complete system.</li>
        <li><strong>Payment Terms:</strong>
          <ul>
            <li>40% advance with purchase order</li>
            <li>30% after material delivery</li>
            <li>20% after installation</li>
            <li>10% after commissioning</li>
          </ul>
        </li>
        <li><strong>Warranty:</strong>
          <ul>
            <li>Solar Panels: 25 years performance warranty</li>
            <li>Inverters: 5 years</li>
            <li>Batteries: 3 years</li>
          </ul>
        </li>
      </ol>
    `,
    status: BudgetaryOfferStatus.APPROVED,
    createdById: 'user-002',
    createdBy: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com'
    },
    createdAt: '2024-01-10T15:45:00Z',
    updatedAt: '2024-01-12T09:20:00Z'
  },
  {
    id: 'bo-003',
    fromAuthority: 'Modern Infrastructure Ltd.',
    toAuthority: 'Airport Authority of India',
    subject: 'Renovation and Modernization of Airport Terminal Building',
    workItems: [
      {
        description: 'Interior renovation including flooring and ceiling work',
        basicRate: 1200000,
        unit: 'Sq. Ft',
        taxRate: 18
      },
      {
        description: 'HVAC system upgrade with energy-efficient units',
        basicRate: 850000,
        unit: 'Unit',
        taxRate: 12
      },
      {
        description: 'Smart lighting system installation with controls',
        basicRate: 320000,
        unit: 'Point',
        taxRate: 18
      }
    ],
    emdDetails: {
      amount: 120000,
      paymentMode: 'BG',
      validityPeriod: 365,
      remarks: 'Bank Guarantee from ICICI Bank'
    },
    termsAndConditions: `
      <h2>Terms and Conditions</h2>
      <ol>
        <li><strong>Project Duration:</strong> 18 months from date of commencement</li>
        <li><strong>Payment Schedule:</strong>
          <ul>
            <li>20% mobilization advance</li>
            <li>Progressive payments against monthly RA bills</li>
            <li>10% retention money</li>
          </ul>
        </li>
        <li><strong>Quality Assurance:</strong> All work to be executed as per international standards</li>
        <li><strong>Safety Measures:</strong> Strict adherence to airport safety protocols</li>
      </ol>
    `,
    status: BudgetaryOfferStatus.DRAFT,
    createdById: 'user-003',
    createdBy: {
      name: 'Robert Johnson',
      email: 'robert.j@example.com'
    },
    createdAt: '2024-01-20T08:15:00Z',
    updatedAt: '2024-01-20T08:15:00Z'
  }
];

export const dummyStatistics = {
  total: 3,
  totalWorkItems: 9,
  totalValue: 4840000,
  totalEMDValue: 245000,
  byStatus: {
    DRAFT: 1,
    SUBMITTED: 1,
    APPROVED: 1,
    REJECTED: 0
  },
  emdByPaymentMode: {
    BG: 2,
    DD: 1,
    ONLINE: 0,
    CASH: 0
  },
  averageEMDPercentage: 5.06
};

// Mock service implementation
export const mockBOService = {
  createOffer: async (data: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      ...data,
      id: `bo-${Date.now()}`,
      status: BudgetaryOfferStatus.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: {
        name: 'Test User',
        email: 'test@example.com'
      }
    };
  },

  updateOffer: async (id: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      ...data,
      id,
      updatedAt: new Date().toISOString()
    };
  },

  getOffer: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const offer = dummyBudgetaryOffers.find(bo => bo.id === id);
    if (!offer) throw new Error('Offer not found');
    return offer;
  },

  listOffers: async (params: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: dummyBudgetaryOffers,
      pagination: {
        total: dummyBudgetaryOffers.length,
        current: 1,
        pageSize: 10
      }
    };
  },

  updateStatus: async (id: string, status: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const offer = dummyBudgetaryOffers.find(bo => bo.id === id);
    if (!offer) throw new Error('Offer not found');
    return {
      ...offer,
      status,
      updatedAt: new Date().toISOString()
    };
  },

  getStatistics: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return dummyStatistics;
  },

  calculateValue: async (workItems: any[]) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const totalValue = workItems.reduce((sum, item) => {
      const itemValue = item.basicRate * (1 + item.taxRate / 100);
      return sum + itemValue;
    }, 0);

    return {
      totalValue,
      suggestedEMD: totalValue * 0.02,
      maxEMD: totalValue * 0.05,
      breakdown: workItems.map(item => ({
        description: item.description,
        basicValue: item.basicRate,
        taxValue: item.basicRate * (item.taxRate / 100),
        totalValue: item.basicRate * (1 + item.taxRate / 100)
      }))
    };
  }
};