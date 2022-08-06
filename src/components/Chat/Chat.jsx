import { Grid, List, Toolbar, Paper, Divider } from '@mui/material'
import { child, get, getDatabase, onChildAdded, query, ref, orderByChild, startAt } from 'firebase/database';
import React from 'react'
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux'
import ChatHeader from './ChatHeader'
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

function Chat() {

    const [messages, setMessages] = useState([]);
    const {channel, user} = useSelector((state) => state);
    const messageEndRef = useRef();

    useEffect(()=> {
        if(!channel.currentChannel) return;
        async function getMessages() {
            const snapShot = await get(child(ref(getDatabase()), "messages/" + channel.currentChannel.id));
            setMessages(snapShot.val() ? Object.values(snapShot.val()) : []);
        }
        getMessages();
        return () => {
            setMessages([]);
        }
    }, [channel.currentChannel]);

    useEffect(()=> {
        if(!channel.currentChannel) return;
        const sorted = query(ref(getDatabase(), "messages/"+channel.currentChannel.id), orderByChild("timestamp"));
        console.log("Ggg")
        const unsubscribe = onChildAdded(query(sorted, startAt(Date.now())), (snapShot)=>setMessages((oldMessages)=>[...oldMessages, snapShot.val()]));
        
        return ()=> {
            unsubscribe?.();
        }
    
    }, [channel.currentChannel]);

    useEffect(() => {
        const setTimeoutId = setTimeout(() => {
            messageEndRef.current.scrollIntoView({behavior:"smooth"});
        }, 2000)
        return () => {
            clearTimeout(setTimeoutId);
        }
    }, [messages.length])

  return (
    <>
        <Toolbar/>
        <ChatHeader channelInfo={channel.currentChannel}/>
        <Grid container component={Paper} variant="outlined" sx={{mt:3, position:"relative"}}>
            <List sx={{height:"calc(100vh - 350px)", overflow:"scroll", width:"100%", position:"relative"}}>
                {messages.map(message => (
                    <ChatMessage key={message.timestamp} message={message} user={user} />
                ))}
                <div ref={messageEndRef}></div>
            </List>
            <Divider/>
            <ChatInput/>
        </Grid>
    </>
  )
}

export default Chat