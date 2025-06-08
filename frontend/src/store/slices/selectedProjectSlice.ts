import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '../../types/project';

interface SelectedProjectState {
  project: Project | null;
}

const initialState: SelectedProjectState = {
  project: null,
};

const selectedProjectSlice = createSlice({
  name: 'selectedProject',
  initialState,
  reducers: {
    setSelectedProject: (state, action: PayloadAction<Project | null>) => {
      state.project = action.payload;
    },
  },
});

export const { setSelectedProject } = selectedProjectSlice.actions;
export default selectedProjectSlice.reducer; 