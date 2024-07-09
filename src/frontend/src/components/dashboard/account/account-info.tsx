'use client';

import * as React from 'react';
import { updateUser } from '@/services/common';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import base64 from 'base-64';
import imageCompression from 'browser-image-compression';

import { useUser } from '@/hooks/use-user';





export function AccountInfo(): React.JSX.Element {
  const { user, checkSession } = useUser();
  const handleUpload = () => {
    // Upload picture logic
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files === null) {
      return;
    }
    const imageFile = event.target.files[0];

    const compressedFile = await imageCompression(imageFile, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    });

    if (compressedFile && user) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64EncodedString = base64.encode(e.target.result);

        await updateUser({ email: user.email, avatar: base64EncodedString });

        checkSession?.();
      };
      reader.readAsBinaryString(compressedFile); // Read the file as a binary string before encoding
    }
  };

  return (
    <Card className="">
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <div>
            <Avatar src={user?.avatar} sx={{ height: '80px', width: '80px' }} />
          </div>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">{user?.username}</Typography>
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions>
        <Button onClick={handleUpload} fullWidth variant="text">
          Upload picture
          <input id="fileInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleChange} />
        </Button>
      </CardActions>
    </Card>
  );
}
