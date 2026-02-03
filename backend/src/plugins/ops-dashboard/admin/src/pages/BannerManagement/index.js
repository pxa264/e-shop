import React, { useState, useEffect } from 'react';
import { useFetchClient } from '@strapi/helper-plugin';
import {
  Layout,
  HeaderLayout,
  ContentLayout,
  Box,
  Typography,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Badge,
  IconButton,
  ModalLayout,
  ModalHeader,
  ModalBody,
  ModalFooter,
  TextInput,
  ToggleInput,
} from '@strapi/design-system';
import { Pencil, Trash, ArrowUp, ArrowDown } from '@strapi/icons';

const BannerManagement = () => {
  const { get, post, put } = useFetchClient();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBanners, setSelectedBanners] = useState([]);
  const [notification, setNotification] = useState(null);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({ title: '', link: '', isActive: true });
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Fetch banners
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data } = await get('/ops-dashboard/banners');
      setBanners(data.data || []);
    } catch (error) {
      showNotification('error', 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Selection handlers
  const handleSelectAll = (checked) => {
    setSelectedBanners(checked ? banners.map(b => b.id) : []);
  };

  const handleSelectBanner = (id, checked) => {
    setSelectedBanners(prev =>
      checked ? [...prev, id] : prev.filter(i => i !== id)
    );
  };

  // Move banner up/down
  const handleMove = async (index, direction) => {
    const newBanners = [...banners];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newBanners.length) return;

    [newBanners[index], newBanners[targetIndex]] = [newBanners[targetIndex], newBanners[index]];

    const updates = newBanners.map((b, i) => ({ id: b.id, sortOrder: i }));

    try {
      await post('/ops-dashboard/banners/reorder', { updates });
      setBanners(newBanners);
      showNotification('success', 'Banner order updated');
    } catch (error) {
      showNotification('error', 'Failed to reorder banners');
    }
  };

  // Toggle banner status
  const handleToggle = async (id, currentStatus) => {
    try {
      await post('/ops-dashboard/banners/bulk/toggle', {
        ids: [id],
        isActive: !currentStatus
      });
      fetchBanners();
      showNotification('success', `Banner ${!currentStatus ? 'enabled' : 'disabled'}`);
    } catch (error) {
      showNotification('error', 'Failed to toggle banner');
    }
  };

  // Bulk toggle
  const handleBulkToggle = async (isActive) => {
    try {
      await post('/ops-dashboard/banners/bulk/toggle', {
        ids: selectedBanners,
        isActive
      });
      fetchBanners();
      setSelectedBanners([]);
      showNotification('success', `${selectedBanners.length} banner(s) ${isActive ? 'enabled' : 'disabled'}`);
    } catch (error) {
      showNotification('error', 'Failed to toggle banners');
    }
  };

  // Edit banner
  const handleEditClick = (banner) => {
    setEditingBanner(banner);
    setFormData({ title: banner.title, link: banner.link || '', isActive: banner.isActive });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    try {
      await put(`/ops-dashboard/banners/${editingBanner.id}`, formData);
      setShowEditModal(false);
      fetchBanners();
      showNotification('success', 'Banner updated');
    } catch (error) {
      showNotification('error', 'Failed to update banner');
    }
  };

  // Delete banners
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteSubmit = async () => {
    try {
      await post('/ops-dashboard/banners/bulk/delete', { ids: selectedBanners });
      setShowDeleteModal(false);
      setSelectedBanners([]);
      fetchBanners();
      showNotification('success', 'Banners deleted');
    } catch (error) {
      showNotification('error', 'Failed to delete banners');
    }
  };

  const getImageUrl = (banner) => {
    if (banner.image?.url) {
      return banner.image.url.startsWith('http')
        ? banner.image.url
        : `http://localhost:1337${banner.image.url}`;
    }
    return null;
  };

  return (
    <Layout>
      <HeaderLayout
        title="Banner Management"
        subtitle={`Manage homepage banners (${banners.length} banners)`}
      />

      <ContentLayout>
        {/* Notification */}
        {notification && (
          <Box marginBottom={4} padding={4} background={notification.type === 'success' ? 'success100' : 'danger100'}>
            <Typography textColor={notification.type === 'success' ? 'success600' : 'danger600'}>
              {notification.message}
            </Typography>
          </Box>
        )}

        {/* Bulk Actions */}
        {selectedBanners.length > 0 && (
          <Box marginBottom={4} padding={4} background="primary100" hasRadius>
            <Flex justifyContent="space-between" alignItems="center">
              <Typography fontWeight="bold">{selectedBanners.length} banner(s) selected</Typography>
              <Flex gap={2}>
                <Button size="S" variant="secondary" onClick={() => handleBulkToggle(true)}>Enable</Button>
                <Button size="S" variant="secondary" onClick={() => handleBulkToggle(false)}>Disable</Button>
                <Button size="S" variant="danger" onClick={handleDeleteClick}>Delete</Button>
              </Flex>
            </Flex>
          </Box>
        )}

        {/* Banner Table */}
        <Box background="neutral0" padding={6} shadow="tableShadow" hasRadius>
          {loading ? (
            <Typography>Loading banners...</Typography>
          ) : banners.length === 0 ? (
            <Typography>No banners found. Create banners in Content Manager.</Typography>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th><Checkbox checked={selectedBanners.length === banners.length} onChange={(e) => handleSelectAll(e.target.checked)} /></Th>
                  <Th>Image</Th>
                  <Th>Title</Th>
                  <Th>Link</Th>
                  <Th>Status</Th>
                  <Th>Order</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {banners.map((banner, index) => (
                  <Tr key={banner.id}>
                    <Td><Checkbox checked={selectedBanners.includes(banner.id)} onChange={(e) => handleSelectBanner(banner.id, e.target.checked)} /></Td>
                    <Td>
                      {getImageUrl(banner) ? (
                        <img src={getImageUrl(banner)} alt={banner.title} style={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 4 }} />
                      ) : (
                        <Box style={{ width: 80, height: 45, background: '#f0f0f0', borderRadius: 4 }} />
                      )}
                    </Td>
                    <Td><Typography fontWeight="semiBold">{banner.title}</Typography></Td>
                    <Td><Typography textColor="neutral600">{banner.link || '-'}</Typography></Td>
                    <Td>
                      <Badge backgroundColor={banner.isActive ? 'success100' : 'neutral150'} textColor={banner.isActive ? 'success600' : 'neutral600'}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                    <Td>
                      <Flex gap={1}>
                        <IconButton label="Move up" icon={<ArrowUp />} onClick={() => handleMove(index, 'up')} disabled={index === 0} />
                        <IconButton label="Move down" icon={<ArrowDown />} onClick={() => handleMove(index, 'down')} disabled={index === banners.length - 1} />
                      </Flex>
                    </Td>
                    <Td>
                      <Flex gap={1}>
                        <IconButton label="Edit" icon={<Pencil />} onClick={() => handleEditClick(banner)} />
                        <Button size="S" variant={banner.isActive ? 'secondary' : 'success'} onClick={() => handleToggle(banner.id, banner.isActive)}>
                          {banner.isActive ? 'Disable' : 'Enable'}
                        </Button>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
      </ContentLayout>

      {/* Edit Modal */}
      {showEditModal && (
        <ModalLayout onClose={() => setShowEditModal(false)} labelledBy="edit-modal">
          <ModalHeader><Typography fontWeight="bold" id="edit-modal">Edit Banner</Typography></ModalHeader>
          <ModalBody>
            <Flex direction="column" gap={4}>
              <TextInput label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              <TextInput label="Link" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} />
              <ToggleInput label="Active" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} onLabel="Yes" offLabel="No" />
            </Flex>
          </ModalBody>
          <ModalFooter startActions={<Button onClick={() => setShowEditModal(false)} variant="tertiary">Cancel</Button>} endActions={<Button onClick={handleEditSubmit}>Save</Button>} />
        </ModalLayout>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <ModalLayout onClose={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }} labelledBy="delete-modal">
          <ModalHeader>
            <Typography fontWeight="bold" id="delete-modal">Delete Banners</Typography>
          </ModalHeader>
          <ModalBody>
            <Box paddingTop={2} paddingBottom={2}>
              <Box marginBottom={4} padding={3} background="danger100" hasRadius>
                <Typography textColor="danger600" fontWeight="bold">
                  Warning: This action cannot be undone!
                </Typography>
              </Box>
              <Typography marginBottom={2}>
                You are about to delete {selectedBanners.length} banner(s):
              </Typography>
              <Box marginTop={2} marginBottom={4} padding={3} background="neutral100" hasRadius>
                {banners
                  .filter(b => selectedBanners.includes(b.id))
                  .map(b => (
                    <Typography key={b.id} variant="pi" textColor="neutral700" as="div">
                      • {b.title}
                    </Typography>
                  ))
                }
              </Box>
              <Box marginTop={4}>
                <TextInput
                  label="Type DELETE to confirm"
                  placeholder="DELETE"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  hint="This action is irreversible. Please type DELETE to confirm."
                />
              </Box>
            </Box>
          </ModalBody>
          <ModalFooter
            startActions={
              <Button onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }} variant="tertiary">
                Cancel
              </Button>
            }
            endActions={
              <Button
                onClick={() => { handleDeleteSubmit(); setDeleteConfirmText(''); }}
                variant="danger"
                disabled={deleteConfirmText !== 'DELETE'}
              >
                Delete {selectedBanners.length} Banner(s)
              </Button>
            }
          />
        </ModalLayout>
      )}
    </Layout>
  );
};

export default BannerManagement;
