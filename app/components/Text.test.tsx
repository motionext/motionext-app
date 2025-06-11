import { render, screen } from "@testing-library/react-native"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { Text } from "./Text"

/* This is an example component test using react-native-testing-library. For more
 * information on how to write your own, see the documentation here:
 * https://callstack.github.io/react-native-testing-library/ */

const testText = "Test string"

// Using real navigator implementation
const Stack = createNativeStackNavigator()

// Component wrapper to provide the navigation context
const NavigationWrapper = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Test">{() => children}</Stack.Screen>
    </Stack.Navigator>
  </NavigationContainer>
)

describe("Text", () => {
  it("should render the component within navigation context", () => {
    render(<Text text={testText} />, {
      wrapper: NavigationWrapper,
    })
    expect(screen.getByText(testText)).toBeTruthy()
  })
})
