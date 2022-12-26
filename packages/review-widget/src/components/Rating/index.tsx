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
  iconColor?: string;
  isDarkMode?: boolean;
}

const DEFAULT_VALUE = 2;

export const Rating = (props: IProps) => {
  const {
    label,
    name,
    value,
    onChange,
    isDisabled = false,
    readOnly = false,
    iconColor = 'cyan',
    isDarkMode = true
  } = props;
  const [hover, setHover] = useState(-1);

  return (
    <StyledEngineProvider injectFirst>
      <Wrapper iconColor={iconColor} isDarkMode={isDarkMode}>
        <FormControlLabel
          control={
            <MaterialRating
              value={value || DEFAULT_VALUE}
              defaultValue={DEFAULT_VALUE}
              name={name}
              disabled={isDisabled}
              precision={0.5}
              readOnly={readOnly}
              onChange={isDisabled ? undefined : onChange}
              onChangeActive={(event, newHover) => {
                if (isDisabled) return;

                setHover(newHover);
              }}
            />
          }
          disabled={isDisabled}
          label={`Rating: ${hover === -1 ? value || DEFAULT_VALUE : hover}/5`}
        />
      </Wrapper>
    </StyledEngineProvider>
  );
};
