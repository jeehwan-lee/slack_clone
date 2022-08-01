import { CardContent, Grid, Typography, Paper } from '@mui/material'
import React from 'react'

function ChatHeader({channelInfo}) {
  return (
    <Grid container component={Paper} varaint="outlined">
        <CardContent>
            <Typography variant="h5"># {channelInfo?.name}</Typography>
            <Typography variant="body1">채널설명입니다.</Typography>

        </CardContent>
    </Grid>
  )
}

export default ChatHeader