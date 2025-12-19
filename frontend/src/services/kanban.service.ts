import { apiClient } from './api/client';

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
    const response = await apiClient.get('/kanban/boards');
    return response.data;
  },

  async getBoardById(id: number): Promise<KanbanBoard & { columns: (KanbanColumn & { cards: KanbanCard[] })[] }> {
    const response = await apiClient.get(`/kanban/boards/${id}`);
    return response.data;
  },

  async createBoard(data: CreateBoardData): Promise<KanbanBoard> {
    const response = await apiClient.post('/kanban/boards', data);
    return response.data;
  },

  async updateBoard(id: number, data: Partial<CreateBoardData>): Promise<KanbanBoard> {
    const response = await apiClient.put(`/kanban/boards/${id}`, data);
    return response.data;
  },

  async deleteBoard(id: number): Promise<void> {
    await apiClient.delete(`/kanban/boards/${id}`);
  },

  async getBoardStats(id: number): Promise<{
    totalCards: number;
    cardsByColumn: { column_id: number; column_name: string; count: number }[];
    cardsByPriority: { priority: string; count: number }[];
    totalAmount: number;
  }> {
    const response = await apiClient.get(`/kanban/boards/${id}/stats`);
    return response.data;
  },

  // Columns
  async createColumn(boardId: number, data: CreateColumnData): Promise<KanbanColumn> {
    const response = await apiClient.post(`/kanban/boards/${boardId}/columns`, data);
    return response.data;
  },

  async updateColumn(id: number, data: Partial<CreateColumnData>): Promise<KanbanColumn> {
    const response = await apiClient.put(`/kanban/columns/${id}`, data);
    return response.data;
  },

  async deleteColumn(id: number): Promise<void> {
    await apiClient.delete(`/kanban/columns/${id}`);
  },

  async reorderColumns(boardId: number, columnIds: number[]): Promise<void> {
    await apiClient.put(`/kanban/boards/${boardId}/columns/reorder`, { columnIds });
  },

  // Cards
  async getCardById(id: number): Promise<KanbanCard & { activities: KanbanActivity[] }> {
    const response = await apiClient.get(`/kanban/cards/${id}`);
    return response.data;
  },

  async createCard(data: CreateCardData): Promise<KanbanCard> {
    const response = await apiClient.post('/kanban/cards', data);
    return response.data;
  },

  async updateCard(id: number, data: Partial<CreateCardData>): Promise<KanbanCard> {
    const response = await apiClient.put(`/kanban/cards/${id}`, data);
    return response.data;
  },

  async moveCard(cardId: number, columnId: number, position: number): Promise<KanbanCard> {
    const response = await apiClient.put(`/kanban/cards/${cardId}/move`, {
      column_id: columnId,
      position,
    });
    return response.data;
  },

  async deleteCard(id: number): Promise<void> {
    await apiClient.delete(`/kanban/cards/${id}`);
  },

  async reorderCards(columnId: number, cardIds: number[]): Promise<void> {
    await apiClient.put(`/kanban/columns/${columnId}/cards/reorder`, { cardIds });
  },

  // Activities
  async getCardActivities(cardId: number): Promise<KanbanActivity[]> {
    const response = await apiClient.get(`/kanban/cards/${cardId}/activities`);
    return response.data;
  },

  async addActivity(cardId: number, data: CreateActivityData): Promise<KanbanActivity> {
    const response = await apiClient.post(`/kanban/cards/${cardId}/activities`, data);
    return response.data;
  },

  async deleteActivity(id: number): Promise<void> {
    await apiClient.delete(`/kanban/activities/${id}`);
  },
};

export default kanbanService;

