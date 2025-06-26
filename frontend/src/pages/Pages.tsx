import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPages, createPage, deletePage, updatePage, createFromSitemap } from '../store/slices/pagesSlice';
import { fetchProjectById } from '../store/slices/projectsSlice';
import { Page, CreatePageDto, UpdatePageDto } from '../types/page';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  TextField,
  Link,
  Divider,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon, Upload as UploadIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';

type PageFormData = {
  title: string;
  url: string;
};

const Pages: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { pages, loading, error } = useAppSelector((state) => state.pages);
  const { currentProject: project } = useAppSelector((state) => state.projects);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [sitemapFile, setSitemapFile] = useState<File | null>(null);
  const [sitemapUploading, setSitemapUploading] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<PageFormData>({
    defaultValues: {
      title: '',
      url: '',
    }
  });

  useEffect(() => {
    if (projectId) {
      dispatch(fetchPages(parseInt(projectId)));
      dispatch(fetchProjectById(parseInt(projectId)));
    }
  }, [dispatch, projectId]);

  const handleOpen = () => {
    reset();
    setEditingPage(null);
    setOpen(true);
  };

  const handleEditClick = (page: Page, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPage(page);
    reset({
      title: page.title,
      url: page.url,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingPage(null);
  };

  const handleDeleteClick = (page: Page) => {
    setPageToDelete(page);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (pageToDelete) {
      await dispatch(deletePage(pageToDelete.id));
      setDeleteDialogOpen(false);
      setPageToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPageToDelete(null);
  };

  const onSubmit = async (data: PageFormData) => {
    if (projectId) {
      if (editingPage) {
        // Update existing page
        const updateData: UpdatePageDto = {
          title: data.title,
          url: data.url,
        };
        await dispatch(updatePage({ id: editingPage.id, pageData: updateData }));
      } else {
        // Create new page
        const pageData: CreatePageDto = {
          title: data.title,
          url: data.url,
          projectId: parseInt(projectId)
        };
        await dispatch(createPage(pageData));
      }
      handleClose();
    }
  };

  const handleSitemapFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if it's an XML file by extension or MIME type
      const isXml = file.name.toLowerCase().endsWith('.xml') || 
                   file.type === 'text/xml' || 
                   file.type === 'application/xml';
      
      if (isXml) {
        setSitemapFile(file);
      } else {
        alert('Please select a valid XML file (.xml extension)');
        // Reset file input
        event.target.value = '';
      }
    }
  };

  const handleSitemapUpload = async () => {
    if (!sitemapFile || !projectId) return;

    setSitemapUploading(true);
    try {
      const fileContent = await sitemapFile.text();
      await dispatch(createFromSitemap({ projectId: parseInt(projectId), sitemapXml: fileContent }));
      setSitemapFile(null);
      // Reset file input
      const fileInput = document.getElementById('sitemap-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      alert('Sitemap uploaded successfully! Pages have been created.');
    } catch (error: any) {
      console.error('Failed to upload sitemap:', error);
      const errorMessage = error?.message || error?.error || 'Failed to upload sitemap';
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setSitemapUploading(false);
    }
  };

  const handlePageClick = (pageId: number) => {
    navigate(`/projects/${projectId}/pages/${pageId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/projects/${projectId}`)}
            sx={{ mr: 2 }}
          >
            Back to Project
          </Button>
          <Typography variant="h4" component="h1">
            Pages - {project?.name}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpen}
            >
              Add Page
            </Button>
            <Divider orientation="vertical" flexItem />
            <Box display="flex" alignItems="center" gap={1}>
              <input
                id="sitemap-file-input"
                type="file"
                accept=".xml"
                onChange={handleSitemapFileChange}
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                component="label"
                htmlFor="sitemap-file-input"
                startIcon={<UploadIcon />}
              >
                Select Sitemap
              </Button>
              {sitemapFile && (
                <Button
                  variant="contained"
                  onClick={handleSitemapUpload}
                  disabled={sitemapUploading}
                  startIcon={sitemapUploading ? <CircularProgress size={16} /> : <UploadIcon />}
                >
                  {sitemapUploading ? 'Uploading...' : 'Upload Sitemap'}
                </Button>
              )}
            </Box>
          </Box>
          {sitemapFile && (
            <Typography variant="body2" color="text.secondary">
              Selected: {sitemapFile.name}
            </Typography>
          )}
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>Tasks Count</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pages.map((page) => (
                <TableRow
                  key={page.id}
                  hover
                  onClick={() => handlePageClick(page.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{page.title}</TableCell>
                  <TableCell>
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {page.url}
                    </a>
                  </TableCell>
                  <TableCell>{page.tasks?.length || 0}</TableCell>
                  <TableCell>
                    {new Date(page.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleEditClick(page, e)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(page);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Create Page Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>{editingPage ? 'Edit Page' : 'Create Page'}</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name="title"
                    control={control}
                    rules={{ 
                      required: 'Title is required'
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Page Title"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="url"
                    control={control}
                    rules={{ 
                      required: 'URL is required',
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: 'Please enter a valid URL starting with http:// or https://'
                      }
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Page URL"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} variant="contained">
              {editingPage ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
        >
          <DialogTitle>Delete Page</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this page? This will also delete all tasks associated with this page. This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Pages; 