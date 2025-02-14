import { Box } from '@mui/material';
import { useSelector } from 'react-redux';

import { getIsLoggedIn } from '@/state/auth/auth.selectors.ts';
import { selectPersons } from '@/state/person/person.selectors.ts';

const Dashboard: React.FC = () => {
  const persons = useSelector(selectPersons);

  console.log(persons);

  const isLoggedIn: boolean = useSelector(getIsLoggedIn);

  console.log(isLoggedIn);
  return <Box m="1.5rem 2.5rem" />;
};

export default Dashboard;
