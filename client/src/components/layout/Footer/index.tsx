import { Layout } from 'antd';

export const Footer = () => {
  return (
    <Layout.Footer className="h-14 g-white border-t border-gray-200 p-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-gray-600 mb-2 md:mb-0">
          ©{new Date().getFullYear()} Your Company. All rights reserved.
        </div>
        <div className="flex gap-6">
          <a href="/privacy" className="text-gray-600 hover:text-blue-500">
            Privacy Policy
          </a>
          <a href="/terms" className="text-gray-600 hover:text-blue-500">
            Terms of Service
          </a>
          <a href="/support" className="text-gray-600 hover:text-blue-500">
            Support
          </a>
        </div>
      </div>
    </Layout.Footer>
  );
};