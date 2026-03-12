describe('Tasks - Tests Unitaires', () => {

  const createTask = (title, priority = 'medium') => {
    if (!title) throw new Error('Title is required');
    if (!['low', 'medium', 'high'].includes(priority)) {
      throw new Error('Invalid priority');
    }
    return {
      id: Date.now(),
      title,
      priority,
      status: 'todo',
      createdAt: new Date()
    };
  };

  const filterTasksByStatus = (tasks, status) => {
    return tasks.filter(t => t.status === status);
  };

  const filterTasksByPriority = (tasks, priority) => {
    return tasks.filter(t => t.priority === priority);
  };

  describe('createTask()', () => {
    test('crée une tâche avec titre et priorité', () => {
      const task = createTask('Ma tâche', 'high');
      expect(task.title).toBe('Ma tâche');
      expect(task.priority).toBe('high');
      expect(task.status).toBe('todo');
    });

    test('priorité par défaut est medium', () => {
      const task = createTask('Ma tâche');
      expect(task.priority).toBe('medium');
    });

    test('lève une erreur si titre vide', () => {
      expect(() => createTask('')).toThrow('Title is required');
    });

    test('lève une erreur si priorité invalide', () => {
      expect(() => createTask('Test', 'urgent')).toThrow('Invalid priority');
    });

    test('la tâche a bien un id et une date', () => {
      const task = createTask('Test');
      expect(task.id).toBeDefined();
      expect(task.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('filterTasksByStatus()', () => {
    const tasks = [
      { id: 1, title: 'Task 1', status: 'todo' },
      { id: 2, title: 'Task 2', status: 'done' },
      { id: 3, title: 'Task 3', status: 'todo' },
    ];

    test('filtre les tâches par statut todo', () => {
      const result = filterTasksByStatus(tasks, 'todo');
      expect(result.length).toBe(2);
    });

    test('filtre les tâches par statut done', () => {
      const result = filterTasksByStatus(tasks, 'done');
      expect(result.length).toBe(1);
    });

    test('retourne tableau vide si aucune tâche', () => {
      const result = filterTasksByStatus(tasks, 'in-progress');
      expect(result).toEqual([]);
    });
  });

  describe('filterTasksByPriority()', () => {
    const tasks = [
      { id: 1, title: 'Task 1', priority: 'high' },
      { id: 2, title: 'Task 2', priority: 'low' },
      { id: 3, title: 'Task 3', priority: 'high' },
    ];

    test('filtre les tâches high priority', () => {
      const result = filterTasksByPriority(tasks, 'high');
      expect(result.length).toBe(2);
    });

    test('filtre les tâches low priority', () => {
      const result = filterTasksByPriority(tasks, 'low');
      expect(result.length).toBe(1);
    });
  });
});