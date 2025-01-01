// prisma/seeds/masterData.ts
import { PrismaClient } from '@prisma/client';
import { VendorStatus, VendorCategory } from '../../src/types/master.types';

const prisma = new PrismaClient();

async function seedMasterData() {
    try {
        console.log('Starting seed...');

        // Clear existing data (optional)
        console.log('Clearing existing data...');
        await prisma.itemSpecification.deleteMany();
        await prisma.itemMaster.deleteMany();
        await prisma.vendor.deleteMany();

        // Seed Items
        const items = [
            {
                itemCode: 'ELE-001',
                description: 'Industrial Circuit Breaker 100A',
                category: 'ELECTRICAL',
                unit: 'PCS',
                specifications: [
                    { key: 'amperage', value: '100A', mandatory: true },
                    { key: 'voltage', value: '440V', mandatory: true },
                    { key: 'phase', value: '3-Phase', mandatory: true }
                ]
            },
            {
                itemCode: 'ELE-002',
                description: 'Power Cable 4-Core',
                category: 'ELECTRICAL',
                unit: 'MTR',
                specifications: [
                    { key: 'size', value: '25 sq mm', mandatory: true },
                    { key: 'insulation', value: 'XLPE', mandatory: true }
                ]
            },
            {
                itemCode: 'MECH-001',
                description: 'Industrial Pump Set',
                category: 'MECHANICAL',
                unit: 'SET',
                specifications: [
                    { key: 'power', value: '10 HP', mandatory: true },
                    { key: 'flow_rate', value: '100 LPM', mandatory: true },
                    { key: 'head', value: '30m', mandatory: true }
                ]
            },
            {
                itemCode: 'IT-001',
                description: 'Desktop Computer',
                category: 'IT_EQUIPMENT',
                unit: 'SET',
                specifications: [
                    { key: 'processor', value: 'Intel i7', mandatory: true },
                    { key: 'ram', value: '16GB', mandatory: true },
                    { key: 'storage', value: '512GB SSD', mandatory: true }
                ]
            },
            {
                itemCode: 'SAFE-001',
                description: 'Safety Helmet',
                category: 'SAFETY_EQUIPMENT',
                unit: 'PCS',
                specifications: [
                    { key: 'material', value: 'HDPE', mandatory: true },
                    { key: 'standard', value: 'IS 2925', mandatory: true }
                ]
            }
        ];

        // Seed Vendors
        const vendors = [
            {
                name: 'Electrical Solutions Pvt Ltd',
                email: 'contact@electricalsolutions.com',
                phone: '9876543210',
                address: '123 Industrial Area',
                city: 'Mumbai',
                state: 'Maharashtra',
                country: 'India',
                pinCode: '400001',
                gstin: '27AAAAA0000A1Z5',
                pan: 'AAAAA0000A',
                contactPerson: 'John Doe',
                contactEmail: 'john@electricalsolutions.com',
                contactPhone: '9876543211',
                category: ['SUPPLIES', 'SERVICES'],
                status: 'ACTIVE'
            },
            {
                name: 'Mechanical Works India',
                email: 'info@mechanicalworks.com',
                phone: '9876543220',
                address: '456 MIDC',
                city: 'Pune',
                state: 'Maharashtra',
                country: 'India',
                pinCode: '411001',
                gstin: '27BBBBB0000B1Z5',
                pan: 'BBBBB0000B',
                contactPerson: 'Jane Smith',
                contactEmail: 'jane@mechanicalworks.com',
                contactPhone: '9876543221',
                category: ['WORKS'],
                status: 'ACTIVE'
            },
            {
                name: 'IT Systems & Services',
                email: 'contact@itsystems.com',
                phone: '9876543230',
                address: '789 Tech Park',
                city: 'Bangalore',
                state: 'Karnataka',
                country: 'India',
                pinCode: '560001',
                gstin: '29CCCCC0000C1Z5',
                pan: 'CCCCC0000C',
                contactPerson: 'Mike Johnson',
                contactEmail: 'mike@itsystems.com',
                contactPhone: '9876543231',
                category: ['SERVICES', 'CONSULTING'],
                status: 'ACTIVE'
            }
        ];

        // Insert Items
        console.log('Seeding items...');
        for (const item of items) {
            await prisma.itemMaster.upsert({
                where: { itemCode: item.itemCode },
                update: {
                    description: item.description,
                    category: item.category,
                    unit: item.unit,
                    isActive: true,
                    specifications: {
                        deleteMany: {},
                        create: item.specifications
                    }
                },
                create: {
                    itemCode: item.itemCode,
                    description: item.description,
                    category: item.category,
                    unit: item.unit,
                    isActive: true,
                    specifications: {
                        create: item.specifications
                    }
                }
            });
            console.log(`Upserted item: ${item.itemCode}`);
        }

        // Insert Vendors
        console.log('Seeding vendors...');
        for (const vendor of vendors) {
            await prisma.vendor.upsert({
                where: { email: vendor.email },
                update: {
                    name: vendor.name,
                    phone: vendor.phone,
                    address: vendor.address,
                    city: vendor.city,
                    state: vendor.state,
                    country: vendor.country,
                    pinCode: vendor.pinCode,
                    gstin: vendor.gstin,
                    pan: vendor.pan,
                    contactPerson: vendor.contactPerson,
                    contactEmail: vendor.contactEmail,
                    contactPhone: vendor.contactPhone,
                    category: vendor.category,
                    status: vendor.status
                },
                create: {
                    name: vendor.name,
                    email: vendor.email,
                    phone: vendor.phone,
                    address: vendor.address,
                    city: vendor.city,
                    state: vendor.state,
                    country: vendor.country,
                    pinCode: vendor.pinCode,
                    gstin: vendor.gstin,
                    pan: vendor.pan,
                    contactPerson: vendor.contactPerson,
                    contactEmail: vendor.contactEmail,
                    contactPhone: vendor.contactPhone,
                    category: vendor.category,
                    status: vendor.status
                }
            });
            console.log(`Upserted vendor: ${vendor.name}`);
        }

        console.log('Seed completed successfully');
    } catch (error) {
        console.error('Error seeding data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedMasterData()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });