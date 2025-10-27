import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create dummy shipping addresses
  const shippingAddresses = [
    {
      label: 'Main Office',
      address: '123 Business Park, Tower A, Floor 5\nMumbai, Maharashtra - 400001\nIndia',
      isDefault: true,
    },
    {
      label: 'Warehouse - Delhi',
      address: 'Plot No. 456, Industrial Area\nSector 18, Gurgaon\nHaryana - 122015\nIndia',
      isDefault: false,
    },
    {
      label: 'Site Office - Bangalore',
      address: 'Tech Park Campus, Building B\nWhitefield, Bangalore\nKarnataka - 560066\nIndia',
      isDefault: false,
    },
    {
      label: 'Regional Office - Pune',
      address: 'Rajiv Gandhi IT Park, Phase 2\nHinjewadi, Pune\nMaharashtra - 411057\nIndia',
      isDefault: false,
    },
    {
      label: 'Construction Site - Noida',
      address: 'Greater Noida Industrial Area\nSector 63, Noida\nUttar Pradesh - 201301\nIndia',
      isDefault: false,
    },
  ];

  for (const address of shippingAddresses) {
    await prisma.shippingAddress.create({
      data: address,
    });
    console.log(`Created shipping address: ${address.label}`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
