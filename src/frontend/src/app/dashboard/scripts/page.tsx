'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  activateScript,
  deactivateScript,
  deleteScript,
  favScript,
  getActiveScripts,
  listFavScript,
  listScripts,
  unFavScript,
  type ListScriptsResponse,
} from '@/services/common';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { toast } from 'react-toastify';

import { type ScriptTableData } from '@/types/script';
import { paths } from '@/paths';
import { logger } from '@/lib/default-logger';
import { useUser } from '@/hooks/use-user';
import { ScriptSearch } from '@/components/dashboard/script/script-filters';
import { ScriptTable } from '@/components/dashboard/script/script-table';

export function toTableScript(response: ListScriptsResponse, activeScripts: number[]): ScriptTableData {
  let script: ScriptTableData;
  const updatedTime = new Date(response.updated_time).toLocaleString();

  script = {
    scriptId: response.script_id,
    name: response.script_name,
    category: response.label?.toString() || 'no Label',
    creator: response.user_full_name?.toString() || 'Unknown',
    lastUpdatedAt: updatedTime,
    status: response.is_active,
    isFavScript: null,
  };
  return script;
}

export default function Page(): React.JSX.Element {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const router = useRouter();

  const [scriptsInTable, setScriptsInTable] = useState<ScriptTableData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [favScriptList, setFavScriptList] = useState<string[]>([]);
  const [filteredScripts, setFilteredScripts] = useState<ScriptTableData[]>([]);
  const { user } = useUser();

  const fetchScriptsAndFavorites = async () => {
    try {
      const [scriptsRes, favIdsRes, activeScriptsRes] = await Promise.all([
        listScripts(),
        listFavScript(),
        getActiveScripts(),
      ]);
      return {
        scripts: scriptsRes.data,
        favoriteIds: favIdsRes.data.map((str) => parseInt(str, 10)),
        activeScripts: activeScriptsRes.data,
      };
    } catch (error) {
      logger.error('Failed to fetch scripts or favorite IDs', error);
      throw error; // Rethrow or handle as needed
    }
  };

  const convertToTableScripts = (scripts: ListScriptsResponse[], favoriteIds: number[], activeScripts: number[]) => {
    return scripts.map((script: ListScriptsResponse) => {
      const tableScript = toTableScript(script, activeScripts);
      const scriptId = parseInt(tableScript.scriptId, 10); // Always specify radix with parseInt
      tableScript.isFavScript = favoriteIds.includes(scriptId);
      return tableScript;
    });
  };

  const fetchList = async () => {
    try {
      const { scripts, favoriteIds, activeScripts } = await fetchScriptsAndFavorites();

      const tableScripts = convertToTableScripts(scripts, favoriteIds, activeScripts);

      setScriptsInTable(tableScripts);
    } catch (error) {
      logger.error('Failed to process scripts', error);
    }
  };

  useEffect(() => {
    const tid = toast.loading('Loading scripts');
    fetchList().then(() => toast.dismiss(tid));
    return () => {
      toast.dismiss(tid);
    };
  }, []);

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleDeleteScript = (id: string) => {
    if (!confirm('Are you sure you want to delete this script?')) {
      return;
    }
    deleteScript(id).then((resp) => {
      if (!resp.success) {
        console.error(resp.message);
        alert(resp.message);
        return;
      }
      setScriptsInTable((prevScripts) => prevScripts.filter((script) => script.scriptId !== id));
      alert('Script deleted successfully');
    });
  };

  const handleFavScript = async (script: ScriptTableData) => {
    if (script.isFavScript) {
      toast.loading('Unfavoriting script');
      const response = await unFavScript(script.scriptId);
      toast.dismiss();

      if (!response.success) {
        console.error(response.message);
        return;
      }
      setScriptsInTable((prevScripts) =>
        prevScripts.map((prevScript) => {
          if (prevScript.scriptId === script.scriptId) {
            return { ...prevScript, isFavScript: false };
          }
          return prevScript;
        })
      );
      return;
    }

    const response = await favScript(script.scriptId);
    toast.dismiss();
    if (!response.success) {
      console.error(response.message);
      return;
    }
    setScriptsInTable((prevScripts) =>
      prevScripts.map((prevScript) => {
        if (prevScript.scriptId === script.scriptId) {
          return { ...prevScript, isFavScript: true };
        }
        return prevScript;
      })
    );
  };

  const handleStatusChange = async (script: ScriptTableData) => {
    try {
      if (script.status) {
        await deactivateScript(parseInt(script.scriptId, 10));
        setScriptsInTable((prevScripts) =>
          prevScripts.map((prevScript) =>
            prevScript.scriptId === script.scriptId ? { ...prevScript, status: false } : prevScript
          )
        );
      } else {
        await activateScript(parseInt(script.scriptId, 10));
        setScriptsInTable((prevScripts) =>
          prevScripts.map((prevScript) =>
            prevScript.scriptId === script.scriptId ? { ...prevScript, status: true } : prevScript
          )
        );
      }
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Failed to update script status', error);
      alert('Failed to update script status');
    }
  };
  useEffect(() => {
    setFilteredScripts(
      scriptsInTable.filter((script) => {
        return (
          script.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          script.category.toLowerCase().includes(filterQuery.toLowerCase())
        );
      })
    );
  }, [scriptsInTable, searchQuery, filterQuery]);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Script List</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }} />
        </Stack>
        {user?.isAdmin && (
          <div>
            <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained">
              <Link href={paths.dashboard.newScript}>Add New Script</Link>
            </Button>
          </div>
        )}
      </Stack>
      <ScriptSearch
        searchQuery={searchQuery}
        filterQuery={filterQuery}
        onSearchChange={setSearchQuery}
        onFilterChange={setFilterQuery}
      />
      <ScriptTable
        // isAdmin
        scripts={filteredScripts.slice(page * rowsPerPage, (page + 1) * rowsPerPage)}
        setScripts={setScriptsInTable}
        count={filteredScripts.length}
        page={page}
        rowsPerPage={rowsPerPage}
        favScriptList={favScriptList}
        onExecution={function (scripId: string): void {
          router.push(paths.dashboard.executeScript(scripId));
        }}
        onFavScript={handleFavScript}
        onDeleteScript={handleDeleteScript}
        onEditScript={function (scripId: string): void {
          router.push(paths.dashboard.editScript(scripId));
        }}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onStatusChange={handleStatusChange}
      />
    </Stack>
  );
}
