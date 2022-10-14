import { ADD_NOTE, REMOVE_NOTE, STORE_USER_DATA } from '../actions/actions';

const initialState = {
  notes: [],
  userData: JSON.parse(localStorage.getItem('data')) || {},
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_NOTE:
      return {
        notes: [
          ...state.notes,
          {
            title: action.title,
            content: action.content,
          },
        ],
      };
    case REMOVE_NOTE:
      return {
        notes: state.notes.filter((note, index) => index != action.id),
      };
      case STORE_USER_DATA:
        return {
          ...state,
          userData: action.payload
        };
    default:
      return state;
  }
}

export default rootReducer;
