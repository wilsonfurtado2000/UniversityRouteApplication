import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {useSelector, useDispatch} from 'react-redux';
import {onValue, update} from 'firebase/database';
import EditProfileScreen from '../../edit_profile/EditProfileScreen';

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(),
  ref: jest.fn(),
  onValue: jest.fn(),
  update: jest.fn(),
}));

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
  }),
}));

describe('EditProfileScreen', () => {
  let mockDispatch = jest.fn();
  let mockNavigation = {
    goBack: jest.fn(),
  };
  beforeEach(() => {
    useSelector.mockImplementation(selector =>
      selector({
        user: {
          userEmail: 'wfurtado@gmail.com',
        },
      }),
    );

    useDispatch.mockReturnValue(mockDispatch);

    jest
      .spyOn(require('@react-navigation/native'), 'useNavigation')
      .mockReturnValue(mockNavigation);

    onValue.mockImplementation((ref, callback) => {
      callback({
        exists: () => true,
        val: () => ({name: 'Wilson Furtado'}),
      });
      return jest.fn();
    });

    update.mockResolvedValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('displays correctly with user data', async () => {
    const {getByPlaceholderText, getByText} = render(<EditProfileScreen />);

    await waitFor(() => {
      expect(getByPlaceholderText('Enter your name').props.value).toBe(
        'Wilson Furtado',
      );
    });

    expect(getByText('Edit Profile')).toBeTruthy();
    expect(getByText('Save Changes')).toBeTruthy();
  });

  it('handles name change correctly', () => {
    const {getByPlaceholderText} = render(<EditProfileScreen />);
    const nameInput = getByPlaceholderText('Enter your name');

    fireEvent.changeText(nameInput, 'New Name');
    expect(nameInput.props.value).toBe('New Name');
  });

  it('fetches user data on mount', () => {
    render(<EditProfileScreen />);
    expect(useSelector).toHaveBeenCalled();
    expect(onValue).toHaveBeenCalled();
  });

  it('unsubscribes from Firebase listener on unmount', () => {
    const unsubscribeMock = jest.fn();
    onValue.mockReturnValueOnce(unsubscribeMock);

    const {unmount} = render(<EditProfileScreen />);
    unmount();

    expect(unsubscribeMock).toHaveBeenCalled();
  });

  it('saves changes when Save Changes button is pressed', async () => {
    const {getByText, getByPlaceholderText} = render(<EditProfileScreen />);
    const nameInput = getByPlaceholderText('Enter your name');
    const saveButton = getByText('Save Changes');

    fireEvent.changeText(nameInput, 'New Name');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(update).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalled();
    });
  });
});
