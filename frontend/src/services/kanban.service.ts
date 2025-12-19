import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Types
export interface KanbanBoard {
  id: number;
  name: string;
  description?: string;
  board_type: string;
  created_by: number;
  is_default?: boolean;
  settings?: Record<string, any>;
  columns?: KanbanColumn[];
  created_at: string;
  updated_at: string;
}

export interface KanbanColumn {
  id: number;
  board_id: number;
  name: string;
  position: number;
  color?: string;
  wip_limit?: number;
  cards?: KanbanCard[];
  created_at: string;
  updated_at: string;
}

export interface KanbanCard {
  id: number;
  column_id: number;
  board_id: number;
  title: string;
  description?: string;
  position: number;
  contact_id?: number;
  company_id?: number;
  project_id?: number;
  assigned_to?: number;
  due_date?: string;
  amount?: number;
  priority?: string;
  labels?: string[];
  custom_fields?: Record<string, any>;
  created_by: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  contact_name?: string;
  company_name?: string;
  assigned_to_name?: string;
  column_name?: string;
  last_activity_at?: string;
  activity_count?: number;
  activities?: KanbanActivity[];
  contact_email?: string;
  contact_phone?: string;
  board_name?: string;
}

export interface KanbanActivity {
  id: number;
  card_id: number;
  user_id: number;
  activity_type: string;
  content?: string;
  metadata?: Record<string, any>;
  created_at: string;
  user_name?: string;
}

export interface CreateBoardData {
  name: string;
  description?: string;
  board_type?: string;
  settings?: Record<string, any>;
}

export interface CreateColumnData {
  name: string;
  color?: string;
  wip_limit?: number;
  position?: number;
}

export interface CreateCardData {
  column_id: number;
  board_id: number;
  title: string;
  description?: string;
  contact_id?: number;
  company_id?: number;
  project_id?: number;
  assigned_to?: number;
  due_date?: string;
  amount?: number;
  priority?: string;
  labels?: string[];
  custom_fields?: Record<string, any>;
}

export interface CreateActivityData {
  activity_type: string;
  content?: string;
  metadata?: Record<string, any>;
}

// ============ BOARDS ============
export const kanbanService = {
  // Boards
  async getAllBoards(): Promise<KanbanBoard[]> {
    const response = await axios.get(`${API_URL}/kanban/boards`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async getBoardById(id: number): Promise<KanbanBoard & { columns: (KanbanColumn & { cards: KanbanCard[] })[] }> {
    const response = await axios.get(`${API_URL}/kanban/boards/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async createBoard(data: CreateBoardData): Promise<KanbanBoard> {
    const response = await axios.post(`${API_URL}/kanban/boards`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async updateBoard(id: number, data: Partial<CreateBoardData>): Promise<KanbanBoard> {
    const response = await axios.put(`${API_URL}/kanban/boards/${id}`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async deleteBoard(id: number): Promise<void> {
    await axios.delete(`${API_URL}/kanban/boards/${id}`, {
      headers: getAuthHeader(),
    });
  },

  async getBoardStats(id: number): Promise<{
    totalCards: number;
    cardsByColumn: { column_id: number; column_name: string; count: number }[];
    cardsByPriority: { priority: string; count: number }[];
    totalAmount: number;
  }> {
    const response = await axios.get(`${API_URL}/kanban/boards/${id}/stats`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Columns
  async createColumn(boardId: number, data: CreateColumnData): Promise<KanbanColumn> {
    const response = await axios.post(`${API_URL}/kanban/boards/${boardId}/columns`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async updateColumn(id: number, data: Partial<CreateColumnData>): Promise<KanbanColumn> {
    const response = await axios.put(`${API_URL}/kanban/columns/${id}`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async deleteColumn(id: number): Promise<void> {
    await axios.delete(`${API_URL}/kanban/columns/${id}`, {
      headers: getAuthHeader(),
    });
  },

  async reorderColumns(boardId: number, columnIds: number[]): Promise<void> {
    await axios.put(`${API_URL}/kanban/boards/${boardId}/columns/reorder`, { columnIds }, {
      headers: getAuthHeader(),
    });
  },

  // Cards
  async getCardById(id: number): Promise<KanbanCard & { activities: KanbanActivity[] }> {
    const response = await axios.get(`${API_URL}/kanban/cards/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async createCard(data: CreateCardData): Promise<KanbanCard> {
    const response = await axios.post(`${API_URL}/kanban/cards`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async updateCard(id: number, data: Partial<CreateCardData>): Promise<KanbanCard> {
    const response = await axios.put(`${API_URL}/kanban/cards/${id}`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async moveCard(cardId: number, columnId: number, position: number): Promise<KanbanCard> {
    const response = await axios.put(`${API_URL}/kanban/cards/${cardId}/move`, {
      column_id: columnId,
      position,
    }, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async deleteCard(id: number): Promise<void> {
    await axios.delete(`${API_URL}/kanban/cards/${id}`, {
      headers: getAuthHeader(),
    });
  },

  async reorderCards(columnId: number, cardIds: number[]): Promise<void> {
    await axios.put(`${API_URL}/kanban/columns/${columnId}/cards/reorder`, { cardIds }, {
      headers: getAuthHeader(),
    });
  },

  // Activities
  async getCardActivities(cardId: number): Promise<KanbanActivity[]> {
    const response = await axios.get(`${API_URL}/kanban/cards/${cardId}/activities`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async addActivity(cardId: number, data: CreateActivityData): Promise<KanbanActivity> {
    const response = await axios.post(`${API_URL}/kanban/cards/${cardId}/activities`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async deleteActivity(id: number): Promise<void> {
    await axios.delete(`${API_URL}/kanban/activities/${id}`, {
      headers: getAuthHeader(),
    });
  },
};

export default kanbanService;

