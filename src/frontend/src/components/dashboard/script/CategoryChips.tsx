import React from 'react';
import Chip from '@mui/material/Chip';

function CategoryChips({ category }: { category: string }): React.ReactElement {
  return (
    <div>
      {category.split(',').map((item) => (
        <Chip
          size="small"
          key={item.trim()}
          label={item.trim()}
          color="primary"
          variant="filled"
          style={{ margin: '1px', padding: '1px' }}
        />
      ))}
    </div>
  );
}

export default CategoryChips;
