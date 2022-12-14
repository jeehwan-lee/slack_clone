import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, List, ListItem, ListItemIcon, ListItemText, TextField } from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'
import AddIcon from "@mui/icons-material/Add"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import "../firebase"
import {child, getDatabase, onChildAdded, push, ref, update} from "firebase/database"
import { async } from '@firebase/util'
import { useDispatch } from 'react-redux'
import { setCurrentChannel } from '../store/channelReducer'

function ChannelMenu() {

    const [open, setOpen] = useState(false);
    const [channelName, setChannelName] = useState("");
    const [channelDetail, setChannelDetail] = useState("");
    const [channels, setChannels] = useState([]);
    const [activeChannelId, setActiveChannelId] = useState("");
    const [firstLoaded, setFirstLoaded] = useState(true);

    const dispatch = useDispatch();


    const handleClickOpen =() => {
        setOpen(true);
    }

    const handleClickClose = () => {
        setOpen(false);
    }

    useEffect(()=> {
        const unsubscribe = onChildAdded(ref(getDatabase(), "channels"), (snapshot)=> {
            setChannels((channelArr)=>[...channelArr, snapshot.val()]);
        })

        return () => {
            setChannels([]);
            unsubscribe();
        }
    }, []);

    const changeChannel =(channel) => {
        if(channel.id === activeChannelId) return;
        setActiveChannelId(channel.id);
        dispatch(setCurrentChannel(channel));
    }

    const handleSubmit = useCallback(async () => {
        const db = getDatabase();
        const key = push(child(ref(db), "channels")).key;
        
        const newChannel = {
            id:key,
            name:channelName,
            details:channelDetail
        };

        const updates = {};
        updates["/channels/"+key] = newChannel;

        try {
            await update(ref(db),updates);
            setChannelName("");
            setChannelDetail("");
            handleClickClose();
        } catch(error) {
            console.error(error);
        }

    }, [channelDetail, channelName])

    useEffect(()=> {

        if(channels.length >0 && firstLoaded) {
            setActiveChannelId(channels[0].id);
            dispatch(setCurrentChannel(channels[0]));
            setFirstLoaded(false);
        }
    }, [channels, dispatch, firstLoaded]);

  return (
    <>
        <List sx={{overflow:"auto", width:240, backgroundColor:"#4c3c4c"}}>
            <ListItem secondaryAction={
                <IconButton sx={{color:"#9A939B"}} onClick={handleClickOpen}>
                    <AddIcon />
                </IconButton>
            }>
                <ListItemIcon sx={{color:"#9A939B"}}>
                    <ArrowDropDownIcon/>
                </ListItemIcon>
                <ListItemText primary="??????" sx={{wordBreak:"break-all", color:"#9A939B"}}/>
            </ListItem>
            <List component="div" disablePadding sx={{pl:3}}>
                {channels.map(channel => (
                            <ListItem button selected={channel.id === activeChannelId} onClick={()=> changeChannel(channel)} key={channel.id}>
                                <ListItemText primary={`# ${channel.name}`} sx={{wordBreak:"break-all", color:"#918990"}}/>
                            </ListItem>
                
                        )
                )}
            </List>
        </List>
        <Dialog open={open} onClose={handleClickClose}>
            <DialogTitle>????????????</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    ????????? ???????????? ????????? ??????????????????.
                </DialogContentText>
                <TextField autoFocus margin="dense" label="?????????" type="text" fullWidth variant='standard' autoComplete="off" onChange={(e)=> setChannelName(e.target.value)}/>
                <TextField margin="dense" label="??????" type="text" fullWidth variant='standard' autoComplete="off" onChange={(e)=> setChannelDetail(e.target.value)}/>   
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClickClose}>??????</Button>
                <Button onClick={handleSubmit}>??????</Button>
            </DialogActions>
        </Dialog>
    </>
  )
}

export default ChannelMenu