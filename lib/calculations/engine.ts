import { FormSchema } from "@/form-builder/types"

export type TokenType = "NUMBER" | "FIELD" | "OPERATOR" | "LPAREN" | "RPAREN"

export interface Token {
  type: TokenType
  value: string | number
}

// Tokenize expression string into token list
export function tokenize(expression: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < expression.length) {
    const char = expression[i]

    // Skip whitespace
    if (/\s/.test(char)) {
      i++
      continue
    }

    // Numbers & decimals
    if (/[0-9]/.test(char) || (char === "." && i + 1 < expression.length && /[0-9]/.test(expression[i + 1]))) {
      let numStr = ""
      while (i < expression.length && (/[0-9]/.test(expression[i]) || expression[i] === ".")) {
        numStr += expression[i]
        i++
      }
      tokens.push({ type: "NUMBER", value: parseFloat(numStr) })
      continue
    }

    // Bracketed field identifier or label [fi_plot_length] or [Plot Length]
    if (char === "[") {
      let fieldId = ""
      i++ // Skip [
      while (i < expression.length && expression[i] !== "]") {
        fieldId += expression[i]
        i++
      }
      i++ // Skip ]
      tokens.push({ type: "FIELD", value: fieldId.trim() })
      continue
    }

    // Operators
    if (["+", "-", "*", "/", "%"].includes(char)) {
      tokens.push({ type: "OPERATOR", value: char })
      i++
      continue
    }

    // Parentheses
    if (char === "(") {
      tokens.push({ type: "LPAREN", value: "(" })
      i++
      continue
    }
    if (char === ")") {
      tokens.push({ type: "RPAREN", value: ")" })
      i++
      continue
    }

    // Bare field identifiers (alphanumeric/underscore/dash words)
    if (/[a-zA-Z_]/.test(char)) {
      let idStr = ""
      while (i < expression.length && /[a-zA-Z0-9_\-]/.test(expression[i])) {
        idStr += expression[i]
        i++
      }
      tokens.push({ type: "FIELD", value: idStr.trim() })
      continue
    }

    i++
  }

  return tokens
}

// Resolve field ID from ID or Label or slugified label
export function resolveFieldId(fieldRef: string, schema?: FormSchema): string {
  const refLower = fieldRef.toLowerCase().trim()
  if (!schema) return fieldRef

  // 1. Direct ID match
  const directMatch = schema.fields.find((f) => f.id === fieldRef)
  if (directMatch) return directMatch.id

  // 2. Case-insensitive ID match
  const ciIdMatch = schema.fields.find((f) => f.id.toLowerCase() === refLower)
  if (ciIdMatch) return ciIdMatch.id

  // 3. Label match
  const labelMatch = schema.fields.find((f) => f.label.toLowerCase().trim() === refLower)
  if (labelMatch) return labelMatch.id

  // 4. Slugified label match (e.g. plot_length matching "Plot Length")
  const slugMatch = schema.fields.find(
    (f) => f.label.toLowerCase().replace(/[^a-z0-9]/g, "_") === refLower.replace(/[^a-z0-9]/g, "_")
  )
  if (slugMatch) return slugMatch.id

  return fieldRef
}

// Extract referenced field IDs from expression
export function getReferencedFieldIds(expression: string, schema?: FormSchema): string[] {
  const tokens = tokenize(expression)
  const fieldIds: string[] = []

  tokens.forEach((t) => {
    if (t.type === "FIELD" && typeof t.value === "string") {
      const resolvedId = resolveFieldId(t.value, schema)
      if (!fieldIds.includes(resolvedId)) {
        fieldIds.push(resolvedId)
      }
    }
  })

  return fieldIds
}

// Safe Pratt Parser / Shunting-Yard arithmetic evaluator
// Returns number if valid computation, or null if required inputs are missing/empty
export function evaluateTokens(
  tokens: Token[],
  responses: Record<string, unknown>,
  schema?: FormSchema
): number | null {
  if (tokens.length === 0) return null

  let hasMissingInput = false
  const outputQueue: Token[] = []
  const operatorStack: Token[] = []

  const precedence: Record<string, number> = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
    "%": 2,
  }

  tokens.forEach((token) => {
    if (token.type === "NUMBER") {
      outputQueue.push(token)
    } else if (token.type === "FIELD") {
      const fieldRef = String(token.value).trim()
      const resolvedId = resolveFieldId(fieldRef, schema)
      const rawVal = responses[resolvedId] ?? responses[fieldRef]

      // Check if input is missing or empty string
      if (rawVal === undefined || rawVal === null || String(rawVal).trim() === "") {
        hasMissingInput = true
        outputQueue.push({ type: "NUMBER", value: 0 })
      } else {
        const parsedNum = Number(rawVal)
        if (isNaN(parsedNum)) {
          hasMissingInput = true
          outputQueue.push({ type: "NUMBER", value: 0 })
        } else {
          outputQueue.push({ type: "NUMBER", value: parsedNum })
        }
      }
    } else if (token.type === "OPERATOR") {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1].type === "OPERATOR" &&
        precedence[String(operatorStack[operatorStack.length - 1].value)] >= precedence[String(token.value)]
      ) {
        outputQueue.push(operatorStack.pop()!)
      }
      operatorStack.push(token)
    } else if (token.type === "LPAREN") {
      operatorStack.push(token)
    } else if (token.type === "RPAREN") {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== "LPAREN") {
        outputQueue.push(operatorStack.pop()!)
      }
      if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === "LPAREN") {
        operatorStack.pop()
      }
    }
  })

  // If any calculation input field is missing/empty, return null
  if (hasMissingInput) {
    return null
  }

  while (operatorStack.length > 0) {
    outputQueue.push(operatorStack.pop()!)
  }

  // Evaluate RPN Stack
  const stack: number[] = []

  for (const token of outputQueue) {
    if (token.type === "NUMBER") {
      stack.push(Number(token.value))
    } else if (token.type === "OPERATOR") {
      const b = stack.pop() ?? 0
      const a = stack.pop() ?? 0
      const op = String(token.value)

      switch (op) {
        case "+":
          stack.push(a + b)
          break
        case "-":
          stack.push(a - b)
          break
        case "*":
          stack.push(a * b)
          break
        case "/":
          if (b === 0) return null // Division by zero returns null empty state
          stack.push(a / b)
          break
        case "%":
          if (b === 0) return null
          stack.push(a % b)
          break
      }
    }
  }

  const result = stack.pop()
  if (result === undefined || isNaN(result) || !isFinite(result)) {
    return null
  }

  return Math.round(result * 1000) / 1000
}

export function evaluateExpression(
  expression: string,
  responses: Record<string, unknown>,
  schema?: FormSchema
): number | null {
  if (!expression || !expression.trim()) return null
  try {
    const tokens = tokenize(expression)
    return evaluateTokens(tokens, responses, schema)
  } catch {
    return null
  }
}

// Detect circular calculation dependencies across form fields (DFS graph cycle detection)
export function detectCircularReferences(schema: FormSchema): string[] | null {
  const graph: Record<string, string[]> = {}

  schema.fields.forEach((field) => {
    if (field.type === "calculated" && field.calculation?.expression) {
      graph[field.id] = getReferencedFieldIds(field.calculation.expression, schema)
    }
  })

  const visited: Record<string, boolean> = {}
  const recStack: Record<string, boolean> = {}

  function isCyclic(node: string, path: string[]): string[] | null {
    if (!visited[node]) {
      visited[node] = true
      recStack[node] = true

      const neighbors = graph[node] || []
      for (const neighbor of neighbors) {
        if (!visited[neighbor]) {
          const cycle = isCyclic(neighbor, [...path, node])
          if (cycle) return cycle
        } else if (recStack[neighbor]) {
          return [...path, node, neighbor]
        }
      }
    }
    recStack[node] = false
    return null
  }

  for (const fieldId of Object.keys(graph)) {
    const cycle = isCyclic(fieldId, [])
    if (cycle) return cycle
  }

  return null
}
