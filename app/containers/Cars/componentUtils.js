import React from 'react';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';

function SliderComp({ admin, isObjPlaced }) {
  return (
    isObjPlaced &&
    admin && (
      <Stack sx={{ height: 200 }} spacing={1} direction="row">
        <Slider
          size="small"
          defaultValue={1}
          aria-label="Small"
          valueLabelDisplay="auto"
          id="test-slider"
          orientation="vertical"
          step={0.2}
          min={0}
          max={6}
          track={false}
        />

        <span id="test-slider-xr">
          <Slider
            size="small"
            defaultValue={0}
            aria-label="Small"
            valueLabelDisplay="auto"
            id="test-slider-x"
            orientation="vertical"
            step={1}
            min={-150}
            max={150}
            track={false}
          />
          <Slider
            size="small"
            defaultValue={0}
            aria-label="Small"
            valueLabelDisplay="auto"
            id="test-slider-y"
            orientation="vertical"
            step={1}
            min={-150}
            max={150}
            track={false}
          />
          <Slider
            size="small"
            defaultValue={0}
            aria-label="Small"
            valueLabelDisplay="auto"
            id="test-slider-z"
            orientation="vertical"
            step={1}
            min={-150}
            max={150}
            track={false}
          />
        </span>
      </Stack>
    )
  );
}

export { SliderComp };
