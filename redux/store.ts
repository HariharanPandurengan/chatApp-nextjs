import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  login: boolean;
  username: string;
  oppositeUsername : string
  groupName:string,
  groupID:string,
  groupOppositeUsers:string[]
}

interface GroupPayload {
  groupID: string;
  groupName: string;
}

const initialState: UserState = {
  login: false,
  username: '',
  oppositeUsername:'',
  groupName:'',
  groupID:'',
  groupOppositeUsers:[]
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
    reduxGroupIDandName: (state,action: PayloadAction<GroupPayload>) => {
      state.groupID = action.payload.groupID;
      state.groupName = action.payload.groupName;
    },
  },
});

//userSlice functions - useDispatch()
export const { reduxLogin , reduxUsername ,reduxOppositeUsername ,reduxGroupIDandName} =
  userSlice.actions;

//useSelector()
export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;