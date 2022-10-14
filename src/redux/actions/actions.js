export const ADD_NOTE = 'ADD_NOTE';
export const REMOVE_NOTE = 'REMOVE_NOTE';
export const STORE_USER_DATA = 'STORE_USER_DATA';

export function addNote(title, content) {
  return { type: ADD_NOTE, title: title, content: content };
}

export function removeNote(id) {
  return { type: REMOVE_NOTE, id: id };
}

export function storeUserData(data) {
  return { type: STORE_USER_DATA, payload: data };
}

