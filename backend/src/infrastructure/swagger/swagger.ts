// src/infrastructure/swagger/swagger.ts

import swaggerJsdoc from 'swagger-jsdoc';
import config from '../../config';

// Define the base Swagger/OpenAPI configuration
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Procurement Management API',
    version: '1.0.0',
    description: 'API documentation for procurement management system with comprehensive features including budgetary offers, purchase orders, and vendor management.'
  },
  servers: [
    {
      url: `http://localhost:${config.port}/api`,
      description: 'Development server'
    }
  ],
  components: {
    // Security scheme definition for JWT authentication
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      // Primary Domain Models
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'Unique identifier for the user' },
          email: { type: 'string', format: 'email', description: 'User email address' },
          name: { type: 'string', description: 'Full name of the user' },
          role: {
            type: 'string',
            enum: ['ADMIN', 'MANAGER', 'STAFF'],
            description: 'User role determining access permissions'
          },
          department: { type: 'string', description: 'Department the user belongs to' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },

      // Authentication DTOs
      LoginDto: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' }
        },
        example: {
          email: "user@example.com",
          password: "securePassword123"
        }
      },

      RegisterUserDto: {
        type: 'object',
        required: ['email', 'password', 'name', 'role'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'STAFF'] },
          department: { type: 'string' }
        }
      },

      // Budgetary Offer Related Schemas
      BudgetaryOffer: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          offerId: { type: 'string', description: 'Formatted offer ID (e.g., BO/2024/0001)' },
          offerDate: { type: 'string', format: 'date-time' },
          toAuthority: { type: 'string' },
          subject: { type: 'string' },
          workItems: {
            type: 'array',
            items: { $ref: '#/components/schemas/WorkItem' }
          },
          termsConditions: { type: 'string' },
          documentUrl: { type: 'string' },
          documentHash: { type: 'string', description: 'Hash for document verification' },
          status: {
            type: 'string',
            enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED']
          },
          createdById: { type: 'string' },
          approverId: { type: 'string' },
          approvalComments: { type: 'string' },
          approvalDate: { type: 'string', format: 'date-time' },
          approvalHistory: {
            type: 'array',
            items: { $ref: '#/components/schemas/ApprovalAction' }
          },
          tags: { type: 'array', items: { type: 'string' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },

      CreateBudgetaryOfferDto: {
        type: 'object',
        required: ['offerDate', 'toAuthority', 'subject', 'workItems', 'termsConditions', 'approverId'],
        properties: {
          tags: { type: 'array', items: { type: 'string' } },
          offerDate: { type: 'string', format: 'date' },
          toAuthority: { type: 'string' },
          subject: { type: 'string' },
          workItems: {
            type: 'array',
            items: { $ref: '#/components/schemas/WorkItem' }
          },
          termsConditions: { type: 'string' },
          approverId: { type: 'string' }
        },
        example: {
          tags: ["urgent", "new"],
          offerDate: "2024-01-23",
          toAuthority: "Central Procurement",
          subject: "Supply of Equipment",
          workItems: [
            {
              description: "Industrial Generator",
              quantity: 2,
              unitOfMeasurement: "units",
              baseRate: 50000,
              taxRate: 18
            }
          ],
          termsConditions: "Delivery within 30 days",
          approverId: "auth123"
        }
      },

      UpdateBudgetaryOfferDto: {
        type: 'object',
        properties: {
          offerDate: { type: 'string', format: 'date' },
          status: {
            type: 'string',
            enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED']
          },
          toAuthority: { type: 'string' },
          subject: { type: 'string' },
          workItems: {
            type: 'array',
            items: { $ref: '#/components/schemas/WorkItem' }
          },
          termsConditions: { type: 'string' },
          approverId: { type: 'string' }
        }
      },
      CreateVendorDto: {
        type: 'object',
        required: ['name', 'email', 'mobile', 'address', 'bankDetails'],
        properties: {
          name: { type: 'string', description: 'Full legal name of the vendor' },
          email: { type: 'string', format: 'email', description: 'Primary contact email' },
          mobile: { type: 'string', description: 'Contact phone number' },
          gstin: { type: 'string', description: 'GST Identification Number' },
          address: { type: 'string', description: 'Complete postal address' },
          bankDetails: {
            type: 'object',
            required: ['accountNumber', 'accountName', 'bankName', 'branchName', 'ifscCode'],
            properties: {
              accountNumber: { type: 'string', description: 'Bank account number' },
              accountName: { type: 'string', description: 'Name on the bank account' },
              bankName: { type: 'string', description: 'Name of the bank' },
              branchName: { type: 'string', description: 'Branch location' },
              ifscCode: { type: 'string', description: 'IFSC code of the branch' }
            }
          }
        },
        example: {
          name: "ABC Industries Pvt Ltd",
          email: "accounts@abcindustries.com",
          mobile: "+91-9876543210",
          gstin: "27AABCU9603R1ZX",
          address: "123, Industrial Area Phase II, Mumbai - 400001",
          bankDetails: {
            accountNumber: "1234567890",
            accountName: "ABC Industries Pvt Ltd",
            bankName: "State Bank of India",
            branchName: "Mumbai Industrial Branch",
            ifscCode: "SBIN0005943"
          }
        }
      },

      // Item Related Schemas
      CreateItemDto: {
        type: 'object',
        required: ['name', 'unitPrice', 'uom', 'taxRates'],
        properties: {
          name: { type: 'string', description: 'Name of the item' },
          description: { type: 'string', description: 'Detailed description' },
          unitPrice: { type: 'number', description: 'Base price per unit' },
          uom: { type: 'string', description: 'Unit of Measurement' },
          hsnCode: { type: 'string', description: 'HSN/SAC code for GST' },
          taxRates: {
            type: 'object',
            properties: {
              igst: { type: 'number', description: 'IGST percentage' },
              sgst: { type: 'number', description: 'SGST percentage' },
              ugst: { type: 'number', description: 'UGST percentage' }
            }
          }
        },
        example: {
          name: "Industrial Generator XG5000",
          description: "5000W Industrial Grade Power Generator with Auto-start",
          unitPrice: 45000.00,
          uom: "units",
          hsnCode: "8502",
          taxRates: {
            igst: 18,
            sgst: 9,
            ugst: 9
          }
        }
      },

      // VendorItem Related Schemas
      CreateVendorItemDto: {
        type: 'object',
        required: ['itemId', 'unitPrice'],
        properties: {
          itemId: {
            type: 'string',
            format: 'uuid',
            description: 'UUID of the item to be associated with vendor'
          },
          unitPrice: {
            type: 'number',
            description: 'Vendor-specific price for this item'
          }
        },
        example: {
          itemId: "550e8400-e29b-41d4-a716-446655440000",
          unitPrice: 42500.00
        }
      },

      UpdateVendorItemDto: {
        type: 'object',
        required: ['unitPrice'],
        properties: {
          unitPrice: {
            type: 'number',
            description: 'New vendor-specific price for this item'
          }
        },
        example: {
          unitPrice: 43000.00
        }
      },

      // Purchase Order Related Schemas
      PurchaseOrderItemDto: {
        type: 'object',
        required: ['itemId', 'quantity', 'unitPrice', 'taxRate'],
        properties: {
          itemId: { type: 'string' },
          quantity: { type: 'number' },
          unitPrice: { type: 'number' },
          taxRate: { type: 'number' },
          totalAmount: { type: 'number' }
        }
      },

      UpdatePurchaseOrderDto: {
        type: 'object',
        properties: {
          requirementDesc: { type: 'string' },
          termsConditions: { type: 'string' },
          shipToAddress: { type: 'string' },
          notes: { type: 'string' },
          documentFile: { type: 'string', format: 'binary' },
          tags: { type: 'array', items: { type: 'string' } },
          approverId: { type: 'string' },
          status: { type: 'string', enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'] },
          regeneratePdf: { type: 'boolean' },
          approvalNotes: { type: 'string' },
          rejectionReason: { type: 'string' }
        }
      },

      UpdateVendorDto: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          mobile: { type: 'string' },
          gstin: { type: 'string' },
          address: { type: 'string' },
          bankDetails: { $ref: '#/components/schemas/BankDetails' }
        }
      },

      UpdateAmendmentDto: {
        type: 'object',
        properties: {
          amendmentNumber: { type: 'string' },
          documentFile: { type: 'string', format: 'binary' },
          tags: { type: 'array', items: { type: 'string' } }
        }
      },

      SubmitForApprovalDto: {
        type: 'object',
        properties: {
          comments: { type: 'string' }
        }
      },

      ApproveOrderDto: {
        type: 'object',
        properties: {
          comments: { type: 'string' }
        }
      },

      RejectOrderDto: {
        type: 'object',
        required: ['reason'],
        properties: {
          reason: { type: 'string' }
        }
      },

      UpdateItemDto: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          unitPrice: { type: 'number' },
          uom: { type: 'string' },
          hsnCode: { type: 'string' },
          taxRates: { $ref: '#/components/schemas/TaxRates' }
        }
      },
      BankDetails: {
        type: 'object',
        required: ['accountNumber', 'accountName', 'bankName', 'branchName', 'ifscCode'],
        properties: {
          accountNumber: { 
            type: 'string',
            description: 'Bank account number'
          },
          accountName: { 
            type: 'string',
            description: 'Name on the bank account'
          },
          bankName: { 
            type: 'string',
            description: 'Name of the bank'
          },
          branchName: { 
            type: 'string',
            description: 'Branch location'
          },
          ifscCode: { 
            type: 'string',
            description: 'IFSC code of the branch'
          }
        }
      },
      
      // TaxRates schema - used by item-related DTOs
      TaxRates: {
        type: 'object',
        properties: {
          igst: { 
            type: 'number',
            description: 'IGST percentage'
          },
          sgst: { 
            type: 'number',
            description: 'SGST percentage'
          },
          ugst: { 
            type: 'number',
            description: 'UGST percentage'
          }
        }
      },
      
      // CreateAmendmentDto schema - used for LOA amendments
      CreateAmendmentDto: {
        type: 'object',
        required: ['amendmentNumber', 'documentFile'],
        properties: {
          amendmentNumber: { 
            type: 'string',
            description: 'Sequential number for the amendment'
          },
          documentFile: { 
            type: 'string',
            format: 'binary',
            description: 'Amendment document file'
          },
          tags: { 
            type: 'array',
            items: { type: 'string' },
            description: 'Tags for categorizing the amendment'
          }
        }
      },

      // LOA Related Schemas
      LOA: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          loaNumber: { type: 'string' },
          loaValue: { type: 'number', format: 'float' },
          deliveryPeriod: {
            type: 'object',
            properties: {
              start: { type: 'string', format: 'date' },
              end: { type: 'string', format: 'date' }
            }
          },
          workDescription: { type: 'string' },
          documentUrl: { type: 'string' }
        }
      },

      // Purchase Order Related Schemas
      PurchaseOrder: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          poNumber: { type: 'string' },
          loaId: { type: 'string' },
          vendorId: { type: 'string' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/PurchaseOrderItem' }
          },
          requirementDesc: { type: 'string' },
          termsConditions: { type: 'string' },
          shipToAddress: { type: 'string' },
          status: {
            type: 'string',
            enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED']
          }
        }
      },

      // Common Components and Shared Types
      WorkItem: {
        type: 'object',
        required: ['description', 'quantity', 'unitOfMeasurement', 'baseRate', 'taxRate'],
        properties: {
          description: { type: 'string' },
          quantity: { type: 'number' },
          unitOfMeasurement: { type: 'string' },
          baseRate: { type: 'number' },
          taxRate: { type: 'number' }
        }
      },

      ApprovalAction: {
        type: 'object',
        required: ['actionType', 'userId', 'timestamp', 'previousStatus', 'newStatus'],
        properties: {
          actionType: {
            type: 'string',
            enum: ['SUBMIT', 'APPROVE', 'REJECT']
          },
          userId: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
          comments: { type: 'string' },
          previousStatus: { type: 'string' },
          newStatus: { type: 'string' }
        }
      },

      EmailLog: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          budgetaryOfferId: { type: 'string' },
          to: { type: 'array', items: { type: 'string' } },
          cc: { type: 'array', items: { type: 'string' } },
          bcc: { type: 'array', items: { type: 'string' } },
          subject: { type: 'string' },
          content: { type: 'string' },
          messageId: { type: 'string' },
          status: { type: 'string', enum: ['SENT', 'FAILED'] },
          error: { type: 'string' },
          sentAt: { type: 'string', format: 'date-time' }
        }
      },

      // Tender Related Schemas
      Tender: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          tenderNumber: { type: 'string' },
          dueDate: { type: 'string', format: 'date' },
          description: { type: 'string' },
          hasEMD: { type: 'boolean' },
          emdAmount: { type: 'number', format: 'float' },
          status: {
            type: 'string',
            enum: ['ACTIVE', 'CLOSED', 'CANCELLED', 'AWARDED']
          },
          documentUrl: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },

      CreateTenderDto: {
        type: 'object',
        required: ['tenderNumber', 'dueDate', 'description', 'hasEMD'],
        properties: {
          tenderNumber: { type: 'string' },
          dueDate: { type: 'string', format: 'date' },
          description: { type: 'string' },
          hasEMD: { type: 'boolean' },
          emdAmount: { type: 'number', format: 'float' },
          documentFile: { type: 'string', format: 'binary' },
          tags: { type: 'array', items: { type: 'string' } }
        }
      },

      UpdateTenderDto: {
        type: 'object',
        properties: {
          tenderNumber: { type: 'string' },
          dueDate: { type: 'string', format: 'date' },
          description: { type: 'string' },
          hasEMD: { type: 'boolean' },
          emdAmount: { type: 'number', format: 'float' },
          status: {
            type: 'string',
            enum: ['ACTIVE', 'CLOSED', 'CANCELLED', 'AWARDED']
          },
          documentFile: { type: 'string', format: 'binary' },
          tags: { type: 'array', items: { type: 'string' } }
        }
      },

      UpdateTenderStatusDto: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['ACTIVE', 'CLOSED', 'CANCELLED', 'AWARDED']
          }
        }
      },

      // Additional schemas for swagger.ts
      UpdateLoaDto: {
        type: 'object',
        properties: {
          loaNumber: { type: 'string' },
          loaValue: { type: 'number' },
          deliveryPeriod: {
            type: 'object',
            properties: {
              start: { type: 'string', format: 'date' },
              end: { type: 'string', format: 'date' }
            }
          },
          workDescription: { type: 'string' },
          documentFile: { type: 'string', format: 'binary' },
          tags: { type: 'array', items: { type: 'string' } }
        }
      }
    },

    // Common Parameters
    parameters: {
      paginationLimit: {
        in: 'query',
        name: 'limit',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 10
        },
        description: 'Number of items to return per page'
      },
      paginationOffset: {
        in: 'query',
        name: 'offset',
        schema: {
          type: 'integer',
          minimum: 0,
          default: 0
        },
        description: 'Number of items to skip'
      },
      sortField: {
        in: 'query',
        name: 'sortBy',
        schema: { type: 'string' },
        description: 'Field to sort by'
      },
      sortOrder: {
        in: 'query',
        name: 'order',
        schema: {
          type: 'string',
          enum: ['asc', 'desc'],
          default: 'desc'
        },
        description: 'Sort order (ascending or descending)'
      }
    },

    // Common Response Schemas
    responses: {
      UnauthorizedError: {
        description: 'Authentication is required',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                error: { type: 'string' }
              }
            }
          }
        }
      },
      ValidationError: {
        description: 'Invalid input parameters',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  
  // Global security requirement
  security: [{ bearerAuth: [] }],
  // API Tags for grouping endpoints
  tags: [
    { name: 'Auth', description: 'Authentication operations' },
    { name: 'BudgetaryOffer', description: 'Budgetary Offer management' },
    { name: 'LOA', description: 'Letter of Award management' },
    { name: 'Vendor', description: 'Vendor management' },
    { name: 'Item', description: 'Item/Product management' },
    { name: 'PurchaseOrder', description: 'Purchase Order management' },
    { name: 'User', description: 'User management' },
    { name: 'Dashboard', description: 'Dashboard stats and data' },
    { name: 'Site', description: 'Site management' },
    { name: 'Customer', description: 'Customer management' },
    { name: 'Tender', description: 'Tender management' }
  ]
};

// Configure Swagger options
const options = {
  swaggerDefinition,
  // Path to the API docs
  apis: [
    './src/interfaces/http/routes/*.ts',
    './src/domain/entities/*.ts'
  ]
};

// Generate OpenAPI specification
export const specs = swaggerJsdoc(options);