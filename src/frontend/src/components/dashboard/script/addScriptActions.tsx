import * as React from 'react';
import Button from '@mui/material/Button';





export default function AddScriptActions({ loading, reset, handleAddScript }) {
  return (
    <div className="  w-full">
      {/* button */}
      <Button
        disabled={loading}
        variant="contained"
        color="error"
        onClick={() => {
          reset();
        }}
      >
        Reset
      </Button>
      <Button
        disabled={loading}
        variant="contained"
        color="primary"
        className="float-right"
        onClick={async () => {
          await handleAddScript();
        }}
      >
        Submit
      </Button>
    </div>
  );
}
