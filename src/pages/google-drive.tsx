/**
 * v0 by Vercel.
 * @see https://v0.dev/t/Hsf1Xr76Ibi
 * 
 */
import React, { useState, useEffect } from 'react';
import useDrivePicker from 'react-google-drive-picker';
import { signIn, useSession } from 'next-auth/react';

interface GooglePickerDocument {
  id: string;
  name: string;
  mimeType: string;
  thumbnails?: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  // ... include other properties you expect to receive
}

export default function Component() {
  const { data: session, status } = useSession();
  const [openPicker, authResponse] = useDrivePicker();
  console.log(authResponse);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [docIds, setDocIds] = useState<string[]>([]);
  const [authResponseReady, setAuthResponseReady] = useState(false);

  useEffect(() => {
    if (authResponse && docIds) {
      docIds.forEach(docId => {
        fetchImageFromDrive(docId, authResponse.access_token).then(imageUrl => {
          if (imageUrl) {
            setSelectedImages(prevImages => [...prevImages, imageUrl]);
          }
        });
      });
    }
  }, [authResponse, docIds]);


  const fetchImageFromDrive = async (fileId: string, accessToken: string): Promise<string | null> => {
    console.log(`Fetching image for file ID: ${fileId}`);

    try {
      const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
      if (!accessToken) {
        console.error('Access token is not available');
        return null;
      }
      const headers = new Headers({ 'Authorization': 'Bearer ' + accessToken });
      console.log(`Sending request to URL: ${url} with headers: `, headers);
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      console.log(`Received blob for file ID: ${fileId}`);
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error(`Error fetching image from Google Drive: ${error}`);
      return null; // or handle the error as needed
    }
  }


  const handleOpenPicker = () => {
    if (status === "authenticated") {
      openPicker({
        clientId: "907677598391-95vummkg3983m58scqgg522mikqvvmec.apps.googleusercontent.com",
        developerKey: "AIzaSyDVOb16o-bGVa6wXycpb2qq6H3HsP4Sfg8",
        viewId: "DOCS_IMAGES",
        token: session.accessToken, // Use the OAuth token from the session
        showUploadView: true,
        showUploadFolders: true,
        supportDrives: true,
        multiselect: true,
        callbackFunction: async (data) => {
          if (data.action === google.picker.Action.PICKED) {
            const documents: GooglePickerDocument[] = data[google.picker.Response.DOCUMENTS];
            setDocIds(documents.map(doc => doc.id)); 
          }
          console.log(data);
        },
      });
    } else {
      signIn('google'); // Prompt the user to sign in if not already
    }
  };


  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-between p-4">
        <div />
        <div className="flex gap-4">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={handleOpenPicker}>
            Import
        </button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
            Export
        </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 p-4">
        {selectedImages.map((imageSrc, index) => (
          <img
            key={index}
            alt={`Gallery Image ${index + 1}`}
            className="aspect-square object-cover border border-gray-200 w-full rounded-lg overflow-hidden dark:border-gray-800"
            height="200"
            src={imageSrc}
            width="200"
          />
        ))}
      </div>
    </div>
  )
}

