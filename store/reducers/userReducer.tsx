const initialState = {
  userEmail: '',
  destination: '',
  source: '',
  profileImage: null,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER_DETAILS':
      return {
        ...state,
        userEmail: action.payload.userEmail,
      };
    case 'DESTINATION':
      return {
        ...state,
        destination: action.payload.destination,
      };
    case 'SOURCE':
      return {
        ...state,
        source: action.payload.source,
      };
    case 'SET_PROFILE_IMAGE':
      return {
        ...state,
        profileImage: action.payload.profileImage,
      };
    case 'SIGN_OUT':
      return initialState;
    default:
      return state;
  }
};

export default userReducer;
