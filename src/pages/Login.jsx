import React, { useCallback, useState } from 'react'
import { Alert, Avatar, Grid, TextField, Typography } from "@mui/material";
import { Container, Box } from "@mui/system";
import TagIcon from "@mui/icons-material/Tag";
import { LoadingButton } from "@mui/lab";
import { Link } from 'react-router-dom';
import "../firebase";
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useEffect } from 'react';


function Login() {

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loginUser = useCallback(async (email, password) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(getAuth(), email, password);
    } catch(e) {
      setError(e.message);
    }
  },[]);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get("email");
    const password = data.get("password");

    if(!email || !password) {
      setError("모든 항목을 입력해주세요.");
      return;
    }

    loginUser(email, password);
  },[loginUser]);

  useEffect(() => {
    if(!error) return;
    setTimeout(() => {setError("")}, 3000)
  }, [error]);

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alginItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Avatar sx={{ m:1, bgcolor: "secondary.main" }}>
          <TagIcon />
        </Avatar>
        <Typography component="hi" variant="h5">
          로그인
        </Typography>
        <Box component="form" noValidate sx={{ mt: 3 }} onSubmit={handleSubmit}>
          <TextField margin='normal' required fullWidth label="이메일 주소" name="email" autoComplete='off' autoFocus/>
          <TextField margin='normal' required fullWidth label="비밀번호" name="password" type="password"/>
          {error ? <Alert sx={{mt:3}} severity="error">{error}</Alert> : null }
          <LoadingButton type="submit" fullWidth variant="contained" color="secondary" loading={loading} sx={{mt:3, mb:2}}>로그인</LoadingButton>
          <Grid container justifyContent="flex-end">
            <Grid item>
                <Link to="/join" style={{textDecoration:"none", color:"blue"}}>
                    계정이 없나요? 회원가입으로 이동
                </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  )
}

export default Login