import { useNavigate } from 'react-router-dom';
import { useCredits, CREDIT_COSTS } from '@/hooks/useCredits';
import Billing from '@/pages/Billing';

export default function BillingSettings() {
  return <Billing />;
}
