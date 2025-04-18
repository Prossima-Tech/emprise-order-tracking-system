import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { TenderList } from '../components/TenderList';
import { useTenders } from '../hooks/use-tenders';
import { Tender } from '../types/tender';
import { LoadingSpinner } from '../../../components/feedback/LoadingSpinner';

export function TendersListPage() {
  const [, setTenders] = useState<Tender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<boolean>(false);
  const { getAllTenders } = useTenders();

  // Use an effect to fetch tenders only once on component mount
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getAllTenders();
        if (isMounted) {
          setTenders(data || []);
          setError(false);
        }
      } catch (error) {
        console.error('Failed to fetch tenders', error);
        if (isMounted) {
          setTenders([]);
          setError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>Tenders | Emprise Order Tracking</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Tenders</h1>
        </div>
        <TenderList />
      </div>
    </>
  );
} 