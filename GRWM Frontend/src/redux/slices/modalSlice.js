import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showModal: false,
  firstOpen: true,
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal: (state) => {
      state.showModal = true;
    },
    closeModal: (state) => {
      state.showModal = false;
      state.firstOpen = false;
    },
    resetModalState: (state) => {
      state.showModal = false;
      state.firstOpen = true;
    },
    setFirstOpenFalse: (state) => {
      state.firstOpen = false;
    },
  },
});

export const { openModal, closeModal, resetModalState, setFirstOpenFalse } =
  modalSlice.actions;
export default modalSlice.reducer;
