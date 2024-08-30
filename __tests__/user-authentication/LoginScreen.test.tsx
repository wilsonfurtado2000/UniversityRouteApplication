import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import LoginScreen from '../../UserAuthentication/LoginScreen';

jest.mock('../../firebase/firebase', () => ({
  database: {},
}));

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  get: jest.fn(),
  child: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
  CommonActions: {
    navigate: jest.fn(),
  },
}));

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const {getByText, getByPlaceholderText, getByTestId} = render(
      <LoginScreen navigation={mockNavigation} />,
    );
    expect(getByTestId('button-sign-in')).toBeTruthy();

    expect(getByTestId('header-sign-in')).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();

    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText("Don't have an account?")).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
  });

  it('handles email input', () => {
    const {getByPlaceholderText} = render(
      <LoginScreen navigation={mockNavigation} />,
    );

    const emailInput = getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'wfurtado@gmail.com');

    expect(emailInput.props.value).toBe('wfurtado@gmail.com');
  });

  it('handles password input', () => {
    const {getByPlaceholderText} = render(
      <LoginScreen navigation={mockNavigation} />,
    );

    const passwordInput = getByPlaceholderText('Password');
    fireEvent.changeText(passwordInput, 'wilson123');

    expect(passwordInput.props.value).toBe('wilson123');
  });

  it('navigates to signup screen when "Sign Up" is pressed', () => {
    const {getByText} = render(<LoginScreen navigation={mockNavigation} />);

    const signUpButton = getByText('Sign Up');
    fireEvent.press(signUpButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Signup');
  });

  it('navigates back when back button is pressed', () => {
    const {getByTestId} = render(<LoginScreen navigation={mockNavigation} />);

    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
