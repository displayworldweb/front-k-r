// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://k-r.by/api';

export const apiClient = {
  async get(endpoint: string) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async put(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async delete(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};

// API endpoints
export const API_ENDPOINTS = {
  // Products and monuments
  monuments: '/monuments',
  products: '/products', 
  accessories: '/accessories',
  fences: '/fences',
  landscape: '/landscape',
  
  // Categories
  categories: '/categories',
  
  // Campaigns and blogs
  campaigns: '/campaigns',
  blogs: '/blogs',
  
  // Page descriptions
  pageDescriptions: '/page-descriptions',
  
  // Admin endpoints
  admin: {
    epitaphs: '/admin/epitaphs',
    monuments: '/admin/monuments',
    products: '/admin/products',
    accessories: '/admin/accessories',
    fences: '/admin/fences',
    landscape: '/admin/landscape',
    campaigns: '/admin/campaigns',
    blogs: '/admin/blogs',
    works: '/admin/works',
    pageDescriptions: '/admin/page-descriptions',
    pageSeo: '/admin/page-seo',
  }
};

export default apiClient;