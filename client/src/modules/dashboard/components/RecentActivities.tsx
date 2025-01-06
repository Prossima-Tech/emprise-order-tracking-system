// // src/modules/dashboard/components/RecentActivities.tsx
// import { List, Avatar, Tag } from 'antd';
// import { useQuery } from '../../../hooks/useQuery';
// import { dashboardApi } from '../services';
// import { formatDistanceToNow } from 'date-fns';
// import styles from './RecentActivities.module.css';

// interface Activity {
//   id: string;
//   type: string;
//   description: string;
//   user: {
//     name: string;
//     avatar: string;
//   };
//   timestamp: string;
// }

export const RecentActivities = () => {
  const activities = [
    {
      id: 1,
      title: "Purchase Order Created",
      time: "2 hours ago",
      status: "success"
    },
    {
      id: 2,
      title: "LOA Approval Pending",
      time: "5 hours ago",
      status: "pending"
    },
    {
      id: 3,
      title: "EMD Submitted",
      time: "1 day ago",
      status: "success"
    }
  ];

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${
            activity.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
          <div>
            <p className="text-sm font-medium">{activity.title}</p>
            <p className="text-xs text-gray-500">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivities;