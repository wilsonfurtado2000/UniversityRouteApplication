import React from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {render, fireEvent} from '@testing-library/react-native';
import ProfileScreen from '../../profile/ProfileScreen';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(),
  ref: jest.fn(),
  onValue: jest.fn((ref, callback) => {
    callback({
      exists: () => true,
      val: () => ({name: 'Wilson Furtado'}),
    });
    return jest.fn();
  }),
}));

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

describe('ProfileScreen', () => {
  let mockDispatch = jest.fn();
  let mockNavigation = {
    navigate: jest.fn(),
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
  });

  it('renders correctly with user data', () => {
    const {getByText} = render(<ProfileScreen />);

    expect(getByText('Analytics')).toBeTruthy();
    expect(getByText('Edit Profile')).toBeTruthy();
    expect(getByText('Sign Out')).toBeTruthy();
    expect(getByText('Wilson Furtado')).toBeTruthy();
    expect(getByText('Search History')).toBeTruthy();
  });

  it('handles Edit Profile option press correctly', () => {
    const {getByText} = render(<ProfileScreen />);
    fireEvent.press(getByText('Edit Profile'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('EditProfileScreen');
  });

  it('handles Search History option press correctly', () => {
    const {getByText} = render(<ProfileScreen />);
    fireEvent.press(getByText('Search History'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('SearchHistoryScreen');
  });

  it('handles Analytics option press correctly', () => {
    const {getByText} = render(<ProfileScreen />);
    fireEvent.press(getByText('Analytics'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AnalyticsScreen');
  });

  it('handles Sign Out option press correctly', () => {
    const {getByText} = render(<ProfileScreen />);
    fireEvent.press(getByText('Sign Out'));
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
  });

  it('fetches user data on mount', () => {
    render(<ProfileScreen />);
    expect(useSelector).toHaveBeenCalled();
    expect(require('firebase/database').onValue).toHaveBeenCalled();
  });

  it('unsubscribes from Firebase listener on unmount', () => {
    const unsubscribeMock = jest.fn();
    require('firebase/database').onValue.mockReturnValueOnce(unsubscribeMock);

    const {unmount} = render(<ProfileScreen />);
    unmount();

    expect(unsubscribeMock).toHaveBeenCalled();
  });

  it('handles non-existent user data', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    require('firebase/database').onValue.mockImplementationOnce(
      (ref, callback) => {
        callback({
          exists: () => false,
        });
        return jest.fn();
      },
    );

    render(<ProfileScreen />);

    expect(consoleSpy).toHaveBeenCalledWith('No data available');
    consoleSpy.mockRestore();
  });
});
