import { Box, BoxProps } from '@mui/material';
import { styled } from '@mui/system';

interface FlexBetweenProps extends BoxProps {
  backgroundColor?: string;
}

const FlexBetween = styled(Box)<FlexBetweenProps>(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
}));

export default FlexBetween;
