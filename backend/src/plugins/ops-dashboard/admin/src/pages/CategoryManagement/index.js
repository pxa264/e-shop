import React, { useState, useEffect, useCallback } from 'react';
import { useFetchClient } from '@strapi/helper-plugin';
import Tree from 'rc-tree';
import 'rc-tree/assets/index.css';
import {
  Layout,
  HeaderLayout,
  ContentLayout,
  Box,
  Typography,
  Button,
  Flex,
  IconButton,
  ModalLayout,
  ModalHeader,
  ModalBody,
  ModalFooter,
  TextInput,
  Textarea,
  Badge,
} from '@strapi/design-system';
import { Plus, Pencil, Trash, Folder } from '@strapi/icons';

// Helper: Get badge colors based on product count
const getBadgeColors = (count) => {
  if (count === 0) return { bg: 'neutral200', text: 'neutral600' };
  if (count <= 5) return { bg: 'primary100', text: 'primary600' };
  return { bg: 'success100', text: 'success600' };
};

const CategoryManagement = () => {
  const { get, post, put, del } = useFetchClient();

  // Data states
  const [treeData, setTreeData] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCategories, setTotalCategories] = useState(0);
  const [hoveredNode, setHoveredNode] = useState(null);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    parentId: null,
  });

  // Notification state
  const [notification, setNotification] = useState(null);

  // Fetch category tree
  const fetchCategoryTree = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await get('/ops-dashboard/categories/tree');
      const formattedTree = formatTreeForRcTree(data.data.tree);
      setTreeData(formattedTree);
      setTotalCategories(data.data.totalCount);

      // Auto-expand root level
      const rootKeys = formattedTree.map(node => node.key);
      setExpandedKeys(rootKeys);
    } catch (error) {
      console.error('Failed to load categories:', error);
      showNotification('error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchCategoryTree();
  }, [fetchCategoryTree]);

  // Format tree data for rc-tree
  const formatTreeForRcTree = (tree) => {
    return tree.map(node => ({
      key: `category-${node.id}`,
      title: node.name,
      id: node.id,
      name: node.name,
      slug: node.slug,
      description: node.description,
      productCount: node.productCount,
      sortOrder: node.sortOrder,
      parent: node.parent,
      children: node.children?.length > 0 ? formatTreeForRcTree(node.children) : [],
    }));
  };

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle add root category
  const handleAddRootCategory = () => {
    setFormData({ name: '', description: '', slug: '', parentId: null });
    setShowAddModal(true);
  };

  // Handle add child category
  const handleAddChildClick = (node) => {
    setFormData({ name: '', description: '', slug: '', parentId: node.id });
    setShowAddModal(true);
  };

  // Handle edit click
  const handleEditClick = (node) => {
    setSelectedCategory(node);
    setFormData({
      name: node.name,
      description: node.description || '',
      slug: node.slug || '',
      parentId: node.parent?.id || null,
    });
    setShowEditModal(true);
  };

  // Handle delete click
  const handleDeleteClick = (node) => {
    setSelectedCategory(node);
    setShowDeleteModal(true);
  };

  // Handle add submit
  const handleAddSubmit = async () => {
    try {
      await post('/ops-dashboard/categories', {
        name: formData.name,
        description: formData.description,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        parentId: formData.parentId,
        sortOrder: 0,
      });
      showNotification('success', 'Category created successfully');
      setShowAddModal(false);
      fetchCategoryTree();
    } catch (error) {
      showNotification('error', 'Failed to create category');
    }
  };

  // Handle edit submit
  const handleEditSubmit = async () => {
    try {
      await put(`/ops-dashboard/categories/${selectedCategory.id}`, {
        name: formData.name,
        description: formData.description,
        slug: formData.slug,
      });
      showNotification('success', 'Category updated successfully');
      setShowEditModal(false);
      fetchCategoryTree();
    } catch (error) {
      showNotification('error', 'Failed to update category');
    }
  };

  // Handle delete submit
  const handleDeleteSubmit = async () => {
    try {
      await del(`/ops-dashboard/categories/${selectedCategory.id}`);
      showNotification('success', 'Category deleted successfully');
      setShowDeleteModal(false);
      fetchCategoryTree();
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to delete category';
      showNotification('error', message);
    }
  };

  // Render tree node
  const renderTreeNode = (node) => {
    const badgeColors = getBadgeColors(node.productCount);
    return (
      <Flex
        justifyContent="space-between"
        alignItems="center"
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: hoveredNode === node.key ? '#f0f0ff' : 'transparent',
          transition: 'all 0.2s ease',
          marginBottom: '4px'
        }}
        onMouseEnter={() => setHoveredNode(node.key)}
        onMouseLeave={() => setHoveredNode(null)}
      >
        <Flex gap={3} alignItems="center">
          <Box
            padding={2}
            hasRadius
            background={hoveredNode === node.key ? 'primary100' : 'neutral100'}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Folder style={{ color: '#4945FF', width: 22, height: 22 }} />
          </Box>
          <Typography variant="omega" fontWeight="semiBold" style={{ fontSize: '15px' }}>
            {node.name}
          </Typography>
          <Badge
            backgroundColor={badgeColors.bg}
            textColor={badgeColors.text}
            size="S"
            style={{ marginLeft: '8px' }}
          >
            {node.productCount} products
          </Badge>
        </Flex>
        <Flex gap={2}>
          <IconButton
            label="Edit"
            icon={<Pencil />}
            onClick={() => handleEditClick(node)}
            noBorder
            style={{
              color: '#4945FF',
              backgroundColor: hoveredNode === node.key ? '#e0e0ff' : 'transparent',
              width: '36px',
              height: '36px'
            }}
          />
          <IconButton
            label="Add child"
            icon={<Plus />}
            onClick={() => handleAddChildClick(node)}
            noBorder
            style={{
              color: '#328048',
              backgroundColor: hoveredNode === node.key ? '#e0ffe0' : 'transparent',
              width: '36px',
              height: '36px'
            }}
          />
          <IconButton
            label="Delete"
            icon={<Trash />}
            onClick={() => handleDeleteClick(node)}
            noBorder
            style={{
              color: '#D02B20',
              backgroundColor: hoveredNode === node.key ? '#ffe0e0' : 'transparent',
              width: '36px',
              height: '36px'
            }}
          />
        </Flex>
      </Flex>
    );
  };

  return (
    <Layout>
      <HeaderLayout
        title="Category Management"
        subtitle={`${totalCategories} categories total`}
        primaryAction={
          <Button startIcon={<Plus />} onClick={handleAddRootCategory}>
            Add Root Category
          </Button>
        }
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

        {/* Tree View */}
        <Box background="neutral0" padding={6} shadow="tableShadow" hasRadius>
          {loading ? (
            <Typography>Loading categories...</Typography>
          ) : treeData.length === 0 ? (
            <Typography>No categories found. Create your first category!</Typography>
          ) : (
            <>
              <style>
                {`
                  .category-tree .rc-tree-treenode {
                    padding: 4px 0;
                  }
                  .category-tree .rc-tree-indent-unit {
                    width: 32px;
                  }
                  .category-tree .rc-tree-switcher {
                    width: 28px;
                    height: 28px;
                    line-height: 28px;
                    margin-right: 4px;
                    background: #f5f5f5;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  }
                  .category-tree .rc-tree-switcher:hover {
                    background: #e0e0ff;
                  }
                  .category-tree .rc-tree-switcher-icon {
                    font-size: 12px;
                  }
                  .category-tree .rc-tree-node-content-wrapper {
                    flex: 1;
                    min-height: 48px;
                    display: flex;
                    align-items: center;
                  }
                  .category-tree .rc-tree-title {
                    flex: 1;
                  }
                `}
              </style>
              <Tree
                className="category-tree"
                treeData={treeData}
                expandedKeys={expandedKeys}
                onExpand={setExpandedKeys}
                titleRender={(node) => renderTreeNode(node)}
                showIcon={false}
                style={{ fontSize: '15px' }}
              />
            </>
          )}
        </Box>
      </ContentLayout>

      {/* Edit Modal */}
      {showEditModal && (
        <ModalLayout onClose={() => setShowEditModal(false)} labelledBy="edit-modal">
          <ModalHeader>
            <Typography fontWeight="bold" id="edit-modal">Edit Category</Typography>
          </ModalHeader>
          <ModalBody>
            <Flex direction="column" gap={4}>
              <TextInput
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <TextInput
                label="Slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Flex>
          </ModalBody>
          <ModalFooter
            startActions={<Button onClick={() => setShowEditModal(false)} variant="tertiary">Cancel</Button>}
            endActions={<Button onClick={handleEditSubmit}>Save</Button>}
          />
        </ModalLayout>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <ModalLayout onClose={() => setShowAddModal(false)} labelledBy="add-modal">
          <ModalHeader>
            <Typography fontWeight="bold" id="add-modal">
              {formData.parentId ? 'Add Child Category' : 'Add Root Category'}
            </Typography>
          </ModalHeader>
          <ModalBody>
            <Flex direction="column" gap={4}>
              <TextInput
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <TextInput
                label="Slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                hint="Leave empty to auto-generate from name"
              />
              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Flex>
          </ModalBody>
          <ModalFooter
            startActions={<Button onClick={() => setShowAddModal(false)} variant="tertiary">Cancel</Button>}
            endActions={<Button onClick={handleAddSubmit} disabled={!formData.name}>Create</Button>}
          />
        </ModalLayout>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedCategory && (
        <ModalLayout onClose={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }} labelledBy="delete-modal">
          <ModalHeader>
            <Typography fontWeight="bold" id="delete-modal">Delete Category</Typography>
          </ModalHeader>
          <ModalBody>
            <Box paddingTop={2} paddingBottom={2}>
              <Box marginBottom={4} padding={3} background="danger100" hasRadius>
                <Typography textColor="danger600" fontWeight="bold">
                  Warning: This action cannot be undone!
                </Typography>
              </Box>
              <Typography>
                Are you sure you want to delete "{selectedCategory.name}"?
              </Typography>
              {selectedCategory.productCount > 0 && (
                <Box marginTop={2} padding={4} background="danger100">
                  <Typography textColor="danger600">
                    This category has {selectedCategory.productCount} products. Please reassign them first.
                  </Typography>
                </Box>
              )}
              {selectedCategory.productCount === 0 && (
                <Box marginTop={4}>
                  <TextInput
                    label="Type DELETE to confirm"
                    placeholder="DELETE"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    hint="This action is irreversible. Please type DELETE to confirm."
                  />
                </Box>
              )}
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
                disabled={selectedCategory.productCount > 0 || deleteConfirmText !== 'DELETE'}
              >
                Delete Category
              </Button>
            }
          />
        </ModalLayout>
      )}
    </Layout>
  );
};

export default CategoryManagement;
