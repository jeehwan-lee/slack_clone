import logo from './logo.svg';
import './App.css';
import {Routes, Route, Navigate} from 'react-router-dom';
import Join from './pages/Join';
import Login from './pages/Login';
import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {useDispatch, useSelector} from 'react-redux';
import { clearUser, setUser } from './store/userReducer';
import Main from './pages/Main';

function App() {

  const dispatch = useDispatch();
  const {isLoading, currentUser} = useSelector((state)=>state.user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user)=> {
      if(!!user) {
        dispatch(setUser(user));
      } else {
        dispatch(clearUser());
      }
    })
    return () => unsubscribe();
  }, [dispatch]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Main/>}></Route>
        <Route path="/login" element={<Login/>}></Route>
        <Route path="/join" element={currentUser ? <Navigate to="/" /> : <Join/>}></Route>
      </Routes>
    </>
  );
}

export default App;
