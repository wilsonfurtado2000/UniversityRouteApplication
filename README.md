# UniversityRouteApplication


# Testing Guide

This guide provides detailed instructions for setting up your macOS environment and testing the application. Follow these steps carefully to ensure everything is set up correctly and the app runs smoothly.

## Prerequisites

### 1. Install Node.js
Node.js is required to run the JavaScript code. Download and install the latest LTS version of Node.js from the [Node.js Official Website](https://nodejs.org/).

### 2. Install Watchman
Watchman is a tool for watching changes in the filesystem. It’s recommended to install Watchman on macOS to improve the React Native development experience.

```bash
brew install watchman
```

### 3. Install React Native CLI
React Native CLI is the command line interface for React Native. It allows you to create, run, and manage React Native projects.

```bash
npm install -g react-native-cli

or

yarn global add react-native-cli
```

### 4. Install Xcode 

Xcode is required for iOS development. It includes the iOS SDK, which is essential for building and running iOS apps.

Download and install Xcode from the Mac App Store.
Open Xcode and go to Preferences > Locations to ensure the Command Line Tools are installed and selected.

### 5. Install Ruby and CocoaPods 

#### Ruby: macOS comes with Ruby pre-installed, but you may want to manage Ruby versions using rbenv or rvm.
#### rbenv - https://github.com/rbenv/rbenv
#### rvm - https://rvm.io/

Check the installed Ruby version:

```bash
ruby -v
```

If needed, install Ruby using Homebrew:

```bash
brew install ruby
```

Or using rbenv:

```bash
brew install rbenv
rbenv install 3.1.2
rbenv global 3.1.2
```

#### CocoaPods: CocoaPods is used to manage iOS dependencies. Install CocoaPods using the following command:

```bash
sudo gem install cocoapods
```

### 6. Install IOS Simulator

To test the iOS application, you’ll need an iOS simulator.

Open Xcode.
Go to Preferences > Components.
Download a simulator for the latest iOS version

### 7. Project Setup
#### 1. Clone the Project Repository
First, clone the repository to your local machine.

```bash
git clone https://github.com/your-github-username/UniversityRouteApplication.git
cd UniversityRouteApplication
```

#### 2. Install JavaScript Dependencies

```bash
npm install
# OR
yarn install
```

#### 3. Install iOS Dependencies (macOS only)

```bash
cd ios
pod install
cd ..
```

### 8. Running the Application

#### 1. Start the Metro Bundler

Metro is the JavaScript bundler that ships with React Native. It compiles the JavaScript code and serves it to the app.

In the project root directory, run:

```bash
npm start
# OR
yarn start
```

This will start the Metro Bundler, and you should leave this terminal window open.


#### 2. Run the Application on iOS (simulator)

#### Note: The AppleCorelocation API doesn't work when testing on a iPhone simulator, as a result it is necessary to the application on a physical Iphone Device In order to test all the features of the application.


```bash
npx react-native run-ios
```

#### 3. Run the application on a physical device (iPhone)

#### Enable Developer Mode on Your iPhone:

On your iPhone, go to Settings > Privacy & Security.
Scroll down and find Developer Mode.
Toggle Developer Mode on.
You may be prompted to restart your device. After restarting, confirm enabling Developer Mode.

#### Connect your iPhone to your Mac using a USB cable.

#### Open Xcode and select your project in the Xcode sidebar.

#### In the top toolbar, select your connected iPhone as the build target.

#### Ensure your iPhone is trusted by your Mac. If you haven’t trusted your Mac before, a prompt will appear on your iPhone to trust this computer

#### Update the Signing & Capabilities:

Go to the Signing & Capabilities tab in Xcode.
Ensure that the Team field is filled out. You may need to select your personal or organization’s Apple Developer account.
Xcode will automatically manage signing if this is set up correctly.

#### Run the App:

Click the Run button (the play icon) in Xcode or press <kbd>Cmd ⌘</kbd> + <kbd>R</kbd>.
The app will build and then be installed on your iPhone.
Once the build is complete, the app should open automatically on your iPhone
