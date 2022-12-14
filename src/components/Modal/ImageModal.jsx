import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Input } from '@mui/material'
import React from 'react'
import { useState } from 'react';
import { v4 as uuidv4} from 'uuid';
import "../../firebase";
import {getDownloadURL, getStorage, ref as refStorage, uploadBytesResumable,} from "firebase/storage";
import {getDatabase, push, ref, serverTimestamp, set,} from 'firebase/database';
import { useSelector } from 'react-redux';
import { useCallback } from 'react';

function ImageModal({open, handleClose, setPercent, setUploading}) {

    const {channel, user} = useSelector(state => state);

    const [file, setFile] = useState(null);

    const onChangeAddFile = (e) => {
        const addFile = e.target.files[0];
        if(addFile) setFile(addFile);
    }

    const createImageMessage = useCallback((fileUrl) => ({
        timestamp: serverTimestamp(),
        user:{
            id:user.currentUser.uid, 
            name:user.currentUser.displayName, 
            avatar:user.currentUser.photoURL,
        },
        image:fileUrl,
    }), [user.currentUser.uid, user.currentUser.displayName, user.currentUser.photoURL])

    const UploadFile = () => {
        
        setUploading(true);

        console.log(file);

        const filePath = `chat/${uuidv4()}.${file.name.split(".").pop()}`
        const uploadTask = uploadBytesResumable(refStorage(getStorage(), filePath),file);

        console.log("good");
        const unsubscribe = uploadTask.on("state_changed", (snap) => {
            const percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes)*100);
            setPercent(percentUploaded);

        }, (error) => {
            console.error(error);
            setUploading(false);
    }, async () => {
        try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            await set(
                push(ref(getDatabase(), "messages/" + channel.currentChannel?.id)),
                createImageMessage(downloadUrl));
                setUploading(false);
                unsubscribe();
        } catch (error) {
            console.error(error);
            setUploading(false);
            unsubscribe();

        }
    });
    }

    const handleSendFile = () => {
        UploadFile();
        handleClose();
        setFile(null);
    }
  return (
    <Dialog open={open} onClose={handleClose}>
        <DialogTitle>????????? ?????????</DialogTitle>
        <DialogContent>
            <Input
                margin='dense'
                inputProps={{accept:"image/jpeg, image/jpg, image/png, image/gif"}}
                type="file"
                fullWidth
                variant="standard"
                onChange={onChangeAddFile}    
            />

        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>??????</Button>
            <Button onClick={handleSendFile}>??????</Button>
        </DialogActions>
    </Dialog>
  )
}

export default ImageModal