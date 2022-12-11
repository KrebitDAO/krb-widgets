import { useState, ChangeEvent } from 'react';

import { Wrapper } from './styles';

import { StyledEngineProvider } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import MaterialRating from '@mui/material/Rating';

interface IProps {
  label: string;
  name?: string;
  value?: number;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
  readOnly?: boolean;
}

export const Rating = (props: IProps) => {
  const {
    label,
    name,
    value,
    onChange,
    isDisabled = false,
    readOnly = false
  } = props;
  const [hover, setHover] = useState(-1);

  return (
    <StyledEngineProvider injectFirst>
      <Wrapper>
        <FormControlLabel
          control={
            <MaterialRating
              value={value || 2.5}
              onChange={isDisabled ? undefined : onChange}
              name={name}
              disabled={isDisabled}
              precision={0.5}
              onChangeActive={(event, newHover) => {
                setHover(newHover);
              }}
              readOnly={readOnly}
            />
          }
          disabled={isDisabled}
          label={hover !== -1 ? `Rating: ${hover * 2}/10` : label}
        />
      </Wrapper>
    </StyledEngineProvider>
  );
};
