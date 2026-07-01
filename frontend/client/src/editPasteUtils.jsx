export const handleEditPaste = (pasteCode, setEditingPaste, setShowEditModal, token, setMessage) => {
  if (!token) {
    setMessage('Авторизуйтесь, чтобы редактировать пасты');
    setTimeout(() => setMessage(''), 3000);
    return;
  }

  setEditingPaste({ code: pasteCode });
  setShowEditModal(true);
};

export const fetchPasteData = async (code, token) => {
  try {
    const response = await fetch(`http://localhost:8000/api/pastes/${code}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      const error = await response.json();
      return { success: false, error: error.message || 'Ошибка загрузки пасты' };
    }
  } catch (error) {
    console.error('Ошибка загрузки пасты:', error);
    return { success: false, error: 'Ошибка подключения к серверу' };
  }
};

// Функция для сохранения изменений пасты
export const savePasteData = async (code, data, token) => {
  try {
    const response = await fetch(`http://localhost:8000/api/pastes/${code}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      return { success: true, data: result };
    } else {
      return { 
        success: false, 
        error: result.message || result.error || 'Ошибка обновления пасты'
      };
    }
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    return { success: false, error: 'Ошибка подключения к серверу' };
  }
};