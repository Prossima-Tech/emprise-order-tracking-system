// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create Departments
    const departments = await Promise.all([
      prisma.department.upsert({
        where: { deptCode: 'ADMIN' },
        update: {},
        create: {
          deptCode: 'ADMIN',
          deptName: 'Administration',
          isActive: true
        }
      }),
      prisma.department.upsert({
        where: { deptCode: 'ENG' },
        update: {},
        create: {
          deptCode: 'ENG',
          deptName: 'Engineering',
          isActive: true
        }
      }),
      prisma.department.upsert({
        where: { deptCode: 'PROC' },
        update: {},
        create: {
          deptCode: 'PROC',
          deptName: 'Procurement',
          isActive: true
        }
      })
    ]);

    // Create Users
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'System Admin',
        role: 'ADMIN',
        passwordHash: await hash('Admin@123', 10),
        departmentId: departments[0].id,
        isActive: true
      }
    });

    const managerUser = await prisma.user.upsert({
      where: { email: 'manager@example.com' },
      update: {},
      create: {
        email: 'manager@example.com',
        name: 'Project Manager',
        role: 'MANAGER',
        passwordHash: await hash('Manager@123', 10),
        departmentId: departments[1].id,
        isActive: true
      }
    });

    // // Create Vendors
    // const vendor = await prisma.vendor.create({
    //   data: {
    //     name: 'Test Vendor',
    //     email: 'vendor@example.com',
    //     phone: '1234567890',
    //     status: 'ACTIVE'
    //   }
    // });

    // // Create Items
    // const item = await prisma.itemMaster.create({
    //   data: {
    //     itemCode: 'ITEM-001',
    //     description: 'Test Item',
    //     category: 'ELECTRONICS',
    //     unit: 'PCS',
    //     specifications: {
    //       create: [
    //         {
    //           key: 'color',
    //           value: 'black',
    //           mandatory: true
    //         }
    //       ]
    //     },
    //     isActive: true
    //   }
    // });

    // Create Budgetary Offer
    const budgetaryOffer = await prisma.budgetaryOffer.create({
      data: {
        tenderNo: 'TENDER-2024-001',
        amount: new Decimal(1000000),
        emdAmount: new Decimal(20000),
        dueDate: new Date('2024-12-31'),
        status: 'DRAFT',
        createdById: adminUser.id
      }
    });

    console.log('Seed data created successfully');
    console.log({
      departments: departments.map(d => ({ code: d.deptCode, name: d.deptName })),
      users: [
        { email: adminUser.email, role: adminUser.role },
        { email: managerUser.email, role: managerUser.role }
      ],
      // vendor: { name: vendor.name, email: vendor.email },
      // item: { code: item.itemCode, description: item.description },
      budgetaryOffer: { tenderNo: budgetaryOffer.tenderNo, amount: budgetaryOffer.amount }
    });

  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });