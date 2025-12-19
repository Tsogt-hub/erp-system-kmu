import {
  KanbanBoardModel,
  KanbanColumnModel,
  KanbanCardModel,
  KanbanActivityModel,
  KanbanBoard,
  KanbanColumn,
  KanbanCard,
  KanbanActivity,
  CreateKanbanBoardData,
  CreateKanbanColumnData,
  CreateKanbanCardData,
  CreateKanbanActivityData,
} from '../models/KanbanBoard';

export class KanbanService {
  // ============ BOARDS ============
  static async getAllBoards(userId?: number): Promise<KanbanBoard[]> {
    return await KanbanBoardModel.findAll(userId);
  }

  static async getBoardById(id: number): Promise<KanbanBoard & { columns: (KanbanColumn & { cards: KanbanCard[] })[] }> {
    const board = await KanbanBoardModel.findById(id);
    if (!board) {
      throw new Error('Board not found');
    }

    const columns = await KanbanColumnModel.findByBoard(id);
    const cards = await KanbanCardModel.findByBoard(id);

    // Group cards by column
    const columnsWithCards = columns.map(column => ({
      ...column,
      cards: cards.filter(card => card.column_id === column.id),
    }));

    return {
      ...board,
      columns: columnsWithCards,
    };
  }

  static async createBoard(data: CreateKanbanBoardData): Promise<KanbanBoard> {
    const board = await KanbanBoardModel.create(data);
    
    // Create default columns based on board type
    const columnConfigs: Record<string, string[]> = {
      'sales': ['Vorqualifizierung', 'Erstkontakt', 'Angebot erstellt', 'Verhandlung', 'Abgeschlossen'],
      'pv': ['Erstkontakt', 'Beratung', 'Angebot', 'Beauftragt', 'In Umsetzung', 'Abgeschlossen'],
      'gewerbe': ['Anfrage', 'Erstberatung', 'Planung', 'Angebot', 'Auftrag', 'Installation', 'Fertig'],
      'service': ['Offen', 'In Bearbeitung', 'Warten auf Kunde', 'Gelöst', 'Abgeschlossen'],
      'project': ['To Do', 'In Bearbeitung', 'Review', 'Fertig'],
      'custom': [], // No default columns for custom boards
    };
    
    const defaultColumns = columnConfigs[data.board_type || 'project'] || columnConfigs['project'];
    
    const colors = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#00BCD4', '#E91E63'];
    
    for (let i = 0; i < defaultColumns.length; i++) {
      await KanbanColumnModel.create({
        board_id: board.id,
        name: defaultColumns[i],
        position: i + 1,
        color: colors[i % colors.length],
      });
    }

    return board;
  }

  static async updateBoard(id: number, data: Partial<CreateKanbanBoardData>): Promise<KanbanBoard> {
    const board = await KanbanBoardModel.findById(id);
    if (!board) {
      throw new Error('Board not found');
    }
    return await KanbanBoardModel.update(id, data);
  }

  static async deleteBoard(id: number): Promise<void> {
    const board = await KanbanBoardModel.findById(id);
    if (!board) {
      throw new Error('Board not found');
    }
    await KanbanBoardModel.delete(id);
  }

  // ============ COLUMNS ============
  static async getColumnsByBoard(boardId: number): Promise<KanbanColumn[]> {
    return await KanbanColumnModel.findByBoard(boardId);
  }

  static async createColumn(data: CreateKanbanColumnData): Promise<KanbanColumn> {
    return await KanbanColumnModel.create(data);
  }

  static async updateColumn(id: number, data: Partial<CreateKanbanColumnData>): Promise<KanbanColumn> {
    const column = await KanbanColumnModel.findById(id);
    if (!column) {
      throw new Error('Column not found');
    }
    return await KanbanColumnModel.update(id, data);
  }

  static async deleteColumn(id: number): Promise<void> {
    const column = await KanbanColumnModel.findById(id);
    if (!column) {
      throw new Error('Column not found');
    }
    // Check if column has cards
    const cards = await KanbanCardModel.findByColumn(id);
    if (cards.length > 0) {
      throw new Error('Cannot delete column with cards. Move or delete cards first.');
    }
    await KanbanColumnModel.delete(id);
  }

  static async reorderColumns(boardId: number, columnIds: number[]): Promise<void> {
    await KanbanColumnModel.reorder(boardId, columnIds);
  }

  // ============ CARDS ============
  static async getCardsByColumn(columnId: number): Promise<KanbanCard[]> {
    return await KanbanCardModel.findByColumn(columnId);
  }

  static async getCardById(id: number): Promise<KanbanCard & { activities: KanbanActivity[] }> {
    const card = await KanbanCardModel.findById(id);
    if (!card) {
      throw new Error('Card not found');
    }

    const activities = await KanbanActivityModel.findByCard(id);

    return {
      ...card,
      activities,
    };
  }

  static async createCard(data: CreateKanbanCardData): Promise<KanbanCard> {
    const card = await KanbanCardModel.create(data);

    // Create "created" activity
    await KanbanActivityModel.create({
      card_id: card.id,
      user_id: data.created_by,
      activity_type: 'created',
      content: 'Karte erstellt',
    });

    return card;
  }

  static async updateCard(id: number, data: Partial<CreateKanbanCardData>, userId: number): Promise<KanbanCard> {
    const card = await KanbanCardModel.findById(id);
    if (!card) {
      throw new Error('Card not found');
    }

    // Track column change for activity
    if (data.column_id && data.column_id !== card.column_id) {
      const oldColumn = await KanbanColumnModel.findById(card.column_id);
      const newColumn = await KanbanColumnModel.findById(data.column_id);
      
      await KanbanActivityModel.create({
        card_id: id,
        user_id: userId,
        activity_type: 'status_change',
        content: `Status geändert von "${oldColumn?.name}" zu "${newColumn?.name}"`,
        metadata: {
          from_column_id: card.column_id,
          to_column_id: data.column_id,
          from_column_name: oldColumn?.name,
          to_column_name: newColumn?.name,
        },
      });
    }

    return await KanbanCardModel.update(id, data);
  }

  static async moveCard(cardId: number, newColumnId: number, newPosition: number, userId: number): Promise<KanbanCard> {
    const card = await KanbanCardModel.findById(cardId);
    if (!card) {
      throw new Error('Card not found');
    }

    // Track column change for activity
    if (newColumnId !== card.column_id) {
      const oldColumn = await KanbanColumnModel.findById(card.column_id);
      const newColumn = await KanbanColumnModel.findById(newColumnId);
      
      await KanbanActivityModel.create({
        card_id: cardId,
        user_id: userId,
        activity_type: 'status_change',
        content: `Verschoben von "${oldColumn?.name}" zu "${newColumn?.name}"`,
        metadata: {
          from_column_id: card.column_id,
          to_column_id: newColumnId,
        },
      });
    }

    return await KanbanCardModel.moveToColumn(cardId, newColumnId, newPosition);
  }

  static async deleteCard(id: number): Promise<void> {
    const card = await KanbanCardModel.findById(id);
    if (!card) {
      throw new Error('Card not found');
    }
    await KanbanCardModel.delete(id);
  }

  static async reorderCards(columnId: number, cardIds: number[]): Promise<void> {
    await KanbanCardModel.reorderInColumn(columnId, cardIds);
  }

  // ============ ACTIVITIES ============
  static async getCardActivities(cardId: number): Promise<KanbanActivity[]> {
    return await KanbanActivityModel.findByCard(cardId);
  }

  static async addActivity(data: CreateKanbanActivityData): Promise<KanbanActivity> {
    return await KanbanActivityModel.create(data);
  }

  static async deleteActivity(id: number): Promise<void> {
    await KanbanActivityModel.delete(id);
  }

  // ============ STATS ============
  static async getBoardStats(boardId: number): Promise<{
    totalCards: number;
    cardsByColumn: { column_id: number; column_name: string; count: number }[];
    cardsByPriority: { priority: string; count: number }[];
    totalAmount: number;
  }> {
    const cards = await KanbanCardModel.findByBoard(boardId);
    const columns = await KanbanColumnModel.findByBoard(boardId);

    const cardsByColumn = columns.map(col => ({
      column_id: col.id,
      column_name: col.name,
      count: cards.filter(c => c.column_id === col.id).length,
    }));

    const priorities = ['low', 'medium', 'high', 'urgent'];
    const cardsByPriority = priorities.map(p => ({
      priority: p,
      count: cards.filter(c => c.priority === p).length,
    }));

    const totalAmount = cards.reduce((sum, c) => sum + (c.amount || 0), 0);

    return {
      totalCards: cards.length,
      cardsByColumn,
      cardsByPriority,
      totalAmount,
    };
  }
}

