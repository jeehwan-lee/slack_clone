import { InsertEmoticon } from '@mui/icons-material'
import { Grid, IconButton, InputAdornment, LinearProgress, TextField } from '@mui/material'
import React, { useState } from 'react'
import ImageIcon from "@mui/icons-material/Image"
import SendIcon from "@mui/icons-material/Send"
import { async } from '@firebase/util'
import { getDatabase, push, ref, serverTimestamp, set } from 'firebase/database'
import { useSelector } from 'react-redux'
import { useCallback } from 'react'
import { Picker } from 'emoji-mart'
import "emoji-mart/css/emoji-mart.css"
import ImageModal from '../Modal/ImageModal'

function ChatInput() {

    const {channel, user} = useSelector((state)=>state);

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [ImageModalOpen, setImageModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [percent, setPercent] = useState(0);

    const handleClickOpen = () => {
        setImageModalOpen(true);
    }

    const handleClickClose =() => {
        setImageModalOpen(false);
    }

    const handleTogglePicker =() => {
        setShowEmoji((show) => !show)
    }

    const handleChange = useCallback((e) => setMessage(e.target.value), []);

    const createMessage = useCallback(() => ({
        timestamp : serverTimestamp(), 
        user:{
            id:user.currentUser.uid, 
            name: user.currentUser.displayName,
            avatar:user.currentUser.photoURL,
        },
        content:message
    }),[message, user.currentUser.uid, user.currentUser.displayName, user.currentUser.photoURL,]);

    const clickSendMessage = useCallback(async () => {
        if(!message) return;
        setLoading(true);

        try {
            await set(
                push(ref(getDatabase(), "messages/" + channel.currentChannel.id )),
                createMessage()
            );
            setLoading(false);
            setMessage("");
        } catch (error) {
            console.log(error);
        }
    }, [message]);

    const selectEmoji =(e) => {
        const syn = e.unified.split("-");
        const codesArray = [];
        syn.forEach(el => codesArray.push("0x" +el));
        const emoji = String.fromCodePoint(...codesArray);

        setMessage((messageValue) => messageValue + emoji);
    }

  return (
    <Grid container sx={{p:"20px"}}>
        <Grid item xs={12} sx={{position:"relative"}}>
            {showEmoji && (
                <Picker set="google" className="emojiPicker" onSelect={selectEmoji} title="이모지를 선택하세요." emoji="point_up" style={{position: "absolute", bottom:"88px"}} />
            )}
            <TextField
                InputProps={{
                    startAdornment:(
                        <InputAdornment position="start">
                            <IconButton onClick={handleTogglePicker}>
                                <InsertEmoticon/>
                            </IconButton>
                            <IconButton onClick={handleClickOpen}>
                                <ImageIcon/>
                            </IconButton>
                        </InputAdornment>
                    ),
                    endAdornment:(
                        <InputAdornment position="start">
                            <IconButton disabled={loading} onClick={clickSendMessage}>
                                <SendIcon/>
                            </IconButton>
                        </InputAdornment>
                    )
                }}
                autoComplete="off"
                label = "메세지 입력"
                fullWidth
                value={message}
                onChange={handleChange}
            />
            {uploading ? 
                <Grid item xs={12} sx={{m:"10px"}}>
                    <LinearProgress variant="determinate" value={percent}/>
                </Grid>
            : null }
            <ImageModal open={ImageModalOpen} handleClose={handleClickClose} setPercent={setPercent} setUploading={setUploading}/>
        </Grid>
    </Grid>
  )
}

export default ChatInput