'use client';

import * as React from 'react';
import FilterListIcon from '@mui/icons-material/FilterList'; // Adjust the import path if necessary
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';





interface ScriptSearchProps {
  onSearchChange: (search: string) => void;
  onFilterChange: (category: string) => void;
  searchQuery: string;
  filterQuery: string;
}

export function ScriptSearch({searchQuery, filterQuery, onSearchChange, onFilterChange }:ScriptSearchProps): React.JSX.Element {

  return (
    <Card sx={{ p: 2}}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <OutlinedInput
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by Name"
          startAdornment={
            <InputAdornment position="start">
                <MagnifyingGlassIcon />

            </InputAdornment>
          }
          sx={{ width: '100%' }}
        />
        <OutlinedInput
          value={filterQuery}
          onChange={(e)=>{
            onFilterChange(e.target.value);
          }}
          placeholder="Filter by Category"
          startAdornment={
            <InputAdornment position="start">
              <FilterListIcon />
            </InputAdornment>
          }
          sx={{ width: '100%' }}
        />
      </Box>

    </Card>

  );
}


function setSearchText(value: string) {
  throw new Error('Function not implemented.');
}
