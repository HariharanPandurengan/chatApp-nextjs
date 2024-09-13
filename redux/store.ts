import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  login: boolean;
  username: string;
  oppositeUsername : string
}

const initialState: UserState = {
  login: false,
  username: '',
  oppositeUsername:'',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    reduxLogin: (state, action: PayloadAction<boolean>) => {
      state.login = action.payload;
    },
    reduxUsername: (state,action: PayloadAction<string>) => {
      state.username = action.payload;
    },
    reduxOppositeUsername: (state,action: PayloadAction<string>) => {
      state.oppositeUsername = action.payload;
    },
  },
});

//userSlice functions - useDispatch()
export const { reduxLogin , reduxUsername ,reduxOppositeUsername } =
  userSlice.actions;

//useSelector()
export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;