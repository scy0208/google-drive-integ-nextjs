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

  const[authToken, setAuthToken] = useState<string>("");

  const [docIds, setDocIds] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploadGoogleDriveFolder, setUploadGoogleDriveFolder] = useState<string | null>(null);


  useEffect(() => {
    if (authResponse && !authToken) {
      setAuthToken(authResponse.access_token);
    }
  }, [authResponse]);

  useEffect(() => {
    console.log("useEffect called to fetchImageFromDriveToS3");
    if (authToken && docIds.length > 0) {
      docIds.forEach(docId => {
        fetchImageFromDriveToS3(docId, authToken).then(imageUrl => { // if (imageUrl) {
        });
      });
      setDocIds([]);
      fetchImageUrlsFromS3();
    }
  }, [authToken, docIds]);

  useEffect(() => {
    console.log("useEffect called to fetchImageUrlsFromS3");
    fetchImageUrlsFromS3();
  }, []);

  useEffect(() => {
    console.log("useEffect called to uploadImageToDrive");
    if (authToken && uploadGoogleDriveFolder && selectedImages.length > 0) {
      console.log("useEffect called to uploadImageToDrive start uploading");
      selectedImages.forEach(imageUrl => uploadImageToDrive(imageUrl, uploadGoogleDriveFolder, authToken));
      setSelectedImages([])
    }
  }, [authToken, uploadGoogleDriveFolder]);

  const fetchImageUrlsFromS3 = async () => {
    try {
      const response = await fetch('/api/fetchImageUrlsFromS3');
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      setImageUrls(data.urls);
    } catch (error) {
      console.error(`Error fetching image URLs from S3: ${error}`);
    }
  }

  const uploadImageToDrive = async (imageUrl: string, folderId: string, accessToken: string) => {
    console.log("uploading " + imageUrl + " to " + folderId);
  
    // Extract the filename from the imageUrl
    const fileName = imageUrl.split('/').pop() || 'filename.jpg';
  
    // Call the uploadToDrive API
    const uploadResponse = await fetch('/api/uploadToDrive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken: accessToken,
        fileName: fileName, // Use the extracted filename
        folderId: folderId,
        mimeType: 'image/jpeg',
        imageUrl: imageUrl, // Pass the image URL directly
      }),
    });
  
    if (!uploadResponse.ok) {
      console.error(`HTTP error! status: ${uploadResponse.status}`); // Log the error status
    }
  
    const uploadData = await uploadResponse.json();
    console.log('Upload response:', uploadData); // Log the upload response
  }

  const fetchImageFromDriveToS3 = async (fileId: string, accessToken: string): Promise<string | null> => {
    console.log(`Fetching image for file ID: ${fileId}`);
  
    try {
      const response = await fetch('/api/fetchImageFromDriveToS3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: fileId,
          accessToken: accessToken,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Fetch response:', data);
  
      return data.location; // return the URL of the uploaded image
    } catch (error) {
      console.error(`Error fetching image from Google Drive: ${error}`);
      return null; // or handle the error as needed
    }
  }

  const handleExport = async () => {
    // 1. Open the Google Drive picker to select a folder
    if (status === "authenticated") {
      openPicker({
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        developerKey: process.env.NEXT_PUBLIC_GOOGLE_DEV_KEY || "",
        viewId: "FOLDERS", // This will allow the user to select a folder
        token: session.accessToken, // Use the OAuth token from the session
        setSelectFolderEnabled: true, // Allow folder selection
        callbackFunction: async (data) => {
          if (data.action === google.picker.Action.PICKED) {
            const folder: GooglePickerDocument = data[google.picker.Response.DOCUMENTS][0];
            const folderId = folder.id;
            console.log(`Selected folder ID: ${folderId}`); // Log the selected folder ID
            
            if (folderId) {
              setUploadGoogleDriveFolder(folderId);
            }
          }
        },
      });
    }
  };

  const handleOpenPicker = () => {
    if (status === "authenticated") {
      openPicker({
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        developerKey: process.env.NEXT_PUBLIC_GOOGLE_DEV_KEY || "",
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
      // handleOpenPicker();
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
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={handleExport}>
            Export
        </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 p-4">
      {imageUrls.map((imageUrl, index) => (
      <div key={index}>
        <img
          alt={`Gallery Image ${index + 1}`}
          className="aspect-square object-cover border border-gray-200 w-full rounded-lg overflow-hidden dark:border-gray-800"
          height="200"
          src={imageUrl}
          width="200"
        />
        <input
          type="checkbox"
          checked={selectedImages.includes(imageUrl)}
          onChange={(event) => {
            if (event.target.checked) {
              setSelectedImages((prevImages) => [...prevImages, imageUrl]);
            } else {
              setSelectedImages((prevImages) => prevImages.filter((image) => image !== imageUrl));
            }
          }}
        />
      </div>
))}
      </div>
    </div>
  )
}

