// src/routes/private.tsx
import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { SuspenseWrapper } from '../components/shared/SuspenseWrapper'

// Correct lazy loading implementation
const DashboardPage = lazy(() => 
  import('../modules/dashboard/pages/DashboardPage').then(module => ({
    default: module.default || module.DashboardPage
  }))
);

const EMDTrackingPage = lazy(() => 
  import('../modules/emd-tracking/pages/EMDTrackingPage').then(module => ({
    default: module.default || module.EMDTrackingPage
  }))
);

const BODashboard = lazy(() => 
  import('../modules/budgetary-offer/pages/BODashboard').then(module => ({
    default: module.default || module.BODashboard
  }))
);

const CreateBO = lazy(() => 
  import('../modules/budgetary-offer/pages/CreateBO').then(module => ({
    default: module.default || module.CreateBO
  }))
);

const EditBO = lazy(() => 
  import('../modules/budgetary-offer/pages/EditBO').then(module => ({
    default: module.default || module.EditBO
  }))
);

const ViewBO = lazy(() => 
  import('../modules/budgetary-offer/pages/ViewBO').then(module => ({
    default: module.default || module.ViewBO
  }))
);

const BOList = lazy(() => 
  import('../modules/budgetary-offer/pages/BOList').then(module => ({
    default: module.default || module.BOList
  }))
);


const BudgetaryOffersPage = lazy(() => 
  import('../modules/budgetary-offer/pages/BudgetaryOffersPage').then(module => ({
    default: module.default || module.BudgetaryOffersPage
  }))
);

const PurchaseOrdersPage = lazy(() => 
  import('../modules/purchase-orders/pages/PurchaseOrdersPage').then(module => ({
    default: module.default || module.PurchaseOrdersPage
  }))
);

const PurchaseOrderDetails = lazy(() => 
  import('../modules/purchase-orders/pages/PurchaseOrderDetailsPage').then(module => ({
    default: module.default || module.PurchaseOrderDetailsPage
  }))
);

const CreatePOPage = lazy(() => 
  import('../modules/purchase-orders/pages/CreatePOPage').then(module => ({
    default: module.default || module.CreatePOPage
  }))
);

const EditPOPage = lazy(() => 
  import('../modules/purchase-orders/pages/EditPOPage').then(module => ({
    default: module.default || module.EditPOPage
  }))
);

const LoaManagementPage = lazy(() => 
  import('../modules/loa-management/pages/LoaManagementPage').then(module => ({
    default: module.default || module.LOAManagementPage
  }))
);

const ItemMasterPage = lazy(() => 
  import('../modules/master-data/pages/ItemMasterPage').then(module => ({
    default: module.default || module.ItemMasterPage
  }))
);

const VendorMasterPage = lazy(() => 
  import('../modules/master-data/pages/VendorMasterPage').then(module => ({
    default: module.default || module.VendorMasterPage
  }))
);


const MasterDataDashboard = lazy(() => 
  import('../modules/master-data/pages/MasterDataDashboard').then(module => ({
    default: module.default || module.MasterDataDashboard
  }))
);

export const privateRoutes: RouteObject[] = [
  {
    path: 'dashboard',
    element: (
      <SuspenseWrapper>
        <DashboardPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: 'budgetary-offers',
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <BODashboard />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'create',
        element: (
          <SuspenseWrapper>
            <CreateBO />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'edit/:id',
        element: (
          <SuspenseWrapper>
            <EditBO />
          </SuspenseWrapper>
        ),
      },
      {
        path: ':id',
        element: (
          <SuspenseWrapper>
            <ViewBO />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'list',
        element: (
          <SuspenseWrapper>
            <BOList />
          </SuspenseWrapper>
        ),
      }
    ],
    // element: (
    //   <SuspenseWrapper>
    //     <BudgetaryOffersPage />
    //   </SuspenseWrapper>
    // ),
  },
  {
    path: 'purchase-orders',
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <PurchaseOrdersPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'create',
        element: (
          <SuspenseWrapper>
            <CreatePOPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'edit/:id',
        element: (
          <SuspenseWrapper>
            <EditPOPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: ':id',
        element: (
          <SuspenseWrapper>
            <PurchaseOrderDetails />
          </SuspenseWrapper>
        ),
      }
    ]
  },
  {
    path: 'emd-tracking',
    element: (
      <SuspenseWrapper>
        <EMDTrackingPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: 'loa-management',
    element: (
      <SuspenseWrapper>
        <LoaManagementPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: 'master-data',
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <MasterDataDashboard />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'items',
        element: (
          <SuspenseWrapper>
            <ItemMasterPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'vendors',
        element: (
          <SuspenseWrapper>
            <VendorMasterPage />
          </SuspenseWrapper>
        ),
      }
    ]
  },
];