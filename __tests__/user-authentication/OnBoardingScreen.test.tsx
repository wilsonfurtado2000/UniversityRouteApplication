import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import OnBoardingScreen from '../../UserAuthentication/OnBoarding/OnboardingScreen';

const mockNavigation = {
  navigate: jest.fn(),
};

jest.mock(
  '/Users/wilsonfurtado/UniversityRoute/assests/images/uni_of_bath.png',
  () => 'mocked-image-path',
);

describe('OnBoardingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to Signup screen when Sign Up text is pressed', () => {
    const {getByText} = render(
      <OnBoardingScreen navigation={mockNavigation} />,
    );

    const signUpText = getByText('Sign Up');
    fireEvent.press(signUpText);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Signup');
  });

  it('renders correctly', () => {
    const {getByText, getByTestId} = render(
      <OnBoardingScreen navigation={mockNavigation} />,
    );

    expect(getByTestId('onboarding-image')).toBeTruthy();

    expect(getByText('Sign In')).toBeTruthy();
    expect(getByText("Don't have an account?")).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
    expect(getByText('Navigate Your Campus with Confidence')).toBeTruthy();
  });

  it('displays the correct image', () => {
    const {getByTestId} = render(
      <OnBoardingScreen navigation={mockNavigation} />,
    );

    const image = getByTestId('onboarding-image');
    expect(image.props.source).toBe('mocked-image-path');
  });

  it('navigates to Login screen when Sign In button is pressed', () => {
    const {getByText} = render(
      <OnBoardingScreen navigation={mockNavigation} />,
    );

    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
  });
});
