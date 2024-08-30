import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import SignupScreen from '../../UserAuthentication/SignUpScreen';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

const mockGet = jest.fn();

jest.mock('../../firebase/firebase', () => ({
  database: {},
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  set: jest.fn(),
  get: mockGet,
}));

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('SignupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const {getByText, getByPlaceholderText, getByTestId} = render(
      <SignupScreen navigation={mockNavigation} />,
    );

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByTestId('header-sign-up')).toBeTruthy();

    expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
    expect(getByPlaceholderText('Name')).toBeTruthy();

    expect(getByTestId('button-sign-up')).toBeTruthy();
    expect(getByText('Already have an account?')).toBeTruthy();
    expect(getByTestId('button-sign-in')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  it('handles email input', () => {
    const {getByPlaceholderText} = render(
      <SignupScreen navigation={mockNavigation} />,
    );

    const emailInput = getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'wfurtado@gmail.com');

    expect(emailInput.props.value).toBe('wfurtado@gmail.com');
  });

  it('handles password input', () => {
    const {getByPlaceholderText} = render(
      <SignupScreen navigation={mockNavigation} />,
    );

    const passwordInput = getByPlaceholderText('Password');
    fireEvent.changeText(passwordInput, 'wilson123');

    expect(passwordInput.props.value).toBe('wilson123');
  });

  it('handles name input', () => {
    const {getByPlaceholderText} = render(
      <SignupScreen navigation={mockNavigation} />,
    );

    const nameInput = getByPlaceholderText('Name');
    fireEvent.changeText(nameInput, 'Wilson Furtado');

    expect(nameInput.props.value).toBe('Wilson Furtado');
  });

  it('handles confirmation password input', () => {
    const {getByPlaceholderText} = render(
      <SignupScreen navigation={mockNavigation} />,
    );

    const confirmationInput = getByPlaceholderText('Confirm Password');
    fireEvent.changeText(confirmationInput, 'wilson123');

    expect(confirmationInput.props.value).toBe('wilson123');
  });

  it('navigates to login screen when "Sign In" is pressed', () => {
    const {getByTestId} = render(<SignupScreen navigation={mockNavigation} />);

    const signInButton = getByTestId('button-sign-in');
    fireEvent.press(signInButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
  });

  it('shows error with invalid input', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});

    const {getByPlaceholderText, getByTestId} = render(
      <SignupScreen navigation={mockNavigation} />,
    );

    const emailInput = getByPlaceholderText('Email');
    const confirmationInput = getByPlaceholderText('Confirm Password');
    const passwordInput = getByPlaceholderText('Password');

    const signUpButton = getByTestId('button-sign-up');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(confirmationInput, 'password321');
    fireEvent.changeText(passwordInput, 'password123');

    fireEvent.press(signUpButton);

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith('Invalid input');
    });

    console.log.mockRestore();
  });

  it('navigates back when back button is pressed', () => {
    const {getByTestId} = render(<SignupScreen navigation={mockNavigation} />);

    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
