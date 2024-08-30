import React from 'react';
import {get} from 'firebase/database';

import {Alert} from 'react-native';
import {useSelector} from 'react-redux';
import {render, fireEvent, waitFor} from '@testing-library/react-native';

import SearchHistoryScreen from '../../search_history/SearchHistoryScreen';
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('../../firebase/firebase', () => ({
  database: {},
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  get: jest.fn(),
  query: jest.fn(),
  orderByChild: jest.fn(),
  remove: jest.fn(),
}));

const mockNavigation = {
  goBack: jest.fn(),
};

describe('SearchHistoryScreen', () => {
  beforeEach(() => {
    useSelector.mockReturnValue('wfurtado@gmail.com');
    get.mockResolvedValue({
      forEach: jest.fn(),
    });
  });

  it('changes selected filter when a new filter is pressed', () => {
    const {getByText} = render(
      <SearchHistoryScreen navigation={mockNavigation} />,
    );

    fireEvent.press(getByText('1 Week'));
    expect(get).toHaveBeenCalled();
  });

  it('renders correctly', () => {
    const {getByText, getByTestId} = render(
      <SearchHistoryScreen navigation={mockNavigation} />,
    );
    expect(getByTestId('back-button')).toBeTruthy();
    expect(getByText('Delete All History')).toBeTruthy();

    expect(getByText('Search History')).toBeTruthy();
  });

  it('displays "No data to display" when places array is empty', async () => {
    const {getByText} = render(
      <SearchHistoryScreen navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByText('No data to display 🤷‍♂️')).toBeTruthy();
    });
  });

  it('navigates back when back button is pressed', () => {
    const {getByTestId} = render(
      <SearchHistoryScreen navigation={mockNavigation} />,
    );

    fireEvent.press(getByTestId('back-button'));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('shows confirmation alert when delete button is pressed', () => {
    jest.spyOn(Alert, 'alert');

    const {getByText} = render(
      <SearchHistoryScreen navigation={mockNavigation} />,
    );

    fireEvent.press(getByText('Delete All History'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Confirm Deletion',
      'Are you sure you want to delete all history?',
      expect.any(Array),
    );
  });
});
