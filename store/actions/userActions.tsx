export const setUserDetails = userDetails => ({
  type: 'SET_USER_DETAILS',
  payload: userDetails,
});
export const signOut = () => ({
  type: 'SIGN_OUT',
});

export const setDestination = destination => ({
  type: 'DESTINATION',
  payload: destination,
});

export const setSource = source => ({
  type: 'SOURCE',
  payload: source,
});

export const setProfileImage = profileImage => ({
  type: 'SET_PROFILE_IMAGE',
  payload: {profileImage},
});
