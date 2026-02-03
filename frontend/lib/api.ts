/**
 * Strapi API 工具函数
 *
 * 功能概述：
 * 封装与 Strapi 后端 API 的所有交互，提供统一的请求接口。
 *
 * 主要功能：
 * - 动态 API URL 配置（服务端/客户端自适应）
 * - 商品相关 API（列表、详情、搜索）
 * - 分类相关 API
 * - Banner 相关 API
 * - 订单相关 API
 *
 * 环境变量：
 * - NEXT_PUBLIC_STRAPI_API_URL: Strapi API 地址（服务端使用）
 *
 * @module lib/api
 */

import axios from 'axios'

const mapToStrapiLocale = (locale?: string) => {
  if (!locale) return undefined
  if (locale === 'zh') return 'zh-CN'
  return locale
}

/**
 * API 基础 URL 获取函数
 */
export const getAPIUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://strapi:1337'
  }
  // 浏览器端通过nginx代理访问（本地8089，生产环境用域名）
  return process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
}

/**
 * 获取完整的图片 URL
 * 
 * @param url Strapi 返回的相对或绝对图片路径
 * @returns 完整的图片 URL
 */
export const getImageUrl = (url: string | null | undefined) => {
  if (!url) return '/placeholder.png'
  if (url.startsWith('http')) return url
  return `${getAPIUrl()}${url}`
}

/**
 * 创建 Axios 实例
 */
const getApi = () => {
  return axios.create({
    baseURL: `${getAPIUrl()}/api`,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

/**
 * 获取商品列表（原始接口）
 *
 * 功能：使用 Strapi 原生查询参数获取商品列表
 *
 * @param {Object} params - Strapi 查询参数
 * @param {string} params.fields - 指定返回字段
 * @param {string} params.populate - 关联数据填充
 * @param {Object} params.filters - 筛选条件
 * @param {Object} params.sort - 排序规则
 * @param {Object} params.pagination - 分页配置
 *
 * @returns {Promise<Object>} 包含商品列表和元数据的响应对象
 *
 * @example
 * // 获取前 10 个商品
 * const data = await fetchProducts({
 *   populate: '*',
 *   pagination: { limit: 10 }
 * })
 */
export const fetchProducts = async (params?: any) => {
  const response = await getApi().get('/products', { params })
  return response.data
}

/**
 * 获取商品列表（便捷接口）
 *
 * 功能：提供更友好的商品查询接口
 * - 支持推荐商品筛选
 * - 支持分类筛选
 * - 支持数量限制
 *
 * @param {Object} options - 查询选项
 * @param {boolean} options.featured - 是否只获取推荐商品
 * @param {number} options.limit - 限制返回数量
 * @param {string} options.category - 分类 slug
 *
 * @returns {Promise<Object>} 包含商品列表和元数据的响应对象
 *
 * @example
 * // 获取 4 个推荐商品
 * const data = await getProducts({ featured: true, limit: 4 })
 *
 * @example
 * // 获取特定分类的商品
 * const data = await getProducts({ category: 'electronics' })
 */
export const getProducts = async (options?: {
  featured?: boolean
  limit?: number
  category?: string
  locale?: string
}) => {
  const params: any = { populate: '*' }

  // 内容本地化（需要 Strapi i18n 插件启用并存在对应 locale 内容）
  if (options?.locale) {
    params.locale = mapToStrapiLocale(options.locale)
  }

  // 推荐商品筛选
  if (options?.featured) {
    params.filters = { featured: { $eq: true } }
  }

  // 分类筛选
  if (options?.category) {
    // Note: category is treated as Category id (stringified) to avoid slug uniqueness issues across locales
    const categoryId = Number(options.category)
    params.filters = {
      ...params.filters,
      category: {
        id: {
          $eq: Number.isFinite(categoryId) ? categoryId : options.category,
        },
      },
    }
  }

  // 数量限制
  if (options?.limit) {
    params.pagination = { limit: options.limit }
  }

  const response = await getApi().get('/products', { params })
  return response.data
}

/**
 * 根据 Slug 获取单个商品
 *
 * 功能：通过商品的唯一 slug 获取商品详情
 * - 自动包含关联数据（分类、图片等）
 *
 * @param {string} slug - 商品的唯一标识符
 *
 * @returns {Promise<Object>} 商品对象
 * @throws {Error} 当商品不存在时返回 undefined
 *
 * @example
 * // 获取 slug 为 'iphone-15' 的商品
 * const product = await fetchProductBySlug('iphone-15')
 */
export const fetchProductBySlug = async (slug: string) => {
  const response = await getApi().get(`/products`, {
    params: {
      filters: { slug: { $eq: slug } },
      populate: '*',
    },
  })
  return response.data.data[0]
}

/**
 * 获取所有分类
 *
 * 功能：获取商品分类列表，包含关联数据
 *
 * @returns {Promise<Object>} 包含分类列表的响应对象
 *
 * @example
 * const { data } = await fetchCategories()
 */
export const fetchCategories = async (options?: { locale?: string }) => {
  const response = await getApi().get('/categories', {
    params: {
      populate: '*',
      ...(options?.locale ? { locale: mapToStrapiLocale(options.locale) } : {}),
    },
  })
  return response.data
}

/**
 * 获取激活的 Banner
 *
 * 功能：获取首页轮播图列表
 * - 只返回激活状态的 Banner
 * - 按 sortOrder 升序排列
 *
 * @returns {Promise<Object>} 包含 Banner 列表的响应对象
 */
export const fetchBanners = async () => {
  const response = await getApi().get('/banners', {
    params: {
      filters: { isActive: { $eq: true } },
      populate: '*',
      sort: 'sortOrder:asc',
    },
  })
  return response.data
}

export const fetchBannersByLocale = async (locale?: string) => {
  const response = await getApi().get('/banners', {
    params: {
      filters: { isActive: { $eq: true } },
      populate: '*',
      sort: 'sortOrder:asc',
      ...(locale ? { locale: mapToStrapiLocale(locale) } : {}),
    },
  })
  return response.data
}

/**
 * 创建订单
 *
 * 功能：提交新订单到后端
 * - 包含客户信息、订单总额等
 * - 订单明细需要单独创建
 *
 * @param {Object} orderData - 订单数据
 * @param {string} orderData.orderNumber - 订单号
 * @param {string} orderData.customerName - 客户姓名
 * @param {string} orderData.customerEmail - 客户邮箱
 * @param {string} orderData.customerPhone - 客户电话
 * @param {string} orderData.shippingAddress - 配送地址
 * @param {number} orderData.totalAmount - 订单总金额
 * @param {string} orderData.status - 订单状态（默认 'pending'）
 *
 * @returns {Promise<Object>} 创建的订单对象
 *
 * @example
 * const order = await createOrder({
 *   orderNumber: 'ORD1234567890',
 *   customerName: '张三',
 *   customerEmail: 'zhangsan@example.com',
 *   customerPhone: '13800138000',
 *   shippingAddress: '北京市朝阳区...',
 *   totalAmount: 299.99
 * })
 */
export const createOrder = async (orderData: any) => {
  const api = getAuthApi()
  const response = await api.post('/orders', { data: orderData })
  return response.data
}

/**
 * 创建订单明细
 *
 * 功能：为订单添加商品明细
 * - 每个订单可能包含多个商品
 * - 记录商品名称、价格、数量等
 *
 * @param {Object} orderItemData - 订单明细数据
 * @param {Object} orderItemData.order - 关联的订单对象
 * @param {string} orderItemData.productName - 商品名称（快照）
 * @param {number} orderItemData.price - 商品单价（快照）
 * @param {number} orderItemData.quantity - 商品数量
 * @param {number} orderItemData.subtotal - 小计金额
 *
 * @returns {Promise<Object>} 创建的订单明细对象
 *
 * @example
 * const orderItem = await createOrderItem({
 *   order: createdOrder.data,
 *   productName: 'iPhone 15 Pro',
 *   price: 7999,
 *   quantity: 1,
 *   subtotal: 7999
 * })
 */
export const createOrderItem = async (orderItemData: any) => {
  const api = getAuthApi()
  const response = await api.post('/order-items', { data: orderItemData })
  return response.data
}

// ==================== 认证相关 API ====================

/**
 * 用户登录
 *
 * 功能：使用邮箱和密码登录系统
 *
 * @param {string} email - 用户邮箱
 * @param {string} password - 用户密码
 *
 * @returns {Promise<Object>} 包含 JWT token 和用户信息的响应
 * @returns {string} data.jwt - JWT 认证令牌
 * @returns {Object} data.user - 用户信息
 *
 * @throws {Error} 当邮箱或密码错误时抛出异常
 *
 * @example
 * const { jwt, user } = await login('user@example.com', 'password123')
 */
export const login = async (email: string, password: string) => {
  const api = getApi()
  const response = await api.post('/auth/local', {
    identifier: email,
    password,
  })
  return response.data
}

/**
 * 用户注册
 *
 * 功能：创建新账户并自动登录
 *
 * @param {string} username - 用户名
 * @param {string} email - 用户邮箱
 * @param {string} password - 用户密码（至少 6 位）
 *
 * @returns {Promise<Object>} 包含 JWT token 和用户信息的响应
 *
 * @throws {Error} 当用户名或邮箱已存在时抛出异常
 *
 * @example
 * const { jwt, user } = await register('newuser', 'user@example.com', 'password123')
 */
export const register = async (username: string, email: string, password: string) => {
  const api = getApi()
  const response = await api.post('/auth/local/register', {
    username,
    email,
    password,
  })
  return response.data
}

/**
 * 忘记密码
 *
 * 功能：发送密码重置邮件到用户邮箱
 *
 * @param {string} email - 用户邮箱
 *
 * @returns {Promise<Object>} 成功响应
 *
 * @throws {Error} 当邮箱不存在时仍返回成功（安全考虑）
 *
 * @example
 * await forgotPassword('user@example.com')
 */
export const forgotPassword = async (email: string) => {
  const api = getApi()
  const response = await api.post('/auth/forgot-password', {
    email,
  })
  return response.data
}

/**
 * 重置密码
 *
 * 功能：使用邮件中的重置链接设置新密码
 *
 * @param {string} code - 邮件中的重置代码
 * @param {string} password - 新密码
 * @param {string} passwordConfirmation - 确认新密码
 *
 * @returns {Promise<Object>} 成功响应
 *
 * @throws {Error} 当代码无效或已过期时抛出异常
 *
 * @example
 * await resetPassword('resetCode123', 'newPassword123', 'newPassword123')
 */
export const resetPassword = async (code: string, password: string, passwordConfirmation: string) => {
  const api = getApi()
  const response = await api.post('/auth/reset-password', {
    code,
    password,
    passwordConfirmation,
  })
  return response.data
}

// ==================== 用户相关 API ====================

/**
 * 获取认证的 API 实例
 *
 * 功能：创建带 JWT token 的 axios 实例
 * - 自动从 localStorage 读取 JWT
 * - 添加 Authorization 头
 *
 * @returns {AxiosInstance} 配置好的 axios 实例（带认证）
 *
 * @private
 */
const getAuthApi = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null

  return axios.create({
    baseURL: `${getAPIUrl()}/api`,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })
}

/**
 * 获取当前用户信息
 *
 * 功能：获取已登录用户的详细信息
 * - 包含地址、收藏、订单等关联数据
 *
 * @returns {Promise<Object>} 用户详细信息
 *
 * @throws {Error} 当未登录或 token 无效时抛出异常
 *
 * @example
 * const user = await getCurrentUser()
 */
export const getCurrentUser = async () => {
  const api = getAuthApi()
  const response = await api.get('/user-profile/me')
  return response.data
}

/**
 * 更新用户资料
 *
 * 功能：更新当前用户的基本信息
 *
 * @param {Object} profileData - 用户资料数据
 * @param {string} profileData.username - 用户名（可选）
 * @param {string} profileData.email - 邮箱（可选）
 * @param {string} profileData.phone - 手机号（可选）
 * @param {number} profileData.avatar - 头像 ID（可选）
 *
 * @returns {Promise<Object>} 更新后的用户信息
 *
 * @throws {Error} 当邮箱或手机号已被占用时抛出异常
 *
 * @example
 * const user = await updateProfile({ username: 'newname', phone: '13800138000' })
 */
export const updateProfile = async (profileData: {
  username?: string
  email?: string
}) => {
  const api = getAuthApi()
  const response = await api.put('/user-profile/me', profileData)
  return response.data
}

/**
 * 修改密码
 *
 * 功能：已登录用户修改密码
 * - 需要验证当前密码
 *
 * @param {string} currentPassword - 当前密码
 * @param {string} newPassword - 新密码（至少 6 位）
 *
 * @returns {Promise<Object>} 成功响应
 *
 * @throws {Error} 当当前密码错误时抛出异常
 *
 * @example
 * await changePassword('oldPassword', 'newPassword123', 'newPassword123')
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  passwordConfirmation: string
) => {
  const api = getAuthApi()
  const response = await api.post('/auth/change-password', {
    currentPassword,
    password: newPassword,
    passwordConfirmation,
  })
  return response.data
}

/**
 * 获取用户订单列表
 *
 * 功能：获取当前用户的所有订单
 * - 支持按状态筛选
 * - 支持分页
 *
 * @param {Object} options - 查询选项
 * @param {string} options.status - 订单状态筛选（可选）
 * @param {number} options.limit - 每页数量（默认 10）
 * @param {number} options.start - 分页起始位置（默认 0）
 *
 * @returns {Promise<Object>} 订单列表和分页信息
 *
 * @example
 * // 获取所有订单
 * const orders = await getMyOrders()
 *
 * @example
 * // 获取待付款订单
 * const orders = await getMyOrders({ status: 'pending' })
 */
export const getMyOrders = async (options?: {
  status?: string
  limit?: number
  start?: number
}) => {
  const api = getAuthApi()
  const response = await api.get('/user-profile/orders', {
    params: options,
  })
  return response.data
}

/**
 * 获取用户统计信息
 *
 * 功能：获取用户的订单、地址、收藏统计
 *
 * @returns {Promise<Object>} 统计信息
 * @returns {Object} data.orders - 各状态订单数量统计
 * @returns {number} data.addressCount - 地址数量
 * @returns {number} data.wishlistCount - 收藏数量
 *
 * @example
 * const stats = await getMyStatistics()
 */
export const getMyStatistics = async () => {
  const api = getAuthApi()
  const response = await api.get('/user-profile/statistics')
  return response.data
}

// ==================== 地址管理 API ====================

/**
 * 获取用户地址列表
 *
 * 功能：获取当前用户的所有收货地址
 * - 默认地址排在前面
 *
 * @returns {Promise<Object>} 地址列表
 *
 * @example
 * const { data } = await getAddresses()
 */
export const getAddresses = async () => {
  const api = getAuthApi()
  const response = await api.get('/user-addresses')
  return response.data
}

/**
 * 创建新地址
 *
 * 功能：添加新的收货地址
 * - 可设置为默认地址
 *
 * @param {Object} addressData - 地址数据
 * @param {string} addressData.receiverName - 收货人姓名
 * @param {string} addressData.receiverPhone - 收货人电话
 * @param {string} addressData.province - 省
 * @param {string} addressData.city - 市
 * @param {string} addressData.district - 区
 * @param {string} addressData.detailAddress - 详细地址
 * @param {string} addressData.postalCode - 邮政编码（可选）
 * @param {boolean} addressData.isDefault - 是否默认地址
 *
 * @returns {Promise<Object>} 创建的地址对象
 *
 * @example
 * const address = await createAddress({
 *   receiverName: '张三',
 *   receiverPhone: '13800138000',
 *   province: '北京市',
 *   city: '北京市',
 *   district: '朝阳区',
 *   detailAddress: 'xxx街道xxx号',
 *   isDefault: false
 * })
 */
export const createAddress = async (addressData: {
  receiverName: string
  receiverPhone: string
  province: string
  city: string
  district: string
  detailAddress: string
  postalCode?: string
  isDefault?: boolean
}) => {
  const api = getAuthApi()
  const response = await api.post('/user-addresses', {
    data: addressData,
  })
  return response.data
}

/**
 * 更新地址
 *
 * 功能：修改已有地址信息
 *
 * @param {number} addressId - 地址 ID
 * @param {Object} addressData - 要更新的地址数据
 *
 * @returns {Promise<Object>} 更新后的地址对象
 *
 * @example
 * const address = await updateAddress(1, { receiverName: '李四' })
 */
export const updateAddress = async (addressId: number, addressData: Partial<{
  receiverName: string
  receiverPhone: string
  province: string
  city: string
  district: string
  detailAddress: string
  postalCode: string
  isDefault: boolean
}>) => {
  const api = getAuthApi()
  const response = await api.put(`/user-addresses/${addressId}`, {
    data: addressData,
  })
  return response.data
}

/**
 * 删除地址
 *
 * 功能：删除指定的收货地址
 *
 * @param {number} addressId - 地址 ID
 *
 * @returns {Promise<Object>} 删除的地址对象
 *
 * @example
 * await deleteAddress(1)
 */
export const deleteAddress = async (addressId: number) => {
  const api = getAuthApi()
  const response = await api.delete(`/user-addresses/${addressId}`)
  return response.data
}

/**
 * 设置默认地址
 *
 * 功能：将指定地址设为默认地址
 * - 自动取消其他地址的默认状态
 *
 * @param {number} addressId - 地址 ID
 *
 * @returns {Promise<Object>} 更新后的地址对象
 *
 * @example
 * await setDefaultAddress(1)
 */
export const setDefaultAddress = async (addressId: number) => {
  const api = getAuthApi()
  const response = await api.post(`/user-addresses/${addressId}/set-default`)
  return response.data
}

// ==================== 收藏夹 API ====================

/**
 * 获取收藏列表
 *
 * 功能：获取当前用户的所有收藏商品
 *
 * @returns {Promise<Object>} 收藏列表（包含商品详情）
 *
 * @example
 * const { data } = await getWishlists()
 */
export const getWishlists = async () => {
  const api = getAuthApi()
  const response = await api.get('/wishlists')
  return response.data
}

/**
 * 添加收藏
 *
 * 功能：将商品添加到收藏夹
 * - 重复添加会返回错误
 *
 * @param {number} productId - 商品 ID
 *
 * @returns {Promise<Object>} 创建的收藏对象
 *
 * @throws {Error} 当商品已收藏时抛出异常
 *
 * @example
 * await addToWishlist(1)
 */
export const addToWishlist = async (productId: number) => {
  const api = getAuthApi()
  const response = await api.post('/wishlists', {
    data: {
      product: productId,
    },
  })
  return response.data
}

/**
 * 移除收藏
 *
 * 功能：从收藏夹移除商品
 *
 * @param {number} wishlistId - 收藏记录 ID
 *
 * @returns {Promise<Object>} 删除的收藏对象
 *
 * @example
 * await removeFromWishlist(1)
 */
export const removeFromWishlist = async (wishlistId: number) => {
  const api = getAuthApi()
  const response = await api.delete(`/wishlists/${wishlistId}`)
  return response.data
}

/**
 * 切换收藏状态
 *
 * 功能：智能切换收藏状态
 * - 已收藏则取消
 * - 未收藏则添加
 *
 * @param {number} productId - 商品 ID
 *
 * @returns {Promise<Object>} 操作结果和状态
 * @returns {boolean} data.isFavorited - 当前收藏状态
 *
 * @example
 * const { isFavorited } = await toggleWishlist(1)
 */
export const toggleWishlist = async (productId: number) => {
  const api = getAuthApi()
  const response = await api.post('/wishlists/toggle', {
    data: {
      product: productId,
    },
  })
  return response.data
}

/**
 * 检查收藏状态
 *
 * 功能：检查商品是否已被收藏
 *
 * @param {number} productId - 商品 ID
 *
 * @returns {Promise<Object>} 收藏状态
 * @returns {boolean} data.isFavorited - 是否已收藏
 * @returns {number|null} data.wishlistId - 收藏记录 ID（如果已收藏）
 *
 * @example
 * const { isFavorited, wishlistId } = await checkWishlist(1)
 */
export const checkWishlist = async (productId: number) => {
  const api = getAuthApi()
  const response = await api.get(`/wishlists/check/${productId}`)
  return response.data
}

// ==================== 订单管理 API（用户端） ====================

/**
 * 获取订单详情
 *
 * 功能：获取指定订单号的详细信息
 * - 只能查看自己的订单
 * - 包含订单明细和状态历史
 *
 * @param {string} orderNumber - 订单号
 *
 * @returns {Promise<Object>} 订单详情
 *
 * @throws {Error} 当订单不存在或无权查看时抛出异常
 *
 * @example
 * const order = await getMyOrderDetail('ORD1234567890')
 */
export const getMyOrderDetail = async (orderNumber: string) => {
  const api = getAuthApi()
  const response = await api.get(`/orders/${orderNumber}/detail`)
  return response.data
}

/**
 * 取消订单
 *
 * 功能：用户取消自己的订单
 * - 只有 pending 状态的订单可以取消
 *
 * @param {string} orderNumber - 订单号
 *
 * @returns {Promise<Object>} 取消后的订单信息
 *
 * @throws {Error} 当订单不存在或状态不允许取消时抛出异常
 *
 * @example
 * await cancelOrder('ORD1234567890')
 */
export const cancelOrder = async (orderNumber: string) => {
  const api = getAuthApi()
  const response = await api.post(`/orders/${orderNumber}/cancel`)
  return response.data
}

/**
 * 默认导出：获取 API 实例
 *
 * 功能：供外部直接使用 axios 实例进行自定义 API 调用
 *
 * @returns {AxiosInstance} 配置好的 axios 实例
 *
 * @example
 * const api = getApi()
 * const response = await api.get('/custom-endpoint')
 */
export default getApi
