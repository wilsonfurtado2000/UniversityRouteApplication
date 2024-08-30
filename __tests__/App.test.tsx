import React from 'react';
import renderer from 'react-test-renderer';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import App from '../App';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  NavigationContainer: ({children}) => <div>{children}</div>,
}));
jest.mock('../navigation/AppNavigator', () => props => (
  <div {...props}>AppNavigator</div>
));
jest.mock('../screenTime/ScreenTime', () => 'ScreenTime');

const reducer = (state = {user: {userEmail: null}}, action) => state;
const store = createStore(reducer);

describe('App', () => {
  const createTestStore = userEmail => createStore(() => ({user: {userEmail}}));

  it('renders as logged in', () => {
    const loggedInStore = createTestStore('user@example.com');
    const tree = renderer
      .create(
        <Provider store={loggedInStore}>
          <App />
        </Provider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders as logged out', () => {
    const loggedOutStore = createTestStore(null);
    const tree = renderer
      .create(
        <Provider store={loggedOutStore}>
          <App />
        </Provider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('passes isLoggedIn to AppNavigator', () => {
    const store = createTestStore('user@example.com');
    const component = renderer.create(
      <Provider store={store}>
        <App />
      </Provider>,
    );
    const appNavigator = component.root.findByProps({children: 'AppNavigator'});
    expect(appNavigator.props.isLoggedIn).toBe(true);
  });
});
