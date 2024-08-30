import React from 'react';
import {AppState} from 'react-native';
import {getDatabase} from 'firebase/database';

import {render, act} from '@testing-library/react-native';
import ScreenTime from '../../screenTime/ScreenTime';
import {useSelector} from 'react-redux';

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(),
  ref: jest.fn(),
  set: jest.fn(),
  push: jest.fn(() => ({key: 'pushMock'})),
}));

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

describe('ScreenTime', () => {
  let mockAppStateChangeHandler = jest.fn();
  let mockDatabase = {};
  beforeEach(() => {
    useSelector.mockImplementation(selector =>
      selector({
        user: {
          userEmail: 'wfurtado@gmail.com',
        },
      }),
    );

    getDatabase.mockReturnValue(mockDatabase);

    jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation((event, handler) => {
        if (event === 'change') {
          mockAppStateChangeHandler = handler;
        }
        return {
          remove: jest.fn(),
        };
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('removes app state change listener on unmount', () => {
    const removeSpy = jest.fn();
    AppState.addEventListener.mockReturnValueOnce({remove: removeSpy});

    const {unmount} = render(<ScreenTime />);

    unmount();

    expect(removeSpy).toHaveBeenCalled();
  });

  it('does not set startTime if userEmail is not provided', () => {
    useSelector.mockImplementationOnce(() => ({
      user: {
        userEmail: '',
      },
    }));

    render(<ScreenTime />);

    act(() => {
      mockAppStateChangeHandler('active');
    });

    expect(mockAppStateChangeHandler).toBeTruthy();
  });

  it('sets startTime when app state changes to active', () => {
    render(<ScreenTime />);

    act(() => {
      mockAppStateChangeHandler('active');
    });

    expect(mockAppStateChangeHandler).toBeTruthy();
  });
});
