import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Input, Stack } from '@mui/material'
import React from 'react'
import { useRef } from 'react';
import { useState } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { useSelector } from 'react-redux';
import "../../firebase";
import {getDownloadURL, getStorage, ref as refStorage, uploadBytes,} from "firebase/storage";
import { useEffect } from 'react';
import { async } from '@firebase/util';
import { getAuth, updateProfile } from 'firebase/auth';
import { getDatabase, ref, update } from 'firebase/database';

function ProfileModal({open, handleClose}) {

    const {user} = useSelector(state => state);

    const [previewImage, setPreviewImage] = useState("");
    const [croppedImage, setCroppedImage] = useState("");
    const [blob, setBlob] = useState("");
    const [uploadedCroppedImage, setUploadedCroppedImage] = useState("");

    const avatarEditorRef = useRef(null);

    const closeModal = () => {
        handleClose();
        setPreviewImage("");
        setCroppedImage("");
        setUploadedCroppedImage("");

    }

    const uploadCroppedImage = async() => {

        const storageRef = refStorage(getStorage(), `avatars/users/${user.currentUser.uid}`);
        const uploadTask = await uploadBytes(storageRef, blob);
        const downloadUrl = await getDownloadURL(uploadTask.ref);

        setUploadedCroppedImage(downloadUrl);
    }

    useEffect(() => {
        if(!uploadedCroppedImage || !user.currentUser) return;
        async function changeAvatar() {

            await updateProfile(user.currentUser, {
                photoURL:uploadedCroppedImage
            });

            const newData = {avatar:uploadedCroppedImage};
            const updates ={};
            updates["/users/" + user.currentUser.uid] = newData;

            await update(ref(getDatabase()), updates);

            closeModal();
        }
        changeAvatar();
    }, [uploadedCroppedImage, user.currentUser, closeModal]);

    const handleCropImage = () => {
        avatarEditorRef.current.getImageScaledToCanvas().toBlob((blob) => {
            const imageUrl = URL.createObjectURL(blob);
            setCroppedImage(imageUrl);
            setBlob(blob);
        })
        console.log(croppedImage);
    }

    const handleChange = (e) => {
        const file = e.target.files[0];
        if(!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.addEventListener("load", ()=> {
            setPreviewImage(reader.result);
        })
    }
  return (
    <Dialog open={open} onClose={closeModal}>
        <DialogTitle>프로필 이미지 변경</DialogTitle>
        <DialogContent>
            <Stack direction="column" spacing={3}>
                <Input
                    type="file"
                    onChange={handleChange}
                    inputProps={{accept:"image/jpeg, image/jpg, image/png"}}
                    label="변경할 프로필 이미지 선택"
                />
                <div style={{display:"flex", alignItems:"center"}}>
                    {previewImage && (
                        <AvatarEditor image={previewImage} ref={avatarEditorRef} width={120} height={50} scale={2} style={{display:"inline"}}/>
                    )}
                    {croppedImage && (
                        <img alt="cropped" style={{marginLeft:"50px"}} width={100} height={100} src={croppedImage} />
                    )}
                </div>
            </Stack>
        </DialogContent>
        <DialogActions>
            <Button onClick={closeModal}>취소</Button>
            {previewImage && (
                <Button onClick={handleCropImage}>이미지 크롭</Button>
            )}
            {croppedImage && (
                <Button onClick={uploadCroppedImage}>프로필 이미지 저장</Button>
            )}
        </DialogActions>
    </Dialog>
  )
}

export default ProfileModal