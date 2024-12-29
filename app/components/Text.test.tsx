import { render } from "@testing-library/react-native"
import { Text } from "./Text"

/**
 * This is an example component test using react-native-testing-library.
 * More info: https://callstack.github.io/react-native-testing-library/
 */
const testText = "Test string"

describe("Text", () => {
  it("should render the component", () => {
    const { getByText } = render(<Text text={testText} />)
    expect(getByText(testText)).toBeDefined()
  })
})
